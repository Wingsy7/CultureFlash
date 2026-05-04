create table if not exists profiles (
  id uuid references auth.users primary key,
  username text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

create table if not exists streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_played_at date,
  total_played integer default 0,
  total_correct integer default 0,
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

create table if not exists daily_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  question_id text not null,
  question_text text not null,
  chosen_answer text not null,
  correct_answer text not null,
  is_correct boolean not null,
  category text,
  played_at date default current_date,
  created_at timestamp with time zone default now(),
  unique(user_id, played_at)
);

create or replace view leaderboard as
  select
    p.id,
    p.username,
    p.avatar_url,
    s.current_streak,
    s.longest_streak,
    s.total_correct,
    s.total_played,
    round(s.total_correct::numeric / nullif(s.total_played, 0) * 100) as accuracy
  from profiles p
  join streaks s on s.user_id = p.id
  order by s.current_streak desc, s.total_correct desc;

alter table profiles enable row level security;
alter table streaks enable row level security;
alter table daily_answers enable row level security;

create policy "users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "users can view own streak" on streaks
  for select using (auth.uid() = user_id);

create policy "users can insert own streak" on streaks
  for insert with check (auth.uid() = user_id);

create policy "users can update own streak" on streaks
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can insert own answers" on daily_answers
  for insert with check (auth.uid() = user_id);

create policy "users can view own answers" on daily_answers
  for select using (auth.uid() = user_id);
