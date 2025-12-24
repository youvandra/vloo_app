-- Create public users table to extend auth.users
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Policies for users
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Trigger to automatically create public user when auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update vloos table to strictly link to public.users
-- (Assuming vloos table already exists from 001_initial_schema.sql)
-- We need to ensure giver_id references public.users(id)
-- First, let's make sure the column has the correct foreign key constraint if it doesn't already
-- Since 001 just had "giver_id uuid", we add the constraint now.

alter table vloos 
  add constraint vloos_giver_id_fkey 
  foreign key (giver_id) 
  references public.users(id);

-- Add RLS policy for VLOOS based on Giver ID
create policy "Givers can view their own vloos" on vloos
  for select using (auth.uid() = giver_id);

create policy "Givers can insert their own vloos" on vloos
  for insert with check (auth.uid() = giver_id);

create policy "Givers can update their own vloos" on vloos
  for update using (auth.uid() = giver_id);
