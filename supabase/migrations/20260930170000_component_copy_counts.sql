-- Global copy ranking. copy_events stays per-user (RLS); this table is
-- the public aggregate so we can sort by most copied without exposing rows.
create schema if not exists private;

create table public.component_copy_counts (
  component_slug text primary key,
  copies bigint not null default 0,
  last_copied_at timestamptz not null default now()
);

alter table public.component_copy_counts enable row level security;

create policy "copy counts are publicly readable"
  on public.component_copy_counts
  for select
  to anon, authenticated
  using (true);

grant select on table public.component_copy_counts to anon, authenticated;

create or replace function private.bump_component_copy_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.component_copy_counts as c (
    component_slug,
    copies,
    last_copied_at
  )
  values (new.component_slug, 1, new.created_at)
  on conflict (component_slug) do update
    set
      copies = c.copies + 1,
      last_copied_at = greatest(c.last_copied_at, excluded.last_copied_at);
  return new;
end;
$$;

revoke all on function private.bump_component_copy_count() from public;

create trigger copy_events_bump_counts
  after insert on public.copy_events
  for each row
  execute function private.bump_component_copy_count();

insert into public.component_copy_counts (component_slug, copies, last_copied_at)
select
  component_slug,
  count(*)::bigint,
  max(created_at)
from public.copy_events
group by component_slug
on conflict (component_slug) do update
  set
    copies = excluded.copies,
    last_copied_at = excluded.last_copied_at;
