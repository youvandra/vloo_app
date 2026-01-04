import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Platform, Alert, Image, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { ArrowLeft, Send } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { fetchBalance } from '../../lib/blockcypher';

import BitcoinIcon from '../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../assets/icons/chains/bnb.svg';
import LiskIcon from '../../assets/icons/chains/lisk.svg';
import UsdtIcon from '../../assets/icons/chains/usdt.svg';

const { width } = Dimensions.get('window');

export default function SendScreen({ route, navigation }: any) {
  const { vloo } = route.params;
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<{[key: string]: string}>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR');
  const [prices, setPrices] = useState<any>({});

  useEffect(() => {
    AsyncStorage.getItem('app_currency').then(val => {
       if(val) setCurrency(val as 'IDR' | 'USD');
    });
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch User Wallets from Local Storage
      const stored = await AsyncStorage.getItem(`vloo_wallets_${vloo.id}`);
      let userWallets: any[] = [];
      if (stored) {
        userWallets = JSON.parse(stored);
      }
      
      // Fetch icons from DB if missing
      const { data: allCoins } = await supabase.from('all_wallets').select('*');
      
      if (allCoins) {
        userWallets = userWallets.map(w => {
            const coin = allCoins.find(c => 
                c.name === w.type || 
                (w.type === 'USDT' && c.ticker === 'USDT') ||
                c.ticker === w.ticker
            );
            return {
                ...w,
                icon: coin?.icon || w.icon,
                coingeckoId: coin?.coingecko_id || w.coingeckoId
            };
        });
      }

      setWallets(userWallets);
      
      // Fetch balances and prices
      if (userWallets.length > 0) {
          fetchBalancesAndPrices(userWallets);
      }
    } catch (e) {
      console.error('Error loading wallets:', e);
      Alert.alert('Error', 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalancesAndPrices = async (walletsToFetch: any[]) => {
      // Fetch Balances
      walletsToFetch.forEach(async (w) => {
        try {
            const bal = await fetchBalance(w.address, w.type);
            const key = `${w.type}_${w.address}`;
            setBalances(prev => ({...prev, [key]: bal}));
        } catch (e) {
            console.error('Error fetching balance:', e);
        }
      });

      // Fetch Prices
      const uniqueIds = new Set<string>();
      walletsToFetch.forEach(w => {
          if (w.coingeckoId) {
              uniqueIds.add(w.coingeckoId);
          } else {
              const id = getCoinIdFromType(w.type);
              if (id) uniqueIds.add(id);
          }
      });

      if (uniqueIds.size > 0) {
          const ids = Array.from(uniqueIds).join(',');
          try {
              const curr = currency.toLowerCase(); // This might be stale if used immediately, but effect will re-trigger if currency changes
              // Using hardcoded 'usd,idr' to get both for now to simplify
              const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,idr`);
              const data = await response.json();
              setPrices(data);
          } catch (e) {
              console.error('Error fetching prices:', e);
          }
      }
  };

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

  const getIcon = (iconName?: string) => {
    if (!iconName) return <View style={styles.placeholderIcon} />;

    if (iconName.startsWith('http') || iconName.startsWith('https')) {
        return <Image source={{ uri: iconName }} style={styles.iconImage} />;
    }

    const iconProps = { width: 48, height: 48 };

    switch(iconName.toLowerCase()) {
        case 'bitcoin': return <BitcoinIcon {...iconProps} />;
        case 'ethereum': return <EthIcon {...iconProps} />;
        case 'solana': return <SolanaIcon {...iconProps} />;
        case 'polygon': return <PolygonIcon {...iconProps} />;
        case 'bnb': return <BnbIcon {...iconProps} />;
        case 'lisk': return <LiskIcon {...iconProps} />;
        case 'usdt': return <UsdtIcon {...iconProps} />;
        case 'tron': return <View style={[styles.customIcon, { backgroundColor: '#FF0013' }]}><Text style={styles.customIconText}>T</Text></View>;
        case 'monero': return <View style={[styles.customIcon, { backgroundColor: '#F26822' }]}><Text style={styles.customIconText}>M</Text></View>;
        case 'xrp': return <View style={[styles.customIcon, { backgroundColor: '#000' }]}><Text style={styles.customIconText}>X</Text></View>;
        case 'hedera': return <View style={[styles.customIcon, { backgroundColor: '#222' }]}><Text style={styles.customIconText}>H</Text></View>;
        default: return <View style={styles.placeholderIcon} />;
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const handleSendPress = (wallet: any) => {
      navigation.navigate('Transfer', { wallet, vloo });
  };

  const renderItem = ({ item }: { item: any }) => {
      const key = `${item.type}_${item.address}`;
      const balanceStr = balances[key] || '0.00 ' + (item.ticker || item.type);
      
      // Calculate fiat value if possible
      let fiatValue = '';
      const [amountStr, symbol] = balanceStr.split(' ');
      const amount = parseFloat(amountStr) || 0;
      
      let priceId = item.coingeckoId || getCoinIdFromType(item.type);
      const currKey = currency.toLowerCase();
      const price = prices[priceId]?.[currKey];
      
      if (price) {
          const value = amount * price;
          const locale = currency === 'IDR' ? 'id-ID' : 'en-US';
          fiatValue = new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(value);
      }

      return (
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    {getIcon(item.icon)}
                </View>
                <Text style={styles.coinName}>{item.type}</Text>
                {item.tag && <Text style={styles.coinTag}>{item.tag}</Text>}
            </View>

            <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceText}>{balanceStr}</Text>
                {fiatValue ? <Text style={styles.fiatText}>≈ {fiatValue}</Text> : null}
            </View>

            <View style={styles.addressSection}>
                <Text style={styles.addressLabel}>From Address</Text>
                <View style={styles.addressBox}>
                    <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">{item.address}</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.sendButton}
                onPress={() => handleSendPress(item)}
            >
                <Send size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>

            <Text style={styles.helperText}>
                Select the wallet you want to send from.
            </Text>
          </View>
        </View>
      );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <FlatList
            ref={flatListRef}
            data={wallets}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            snapToInterval={width}
            decelerationRate="fast"
            contentContainerStyle={styles.flatListContent}
        />

        <View style={styles.pagination}>
            {wallets.map((_, index) => (
                <View 
                    key={index} 
                    style={[
                        styles.dot, 
                        activeIndex === index && styles.activeDot
                    ]} 
                />
            ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
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
  content: {
    flex: 1,
    paddingVertical: 24,
  },
  flatListContent: {
    alignItems: 'center',
  },
  cardContainer: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 12,
  },
  coinName: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#000',
    marginBottom: 4,
  },
  coinTag: {
    fontFamily: FONTS.textMedium,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontFamily: FONTS.text,
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balanceText: {
    fontFamily: FONTS.displayBold,
    fontSize: 32,
    color: '#000',
    textAlign: 'center',
  },
  fiatText: {
    fontFamily: FONTS.textMedium,
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  addressSection: {
    width: '100%',
    marginBottom: 24,
  },
  addressLabel: {
    fontFamily: FONTS.textMedium,
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  addressBox: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  addressText: {
    fontFamily: FONTS.text,
    fontSize: 14,
    color: '#000',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    marginBottom: 16,
  },
  sendButtonText: {
    fontFamily: FONTS.displayBold,
    fontSize: 16,
    color: '#fff',
  },
  helperText: {
    fontFamily: FONTS.text,
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  iconImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#eee',
    borderRadius: 24,
  },
  customIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customIconText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
