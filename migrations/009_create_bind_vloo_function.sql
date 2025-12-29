-- Create RPC function to securely bind a Vloo to a Verified Card
-- This enforces ID existence and non-usage checks transactionally.

CREATE OR REPLACE FUNCTION bind_vloo_card(
  p_card_id TEXT,
  p_giver_id UUID,
  p_receiver_name TEXT,
  p_message TEXT,
  p_unlock_date TIMESTAMP WITH TIME ZONE,
  p_encrypted_private_key JSONB,
  p_wallet_address JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (usually admin), ensuring access to tables even if RLS is strict
AS $$
DECLARE
  v_card_record RECORD;
  v_new_vloo_id UUID;
BEGIN
  -- 1. Check if Card Exists
  SELECT vloo_id INTO v_card_record FROM verified_cards WHERE id = p_card_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ID is not registered';
  END IF;

  -- 2. Check if Card is already used
  IF v_card_record.vloo_id IS NOT NULL THEN
    RAISE EXCEPTION 'Card is already in use';
  END IF;

  -- 3. Insert Vloo
  INSERT INTO vloos (
    giver_id,
    receiver_name,
    message,
    unlock_date,
    encrypted_private_key,
    wallet_address,
    status
  ) VALUES (
    p_giver_id,
    p_receiver_name,
    p_message,
    p_unlock_date,
    p_encrypted_private_key,
    p_wallet_address,
    'locked'
  ) RETURNING id INTO v_new_vloo_id;

  -- 4. Update Card
  UPDATE verified_cards 
  SET vloo_id = v_new_vloo_id 
  WHERE id = p_card_id;

  RETURN v_new_vloo_id;
END;
$$;
