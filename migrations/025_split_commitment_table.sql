-- Create a secure table for sensitive card data
CREATE TABLE IF NOT EXISTS card_security (
    card_id TEXT PRIMARY KEY REFERENCES verified_cards(id) ON DELETE CASCADE,
    commitment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE card_security ENABLE ROW LEVEL SECURITY;

-- Deny all access to public/authenticated users (Service Role only)
-- Note: By default, if no policies exist, access is denied. 
-- But adding an explicit "deny" or just not adding "allow" policies is fine.
-- We will rely on default "deny all" behavior for enabled RLS.

-- Move existing commitments (if any)
-- We need to check if column exists first to avoid errors if run multiple times or out of order
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'verified_cards' AND column_name = 'commitment') THEN
        INSERT INTO card_security (card_id, commitment)
        SELECT id, commitment FROM verified_cards 
        WHERE commitment IS NOT NULL
        ON CONFLICT (card_id) DO NOTHING;
    END IF;
END $$;

-- Drop commitment from public table
ALTER TABLE verified_cards DROP COLUMN IF EXISTS commitment;

-- Update the secure RPC function
CREATE OR REPLACE FUNCTION register_card_commitment(p_card_id TEXT, p_commitment TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing_commitment TEXT;
BEGIN
    -- Check if card exists in public table
    IF NOT EXISTS (SELECT 1 FROM verified_cards WHERE id = p_card_id) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Card not found');
    END IF;

    -- Get existing commitment from SECURE table
    SELECT commitment INTO v_existing_commitment FROM card_security WHERE card_id = p_card_id;
    
    -- Scenario 1: No commitment yet -> Bind it
    IF v_existing_commitment IS NULL THEN
        INSERT INTO card_security (card_id, commitment)
        VALUES (p_card_id, p_commitment);
        
        RETURN jsonb_build_object('success', true, 'message', 'Card bound successfully');
    END IF;

    -- Scenario 2: Commitment exists -> Verify it
    IF v_existing_commitment = p_commitment THEN
        RETURN jsonb_build_object('success', true, 'message', 'Card verified successfully');
    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Card is already bound to a different passphrase');
    END IF;
END;
$$;
