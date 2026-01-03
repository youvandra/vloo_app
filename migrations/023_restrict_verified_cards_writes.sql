-- Enable RLS on verified_cards
ALTER TABLE verified_cards ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Enable read access for all users" ON verified_cards;
DROP POLICY IF EXISTS "Enable insert access for all users" ON verified_cards;
DROP POLICY IF EXISTS "Enable update access for all users" ON verified_cards;
DROP POLICY IF EXISTS "Enable delete access for all users" ON verified_cards;

-- Create a policy that allows only SELECT (read) access for everyone
CREATE POLICY "Enable read access for all users" ON verified_cards
    FOR SELECT
    USING (true);

-- Explicitly ensuring no write policies exist means:
-- INSERT, UPDATE, DELETE will be denied for the 'anon' and 'authenticated' roles.
-- Only the 'service_role' (used by admin scripts) can write.
