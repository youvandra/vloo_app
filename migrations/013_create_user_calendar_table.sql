-- Create user_calendar table
create table user_calendar (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  title text not null,
  date timestamp with time zone not null,
  card_amounts jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table user_calendar enable row level security;

-- Policies
create policy "Users can view their own calendar" on user_calendar
  for select using (auth.uid() = user_id);

create policy "Users can insert their own calendar" on user_calendar
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own calendar" on user_calendar
  for update using (auth.uid() = user_id);

create policy "Users can delete their own calendar" on user_calendar
  for delete using (auth.uid() = user_id);
