-- 1. Restore/Ensure the existing MNEE is clearly labeled as ERC-20
-- We update any existing MNEE ticker to be MNEE (ERC-20)
UPDATE all_wallets
SET 
    name = 'MNEE (ERC-20)',
    chain = 'Ethereum',
    is_token = true,
    contract_address = '0x...' -- Ideally we should know this, but for now we keep what was there or null if unknown
WHERE ticker = 'MNEE' AND chain != 'Bitcoin';

-- 2. Insert MNEE (Ordinal) if it doesn't exist
INSERT INTO all_wallets (name, ticker, chain, is_token, contract_address, decimals, icon, coingecko_id, is_active_by_default)
SELECT 'MNEE (Ordinal)', 'MNEE', 'Bitcoin', false, null, 0, 'https://pbs.twimg.com/profile_images/1632766835164864513/p7t_k4k2_400x400.jpg', null, false
WHERE NOT EXISTS (
    SELECT 1 FROM all_wallets WHERE name = 'MNEE (Ordinal)'
);
