create or replace function public.registrar_acesso()
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.perfis set ultimo_acesso = now() where id = auth.uid();
$$;
