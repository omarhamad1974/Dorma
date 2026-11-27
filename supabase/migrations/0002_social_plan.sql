-- Studio → Social: post templates, hashtag sets, the weekly rhythm and the content calendar.
-- Kept apart from site_config so the plan is never published with the site, never copied into
-- site_versions, and is not touched when an earlier site version is put back. Editors only.
create table public.social_plan (
  id         text primary key check (id = 'main'),
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
alter table public.social_plan enable row level security;
create policy "Editors read the social plan" on public.social_plan
  for select to authenticated using ((select public.is_editor()));
create policy "Editors add the social plan" on public.social_plan
  for insert to authenticated with check (id = 'main' and (select public.is_editor()));
create policy "Editors update the social plan" on public.social_plan
  for update to authenticated using ((select public.is_editor()))
  with check (id = 'main' and (select public.is_editor()));

-- same updated_at / updated_by stamp as site_config
create trigger social_plan_touch before insert or update on public.social_plan
  for each row execute function public.touch_site_config();

revoke all on public.social_plan from anon, authenticated;
grant select, insert, update on public.social_plan to authenticated;
