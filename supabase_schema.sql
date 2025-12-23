
-- Create VLOOS table
create table vloos (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  encrypted_private_key text not null,
  wallet_address text not null,
  unlock_date timestamp with time zone not null,
  message text,
  status text default 'locked' check (status in ('locked', 'ready', 'claimed')),
  giver_id uuid -- Optional if we have auth
);

-- Create CARDS table
create table cards (
  id text primary key, -- NFC Card ID (UID)
  vloo_id uuid references vloos(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table vloos enable row level security;
alter table cards enable row level security;

-- Policies (Simplified for MVP - assuming public read/write for demo or specific logic)
-- In a real app, you'd lock this down significantly.
-- For MVP Giver/Receiver flow without Auth:
create policy "Enable read access for all users" on vloos for select using (true);
create policy "Enable insert access for all users" on vloos for insert with check (true);
create policy "Enable update access for all users" on vloos for update using (true);

create policy "Enable read access for all users" on cards for select using (true);
create policy "Enable insert access for all users" on cards for insert with check (true);
