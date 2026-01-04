-- Create table for all supported wallets/coins
CREATE TABLE IF NOT EXISTS all_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    ticker TEXT NOT NULL,
    chain TEXT NOT NULL,
    is_token BOOLEAN DEFAULT FALSE,
    contract_address TEXT,
    decimals INTEGER DEFAULT 18,
    icon TEXT NOT NULL,
    coingecko_id TEXT,
    is_active_by_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE all_wallets ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON all_wallets
    FOR SELECT USING (true);

-- Insert initial data
INSERT INTO all_wallets (name, ticker, chain, is_token, contract_address, decimals, icon, coingecko_id, is_active_by_default) VALUES
('Bitcoin', 'BTC', 'Bitcoin', false, null, 8, 'bitcoin', 'bitcoin', false),
('Ethereum', 'ETH', 'Ethereum', false, null, 18, 'ethereum', 'ethereum', true),
('Solana', 'SOL', 'Solana', false, null, 9, 'solana', 'solana', false),
('Polygon', 'POL', 'Polygon', false, null, 18, 'polygon', 'matic-network', true),
('BNB Chain', 'BNB', 'BNB Chain', false, null, 18, 'bnb', 'binancecoin', true),
('Lisk', 'LSK', 'Lisk', false, null, 18, 'lisk', 'lisk', true),
('Tether USD', 'USDT', 'Ethereum', true, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'usdt', 'tether', true);
