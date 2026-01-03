import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, SafeAreaView, StatusBar, Alert, Platform } from 'react-native';
import { ArrowLeft, Edit2, Copy, Eye, MessageSquare, ArrowDown, ArrowUp, ArrowLeftRight, CreditCard } from 'lucide-react-native';
import { COLORS, FONTS } from '../../lib/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { fetchBalance } from '../../lib/blockcypher';
import BitcoinIcon from '../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../assets/icons/chains/bnb.svg';
import LiskIcon from '../../assets/icons/chains/lisk.svg';
import { WalletDetailModal } from './components/modals/dashboard/WalletDetailModal';
import { supabase } from '../../lib/supabase';

export default function VlooDetailsScreen({ route, navigation }: any) {
  const { vloo } = route.params;
  const [wallets, setWallets] = useState<any[]>([]);
  const [prices, setPrices] = useState<any>({});
  const [walletBalances, setWalletBalances] = useState<{[key: string]: string}>({});
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR');
  
  // Detail Modal State
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('app_currency').then(val => {
       if(val) setCurrency(val as 'IDR' | 'USD');
    });
  }, []);

  useEffect(() => {
    if (vloo?.id) {
      loadWallets();
    }
  }, [vloo]);

  useEffect(() => {
    if (wallets.length > 0) {
      // Fetch Balances
      wallets.forEach(async (w) => {
        const bal = await fetchBalance(w.address, w.type);
        const key = `${w.type}_${w.address}`;
        setWalletBalances(prev => ({...prev, [key]: bal}));
      });

      // Fetch Prices separately for each coin type found
      const uniqueTypes = new Set(wallets.map(w => w.type));
      uniqueTypes.forEach(type => {
         const coinId = getCoinIdFromType(type);
         if (coinId) {
             fetchCoinPrice(coinId);
         }
      });
    }
  }, [wallets, currency]); // Add currency dependency to refetch if it changes

  const getCoinIdFromType = (type: string) => {
    if (!type) return '';
    const lower = type.toLowerCase();
    if (lower.includes('bitcoin')) return 'bitcoin';
    if (lower.includes('ethereum')) return 'ethereum';
    if (lower.includes('solana')) return 'solana';
    if (lower.includes('polygon') || lower.includes('matic')) return 'matic-network';
    if (lower.includes('bnb')) return 'binancecoin';
    if (lower.includes('lisk')) return 'lisk';
    return '';
  };

  const fetchCoinPrice = async (coinId: string) => {
    try {
      const curr = currency.toLowerCase();
      console.log(`Fetching price for: ${coinId} in ${curr}`);
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${curr}`);
      const data = await response.json();
      console.log(`Price for ${coinId}:`, data);
      setPrices((prev: any) => ({ ...prev, ...data }));
    } catch (e) {
      console.error(`Error fetching price for ${coinId}:`, e);
    }
  };


  const loadWallets = async () => {
    try {
      const stored = await AsyncStorage.getItem(`vloo_wallets_${vloo.id}`);
      if (stored) {
        setWallets(JSON.parse(stored));
      } else {
        setWallets([]);
      }
    } catch (e) {
      console.error('Error loading wallets:', e);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  const handleDelete = async () => {
      // Placeholder for delete logic if needed, or pass it from parent
      Alert.alert('Delete', 'Delete functionality coming soon.');
  };

  const formatCurrency = (amount: number) => {
    const locale = currency === 'IDR' ? 'id-ID' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
  };
  
  const formatAddress = (address: string) => {
      if (!address) return '';
      if (address.length < 10) return address;
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const getPriceId = (symbol: string) => {
      if (!symbol) return '';
      const s = symbol.toUpperCase();
      if (s === 'BTC') return 'bitcoin';
      if (s === 'ETH') return 'ethereum';
      if (s === 'SOL') return 'solana';
      if (s === 'POL' || s === 'MATIC') return 'matic-network';
      if (s === 'BNB') return 'binancecoin';
      if (s === 'LSK') return 'lisk';
      return '';
  };
  
  const getWalletPrice = (wallet: any) => {
      if (!wallet) return 0;
      const key = `${wallet.type}_${wallet.address}`;
      const balanceStr = walletBalances[key] || '';
      let symbol = balanceStr.split(' ')[1];
      
      if (!symbol) {
          const type = wallet.type.toLowerCase();
          if (type.includes('bitcoin')) symbol = 'BTC';
          else if (type.includes('ethereum')) symbol = 'ETH';
          else if (type.includes('solana')) symbol = 'SOL';
          else if (type.includes('polygon')) symbol = 'POL';
          else if (type.includes('bnb')) symbol = 'BNB';
          else if (type.includes('lisk')) symbol = 'LSK';
      }
      
      const priceId = getPriceId(symbol || '');
      const curr = currency.toLowerCase();
      return prices[priceId]?.[curr] || 0;
  };

  const getTotalBalance = () => {
    let total = 0;
    wallets.forEach(wallet => {
        const key = `${wallet.type}_${wallet.address}`;
        const balanceStr = walletBalances[key] || '';
        let [amountStr, symbol] = balanceStr.split(' ');
        
        if (!symbol) {
             const type = wallet.type.toLowerCase();
             if (type.includes('bitcoin')) symbol = 'BTC';
             else if (type.includes('ethereum')) symbol = 'ETH';
             else if (type.includes('solana')) symbol = 'SOL';
             else if (type.includes('polygon')) symbol = 'POL';
             else if (type.includes('bnb')) symbol = 'BNB';
             else if (type.includes('lisk')) symbol = 'LSK';
             
             if (!amountStr) amountStr = '0.00';
        }

        const amount = parseFloat(amountStr) || 0;
        const priceId = getPriceId(symbol);
        const curr = currency.toLowerCase();
        const price = prices[priceId]?.[curr] || 0;
        total += amount * price;
    });
    return total;
  };

  const handleWalletPress = (wallet: any) => {
    setSelectedWallet(wallet);
    setDetailModalVisible(true);
  };

  if (!vloo) return null;

  const cardColor = vloo.color || COLORS.primary;
  const status = 'READY';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
           <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vloo Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Visual Card Display */}
        <View style={[styles.cardPreview, { backgroundColor: cardColor, overflow: 'hidden' }]}>
           {/* Decorative Circles */}
           <View style={[styles.circle, styles.circle1]} />
           <View style={[styles.circle, styles.circle2]} />
           <View style={[styles.circle, styles.circle3]} />

           {/* Top Row: Name & Balance */}
           <View style={styles.cardTopRow}>
             <Text style={styles.cardName}>{vloo.name || 'Vloo Card'}</Text>
             <Text style={styles.cardBalance}>{formatCurrency(getTotalBalance())}</Text>
           </View>

           {/* Bottom Left: Big Logo Text */}
           <Text style={styles.cardLogoText}>VLOO</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Receive', 'Coming Soon')}>
            <View style={styles.actionIconContainer}>
              <ArrowDown size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Send', 'Coming Soon')}>
            <View style={styles.actionIconContainer}>
              <ArrowUp size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Swap', 'Coming Soon')}>
            <View style={styles.actionIconContainer}>
              <ArrowLeftRight size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Swap</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Buy', 'Coming Soon')}>
            <View style={styles.actionIconContainer}>
              <CreditCard size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Buy</Text>
          </TouchableOpacity>
        </View>

        {wallets.length > 0 && (
          <View style={styles.infoSection}>
             <Text style={styles.label}>Linked Wallets</Text>
             <View style={styles.walletsContainer}>
               {wallets.map((wallet: any, index: number) => {
                 const key = `${wallet.type}_${wallet.address}`;
                 const balanceStr = walletBalances[key] || '';
                 let [amountStr, symbol] = balanceStr.split(' ');
                 
                 // If symbol missing from balance (e.g. initial load or empty), derive from type
                 if (!symbol) {
                    const type = wallet.type.toLowerCase();
                    if (type.includes('bitcoin')) symbol = 'BTC';
                    else if (type.includes('ethereum')) symbol = 'ETH';
                    else if (type.includes('solana')) symbol = 'SOL';
                    else if (type.includes('polygon')) symbol = 'POL';
                    else if (type.includes('bnb')) symbol = 'BNB';
                    else if (type.includes('lisk')) symbol = 'LSK';
                    
                    // If balance string was empty/default, set amount to 0
                    if (!amountStr) amountStr = '0.00';
                 }

                 const amount = parseFloat(amountStr) || 0;
                 const priceId = getPriceId(symbol);
                 const curr = currency.toLowerCase();
                 const price = prices[priceId]?.[curr] || 0;
                 const value = amount * price;

                 return (
                 <TouchableOpacity key={index} style={styles.walletRow} onPress={() => handleWalletPress(wallet)}>
                   <View style={styles.walletIcon}>
                     {wallet.type === 'Bitcoin' ? <BitcoinIcon width={24} height={24} /> :
                      wallet.type === 'Ethereum' ? <EthIcon width={24} height={24} /> :
                      wallet.type === 'Solana' ? <SolanaIcon width={24} height={24} /> :
                      wallet.type === 'Polygon' ? <PolygonIcon width={24} height={24} /> :
                      wallet.type === 'BNB Chain' ? <BnbIcon width={24} height={24} /> :
                      wallet.type === 'Lisk' ? <LiskIcon width={24} height={24} /> :
                      <View style={{ width: 24, height: 24, backgroundColor: '#eee', borderRadius: 12 }} />}
                   </View>
                   <View style={styles.walletInfo}>
                     <Text style={styles.walletType}>{wallet.type}</Text>
                     <Text style={styles.walletAddress}>{symbol}</Text>
                   </View>
                   <View style={styles.walletBalanceContainer}>
                     <Text style={styles.walletBalanceText}>{amountStr}</Text>
                     <Text style={styles.walletIdrText}>{formatCurrency(value)}</Text>
                   </View>
                 </TouchableOpacity>
               )})}
             </View>
          </View>
        )}
      </ScrollView>

      <WalletDetailModal 
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        wallet={selectedWallet}
        price={getWalletPrice(selectedWallet)}
        currency={currency}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: Platform.select({ android: 60, ios: 16 }),
  },
  headerTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: '#000',
  },
  iconButton: {
    padding: 8,
  },
  body: {
    padding: 24,
    paddingBottom: 40,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 12,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: '#000',
  },
  cardPreview: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    height: 220,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  cardTopRow: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    width: '100%',
    gap: 6,
  },
  cardName: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 4,
  },
  cardBalanceContainer: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardBalance: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#fff',
  },
  cardLogoText: {
    position: 'absolute',
    bottom: -10,
    left: 15,
    fontFamily: FONTS.displayBold,
    fontSize: 90,
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: -4,
    zIndex: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -50,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -80,
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
  },
  circle3: {
    width: 100,
    height: 100,
    top: 40,
    left: 40,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoSection: {
    marginBottom: 20,
  },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 1,
  },
  walletsContainer: {
    marginTop: 12,
    gap: 12,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 16,
    gap: 12,
  },
  walletIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  walletInfo: {
    flex: 1,
  },
  walletType: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  walletAddress: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
  },
  copyButton: {
    padding: 8,
  },
  walletBalanceContainer: {
    alignItems: 'flex-end',
  },
  walletBalanceText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  walletIdrText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
  },
});
