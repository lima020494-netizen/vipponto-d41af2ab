-- Ponto Pro Gestão — auditoria prioritária / PREPARADO, NÃO APLICADO.
-- Banco externo compartilhado: NÃO executar sem autorização explícita.
-- Substitui o antigo setup que liberava acesso anônimo irrestrito.
-- Pré-requisitos: schema atual (pontos, funcionarios, empregador, Supabase Auth).
-- Não recria tabelas legadas, não altera carimbos, não renumera registros existentes.
-- Aplicação futura exclusivamente pela ferramenta de migração.

create table public.ponto_nsr_contadores (
  email_dono text primary key,
  ultimo_nsr bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.ponto_nsr_contadores to authenticated;
grant all on public.ponto_nsr_contadores to service_role;
alter table public.ponto_nsr_contadores enable row level security;
create policy "Conta consulta seu contador" on public.ponto_nsr_contadores
  for select to authenticated
  using (email_dono = lower((select auth.jwt()) ->> 'email'));

-- Aborta se houver duplicidade histórica; não resolve conflitos apagando dados.
create unique index if not exists pontos_conta_nsr_unico
  on public.pontos (email_dono, nsr);
create unique index if not exists pontos_conta_evento_unico
  on public.pontos (email_dono, (dados ->> 'eventoId'))
  where dados ->> 'eventoId' is not null;

create or replace function public.registrar_ponto_sequencial(p_evento uuid, p_batida jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conta text := lower(auth.jwt() ->> 'email');
  v_existente jsonb;
  v_max bigint;
  v_nsr bigint;
  v_payload jsonb;
  v_instante timestamptz;
  v_civil timestamp;
begin
  if auth.uid() is null or v_conta is null then
    raise exception 'Autenticação obrigatória' using errcode = '42501';
  end if;
  if p_evento is null or jsonb_typeof(p_batida) <> 'object' then
    raise exception 'Evento e batida obrigatórios';
  end if;
  if p_batida ->> 'pin' is null or p_batida ->> 'data' is null
     or p_batida ->> 'hora' is null or p_batida ->> 'criadoEm' is null
     or coalesce(p_batida ->> 'tipo', '') not in ('Entrada','Saída Intervalo','Entrada Intervalo','Saída') then
    raise exception 'Dados da marcação inválidos';
  end if;
  if not exists (select 1 from public.funcionarios
    where lower(email_dono) = v_conta and pin = p_batida ->> 'pin') then
    raise exception 'Colaborador não pertence à conta' using errcode = '42501';
  end if;
  v_instante := (p_batida ->> 'criadoEm')::timestamptz;
  v_civil := v_instante at time zone 'America/Belem';
  if p_batida ->> 'fonte' <> 'MANUAL' and (
    p_batida ->> 'data' <> to_char(v_civil, 'YYYY-MM-DD') or
    p_batida ->> 'hora' <> to_char(v_civil, 'HH24:MI')) then
    raise exception 'Carimbo civil diferente do horário de Belém';
  end if;
  -- Fila offline: mesma UUID retorna o mesmo NSR, mesmo após resposta perdida.
  -- Serialização por conta cobre múltiplos dispositivos, sem estado no servidor.
  perform pg_advisory_xact_lock(hashtextextended('ponto-nsr:' || v_conta, 0));
  select dados into v_existente from public.pontos
    where email_dono = v_conta and dados ->> 'eventoId' = p_evento::text;
  if found then
    if v_existente ->> 'pin' is distinct from p_batida ->> 'pin'
      or v_existente ->> 'data' is distinct from p_batida ->> 'data'
      or v_existente ->> 'hora' is distinct from p_batida ->> 'hora'
      or v_existente ->> 'criadoEm' is distinct from p_batida ->> 'criadoEm' then
      raise exception 'UUID já vinculada a outra marcação';
    end if;
    return v_existente;
  end if;
  -- Considera TODO o histórico, não a janela inicial carregada no aparelho.
  select coalesce(max(nsr::bigint), 0) into v_max from public.pontos
    where email_dono = v_conta and nsr ~ '^[0-9]{1,9}$';
  insert into public.ponto_nsr_contadores(email_dono, ultimo_nsr)
    values (v_conta, v_max + 1)
    on conflict (email_dono) do update
      set ultimo_nsr = greatest(ponto_nsr_contadores.ultimo_nsr, v_max) + 1,
          updated_at = now()
    returning ultimo_nsr into v_nsr;
  if v_nsr > 999999998 then raise exception 'Limite do NSR atingido'; end if;
  v_payload := (p_batida - 'nsr') || jsonb_build_object(
    'nsr', lpad(v_nsr::text, 9, '0'), 'eventoId', p_evento::text,
    'nsrPendente', false, 'metodo', 'PIN', 'fuso', 'America/Belem');
  insert into public.pontos(email_dono, nsr, pin, data, hora, tipo, timestamp, origem, dados)
    values (v_conta, v_payload ->> 'nsr', v_payload ->> 'pin',
      v_payload ->> 'data', v_payload ->> 'hora', v_payload ->> 'tipo',
      v_instante, v_payload ->> 'fonte', v_payload);
  return v_payload;
end;
$$;
revoke all on function public.registrar_ponto_sequencial(uuid,jsonb) from public, anon;
grant execute on function public.registrar_ponto_sequencial(uuid,jsonb) to authenticated;
