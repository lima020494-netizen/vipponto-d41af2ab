CREATE TABLE public.folha_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_dono text NOT NULL,
  funcionario_pin text NOT NULL,
  competencia date NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  last_accessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT folha_access_tokens_competencia_inicio CHECK (competencia = date_trunc('month', competencia)::date)
);
GRANT ALL ON public.folha_access_tokens TO service_role;
ALTER TABLE public.folha_access_tokens ENABLE ROW LEVEL SECURITY;
CREATE INDEX folha_access_tokens_owner_month_idx ON public.folha_access_tokens (email_dono, funcionario_pin, competencia);
CREATE INDEX folha_access_tokens_expiry_idx ON public.folha_access_tokens (expires_at) WHERE revoked_at IS NULL;
CREATE OR REPLACE FUNCTION public.update_folha_access_tokens_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER update_folha_access_tokens_updated_at
BEFORE UPDATE ON public.folha_access_tokens
FOR EACH ROW EXECUTE FUNCTION public.update_folha_access_tokens_updated_at();