-- Copia o status e o papel do aluno para o app_metadata do usuário (vai no token de login),
-- para o site checar o acesso sem consultar o banco a cada página.
create or replace function public.sincronizar_acesso_no_usuario(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
  v_papel text;
begin
  select a.status, a.papel into v_status, v_papel
  from public.acessos a where a.email = lower(p_email);

  update auth.users u
  set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object(
      'acesso', coalesce(v_status, 'sem_cadastro'),
      'papel', coalesce(v_papel, 'aluno')
    )
  where lower(u.email) = lower(p_email);
end;
$$;

revoke all on function public.sincronizar_acesso_no_usuario(text) from public, anon, authenticated;

create or replace function public.ao_mudar_acesso()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public.sincronizar_acesso_no_usuario(old.email);
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    perform public.sincronizar_acesso_no_usuario(new.email);
  end if;
  return null;
end;
$$;

revoke all on function public.ao_mudar_acesso() from public, anon, authenticated;

create trigger acessos_sincronizar_usuario after insert or update or delete on public.acessos
  for each row execute function public.ao_mudar_acesso();

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
  perform public.sincronizar_acesso_no_usuario(new.email);
  return new;
end;
$$;
