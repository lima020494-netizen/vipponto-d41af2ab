
-- Remove acessos livres
DROP POLICY IF EXISTS acesso_livre ON public.dados;
DROP POLICY IF EXISTS acesso_livre ON public.empregador;
DROP POLICY IF EXISTS acesso_livre ON public.escala;
DROP POLICY IF EXISTS acesso_livre ON public.feriados;
DROP POLICY IF EXISTS acesso_livre ON public.funcionarios;
DROP POLICY IF EXISTS acesso_livre ON public.logs;
DROP POLICY IF EXISTS acesso_livre ON public.pontos;
DROP POLICY IF EXISTS "empresa ve tudo" ON public.escala;
DROP POLICY IF EXISTS "empresa ve tudo" ON public.funcionarios;
DROP POLICY IF EXISTS "empresa ve tudo" ON public.folhas;
DROP POLICY IF EXISTS "empresa ve tudo" ON public.empresas;
DROP POLICY IF EXISTS isolamento ON public.dados;
DROP POLICY IF EXISTS isolamento ON public.feriados;

-- RLS em todas as tabelas
ALTER TABLE public.dados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empregador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escala ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feriados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_horas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_config ENABLE ROW LEVEL SECURITY;

-- Sem acesso anônimo aos dados das empresas
REVOKE ALL ON public.dados, public.empregador, public.escala, public.feriados, public.funcionarios, public.logs, public.pontos, public.empresas, public.folhas, public.banco_horas, public.dev_config FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dados, public.empregador, public.escala, public.feriados, public.funcionarios, public.logs, public.pontos TO authenticated;
GRANT ALL ON public.dados, public.empregador, public.escala, public.feriados, public.funcionarios, public.logs, public.pontos, public.licencas, public.banco_horas, public.dev_config TO service_role;

-- Isolamento por conta (e-mail da sessão)
CREATE POLICY isolamento_conta ON public.empregador FOR ALL TO authenticated
  USING (lower(email_dono) = lower((SELECT auth.jwt()) ->> 'email')) WITH CHECK (lower(email_dono) = lower((SELECT auth.jwt()) ->> 'email'));
CREATE POLICY isolamento_conta ON public.funcionarios FOR ALL TO authenticated
  USING (lower(email_dono) = lower((SELECT auth.jwt()) ->> 'email')) WITH CHECK (lower(email_dono) = lower((SELECT auth.jwt()) ->> 'email'));
CREATE POLICY isolamento_conta ON public.pontos FOR ALL TO authenticated
  USING (lower(email_dono) = lower((SELECT auth.jwt()) ->> 'email')) WITH CHECK (lower(email_dono) = lower((SELECT auth.jwt()) ->> 'email'));
CREATE POLICY isolamento_conta ON public.escala FOR ALL TO authenticated
  USING (lower(email_dono) = lower((SELECT auth.jwt()) ->> 'email')) WITH CHECK (lower(email_dono) = lower((SELECT auth.jwt()) ->> 'email'));
CREATE POLICY isolamento_conta ON public.logs FOR ALL TO authenticated
  USING (lower(email_dono) = lower((SELECT auth.jwt()) ->> 'email')) WITH CHECK (lower(email_dono) = lower((SELECT auth.jwt()) ->> 'email'));
CREATE POLICY isolamento_conta ON public.dados FOR ALL TO authenticated
  USING (lower(conta) = lower((SELECT auth.jwt()) ->> 'email')) WITH CHECK (lower(conta) = lower((SELECT auth.jwt()) ->> 'email'));
CREATE POLICY isolamento_conta ON public.feriados FOR ALL TO authenticated
  USING (lower(conta) = lower((SELECT auth.jwt()) ->> 'email')) WITH CHECK (lower(conta) = lower((SELECT auth.jwt()) ->> 'email'));
CREATE POLICY folhas_dono ON public.folhas FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Função legada: caminho fixo e sem execução anônima
ALTER FUNCTION public.registrar_ponto(uuid, text, text) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.registrar_ponto(uuid, text, text) FROM PUBLIC, anon;
