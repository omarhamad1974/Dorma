-- Dorma: backups, version history and keep-alive (studio → Site care).
--
-- site_versions gets a kind, a label and a pin:
--   kind 'publish'  = saved by Publish (as before)
--        'snapshot' = saved by hand with "Save a snapshot now"
--        'auto'     = saved by the studio just before a restore or an import replaces the draft
--   pinned versions are never trimmed. The number kept is set in the studio (draft → backups.keep, 5 to 100,
--   default 30) so the history stays small on the free Supabase plan.
--
-- keepalive_log: a tiny log written by the daily GitHub Actions ping (.github/workflows/keep-alive.yml),
-- so the free project never sits idle for a week (Supabase pauses idle free projects). Anyone may call
-- keep_alive() (it is the public site key that pings), but it writes at most one row every 10 minutes
-- and keeps only the latest 200 rows. Only editors can read the log.

alter table public.site_versions
  add column if not exists kind   text    not null default 'publish',
  add column if not exists label  text    not null default '',
  add column if not exists pinned boolean not null default false;
alter table public.site_versions drop constraint if exists site_versions_kind_check;
alter table public.site_versions add constraint site_versions_kind_check check (kind in ('publish', 'snapshot', 'auto'));
alter table public.site_versions drop constraint if exists site_versions_label_check;
alter table public.site_versions add constraint site_versions_label_check check (char_length(label) <= 120);

-- How many versions to keep, read from the saved draft (studio → Site care → Backups).
create or replace function public.versions_to_keep() returns integer
language sql stable security definer set search_path = ''
as $$
  select least(100, greatest(5, coalesce(
    (select case when (config #>> '{backups,keep}') ~ '^\d{1,3}$' then (config #>> '{backups,keep}')::int end
       from public.site_config where id = 'draft'), 30)))
$$;
revoke all on function public.versions_to_keep() from public, anon;

-- Keeps the newest N unpinned versions (pinned ones are always kept). The newest publish is never removed.
create or replace function public.trim_versions() returns void
language plpgsql security definer set search_path = ''
as $$
declare n int := public.versions_to_keep();
begin
  delete from public.site_versions v
   where not v.pinned
     and v.id <> coalesce((select max(id) from public.site_versions where kind = 'publish'), -1)
     and v.id not in (select id from public.site_versions where not pinned order by id desc limit n);
end $$;
revoke all on function public.trim_versions() from public, anon, authenticated;

-- Publish: same as before, plus an optional label, and the history trimmed to the chosen number.
drop function if exists public.publish_draft();
create or replace function public.publish_draft(p_label text default '') returns timestamptz
language plpgsql security definer set search_path = ''
as $$
declare d jsonb; t timestamptz := now();
begin
  if not public.is_editor() then raise exception 'Only editors can publish' using errcode = '42501'; end if;
  select config into d from public.site_config where id = 'draft';
  if d is null then raise exception 'There is no saved draft to publish'; end if;
  insert into public.site_config (id, config) values ('live', d)
    on conflict (id) do update set config = excluded.config;
  insert into public.site_versions (config, published_by, kind, label)
    values (d, auth.uid(), 'publish', left(coalesce(p_label, ''), 120));
  perform public.trim_versions();
  return t;
end $$;
revoke all on function public.publish_draft(text) from public, anon;
grant execute on function public.publish_draft(text) to authenticated;

-- Saves the current saved draft as a version without publishing it.
create or replace function public.save_snapshot(p_label text default '', p_kind text default 'snapshot') returns bigint
language plpgsql security definer set search_path = ''
as $$
declare d jsonb; new_id bigint;
begin
  if not public.is_editor() then raise exception 'Only editors can save snapshots' using errcode = '42501'; end if;
  if p_kind not in ('snapshot', 'auto') then raise exception 'Unknown snapshot kind'; end if;
  select config into d from public.site_config where id = 'draft';
  if d is null then raise exception 'There is no saved draft yet'; end if;
  insert into public.site_versions (config, published_by, kind, label)
    values (d, auth.uid(), p_kind, left(coalesce(p_label, ''), 120)) returning id into new_id;
  perform public.trim_versions();
  return new_id;
end $$;
revoke all on function public.save_snapshot(text, text) from public, anon;
grant execute on function public.save_snapshot(text, text) to authenticated;

-- Renames or pins a version.
create or replace function public.update_version(p_id bigint, p_label text, p_pinned boolean) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_editor() then raise exception 'Only editors can change versions' using errcode = '42501'; end if;
  update public.site_versions set label = left(coalesce(p_label, ''), 120), pinned = coalesce(p_pinned, pinned) where id = p_id;
  if not p_pinned then perform public.trim_versions(); end if;
end $$;
revoke all on function public.update_version(bigint, text, boolean) from public, anon;
grant execute on function public.update_version(bigint, text, boolean) to authenticated;

-- Deletes one version (never the newest publish, which is what visitors see).
create or replace function public.delete_version(p_id bigint) returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_editor() then raise exception 'Only editors can delete versions' using errcode = '42501'; end if;
  if p_id = (select max(id) from public.site_versions where kind = 'publish') then return false; end if;
  delete from public.site_versions where id = p_id;
  return found;
end $$;
revoke all on function public.delete_version(bigint) from public, anon;
grant execute on function public.delete_version(bigint) to authenticated;

-- The version list for the studio, with each version's stored size, and the database size (free plan: 500 MB).
create or replace function public.version_list()
returns table (id bigint, published_at timestamptz, kind text, label text, pinned boolean, bytes integer, mine boolean)
language sql stable security definer set search_path = ''
as $$
  select v.id, v.published_at, v.kind, v.label, v.pinned, pg_column_size(v.config), v.published_by = auth.uid()
    from public.site_versions v
   where public.is_editor()
   order by v.id desc
$$;
revoke all on function public.version_list() from public, anon;
grant execute on function public.version_list() to authenticated;

create or replace function public.database_size() returns bigint
language sql stable security definer set search_path = ''
as $$ select case when public.is_editor() then pg_database_size(current_database()) end $$;
revoke all on function public.database_size() from public, anon;
grant execute on function public.database_size() to authenticated;

-- Keep-alive log.
create table if not exists public.keepalive_log (
  id     bigint generated always as identity primary key,
  at     timestamptz not null default now(),
  source text not null default 'github' check (char_length(source) <= 20),
  note   text not null default '' check (char_length(note) <= 120)
);
alter table public.keepalive_log enable row level security;
revoke all on public.keepalive_log from anon, authenticated;

create or replace function public.keep_alive(p_source text default 'github', p_note text default '') returns timestamptz
language plpgsql security definer set search_path = ''
as $$
declare prev timestamptz;
begin
  select max(at) into prev from public.keepalive_log;
  if prev is not null and prev > now() - interval '10 minutes' then return prev; end if;
  insert into public.keepalive_log (source, note)
    values (left(coalesce(nullif(p_source, ''), 'github'), 20), left(coalesce(p_note, ''), 120));
  delete from public.keepalive_log where id not in (select id from public.keepalive_log order by id desc limit 200);
  return now();
end $$;
revoke all on function public.keep_alive(text, text) from public;
grant execute on function public.keep_alive(text, text) to anon, authenticated;

create or replace function public.keepalive_status()
returns table (at timestamptz, source text, note text)
language sql stable security definer set search_path = ''
as $$ select k.at, k.source, k.note from public.keepalive_log k where public.is_editor() order by k.id desc limit 30 $$;
revoke all on function public.keepalive_status() from public, anon;
grant execute on function public.keepalive_status() to authenticated;
