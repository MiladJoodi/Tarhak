-- CLI copies were logged as `@uselayouts/slug`; counts key on the registry slug.
update public.copy_events
set component_slug = regexp_replace(component_slug, '^@uselayouts/', '')
where component_slug like '@uselayouts/%';

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

delete from public.component_copy_counts
where component_slug like '@uselayouts/%';
