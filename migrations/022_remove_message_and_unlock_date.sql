ALTER TABLE verified_cards
DROP COLUMN IF EXISTS message,
DROP COLUMN IF EXISTS unlock_date;
