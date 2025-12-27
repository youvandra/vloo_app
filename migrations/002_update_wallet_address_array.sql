-- Migration to change wallet_address to JSONB to support multiple addresses (ETH, BTC)
-- and encrypted_private_key to JSONB to support multiple keys

-- First, convert existing data. 
-- We assume existing wallet_address is a string (ETH) and encrypted_private_key is a string (ETH key).

-- Alter wallet_address
ALTER TABLE vloos 
ALTER COLUMN wallet_address TYPE JSONB 
USING jsonb_build_array(
  jsonb_build_object(
    'type', 'Ethereum',
    'address', wallet_address
  )
);

-- Alter encrypted_private_key
ALTER TABLE vloos 
ALTER COLUMN encrypted_private_key TYPE JSONB 
USING jsonb_build_object(
  'ethereum', encrypted_private_key
);
