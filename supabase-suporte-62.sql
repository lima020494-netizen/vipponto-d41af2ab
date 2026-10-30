-- Pacote 6.2: executar após reconectar o Supabase.
CREATE POLICY "Empresa acompanha seu suporte" ON public.support_sessions FOR SELECT TO authenticated
  USING (lower(empresa_id) = lower((SELECT auth.jwt()) ->> 'email'));
CREATE POLICY "Empresa acompanha sua auditoria" ON public.audit_logs FOR SELECT TO authenticated
  USING (lower(empresa_id) = lower((SELECT auth.jwt()) ->> 'email'));
GRANT SELECT ON public.support_sessions, public.audit_logs TO authenticated;
GRANT ALL ON public.support_sessions, public.audit_logs TO service_role;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['empregador','funcionarios','pontos','escala','dados','feriados','logs'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid=format('public.%I',t)::regclass AND tgname='auditar_suporte' AND NOT tgisinternal) THEN
      EXECUTE format('CREATE TRIGGER auditar_suporte AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.auditar_suporte()',t);
    END IF;
  END LOOP;
END $$;