-- Update RLS policies for VLOOS table to restrict updates
-- Only allow updating receiver_name, message, and unlock_date
-- Users must own the vloo (giver_id matches auth.uid())

-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Enable update access for all users" ON vloos;

-- Create a restrictive update policy
-- This checks that the user is the giver (owner) of the record
CREATE POLICY "Enable update for givers" ON vloos
FOR UPDATE
USING (auth.uid() = giver_id)
WITH CHECK (auth.uid() = giver_id);

-- Note: Postgres RLS doesn't natively support "column-level" permissions in the CREATE POLICY syntax directly 
-- in a way that prevents the *attempt* to update other columns without triggers or column-level grants.
-- However, we can enforce it by ensuring that the critical fields haven't changed in the check, 
-- OR by revoking column update privileges and granting them selectively.

-- APPROACH: Revoke generic UPDATE and Grant specific column UPDATE
-- This is the most secure way at the database level.

REVOKE UPDATE ON vloos FROM authenticated;
REVOKE UPDATE ON vloos FROM anon;
REVOKE UPDATE ON vloos FROM public;

-- Grant update ONLY on specific columns to authenticated users
GRANT UPDATE (receiver_name, message, unlock_date) ON vloos TO authenticated;

-- If we want to allow status updates (e.g. for claiming), that might need a separate role or function.
-- For now, per request, users can ONLY update these 3 fields.
-- NOTE: If the app needs to update 'status' (e.g. to 'claimed'), it should be done via a secure RPC function 
-- (like the bind_vloo_card we made earlier) or by a separate admin/service role, NOT by the user directly.
