-- Studio "Write with AI" archive: AI texts saved to reuse later on the site or in Social posts.
-- Editors only, never published with the site.
create table if not exists public.ai_archive (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  title      text not null default '',
  tags       text[] not null default '{}',
  en         text not null default '',
  ar         text not null default '',
  meta       jsonb not null default '{}'::jsonb   -- what it was written for: action, box, brief, style, references
);
create index if not exists ai_archive_created on public.ai_archive (created_at desc);
alter table public.ai_archive enable row level security;
create policy "Editors read the AI archive" on public.ai_archive
  for select to authenticated using ((select public.is_editor()));
create policy "Editors add to the AI archive" on public.ai_archive
  for insert to authenticated with check ((select public.is_editor()));
create policy "Editors change the AI archive" on public.ai_archive
  for update to authenticated using ((select public.is_editor())) with check ((select public.is_editor()));
create policy "Editors remove from the AI archive" on public.ai_archive
  for delete to authenticated using ((select public.is_editor()));

revoke all on public.ai_archive from anon, authenticated;
grant select, insert, update, delete on public.ai_archive to authenticated;
