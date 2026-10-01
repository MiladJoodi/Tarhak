-- Feedback from the browse sponsor/feedback dock. Anonymous is allowed: the
-- button is public, and requiring a login would cost us most of the responses.
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  -- Optional: the comment is the thing worth having, the face is a nicety.
  rating smallint check (rating between 1 and 5),
  comment text not null default '',
  path text,
  created_at timestamptz not null default now()
);

create index feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;

-- Write-only for the public: anyone may leave feedback, nobody may read it
-- back. Reads go through the service role.
create policy "anyone can leave feedback"
  on public.feedback
  for insert
  to anon, authenticated
  with check (
    char_length(comment) <= 2000
    and (auth.uid() is null or auth.uid() = user_id)
  );
