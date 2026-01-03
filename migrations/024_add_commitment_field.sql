-- Add commitment column to store the passphrase hash (not the key/address)
ALTER TABLE verified_cards ADD COLUMN IF NOT EXISTS commitment TEXT;

-- Create a secure function to register the commitment
-- This bypasses the "Read Only" restriction safely
CREATE OR REPLACE FUNCTION register_card_commitment(p_card_id TEXT, p_commitment TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing_commitment TEXT;
BEGIN
    -- Check if card exists
    IF NOT EXISTS (SELECT 1 FROM verified_cards WHERE id = p_card_id) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Card not found');
    END IF;

    -- Get existing commitment
    SELECT commitment INTO v_existing_commitment FROM verified_cards WHERE id = p_card_id;
    
    -- Scenario 1: No commitment yet -> Bind it
    IF v_existing_commitment IS NULL THEN
        UPDATE verified_cards 
        SET commitment = p_commitment 
        WHERE id = p_card_id;
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
