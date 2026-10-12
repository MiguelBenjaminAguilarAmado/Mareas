-- Esquema de la nube de Mareas (Supabase). Ejecútalo en el editor SQL de tu propio proyecto si haces un fork.
-- Después cambia SBU y SBK (URL del proyecto y clave publishable) al principio del bloque "fase 4" de index.html.

-- Una fila por usuario con todo su estado (JSON) y un número de revisión para detectar conflictos.
create table public.mareas_state (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  data jsonb not null,
  rev bigint not null default 1,
  device text,
  updated_at timestamptz not null default now()
);

alter table public.mareas_state enable row level security;

create policy "mareas_state_select_own" on public.mareas_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "mareas_state_insert_own" on public.mareas_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "mareas_state_update_own" on public.mareas_state
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "mareas_state_delete_own" on public.mareas_state
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Guardado con comparación de revisión: devuelve la nueva revisión o -1 si otro dispositivo cambió la nube antes.
create or replace function public.push_state(p_data jsonb, p_base bigint, p_device text default null)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  cur bigint;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  select rev into cur from public.mareas_state where user_id = uid for update;
  if not found then
    insert into public.mareas_state (user_id, data, rev, device) values (uid, p_data, 1, p_device);
    return 1;
  end if;
  if cur <> p_base then
    return -1;
  end if;
  update public.mareas_state
     set data = p_data, rev = cur + 1, device = p_device, updated_at = now()
   where user_id = uid;
  return cur + 1;
end;
$$;

revoke all on function public.push_state(jsonb, bigint, text) from public, anon, authenticated;
grant execute on function public.push_state(jsonb, bigint, text) to authenticated;

-- Bucket privado para fotos y vídeos: cada usuario solo accede a su carpeta (<user_id>/<archivo>).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mareas-media', 'mareas-media', false, 52428800, array['image/*', 'video/*'])
on conflict (id) do nothing;

create policy "mareas_media_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'mareas-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "mareas_media_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'mareas-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "mareas_media_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'mareas-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'mareas-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "mareas_media_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'mareas-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
