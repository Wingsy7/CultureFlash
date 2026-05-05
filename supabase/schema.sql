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

-- Updated only from a trusted backend or RevenueCat webhook.
create table if not exists subscriptions (
  user_id uuid references profiles(id) on delete cascade primary key,
  status text not null default 'free' check (status in ('free', 'pro')),
  revenuecat_app_user_id text,
  entitlement text default 'pro',
  updated_at timestamp with time zone default now()
);

drop view if exists leaderboard;

create view leaderboard as
  select
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

revoke all on leaderboard from public;
revoke all on leaderboard from anon, authenticated;

alter table profiles enable row level security;
alter table streaks enable row level security;
alter table daily_answers enable row level security;
alter table subscriptions enable row level security;

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

create policy "users can view own subscription" on subscriptions
  for select using (auth.uid() = user_id);

create or replace function get_leaderboard()
returns table (
  username text,
  avatar_url text,
  current_streak integer,
  longest_streak integer,
  total_correct integer,
  total_played integer,
  accuracy numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1
    from subscriptions
    where user_id = auth.uid()
      and status = 'pro'
  ) then
    raise exception 'pro_subscription_required';
  end if;

  return query
    select
      l.username,
      l.avatar_url,
      l.current_streak,
      l.longest_streak,
      l.total_correct,
      l.total_played,
      l.accuracy
    from leaderboard l
    limit 50;
end;
$$;

revoke all on function get_leaderboard() from public;
grant execute on function get_leaderboard() to authenticated;
