-- Lista de e-mails liberados (alunos e administradores)
create table public.acessos (
  email text primary key check (email = lower(email) and position('@' in email) > 1),
  nome text,
  papel text not null default 'aluno' check (papel in ('aluno', 'admin')),
  status text not null default 'liberado' check (status in ('liberado', 'bloqueado')),
  origem text not null default 'manual',
  observacao text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
comment on table public.acessos is 'E-mails autorizados a usar a plataforma. Só quem está aqui com status liberado consegue criar conta e acessar.';

-- Perfil de cada usuário cadastrado
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nome text,
  criado_em timestamptz not null default now(),
  ultimo_acesso timestamptz
);

-- Progresso pessoal do aluno (salvos, concluídos, recentes e checklists)
create table public.progresso (
  usuario_id uuid primary key references auth.users (id) on delete cascade,
  favoritos text[] not null default '{}',
  concluidos text[] not null default '{}',
  recentes text[] not null default '{}',
  checklists jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

-- ---------- Funções de apoio ----------

create or replace function public.email_atual()
returns text
language sql
stable
set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.tem_acesso()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.acessos a
    where a.email = public.email_atual() and a.status = 'liberado'
  );
$$;

create or replace function public.e_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.acessos a
    where a.email = public.email_atual() and a.status = 'liberado' and a.papel = 'admin'
  );
$$;

-- Usada na tela de cadastro para dar uma mensagem clara antes de criar a conta
create or replace function public.pode_cadastrar(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.acessos a
    where a.email = lower(trim(p_email)) and a.status = 'liberado'
  );
$$;

create or replace function public.registrar_acesso()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.perfis set ultimo_acesso = now() where id = auth.uid();
$$;

create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger acessos_atualizado_em before update on public.acessos
  for each row execute function public.tocar_atualizado_em();
create trigger progresso_atualizado_em before update on public.progresso
  for each row execute function public.tocar_atualizado_em();

-- Normaliza o e-mail digitado no painel
create or replace function public.normalizar_email_acesso()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

create trigger acessos_normalizar_email before insert or update of email on public.acessos
  for each row execute function public.normalizar_email_acesso();

-- ---------- Cadastro: só e-mails liberados ----------

create or replace function public.bloquear_cadastro_nao_liberado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.acessos a
    where a.email = lower(new.email) and a.status = 'liberado'
  ) then
    raise exception 'Cadastro não liberado para este e-mail';
  end if;
  return new;
end;
$$;

create trigger antes_de_criar_usuario before insert on auth.users
  for each row execute function public.bloquear_cadastro_nao_liberado();

create or replace function public.criar_perfil_do_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, email, nome)
  values (new.id, lower(new.email), nullif(new.raw_user_meta_data ->> 'nome', ''));
  insert into public.progresso (usuario_id) values (new.id);
  return new;
end;
$$;

create trigger depois_de_criar_usuario after insert on auth.users
  for each row execute function public.criar_perfil_do_usuario();

-- ---------- Segurança (RLS) ----------

alter table public.acessos enable row level security;
alter table public.perfis enable row level security;
alter table public.progresso enable row level security;

create policy "admin vê acessos" on public.acessos for select to authenticated using (public.e_admin());
create policy "admin cria acessos" on public.acessos for insert to authenticated with check (public.e_admin());
create policy "admin altera acessos" on public.acessos for update to authenticated using (public.e_admin()) with check (public.e_admin());
create policy "admin remove acessos" on public.acessos for delete to authenticated using (public.e_admin());

create policy "vê o próprio perfil ou admin" on public.perfis for select to authenticated
  using (id = auth.uid() or public.e_admin());
create policy "altera o próprio perfil" on public.perfis for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "vê o próprio progresso ou admin" on public.progresso for select to authenticated
  using ((usuario_id = auth.uid() and public.tem_acesso()) or public.e_admin());
create policy "cria o próprio progresso" on public.progresso for insert to authenticated
  with check (usuario_id = auth.uid() and public.tem_acesso());
create policy "altera o próprio progresso" on public.progresso for update to authenticated
  using (usuario_id = auth.uid() and public.tem_acesso())
  with check (usuario_id = auth.uid() and public.tem_acesso());

-- Permissões das funções
revoke all on function public.tem_acesso() from public, anon;
revoke all on function public.e_admin() from public, anon;
revoke all on function public.registrar_acesso() from public, anon;
revoke all on function public.bloquear_cadastro_nao_liberado() from public, anon, authenticated;
revoke all on function public.criar_perfil_do_usuario() from public, anon, authenticated;
grant execute on function public.tem_acesso() to authenticated;
grant execute on function public.e_admin() to authenticated;
grant execute on function public.registrar_acesso() to authenticated;
grant execute on function public.pode_cadastrar(text) to anon, authenticated;

-- Primeiro administrador
insert into public.acessos (email, nome, papel, origem)
values ('douglas1210sousa@gmail.com', 'Douglas', 'admin', 'configuracao_inicial');
