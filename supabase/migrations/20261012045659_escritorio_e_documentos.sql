-- Dados do escritório do aluno (vão no cabeçalho dos documentos)
create table public.escritorios (
  usuario_id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  profissional text,
  registro text,
  documento text,
  endereco text,
  telefone text,
  email text,
  site text,
  logo_caminho text,
  logo_posicao text not null default 'esquerda' check (logo_posicao in ('esquerda', 'centro', 'direita')),
  mostrar_cabecalho boolean not null default true,
  atualizado_em timestamptz not null default now()
);

-- Documentos que o aluno gerou a partir dos modelos (rascunhos salvos)
create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  modelo_id text not null,
  titulo text not null,
  valores jsonb not null default '{}'::jsonb,
  conteudo jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index documentos_usuario_idx on public.documentos (usuario_id, atualizado_em desc);

create trigger escritorios_atualizado_em before update on public.escritorios
  for each row execute function public.tocar_atualizado_em();
create trigger documentos_atualizado_em before update on public.documentos
  for each row execute function public.tocar_atualizado_em();

alter table public.escritorios enable row level security;
alter table public.documentos enable row level security;

create policy "vê o próprio escritório" on public.escritorios for select to authenticated
  using (usuario_id = (select auth.uid()));
create policy "cria o próprio escritório" on public.escritorios for insert to authenticated
  with check (usuario_id = (select auth.uid()) and public.tem_acesso());
create policy "altera o próprio escritório" on public.escritorios for update to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()) and public.tem_acesso());

create policy "vê os próprios documentos" on public.documentos for select to authenticated
  using (usuario_id = (select auth.uid()));
create policy "cria os próprios documentos" on public.documentos for insert to authenticated
  with check (usuario_id = (select auth.uid()) and public.tem_acesso());
create policy "altera os próprios documentos" on public.documentos for update to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()) and public.tem_acesso());
create policy "apaga os próprios documentos" on public.documentos for delete to authenticated
  using (usuario_id = (select auth.uid()));

-- Logos: bucket privado, cada aluno só mexe na própria pasta (<usuario_id>/...)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', false, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;

create policy "vê a própria logo" on storage.objects for select to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "envia a própria logo" on storage.objects for insert to authenticated
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text and public.tem_acesso());
create policy "troca a própria logo" on storage.objects for update to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "apaga a própria logo" on storage.objects for delete to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = (select auth.uid())::text);
