-- =========================================
-- Family Workout App — Supabase Schema
-- Paste this into: Supabase > SQL Editor > New query > Run
-- =========================================

-- Profiles (one per device/user)
create table if not exists profiles (
  id text primary key,
  nickname text not null,
  created_at timestamp with time zone default now()
);

-- Workouts
create table if not exists workouts (
  id uuid default gen_random_uuid() primary key,
  user_id text references profiles(id) on delete cascade,
  nickname text not null,
  title text,
  duration integer,
  mood text,
  mood_emoji text,
  notes text,
  exercises jsonb default '[]',
  created_at timestamp with time zone default now()
);

-- Likes / Reactions
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references workouts(id) on delete cascade,
  user_id text references profiles(id) on delete cascade,
  nickname text not null,
  reaction text not null default '💪',
  created_at timestamp with time zone default now(),
  unique(workout_id, user_id)
);

-- Comments
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references workouts(id) on delete cascade,
  user_id text references profiles(id) on delete cascade,
  nickname text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- =========================================
-- Row Level Security
-- Allow all reads and writes (family app, no auth needed)
-- =========================================

alter table profiles enable row level security;
alter table workouts enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;

-- Profiles
create policy "Public profiles" on profiles for all using (true) with check (true);

-- Workouts
create policy "Public workouts" on workouts for all using (true) with check (true);

-- Likes
create policy "Public likes" on likes for all using (true) with check (true);

-- Comments
create policy "Public comments" on comments for all using (true) with check (true);

-- =========================================
-- Real-time (optional but enables live feed updates)
-- =========================================
alter publication supabase_realtime add table workouts;
