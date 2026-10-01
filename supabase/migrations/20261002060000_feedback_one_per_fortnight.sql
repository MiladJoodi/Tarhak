-- Feedback is now behind a login, and one person gets one say per fortnight.
-- Enforced in the database, not only in the dialog: the anon key is public, so
-- a client-side check is a courtesy, never a limit.

-- The dialog needs to read its own last submission to show the cooldown before
-- someone writes a comment they cannot send. Own rows only.
create policy "users read own feedback"
  on public.feedback
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.enforce_feedback_interval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Anonymous rows predate the login requirement; leave them alone.
  if new.user_id is null then
    return new;
  end if;

  if exists (
    select 1
    from public.feedback f
    where f.user_id = new.user_id
      and f.created_at > now() - interval '14 days'
  ) then
    raise exception 'feedback_rate_limited'
      using hint = 'One feedback per user every 14 days.';
  end if;

  return new;
end;
$$;

create trigger feedback_one_per_fortnight
  before insert on public.feedback
  for each row
  execute function public.enforce_feedback_interval();

create index if not exists feedback_user_recent_idx
  on public.feedback (user_id, created_at desc);
