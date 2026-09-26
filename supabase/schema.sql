-- Erber Fit — Supabase schema
--
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query → Run).
-- Safe to re-run: everything is idempotent.
--
-- WHY THIS FILE EXISTS
-- The `user_data` table was originally created by hand in the dashboard and was
-- never recorded anywhere. On 2026-09-26, after the project sat paused through
-- ~7 weeks of inactivity, the table was gone — PostgREST returned
-- `PGRST205: Could not find the table 'public.user_data' in the schema cache`
-- and the public schema exposed zero tables. With no schema in version control
-- there was nothing to restore from. Now there is.
--
-- Free-tier projects pause after about a week of inactivity. Pausing alone does
-- not drop tables, so if this happens again, check first whether the project is
-- merely still waking (auth/v1/health returns 502 while starting, 200 once up)
-- before assuming data loss.
--
-- The app is local-first: localStorage is the working copy and this table is a
-- backup. A missing table makes sync fail loudly (syncStatus 'error') and does
-- NOT overwrite local data — see src/hooks/useSupabaseSync.js.

create table if not exists public.user_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  program    jsonb       not null default '{}'::jsonb,
  sessions   jsonb       not null default '[]'::jsonb,
  settings   jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- One row per user, readable and writable only by that user.
drop policy if exists "user_data_select_own" on public.user_data;
create policy "user_data_select_own" on public.user_data
  for select using (auth.uid() = user_id);

drop policy if exists "user_data_insert_own" on public.user_data;
create policy "user_data_insert_own" on public.user_data
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_data_update_own" on public.user_data;
create policy "user_data_update_own" on public.user_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- The app upserts without setting updated_at, so maintain it here.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_data_touch_updated_at on public.user_data;
create trigger user_data_touch_updated_at
  before update on public.user_data
  for each row execute function public.touch_updated_at();

-- PostgREST picks up new tables on its own, but this forces an immediate reload.
notify pgrst, 'reload schema';
