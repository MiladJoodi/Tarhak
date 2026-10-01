-- The dialog went behind a login, but the insert policy did not follow it.
-- `anon` could still write unlimited rows straight to PostgREST, and the
-- fortnight trigger skips rows with a null user_id, so there was nothing
-- holding the line. The publishable key ships in the client bundle, so that
-- is an open endpoint, not a theoretical one.
--
-- Replaces the policy; no rows are touched.
drop policy if exists "anyone can leave feedback" on public.feedback;

create policy "signed-in visitors leave their own feedback"
  on public.feedback
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and char_length(comment) between 30 and 2000
  );
