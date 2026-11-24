-- Dorma: the whole site is one settings document.
--   site_config 'live'  = what visitors see (anyone can read it)
--   site_config 'draft' = what the studio is editing (editors only)
--   site_versions       = every published version, newest first, for going back
--   editors             = the accounts allowed into the studio
-- Uploaded images and videos go to the public storage bucket 'media'.

create table public.editors (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.editors enable row level security;
create policy "Editors can see their own row" on public.editors
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_editor() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.editors where user_id = (select auth.uid())) $$;
revoke all on function public.is_editor() from public;
grant execute on function public.is_editor() to anon, authenticated;

create table public.site_config (
  id         text primary key check (id in ('live', 'draft')),
  config     jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
alter table public.site_config enable row level security;
create policy "Anyone can read the live site; editors also read the draft" on public.site_config
  for select to anon, authenticated using (id = 'live' or (select public.is_editor()));
create policy "Editors save the draft" on public.site_config
  for insert to authenticated with check (id = 'draft' and (select public.is_editor()));
create policy "Editors update the draft" on public.site_config
  for update to authenticated using (id = 'draft' and (select public.is_editor()))
  with check (id = 'draft' and (select public.is_editor()));

create or replace function public.touch_site_config() returns trigger
language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end $$;
create trigger site_config_touch before insert or update on public.site_config
  for each row execute function public.touch_site_config();

create table public.site_versions (
  id           bigint generated always as identity primary key,
  config       jsonb not null,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users (id) on delete set null
);
alter table public.site_versions enable row level security;
create policy "Editors read published versions" on public.site_versions
  for select to authenticated using ((select public.is_editor()));

-- Publishing copies the saved draft to live in one step, keeps a copy in site_versions
-- and trims the history to the last 30 versions. Only editors may call it.
create or replace function public.publish_draft() returns timestamptz
language plpgsql security definer set search_path = ''
as $$
declare d jsonb; t timestamptz := now();
begin
  if not public.is_editor() then raise exception 'Only editors can publish' using errcode = '42501'; end if;
  select config into d from public.site_config where id = 'draft';
  if d is null then raise exception 'There is no saved draft to publish'; end if;
  insert into public.site_config (id, config) values ('live', d)
    on conflict (id) do update set config = excluded.config;
  insert into public.site_versions (config, published_by) values (d, auth.uid());
  delete from public.site_versions where id not in (select id from public.site_versions order by id desc limit 30);
  return t;
end $$;
revoke all on function public.publish_draft() from public, anon;
grant execute on function public.publish_draft() to authenticated;

revoke all on public.editors, public.site_config, public.site_versions from anon, authenticated;
grant select on public.site_config to anon, authenticated;
grant insert, update on public.site_config to authenticated;
grant select on public.editors, public.site_versions to authenticated;

-- Media bucket: public to read, only editors upload, replace or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 26214400,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm'])
on conflict (id) do nothing;

create policy "Editors upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and (select public.is_editor()));
create policy "Editors update media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and (select public.is_editor()));
create policy "Editors delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and (select public.is_editor()));
create policy "Editors list media" on storage.objects
  for select to authenticated using (bucket_id = 'media' and (select public.is_editor()));
