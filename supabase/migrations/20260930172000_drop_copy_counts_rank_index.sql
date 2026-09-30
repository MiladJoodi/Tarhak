-- Ranking is a ~one-row-per-component table, sorted in the app.
-- Maintaining copies desc on every increment is extra write work for no query.
drop index if exists public.component_copy_counts_copies_idx;
