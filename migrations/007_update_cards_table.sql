-- Rename table cards to verified_cards
ALTER TABLE cards RENAME TO verified_cards;

-- Add new columns
ALTER TABLE verified_cards 
ADD COLUMN keys_body TEXT,
ADD COLUMN color TEXT;

-- Note: We rely on vloo_id being NULL to determine if a card is 'free' (unused)
-- and vloo_id IS NOT NULL if it is 'used'.
