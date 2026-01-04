-- Add Testnets and Base Blockchain
INSERT INTO all_wallets (name, ticker, chain, is_token, contract_address, decimals, icon, coingecko_id, is_active_by_default) VALUES
('Lisk Sepolia', 'LSK', 'Lisk', false, null, 18, 'lisk', 'lisk', false),
('Ethereum Sepolia', 'ETH', 'Ethereum', false, null, 18, 'ethereum', 'ethereum', false),
('Hedera Testnet', 'HBAR', 'Hedera', false, null, 8, 'hedera', 'hedera-hashgraph', false),
('Base', 'ETH', 'Base', false, null, 18, 'https://avatars.githubusercontent.com/u/108554348?s=200&v=4', 'ethereum', false),
('Base Sepolia', 'ETH', 'Base', false, null, 18, 'https://avatars.githubusercontent.com/u/108554348?s=200&v=4', 'ethereum', false);
