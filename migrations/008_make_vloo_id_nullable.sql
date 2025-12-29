-- Make vloo_id nullable in verified_cards table
ALTER TABLE verified_cards ALTER COLUMN vloo_id DROP NOT NULL;

-- This ensures that when an admin creates a card, they don't need to assign it to a VLOO immediately.
-- The vloo_id will be filled when a user binds the card to a VLOO.
