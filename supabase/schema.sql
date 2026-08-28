-- DreamBloom cloud schema
--
-- Run this ONCE in your Supabase project's SQL editor (Dashboard -> SQL Editor -> New query).
-- It creates the tables, enables Row Level Security, and adds the invite-code join
-- function used by the app's one-time "Connect Household" step.
--
-- This app is a private, single-household couple app (Khuraza & Yusuf) — this script
-- creates exactly one household. It does not expose any way for the public internet to
-- create additional households; only someone who already knows the invite code you set
-- below can join the one that exists.

-- Supabase projects install extensions into the `extensions` schema by default (not
-- `public`) for security. `IF NOT EXISTS` means this is a no-op if pgcrypto is already
-- installed there (the normal case on Supabase) — the `with schema` clause only matters
-- the first time pgcrypto is actually created.
create extension if not exists pgcrypto with schema extensions;

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'DreamBloom Household',
  invite_code_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (household_id, user_id)
);

create table if not exists profiles (
  id text primary key, -- keeps the app's existing ids: 'khuraza' | 'yusuf'
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  role text not null,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id text primary key,
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  icon text not null,
  color text not null,
  budget_amount numeric,
  budget_period text,
  is_custom boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists obligations (
  id text primary key,
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  monthly_amount numeric not null,
  total_months int not null,
  paid_months int not null default 0,
  start_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transactions (
  id text primary key,
  household_id uuid not null references households(id) on delete cascade,
  type text not null, -- 'income' | 'expense' | 'saving' | 'gold' | 'obligation'
  name text not null,
  amount numeric not null,
  date date not null,
  category_id text references categories(id) on delete set null,
  person_id text,
  grams numeric,
  note text,
  obligation_id text references obligations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists goals (
  id text primary key,
  household_id uuid not null references households(id) on delete cascade,
  title text not null,
  subtitle text,
  icon text not null,
  color text not null,
  target_amount numeric not null,
  current_amount numeric not null default 0,
  target_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Consolidates the app's scalar, one-per-household settings: shared saving target,
-- gold target grams, and the two "Our Beginning" text fields. These map 1:1 to
-- DreamContext's existing sharedSavingTarget / goldTargetGrams / gratitudeText /
-- buildingTogetherText fields — kept as one row per household rather than four
-- separate single-row tables, since that's what the actual data model looks like.
create table if not exists household_settings (
  household_id uuid primary key references households(id) on delete cascade,
  shared_saving_target numeric not null default 0,
  gold_target_grams numeric not null default 0,
  gratitude_text text,
  building_together_text text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table households enable row level security;
alter table household_members enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table goals enable row level security;
alter table obligations enable row level security;
alter table household_settings enable row level security;

create or replace function is_household_member(hh uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from household_members
    where household_id = hh and user_id = auth.uid()
  );
$$;

-- Every policy is DROP IF EXISTS + CREATE, so re-running this whole script never fails
-- with "policy already exists" — dropping and recreating a policy definition touches no
-- table rows, it's schema metadata only, never your data.

drop policy if exists "read own household" on households;
create policy "read own household" on households
  for select using (is_household_member(id));

drop policy if exists "read own membership" on household_members;
create policy "read own membership" on household_members
  for select using (user_id = auth.uid());

drop policy if exists "members read profiles" on profiles;
create policy "members read profiles" on profiles
  for select using (is_household_member(household_id));
drop policy if exists "members write profiles" on profiles;
create policy "members write profiles" on profiles
  for insert with check (is_household_member(household_id));
drop policy if exists "members update profiles" on profiles;
create policy "members update profiles" on profiles
  for update using (is_household_member(household_id));
drop policy if exists "members delete profiles" on profiles;
create policy "members delete profiles" on profiles
  for delete using (is_household_member(household_id));

drop policy if exists "members read categories" on categories;
create policy "members read categories" on categories
  for select using (is_household_member(household_id));
drop policy if exists "members write categories" on categories;
create policy "members write categories" on categories
  for insert with check (is_household_member(household_id));
drop policy if exists "members update categories" on categories;
create policy "members update categories" on categories
  for update using (is_household_member(household_id));
drop policy if exists "members delete categories" on categories;
create policy "members delete categories" on categories
  for delete using (is_household_member(household_id));

drop policy if exists "members read transactions" on transactions;
create policy "members read transactions" on transactions
  for select using (is_household_member(household_id));
drop policy if exists "members write transactions" on transactions;
create policy "members write transactions" on transactions
  for insert with check (is_household_member(household_id));
drop policy if exists "members update transactions" on transactions;
create policy "members update transactions" on transactions
  for update using (is_household_member(household_id));
drop policy if exists "members delete transactions" on transactions;
create policy "members delete transactions" on transactions
  for delete using (is_household_member(household_id));

drop policy if exists "members read goals" on goals;
create policy "members read goals" on goals
  for select using (is_household_member(household_id));
drop policy if exists "members write goals" on goals;
create policy "members write goals" on goals
  for insert with check (is_household_member(household_id));
drop policy if exists "members update goals" on goals;
create policy "members update goals" on goals
  for update using (is_household_member(household_id));
drop policy if exists "members delete goals" on goals;
create policy "members delete goals" on goals
  for delete using (is_household_member(household_id));

drop policy if exists "members read obligations" on obligations;
create policy "members read obligations" on obligations
  for select using (is_household_member(household_id));
drop policy if exists "members write obligations" on obligations;
create policy "members write obligations" on obligations
  for insert with check (is_household_member(household_id));
drop policy if exists "members update obligations" on obligations;
create policy "members update obligations" on obligations
  for update using (is_household_member(household_id));
drop policy if exists "members delete obligations" on obligations;
create policy "members delete obligations" on obligations
  for delete using (is_household_member(household_id));

drop policy if exists "members read settings" on household_settings;
create policy "members read settings" on household_settings
  for select using (is_household_member(household_id));
drop policy if exists "members write settings" on household_settings;
create policy "members write settings" on household_settings
  for insert with check (is_household_member(household_id));
drop policy if exists "members update settings" on household_settings;
create policy "members update settings" on household_settings
  for update using (is_household_member(household_id));

-- ============================================================
-- REALTIME
-- ============================================================

-- Postgres has no "ADD TABLE IF NOT EXISTS" for publications, and adding a table that's
-- already a member errors out — so check the catalog first. Safe to run any number of
-- times.
do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'categories', 'transactions', 'goals', 'obligations', 'household_settings']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;

-- ============================================================
-- JOIN HOUSEHOLD (invite code) — the only way a client can ever attach to a household.
-- The invite code itself is never stored or exposed in plaintext; only its hash is
-- compared, server-side, inside this function.
--
-- NOTE on extensions.crypt(): this function intentionally keeps `set search_path =
-- public` (not widened to include `extensions`) — that's the safer choice for a
-- security-definer function, since a narrower search_path is a smaller attack surface.
-- pgcrypto's crypt() lives in the `extensions` schema on Supabase, so it's called fully
-- schema-qualified here instead of relying on search_path to find it.
-- ============================================================

create or replace function join_household(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
begin
  select id into v_household_id
  from households
  where invite_code_hash = extensions.crypt(p_invite_code, invite_code_hash)
  limit 1;

  if v_household_id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into household_members (household_id, user_id)
  values (v_household_id, auth.uid())
  on conflict (household_id, user_id) do nothing;

  return v_household_id;
end;
$$;

grant execute on function join_household(text) to authenticated, anon;

-- ============================================================
-- ONE-TIME SETUP — create the single DreamBloom household.
--
-- SECURITY — READ BEFORE EDITING:
-- Only the HASH of your invite code is ever meant to reach the database. Do NOT
-- commit a version of this file with a real invite code in it — this repo is deployed
-- publicly via GitHub Pages, so treat it as public. The safe way to set your real code:
--   1. Copy just this DO block (below) into the Supabase SQL Editor.
--   2. Replace 'change-this-invite-code' with your real passphrase THERE, in the editor
--      — not in this file on disk.
--   3. Run it. The editor query history is private to your Supabase project; your local
--      file stays on the placeholder and is safe to commit as-is.
--   4. Keep the real code somewhere safe outside git (a password manager). It's stored
--      only as a bcrypt hash — if you lose the plaintext, re-run this block with a new
--      one (see note below on re-running).
--
-- Idempotent: guarded by "if not exists (select 1 from households)", so re-running this
-- whole script never creates a second household or an orphaned profile row. If you need
-- to CHANGE the invite code after the household already exists, this block will no
-- longer run (by design) — instead run, in the SQL Editor:
--   update households set invite_code_hash = extensions.crypt('your-new-code', extensions.gen_salt('bf'));
-- ============================================================

do $$
declare
  v_household_id uuid;
begin
  if not exists (select 1 from households) then
    insert into households (name, invite_code_hash)
    values ('DreamBloom Household', extensions.crypt('change-this-invite-code', extensions.gen_salt('bf')))
    returning id into v_household_id;

    -- Seed Khuraza & Yusuf's profiles under that household (matches the app's existing
    -- seedProfiles in src/lib/mockData.ts).
    insert into profiles (id, household_id, name, role, photo_url) values
      ('khuraza', v_household_id, 'Khuraza', 'Istri', null),
      ('yusuf', v_household_id, 'Yusuf', 'Suami', null);

    insert into household_settings (household_id, shared_saving_target, gold_target_grams)
    values (v_household_id, 5000000, 10000);
  end if;
end $$;
