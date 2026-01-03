ALTER TABLE verified_cards
DROP COLUMN IF EXISTS keys_body,
DROP COLUMN IF EXISTS scan_count;
