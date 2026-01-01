-- Drop foreign key constraint if it exists
ALTER TABLE verified_cards DROP CONSTRAINT IF EXISTS verified_cards_vloo_id_fkey;

-- Add new columns to verified_cards
ALTER TABLE verified_cards 
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS unlock_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS passphrase TEXT,
ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Drop vloo_id column
ALTER TABLE verified_cards DROP COLUMN IF EXISTS vloo_id;

-- Drop vloos table
DROP TABLE IF EXISTS vloos;

-- Ensure RLS is disabled
ALTER TABLE verified_cards DISABLE ROW LEVEL SECURITY;
