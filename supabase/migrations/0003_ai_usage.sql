-- Studio "Write with AI" (edge function ai-write): a simple per-editor allowance so a stuck button or a
-- shared sign-in can't use up the free Gemini quota. Only the two functions below read or change this table.

create table if not exists public.ai_usage (
  user_id      uuid not null references auth.users (id) on delete cascade,
  day          date not null,
  calls        integer not null default 0,
  minute       timestamptz not null default date_trunc('minute', now()),
  minute_calls integer not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
-- no policies on purpose: nobody reads or writes the table directly

-- Counts one AI request for the signed-in editor, or says why not.
create or replace function public.ai_take(p_day_limit integer, p_minute_limit integer) returns json
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  d   date := (now() at time zone 'utc')::date;
  m   timestamptz := date_trunc('minute', now());
  r   public.ai_usage;
begin
  if uid is null or not public.is_editor() then
    return json_build_object('ok', false, 'code', 'not_editor');
  end if;
  insert into public.ai_usage (user_id, day) values (uid, d) on conflict do nothing;
  select * into r from public.ai_usage where user_id = uid and day = d for update;
  if r.minute <> m then r.minute := m; r.minute_calls := 0; end if;
  if p_day_limit > 0 and r.calls >= p_day_limit then
    return json_build_object('ok', false, 'code', 'day_limit', 'used', r.calls);
  end if;
  if p_minute_limit > 0 and r.minute_calls >= p_minute_limit then
    return json_build_object('ok', false, 'code', 'minute_limit', 'used', r.calls);
  end if;
  update public.ai_usage set calls = r.calls + 1, minute = r.minute, minute_calls = r.minute_calls + 1
    where user_id = uid and day = d;
  delete from public.ai_usage where day < d - 30; -- keep a month, no more
  return json_build_object('ok', true, 'used', r.calls + 1);
end $$;

-- Today's count for the signed-in editor (does not count as a use).
create or replace function public.ai_today() returns json
language sql stable security definer set search_path = ''
as $$
  select json_build_object(
    'editor', public.is_editor(),
    'used', coalesce((select calls from public.ai_usage
                      where user_id = auth.uid() and day = (now() at time zone 'utc')::date), 0))
$$;

revoke all on function public.ai_take(integer, integer) from public;
revoke all on function public.ai_today() from public;
grant execute on function public.ai_take(integer, integer) to authenticated;
grant execute on function public.ai_today() to authenticated;
