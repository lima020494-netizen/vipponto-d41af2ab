-- funcionarios: adaptar para isolamento por email_dono
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS email_dono text, ADD COLUMN IF NOT EXISTS dados jsonb, ADD COLUMN IF NOT EXISTS status text, ADD COLUMN IF NOT EXISTS escala text, ADD COLUMN IF NOT EXISTS inicio_vigencia_banco_horas date;
ALTER TABLE public.funcionarios ALTER COLUMN empresa_id DROP NOT NULL, ALTER COLUMN cpf DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS funcionarios_dono_pin_uk ON public.funcionarios(email_dono, pin);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.funcionarios TO anon, authenticated;
GRANT ALL ON public.funcionarios TO service_role;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "acesso_livre" ON public.funcionarios;
CREATE POLICY "acesso_livre" ON public.funcionarios FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- escala: uma linha por semana/período por conta
ALTER TABLE public.escala ADD COLUMN IF NOT EXISTS email_dono text, ADD COLUMN IF NOT EXISTS semana text, ADD COLUMN IF NOT EXISTS dados jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS escala_dono_semana_uk ON public.escala(email_dono, semana);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.escala TO anon, authenticated;
GRANT ALL ON public.escala TO service_role;
ALTER TABLE public.escala ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "acesso_livre" ON public.escala;
CREATE POLICY "acesso_livre" ON public.escala FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- pontos
CREATE TABLE IF NOT EXISTS public.pontos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_dono text NOT NULL,
  nsr text NOT NULL,
  pin text, data text, hora text, tipo text,
  "timestamp" timestamptz DEFAULT now(),
  origem text,
  dados jsonb,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email_dono, nsr)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pontos TO anon, authenticated;
GRANT ALL ON public.pontos TO service_role;
ALTER TABLE public.pontos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso_livre" ON public.pontos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- logs
CREATE TABLE IF NOT EXISTS public.logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_dono text NOT NULL,
  quando text NOT NULL,
  por text,
  acao text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email_dono, quando, acao)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.logs TO anon, authenticated;
GRANT ALL ON public.logs TO service_role;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso_livre" ON public.logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- empregador
CREATE TABLE IF NOT EXISTS public.empregador (
  email_dono text PRIMARY KEY,
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.empregador TO anon, authenticated;
GRANT ALL ON public.empregador TO service_role;
ALTER TABLE public.empregador ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso_livre" ON public.empregador FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- dados genéricos e feriados também liberados (isolamento por conta no app)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dados, public.feriados TO anon, authenticated;
CREATE POLICY "acesso_livre" ON public.dados FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "acesso_livre" ON public.feriados FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);