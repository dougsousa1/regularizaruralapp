-- Conteúdo editável pelo painel de administração.
-- O conteúdo original continua nos arquivos do repositório (conteudo/); cada linha daqui
-- substitui o item de mesmo id (ou cria um novo). "excluido" esconde o item do site.
-- O site lê estas tabelas no servidor com a chave secreta; alunos não leem direto.

create table public.pilares (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nome text not null check (length(trim(nome)) > 0),
  descricao text not null default '',
  icone text not null default 'estrela',
  comece_aqui text,
  ordem integer not null default 0,
  excluido boolean not null default false,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid default auth.uid()
);

create table public.conteudos (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  pilar text not null,
  tipo text not null check (tipo in ('guia', 'checklist', 'fluxo', 'referencia')),
  titulo text not null check (length(trim(titulo)) > 0),
  resumo text not null default '',
  tags text[] not null default '{}',
  base_legal text[] not null default '{}',
  relacionados text[] not null default '{}',
  fonte text not null default '',
  revisao text not null default 'pendente',
  corpo text not null default '',
  fluxo jsonb,
  excluido boolean not null default false,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid default auth.uid()
);

-- Histórico: guarda a versão anterior a cada alteração ou exclusão.
create table public.conteudos_versoes (
  id bigint generated always as identity primary key,
  conteudo_id text not null,
  dados jsonb not null,
  criado_em timestamptz not null default now(),
  criado_por uuid default auth.uid()
);
create index conteudos_versoes_conteudo on public.conteudos_versoes (conteudo_id, criado_em desc);

create or replace function public.guardar_versao_conteudo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.conteudos_versoes (conteudo_id, dados) values (old.id, to_jsonb(old));
  if tg_op = 'DELETE' then
    return old;
  end if;
  new.atualizado_em := now();
  new.atualizado_por := auth.uid();
  return new;
end;
$$;

create trigger conteudos_versao before update or delete on public.conteudos
  for each row execute function public.guardar_versao_conteudo();
create trigger pilares_atualizado_em before update on public.pilares
  for each row execute function public.tocar_atualizado_em();

revoke all on function public.guardar_versao_conteudo() from public, anon, authenticated;

alter table public.pilares enable row level security;
alter table public.conteudos enable row level security;
alter table public.conteudos_versoes enable row level security;

create policy "admin vê pilares" on public.pilares for select to authenticated using (public.e_admin());
create policy "admin cria pilares" on public.pilares for insert to authenticated with check (public.e_admin());
create policy "admin altera pilares" on public.pilares for update to authenticated using (public.e_admin()) with check (public.e_admin());
create policy "admin remove pilares" on public.pilares for delete to authenticated using (public.e_admin());

create policy "admin vê conteúdos" on public.conteudos for select to authenticated using (public.e_admin());
create policy "admin cria conteúdos" on public.conteudos for insert to authenticated with check (public.e_admin());
create policy "admin altera conteúdos" on public.conteudos for update to authenticated using (public.e_admin()) with check (public.e_admin());
create policy "admin remove conteúdos" on public.conteudos for delete to authenticated using (public.e_admin());

create policy "admin vê versões" on public.conteudos_versoes for select to authenticated using (public.e_admin());
