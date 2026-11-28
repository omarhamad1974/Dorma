-- Studio → Content → Proposals: client-specific mini sites at #for/<code>.
-- Each proposal names a client, the service pages it shows and its own welcome text. It points to the
-- published site's pages (it does not copy them), so service pages edited and published flow through.
-- Proposals are kept out of site_config so the public site settings never list Dorma's clients.
-- Visitors can't read this table: they open one proposal by its code through open_proposal(),
-- which also counts the open. Editors manage everything from the studio.

create table if not exists public.proposals (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,60}$'),
  data        jsonb not null default '{}'::jsonb,
  status      text not null default 'off' check (status in ('live', 'off', 'archived')),
  expires_on  date,
  searchable  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);
alter table public.proposals enable row level security;
create policy "Editors read proposals" on public.proposals
  for select to authenticated using ((select public.is_editor()));
create policy "Editors add proposals" on public.proposals
  for insert to authenticated with check ((select public.is_editor()));
create policy "Editors update proposals" on public.proposals
  for update to authenticated using ((select public.is_editor())) with check ((select public.is_editor()));
create policy "Editors delete proposals" on public.proposals
  for delete to authenticated using ((select public.is_editor()));

create trigger proposals_touch before insert or update on public.proposals
  for each row execute function public.touch_site_config();

-- One row per time a client opened a proposal (editors' own opens are not counted).
create table if not exists public.proposal_opens (
  id          bigint generated always as identity primary key,
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  opened_at   timestamptz not null default now(),
  lang        text check (lang in ('en', 'ar')),
  device      text check (device in ('phone', 'tablet', 'computer'))
);
create index if not exists proposal_opens_by_proposal on public.proposal_opens (proposal_id, opened_at desc);
alter table public.proposal_opens enable row level security;
create policy "Editors read proposal opens" on public.proposal_opens
  for select to authenticated using ((select public.is_editor()));
create policy "Editors clear proposal opens" on public.proposal_opens
  for delete to authenticated using ((select public.is_editor()));

revoke all on public.proposals, public.proposal_opens from anon, authenticated;
grant select, insert, update, delete on public.proposals to authenticated;
grant select, delete on public.proposal_opens to authenticated;

-- Opens a proposal by its code for anyone with the link. Returns its content when it is live and not
-- expired, or a reason ('missing', 'off', 'expired'). p_count = true records one open (the site sends it
-- once per visit). Studio notes ("internal") are never sent.
create or replace function public.open_proposal(p_slug text, p_count boolean default false,
                                                p_lang text default null, p_device text default null)
returns json
language plpgsql security definer set search_path = ''
as $$
declare r public.proposals; editor boolean := public.is_editor();
begin
  select * into r from public.proposals where slug = lower(p_slug);
  if r.id is null then return json_build_object('ok', false, 'code', 'missing'); end if;
  if r.status <> 'live' and not editor then
    return json_build_object('ok', false, 'code', 'off');
  end if;
  if r.expires_on is not null and r.expires_on < (now() at time zone 'utc')::date and not editor then
    return json_build_object('ok', false, 'code', 'expired');
  end if;
  if p_count and not editor
     and (select count(*) from public.proposal_opens
          where proposal_id = r.id and opened_at > now() - interval '1 hour') < 120 then
    insert into public.proposal_opens (proposal_id, lang, device)
      values (r.id,
              case when p_lang in ('en', 'ar') then p_lang end,
              case when p_device in ('phone', 'tablet', 'computer') then p_device end);
    -- keep the latest 1000 opens per proposal
    delete from public.proposal_opens where proposal_id = r.id and id not in
      (select id from public.proposal_opens where proposal_id = r.id order by id desc limit 1000);
  end if;
  return json_build_object('ok', true, 'slug', r.slug, 'data', r.data - 'internal',
                           'status', r.status, 'expires_on', r.expires_on,
                           'searchable', r.searchable, 'updated_at', r.updated_at);
end $$;
revoke all on function public.open_proposal(text, boolean, text, text) from public;
grant execute on function public.open_proposal(text, boolean, text, text) to anon, authenticated;

-- Opens count and last open for every proposal (studio list). Editors only, through RLS.
create or replace function public.proposal_stats()
returns table (proposal_id uuid, opens bigint, last_opened timestamptz)
language sql stable security invoker set search_path = ''
as $$
  select proposal_id, count(*), max(opened_at) from public.proposal_opens group by proposal_id
$$;
revoke all on function public.proposal_stats() from public, anon;
grant execute on function public.proposal_stats() to authenticated;
