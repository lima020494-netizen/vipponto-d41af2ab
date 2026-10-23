-- Ponto Pro Gestão — Super Admin Etapa 2: suporte remoto (impersonate) + auditoria
-- Rode UMA VEZ em: Supabase Dashboard > SQL Editor > New query

CREATE TABLE IF NOT EXISTS public.support_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id uuid NOT NULL,
  empresa_id text NOT NULL,
  empresa_nome text,
  motivo text NOT NULL DEFAULT '',
  ip text,
  iniciado_em timestamptz NOT NULL DEFAULT now(),
  encerrado_em timestamptz
);
GRANT SELECT ON public.support_sessions TO authenticated;
GRANT ALL ON public.support_sessions TO service_role;
ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super admin ve as proprias sessoes" ON public.support_sessions;
CREATE POLICY "Super admin ve as proprias sessoes" ON public.support_sessions FOR SELECT TO authenticated
  USING (super_admin_id = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE INDEX IF NOT EXISTS support_sessions_ativa_idx ON public.support_sessions (super_admin_id) WHERE encerrado_em IS NULL;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id text NOT NULL,
  usuario_id uuid,
  acao text NOT NULL,
  detalhes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip text,
  is_support_action boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super admin le auditoria" ON public.audit_logs;
CREATE POLICY "Super admin le auditoria" ON public.audit_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE INDEX IF NOT EXISTS audit_logs_empresa_idx ON public.audit_logs (empresa_id, criado_em DESC);

-- Empresa acessada pela sessão de suporte ativa (máx. 2h) do super admin logado
CREATE OR REPLACE FUNCTION public.suporte_conta() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lower(s.empresa_id) FROM public.support_sessions s
  WHERE s.super_admin_id = auth.uid() AND s.encerrado_em IS NULL
    AND s.iniciado_em > now() - interval '2 hours'
    AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin')
  ORDER BY s.iniciado_em DESC LIMIT 1
$$;
REVOKE EXECUTE ON FUNCTION public.suporte_conta() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.suporte_conta() TO authenticated;

DROP POLICY IF EXISTS isolamento_conta ON public.empregador;
DROP POLICY IF EXISTS isolamento_conta ON public.funcionarios;
DROP POLICY IF EXISTS isolamento_conta ON public.pontos;
DROP POLICY IF EXISTS isolamento_conta ON public.escala;
DROP POLICY IF EXISTS isolamento_conta ON public.logs;
DROP POLICY IF EXISTS isolamento_conta ON public.dados;
DROP POLICY IF EXISTS isolamento_conta ON public.feriados;
CREATE POLICY isolamento_conta ON public.empregador FOR ALL TO authenticated
  USING (lower(email_dono) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())))
  WITH CHECK (lower(email_dono) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())));
CREATE POLICY isolamento_conta ON public.funcionarios FOR ALL TO authenticated
  USING (lower(email_dono) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())))
  WITH CHECK (lower(email_dono) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())));
CREATE POLICY isolamento_conta ON public.pontos FOR ALL TO authenticated
  USING (lower(email_dono) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())))
  WITH CHECK (lower(email_dono) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())));
CREATE POLICY isolamento_conta ON public.escala FOR ALL TO authenticated
  USING (lower(email_dono) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())))
  WITH CHECK (lower(email_dono) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())));
CREATE POLICY isolamento_conta ON public.logs FOR ALL TO authenticated
  USING (lower(email_dono) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())))
  WITH CHECK (lower(email_dono) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())));
CREATE POLICY isolamento_conta ON public.dados FOR ALL TO authenticated
  USING (lower(conta) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())))
  WITH CHECK (lower(conta) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())));
CREATE POLICY isolamento_conta ON public.feriados FOR ALL TO authenticated
  USING (lower(conta) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())))
  WITH CHECK (lower(conta) IN (lower((SELECT auth.jwt()) ->> 'email'), (SELECT public.suporte_conta())));

-- Auditoria automática de toda alteração feita em modo suporte
CREATE OR REPLACE FUNCTION public.auditar_suporte() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE alvo text; conta_row text; r jsonb;
BEGIN
  alvo := public.suporte_conta();
  IF alvo IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  r := to_jsonb(COALESCE(NEW, OLD));
  conta_row := lower(COALESCE(r ->> 'email_dono', r ->> 'conta'));
  IF conta_row = alvo AND conta_row <> lower(COALESCE(auth.jwt() ->> 'email', '')) THEN
    INSERT INTO public.audit_logs (empresa_id, usuario_id, acao, detalhes, is_support_action)
    VALUES (alvo, auth.uid(), TG_OP || ' ' || TG_TABLE_NAME,
      jsonb_build_object('tabela', TG_TABLE_NAME, 'operacao', TG_OP, 'chave', COALESCE(r ->> 'nsr', r ->> 'pin', r ->> 'chave', r ->> 'id')), true);
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
REVOKE EXECUTE ON FUNCTION public.auditar_suporte() FROM PUBLIC, anon, authenticated;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['empregador','funcionarios','pontos','escala','dados','feriados'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS auditar_suporte ON public.%I', t);
    EXECUTE format('CREATE TRIGGER auditar_suporte AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.auditar_suporte()', t);
  END LOOP;
END $$;
