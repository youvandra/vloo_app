-- 1. Drop the loose policies from 001_initial_schema.sql (Cleanup)
drop policy if exists "Enable insert access for all users" on vloos;
drop policy if exists "Enable update access for all users" on vloos;
drop policy if exists "Enable read access for all users" on vloos;

-- 2. Drop the strict policies from 002 (Re-defining for clarity/safety)
drop policy if exists "Givers can view their own vloos" on vloos;
drop policy if exists "Givers can insert their own vloos" on vloos;
drop policy if exists "Givers can update their own vloos" on vloos;

-- 3. Fix the Foreign Key to point to auth.users directly
-- This avoids issues where public.users table might be out of sync with auth.users
alter table vloos drop constraint if exists vloos_giver_id_fkey;

alter table vloos 
  add constraint vloos_giver_id_fkey 
  foreign key (giver_id) 
  references auth.users(id);

-- 4. Create Strict RLS Policies

-- READ: Users can see vloos where they are the giver
create policy "Users can view own vloos" on vloos
  for select using (auth.uid() = giver_id);

-- INSERT: Users can insert vloos, but ONLY if they assign themselves as giver_id
create policy "Users can insert own vloos" on vloos
  for insert with check (auth.uid() = giver_id);

-- UPDATE: Users can update vloos where they are the giver
create policy "Users can update own vloos" on vloos
  for update using (auth.uid() = giver_id);

-- DELETE: Users can delete their own vloos (Optional, but good for management)
create policy "Users can delete own vloos" on vloos
  for delete using (auth.uid() = giver_id);
