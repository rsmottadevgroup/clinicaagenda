-- ============================================================
-- SCHEMA.SQL — Sistema de Agendamento para Clínica Médica
-- Execute este arquivo inteiro no SQL Editor do Supabase.
-- ============================================================

-- ------------------------------------------------------------
-- EXTENSÕES
-- ------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- TABELA: usuarios
-- Espelha auth.users com dados de perfil e a role do sistema.
-- ------------------------------------------------------------
create table if not exists usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  telefone text,
  avatar_url text,
  role text not null default 'cliente' check (role in ('cliente', 'admin')),
  criado_em timestamptz not null default now()
);

create index if not exists idx_usuarios_role on usuarios(role);

-- ------------------------------------------------------------
-- TABELA: medicos
-- Dados institucionais exibidos na página "Sobre" (1 registro
-- por profissional; suporta múltiplos médicos no futuro).
-- ------------------------------------------------------------
create table if not exists medicos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  crm text,
  biografia text,
  especializacoes text[],
  foto_url text,
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TABELA: disponibilidade
-- Regra de horários de atendimento por dia da semana (0=domingo).
-- ------------------------------------------------------------
create table if not exists disponibilidade (
  id uuid primary key default uuid_generate_v4(),
  dia_semana int not null unique check (dia_semana between 0 and 6),
  ativo boolean not null default false,
  horario_inicio time not null default '08:00',
  horario_fim time not null default '18:00',
  intervalo_inicio time,          -- início do almoço (opcional)
  intervalo_fim time,             -- fim do almoço (opcional)
  duracao_consulta_min int not null default 30,
  atualizado_em timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TABELA: agendamentos
-- ------------------------------------------------------------
create table if not exists agendamentos (
  id uuid primary key default uuid_generate_v4(),
  paciente_id uuid not null references usuarios(id) on delete cascade,
  data date not null,
  horario time not null,
  status text not null default 'aguardando' check (status in ('aguardando', 'confirmado', 'recusado', 'cancelado')),
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  -- Impede duas consultas ativas no mesmo horário
  constraint uniq_horario_ativo unique (data, horario)
);

create index if not exists idx_agendamentos_paciente on agendamentos(paciente_id);
create index if not exists idx_agendamentos_data on agendamentos(data);
create index if not exists idx_agendamentos_status on agendamentos(status);

-- ------------------------------------------------------------
-- TABELA: notificacoes
-- Fila de eventos que devem gerar push notification (consumida
-- por uma Edge Function / Cloud Function externa).
-- ------------------------------------------------------------
create table if not exists notificacoes (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null,
  agendamento_id uuid references agendamentos(id) on delete cascade,
  titulo text not null,
  mensagem text not null,
  lida boolean not null default false,
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TABELA: notificacoes_tokens
-- Tokens de dispositivo FCM por usuário (um usuário pode ter
-- vários dispositivos).
-- ------------------------------------------------------------
create table if not exists notificacoes_tokens (
  usuario_id uuid not null references usuarios(id) on delete cascade,
  token text not null,
  atualizado_em timestamptz not null default now(),
  primary key (usuario_id, token)
);

-- ------------------------------------------------------------
-- TABELA: configuracoes
-- Pares chave/valor para ajustes gerais do sistema (cores, textos,
-- contatos, etc.), editáveis futuramente sem alterar código.
-- ------------------------------------------------------------
create table if not exists configuracoes (
  chave text primary key,
  valor text
);

insert into configuracoes (chave, valor) values
  ('nome_clinica', 'Clínica Bem Estar'),
  ('telefone_contato', '(11) 99999-9999'),
  ('email_contato', 'contato@clinica.com.br'),
  ('endereco', 'Rua Exemplo, 123 - São Paulo, SP')
on conflict (chave) do nothing;

-- ------------------------------------------------------------
-- FUNÇÃO + TRIGGER: atualizar "atualizado_em" automaticamente
-- ------------------------------------------------------------
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp_agendamentos on agendamentos;
create trigger set_timestamp_agendamentos
before update on agendamentos
for each row execute function trigger_set_timestamp();

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------
alter table usuarios enable row level security;
alter table agendamentos enable row level security;
alter table disponibilidade enable row level security;
alter table notificacoes enable row level security;
alter table notificacoes_tokens enable row level security;
alter table medicos enable row level security;
alter table configuracoes enable row level security;

-- Função auxiliar: verifica se o usuário logado é admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from usuarios where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- USUARIOS: cada um vê/edita o próprio perfil; admin vê todos
create policy "usuarios_select_proprio_ou_admin" on usuarios
  for select using (auth.uid() = id or is_admin());
create policy "usuarios_insert_proprio" on usuarios
  for insert with check (auth.uid() = id);
create policy "usuarios_update_proprio_ou_admin" on usuarios
  for update using (auth.uid() = id or is_admin());

-- AGENDAMENTOS: paciente vê/cria/cancela os seus; admin vê e gerencia todos
create policy "agendamentos_select_proprio_ou_admin" on agendamentos
  for select using (auth.uid() = paciente_id or is_admin());
create policy "agendamentos_insert_proprio" on agendamentos
  for insert with check (auth.uid() = paciente_id);
create policy "agendamentos_update_proprio_ou_admin" on agendamentos
  for update using (auth.uid() = paciente_id or is_admin());

-- DISPONIBILIDADE: leitura pública (para exibir o calendário sem login), escrita só admin
create policy "disponibilidade_select_publica" on disponibilidade
  for select using (true);
create policy "disponibilidade_admin_gerencia" on disponibilidade
  for all using (is_admin()) with check (is_admin());

-- NOTIFICACOES: apenas admin lê/gerencia; inserção liberada (paciente dispara ao agendar)
create policy "notificacoes_insert_qualquer_autenticado" on notificacoes
  for insert with check (auth.uid() is not null);
create policy "notificacoes_admin_select_update" on notificacoes
  for select using (is_admin());
create policy "notificacoes_admin_update" on notificacoes
  for update using (is_admin());

-- NOTIFICACOES_TOKENS: cada usuário gerencia apenas seus próprios tokens
create policy "tokens_proprio" on notificacoes_tokens
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- MEDICOS / CONFIGURACOES: leitura pública, escrita só admin
create policy "medicos_select_publica" on medicos for select using (true);
create policy "medicos_admin_gerencia" on medicos for all using (is_admin()) with check (is_admin());
create policy "config_select_publica" on configuracoes for select using (true);
create policy "config_admin_gerencia" on configuracoes for update using (is_admin());

-- ------------------------------------------------------------
-- SEED: disponibilidade padrão (segunda a sexta, 08h-12h e 13h30-18h)
-- ------------------------------------------------------------
insert into disponibilidade (dia_semana, ativo, horario_inicio, horario_fim, intervalo_inicio, intervalo_fim, duracao_consulta_min)
values
  (1, true, '08:00', '18:00', '12:00', '13:30', 30),
  (2, true, '08:00', '18:00', '12:00', '13:30', 30),
  (3, true, '08:00', '18:00', '12:00', '13:30', 30),
  (4, true, '08:00', '18:00', '12:00', '13:30', 30),
  (5, true, '08:00', '18:00', '12:00', '13:30', 30),
  (0, false, '08:00', '12:00', null, null, 30),
  (6, false, '08:00', '12:00', null, null, 30)
on conflict (dia_semana) do nothing;

-- ------------------------------------------------------------
-- COMO CRIAR O PRIMEIRO ADMINISTRADOR
-- 1) Cadastre-se normalmente pelo site (será criado como "cliente").
-- 2) Rode o comando abaixo no SQL Editor, trocando o e-mail:
--
--    update usuarios set role = 'admin' where email = 'seu-email@exemplo.com';
-- ------------------------------------------------------------
