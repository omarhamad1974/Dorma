-- Studio → Inbox: messages from the site's contact and quote request forms, and "Request a quote" on proposals.
-- Studio → Content → Proposals: "new opens" since an editor last looked.
--
-- Visitors can't read, change or list enquiries. They can only send one through submit_enquiry(), which
-- drops bot traffic (a hidden honeypot field, a form filled in under 2.5 seconds) and limits how many
-- messages one connection, one email address and the whole site can send. Editors manage everything.

create table if not exists public.enquiries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  kind          text not null default 'contact' check (kind in ('contact', 'quote', 'proposal')),
  status        text not null default 'new' check (status in ('new', 'read', 'archived')),
  name          text not null default '' check (length(name) <= 200),
  email         text not null default '' check (length(email) <= 200),
  phone         text not null default '' check (length(phone) <= 60),
  company       text not null default '' check (length(company) <= 200),
  service       text not null default '' check (length(service) <= 300),
  quantity      text not null default '' check (length(quantity) <= 100),
  deadline      text not null default '' check (length(deadline) <= 40),
  message       text not null default '' check (length(message) <= 5000),
  lang          text check (lang in ('en', 'ar')),
  page          text not null default '' check (length(page) <= 300),
  proposal_id   uuid references public.proposals (id) on delete set null,
  proposal_slug text not null default '',
  client        text not null default '',
  sender        text not null default '',   -- a one-way hash of the sender's connection, only for rate limits
  replied_at    timestamptz
);
create index if not exists enquiries_by_time on public.enquiries (created_at desc);
create index if not exists enquiries_by_sender on public.enquiries (sender, created_at desc);
alter table public.enquiries enable row level security;
create policy "Editors read enquiries" on public.enquiries
  for select to authenticated using ((select public.is_editor()));
create policy "Editors update enquiries" on public.enquiries
  for update to authenticated using ((select public.is_editor())) with check ((select public.is_editor()));
create policy "Editors delete enquiries" on public.enquiries
  for delete to authenticated using ((select public.is_editor()));
revoke all on public.enquiries from anon, authenticated;
grant select, delete on public.enquiries to authenticated;
grant update (status, replied_at) on public.enquiries to authenticated;

-- Sends one message from the site. Always answers {ok:true} to bots so they learn nothing.
create or replace function public.submit_enquiry(p jsonb)
returns json
language plpgsql security definer set search_path = ''
as $$
declare
  hdr json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  ip text := split_part(coalesce(hdr->>'cf-connecting-ip', hdr->>'x-forwarded-for', hdr->>'x-real-ip', ''), ',', 1);
  who text := md5('dorma-enquiry:' || coalesce(nullif(trim(ip), ''), 'unknown'));
  v_email text := lower(left(trim(coalesce(p->>'email', '')), 200));
  v_msg text := left(trim(coalesce(p->>'message', '')), 5000);
  v_name text := left(trim(coalesce(p->>'name', '')), 200);
  v_phone text := left(trim(coalesce(p->>'phone', '')), 60);
  v_slug text := lower(left(trim(coalesce(p->>'proposal', '')), 61));
  v_kind text := case when p->>'kind' in ('contact', 'quote') then p->>'kind' else 'contact' end;
  pr public.proposals;
begin
  -- honeypot or filled in too fast: pretend it worked
  if coalesce(p->>'website', '') <> '' or (case when p->>'elapsed' ~ '^[0-9]{1,9}$' then (p->>'elapsed')::int else 0 end) < 2500 then
    return json_build_object('ok', true);
  end if;
  if v_name = '' or (v_email = '' and v_phone = '') then
    return json_build_object('ok', false, 'code', 'missing');
  end if;
  if v_email <> '' and v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
    return json_build_object('ok', false, 'code', 'email');
  end if;
  if (select count(*) from public.enquiries where sender = who and created_at > now() - interval '10 minutes') >= 5
     or (v_email <> '' and (select count(*) from public.enquiries where email = v_email and created_at > now() - interval '1 hour') >= 5)
     or (select count(*) from public.enquiries where created_at > now() - interval '1 day') >= 300 then
    return json_build_object('ok', false, 'code', 'busy');
  end if;
  if v_slug <> '' then
    select * into pr from public.proposals where slug = v_slug;
    if pr.id is not null then v_kind := 'proposal'; end if;
  end if;
  insert into public.enquiries (kind, name, email, phone, company, service, quantity, deadline, message, lang, page,
                                proposal_id, proposal_slug, client, sender)
  values (v_kind, v_name, v_email, v_phone,
          left(trim(coalesce(p->>'company', '')), 200), left(trim(coalesce(p->>'service', '')), 300),
          left(trim(coalesce(p->>'quantity', '')), 100), left(trim(coalesce(p->>'deadline', '')), 40), v_msg,
          case when p->>'lang' in ('en', 'ar') then p->>'lang' end, left(coalesce(p->>'page', ''), 300),
          pr.id, case when pr.id is not null then pr.slug else '' end,
          case when pr.id is not null then coalesce(nullif(pr.data #>> '{client,name,en}', ''), pr.data #>> '{client,name,ar}', '') else '' end,
          who);
  -- keep the newest 5000 messages
  delete from public.enquiries where id in (select id from public.enquiries order by created_at desc offset 5000);
  return json_build_object('ok', true);
end $$;
revoke all on function public.submit_enquiry(jsonb) from public;
grant execute on function public.submit_enquiry(jsonb) to anon, authenticated;

-- Proposal opens an editor hasn't looked at yet.
alter table public.proposal_opens add column if not exists seen boolean not null default false;
create policy "Editors mark proposal opens seen" on public.proposal_opens
  for update to authenticated using ((select public.is_editor())) with check ((select public.is_editor()));
grant update (seen) on public.proposal_opens to authenticated;

drop function if exists public.proposal_stats();
create function public.proposal_stats()
returns table (proposal_id uuid, opens bigint, last_opened timestamptz, new_opens bigint)
language sql stable security invoker set search_path = ''
as $$
  select proposal_id, count(*), max(opened_at), count(*) filter (where not seen)
  from public.proposal_opens group by proposal_id
$$;
revoke all on function public.proposal_stats() from public, anon;
grant execute on function public.proposal_stats() to authenticated;

-- The studio's badges: unread messages and new proposal opens (zero for anyone who isn't an editor).
create or replace function public.studio_badges()
returns json
language sql stable security invoker set search_path = ''
as $$
  select json_build_object(
    'unread', (select count(*) from public.enquiries where status = 'new'),
    'new_opens', (select count(*) from public.proposal_opens where not seen))
$$;
revoke all on function public.studio_badges() from public, anon;
grant execute on function public.studio_badges() to authenticated;
