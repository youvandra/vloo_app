import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PriceContextType {
  prices: { [key: string]: { [currency: string]: number } };
  loading: boolean;
  refreshPrices: () => Promise<void>;
}

const PriceContext = createContext<PriceContextType>({
  prices: {},
  loading: false,
  refreshPrices: async () => {},
});

export const usePrices = () => useContext(PriceContext);

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Default coins to fetch
  const defaultCoinIds = [
    'bitcoin',
    'ethereum',
    'solana',
    'matic-network',
    'binancecoin',
    'lisk',
    'hedera-hashgraph',
    'tether',
    'ripple', // xrp
    'monero'
  ];

  const fetchPrices = async () => {
    try {
      setLoading(true);
      console.log('Fetching prices globally...');
      
      const newPrices: any = {};

      // 1. Fetch MNEE Price (Special handling)
      try {
        const mneeResponse = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf&vs_currencies=usd,idr`);
        const mneeData = await mneeResponse.json();
        const mneePrice = mneeData['0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf'];
        if (mneePrice) {
          newPrices['mnee'] = mneePrice;
        }
      } catch (e) {
        console.error('Error fetching MNEE price:', e);
      }

      // 2. Fetch Standard Coins
      try {
        const ids = defaultCoinIds.join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,idr`);
        const data = await response.json();
        Object.assign(newPrices, data);
      } catch (e) {
        console.error('Error fetching standard coin prices:', e);
      }

      setPrices(newPrices);
      
      // Optional: Save to AsyncStorage for offline backup?
      // await AsyncStorage.setItem('cached_prices', JSON.stringify(newPrices));

    } catch (error) {
      console.error('Global price fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  return (
    <PriceContext.Provider value={{ prices, loading, refreshPrices: fetchPrices }}>
      {children}
    </PriceContext.Provider>
  );
};
