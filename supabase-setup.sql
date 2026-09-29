-- ============================================================================
-- VIP PONTO — Estrutura completa do banco (Supabase)
-- Rode este script UMA VEZ em: Supabase Dashboard > SQL Editor > New query
-- Cobre: empresas, funcionarios, batidas, feriados + tabela generica "dados"
-- (gerenciadores, escalas, ocorrencias, cargos, departamentos, logs, config...)
-- ============================================================================

-- 1) EMPRESAS (1 linha por conta do app — dados do empregador)
create table if not exists public.empresas (
  conta text primary key,              -- e-mail da conta do app
  dados jsonb not null,                -- razao, fantasia, cnpj/cpf, cei, endereco, horarios, logo base64...
  atualizado_em timestamptz not null default now()
);

-- 2) FUNCIONARIOS (ate 12 por conta)
create table if not exists public.funcionarios (
  conta text not null,
  pin text not null,                   -- PIN de 4 digitos (unico por conta)
  dados jsonb not null,                -- nome, cpf, cargo, funcao, departamento, escala, status, bancoInicio...
  primary key (conta, pin)
);

-- 3) BATIDAS (marcacoes de ponto — NSR sequencial intocavel)
create table if not exists public.batidas (
  conta text not null,
  nsr text not null,                   -- NSR de 9 digitos (unico por conta)
  dados jsonb not null,                -- pin, nome, cpf, data, hora, tipo, fonte, sync, offset, movimento...
  primary key (conta, nsr)
);
create index if not exists batidas_conta_data_idx on public.batidas (conta, ((dados->>'data')));

-- 4) FERIADOS (nacionais + municipais/estaduais cadastrados)
create table if not exists public.feriados (
  conta text not null,
  data date not null,
  nome text not null,
  tipo text,                           -- Nacional | Estadual | Municipal
  dados jsonb,
  primary key (conta, data, nome)
);

-- 5) DADOS (colecao generica por conta/chave)
--    chaves usadas pelo app: gerenciadores, escalas, ocorrencias, cargos,
--    departamentos, logs, logsEscala, nsr, config, dev, ntpOffset
create table if not exists public.dados (
  conta text not null,
  chave text not null,
  valor jsonb,
  atualizado_em timestamptz not null default now(),
  primary key (conta, chave)
);

-- ============================================================================
-- PERMISSOES (Data API)
-- ============================================================================
grant select, insert, update, delete on public.empresas     to anon, authenticated;
grant select, insert, update, delete on public.funcionarios to anon, authenticated;
grant select, insert, update, delete on public.batidas      to anon, authenticated;
grant select, insert, update, delete on public.feriados     to anon, authenticated;
grant select, insert, update, delete on public.dados        to anon, authenticated;
grant all on public.empresas     to service_role;
grant all on public.funcionarios to service_role;
grant all on public.batidas      to service_role;
grant all on public.feriados     to service_role;
grant all on public.dados        to service_role;

-- ============================================================================
-- RLS — ATENCAO
-- O app faz o login proprio (e-mail/senha no aparelho) e usa a chave anon,
-- entao as politicas abaixo liberam acesso total pela chave anon. Isso e
-- suficiente para uso interno, mas qualquer pessoa com a chave anon pode
-- ler/alterar os dados. Para producao, o recomendado e migrar o login para
-- Supabase Auth e trocar as politicas por conta = auth.jwt()->>'email'.
-- ============================================================================
alter table public.empresas     enable row level security;
alter table public.funcionarios enable row level security;
alter table public.batidas      enable row level security;
alter table public.feriados     enable row level security;
alter table public.dados        enable row level security;

create policy "acesso_app" on public.empresas     for all to anon, authenticated using (true) with check (true);
create policy "acesso_app" on public.funcionarios for all to anon, authenticated using (true) with check (true);
create policy "acesso_app" on public.batidas      for all to anon, authenticated using (true) with check (true);
create policy "acesso_app" on public.feriados     for all to anon, authenticated using (true) with check (true);
create policy "acesso_app" on public.dados        for all to anon, authenticated using (true) with check (true);
