-- Mareas · Conexión MCP (claves de acceso para asistentes de IA)
-- Ejecútalo DESPUÉS de schema.sql, en el editor SQL de tu proyecto de Supabase.

-- 1) Claves: solo se guarda el hash SHA-256 de la clave; la clave en claro se muestra una vez en la app.
create table public.mareas_mcp_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  scope text not null default 'read' check (scope in ('read', 'write')),
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz
);
alter table public.mareas_mcp_tokens enable row level security;

create policy "mcp_tokens_select_own" on public.mareas_mcp_tokens
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "mcp_tokens_insert_own" on public.mareas_mcp_tokens
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "mcp_tokens_update_own" on public.mareas_mcp_tokens
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "mcp_tokens_delete_own" on public.mareas_mcp_tokens
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 2) Copias de seguridad automáticas antes de cada escritura de una IA (se conservan las 5 últimas por usuario).
create table public.mareas_mcp_backups (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  rev bigint not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.mareas_mcp_backups enable row level security;
create policy "mcp_backups_select_own" on public.mareas_mcp_backups
  for select to authenticated using ((select auth.uid()) = user_id);

-- 3) Funciones que usa SOLO la Edge Function (rol service_role). Resuelven al usuario a partir del hash de la clave.
create or replace function public.mcp_read_state(p_hash text)
returns table (out_user uuid, out_data jsonb, out_rev bigint, out_scope text, out_updated timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  t public.mareas_mcp_tokens;
begin
  select * into t from public.mareas_mcp_tokens k
   where k.token_hash = p_hash and k.revoked_at is null and (k.expires_at is null or k.expires_at > now());
  if not found then
    raise exception 'invalid token' using errcode = '28000';
  end if;
  update public.mareas_mcp_tokens set last_used_at = now() where id = t.id;
  return query
    select s.user_id, s.data, s.rev, t.scope, s.updated_at
      from public.mareas_state s where s.user_id = t.user_id;
end;
$$;

create or replace function public.mcp_push_state(p_hash text, p_data jsonb, p_base bigint)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  t public.mareas_mcp_tokens;
  cur bigint;
  old jsonb;
begin
  select * into t from public.mareas_mcp_tokens k
   where k.token_hash = p_hash and k.revoked_at is null and (k.expires_at is null or k.expires_at > now());
  if not found then
    raise exception 'invalid token' using errcode = '28000';
  end if;
  if t.scope <> 'write' then
    raise exception 'token is read-only' using errcode = '42501';
  end if;
  select s.rev, s.data into cur, old from public.mareas_state s where s.user_id = t.user_id for update;
  if not found then
    return -2;
  end if;
  if cur <> p_base then
    return -1;  -- otro dispositivo cambió la nube: la Edge Function relee y reintenta
  end if;
  insert into public.mareas_mcp_backups (user_id, rev, data) values (t.user_id, cur, old);
  delete from public.mareas_mcp_backups
   where user_id = t.user_id
     and id not in (select b.id from public.mareas_mcp_backups b where b.user_id = t.user_id order by b.id desc limit 5);
  update public.mareas_state
     set data = p_data, rev = cur + 1, device = left('MCP · ' || t.name, 60), updated_at = now()
   where user_id = t.user_id;
  update public.mareas_mcp_tokens set last_used_at = now() where id = t.id;
  return cur + 1;
end;
$$;

revoke all on function public.mcp_read_state(text) from public, anon, authenticated;
revoke all on function public.mcp_push_state(text, jsonb, bigint) from public, anon, authenticated;
grant execute on function public.mcp_read_state(text) to service_role;
grant execute on function public.mcp_push_state(text, jsonb, bigint) to service_role;
