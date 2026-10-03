CREATE TABLE public.licencas (
  email_dono text PRIMARY KEY,
  user_id uuid,
  status text NOT NULL DEFAULT 'trial',
  plano integer NOT NULL DEFAULT 1,
  data_vencimento timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  tipo_pagamento text NOT NULL DEFAULT 'pix',
  valor_mensal numeric(10,2),
  aceite_termos jsonb,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.licencas TO authenticated;
GRANT ALL ON public.licencas TO service_role;
ALTER TABLE public.licencas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conta le a propria licenca" ON public.licencas FOR SELECT TO authenticated
  USING (email_dono = lower((SELECT auth.jwt()) ->> 'email'));

CREATE TABLE public.app_config (
  chave text PRIMARY KEY,
  valor jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_config TO anon, authenticated;
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Config publica de cobranca" ON public.app_config FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.vp_touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER licencas_updated BEFORE UPDATE ON public.licencas FOR EACH ROW EXECUTE FUNCTION public.vp_touch_updated_at();
CREATE TRIGGER app_config_updated BEFORE UPDATE ON public.app_config FOR EACH ROW EXECUTE FUNCTION public.vp_touch_updated_at();

DO $$ BEGIN CREATE TYPE public.app_role AS ENUM ('admin','moderator','user'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuario ve os proprios papeis" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;