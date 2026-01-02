
const TOKEN = process.env.EXPO_PUBLIC_BLOCKCYPHER_TOKEN || '7fd9adfa1e3f47dc8f864dbd44956ca4';
const BASE_URL = 'https://api.blockcypher.com/v1';

export const fetchBalance = async (address: string, chainType: string): Promise<string> => {
  if (!address) return '0.00';

  let coin = '';
  let chain = 'main';
  let divisor = 1;
  let symbol = '';

  const normalizedType = chainType.toLowerCase();

  if (normalizedType === 'bitcoin' || normalizedType === 'btc') {
    coin = 'btc';
    divisor = 100000000; // 10^8
    symbol = 'BTC';
  } else if (normalizedType === 'ethereum' || normalizedType === 'eth') {
    coin = 'eth';
    divisor = 1000000000000000000; // 10^18
    symbol = 'ETH';
  } else if (normalizedType === 'litecoin' || normalizedType === 'ltc') {
    coin = 'ltc';
    divisor = 100000000;
    symbol = 'LTC';
  } else if (normalizedType === 'dogecoin' || normalizedType === 'doge') {
    coin = 'doge';
    divisor = 100000000;
    symbol = 'DOGE';
  } else if (normalizedType === 'dash') {
    coin = 'dash';
    divisor = 100000000;
    symbol = 'DASH';
  } else if (normalizedType === 'sepolia') {
    // Use public RPC for Sepolia
    try {
        const response = await fetch('https://ethereum-sepolia.publicnode.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getBalance',
                params: [address, 'latest']
            })
        });
        
        const data = await response.json();
        if (data.result) {
            const balanceWei = parseInt(data.result, 16);
            const balanceEth = balanceWei / 1000000000000000000;
            return `${balanceEth.toFixed(4)} SepoliaETH`;
        }
        return '0.00 SepoliaETH';
    } catch (e) {
        console.error('Error fetching Sepolia balance:', e);
        return '0.00 SepoliaETH';
    }
  } else if (normalizedType === 'lisk') {
    // Lisk (Optimism Stack L2) Mainnet RPC
    try {
        const response = await fetch('https://rpc.api.lisk.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getBalance',
                params: [address, 'latest']
            })
        });
        
        const data = await response.json();
        if (data.result) {
            const balanceWei = parseInt(data.result, 16);
            const balanceEth = balanceWei / 1000000000000000000;
            return `${balanceEth.toFixed(4)} LSK`; // User wants LSK symbol
        }
        return '0.00 LSK';
    } catch (e) {
        console.error('Error fetching Lisk balance:', e);
        return '0.00 LSK';
    }
  } else if (normalizedType === 'lisk sepolia') {
    // Lisk Sepolia Testnet RPC
    try {
        const response = await fetch('https://rpc.sepolia-api.lisk.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getBalance',
                params: [address, 'latest']
            })
        });
        
        const data = await response.json();
        if (data.result) {
            const balanceWei = parseInt(data.result, 16);
            const balanceEth = balanceWei / 1000000000000000000;
            return `${balanceEth.toFixed(4)} LSK`;
        }
        return '0.00 LSK';
    } catch (e) {
        console.error('Error fetching Lisk Sepolia balance:', e);
        return '0.00 LSK';
    }
  } else {
    // Unsupported by BlockCypher or this integration
    symbol = getSymbol(chainType);
    return `0.00 ${symbol}`;
  }

  try {
    const url = `${BASE_URL}/${coin}/${chain}/addrs/${address}/balance?token=${TOKEN}`;
    console.log(`Fetching balance for ${chainType} (${address}): ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
        // Handle 429 Rate Limit specifically if needed, but for now warn
        console.warn(`Error fetching balance for ${chainType} (${address}): ${response.status} - ${response.statusText}`);
        return `0.00 ${symbol}`;
    }
    
    const data = await response.json();
    // data.final_balance includes unconfirmed transactions which is usually what users want to see immediately
    const balance = data.final_balance ?? 0;
    
    // Format with 4 decimals, but strip trailing zeros if it's an integer?
    // User asked for "real number". Fixed 4 decimals is standard for crypto UI.
    const formatted = (balance / divisor).toFixed(4); 
    
    return `${formatted} ${symbol}`;

  } catch (error) {
    console.error('Error fetching balance:', error);
    return `0.00 ${symbol}`;
  }
};

const getSymbol = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('bitcoin') || lower === 'btc') return 'BTC';
    if (lower.includes('ethereum') || lower === 'eth') return 'ETH';
    if (lower.includes('solana') || lower === 'sol') return 'SOL';
    if (lower.includes('polygon') || lower === 'pol' || lower === 'matic') return 'POL';
    if (lower.includes('bnb')) return 'BNB';
    return '';
};
