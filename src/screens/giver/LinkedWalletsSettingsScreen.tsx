import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Switch, Platform, Alert, ScrollView } from 'react-native';
import { ArrowLeft, Menu, Plus } from 'lucide-react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { generateMockBitcoinData, generateMockSolanaData } from '../../lib/wallet';

import BitcoinIcon from '../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../assets/icons/chains/bnb.svg';
import LiskIcon from '../../assets/icons/chains/lisk.svg';
import UsdtIcon from '../../assets/icons/chains/usdt.svg';

export default function LinkedWalletsSettingsScreen({ route, navigation }: any) {
  const { vloo } = route.params;
  const [wallets, setWallets] = useState<any[]>([]);
  const [moreCoins, setMoreCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // 1. Fetch User Wallets from Local Storage
      const stored = await AsyncStorage.getItem(`vloo_wallets_${vloo.id}`);
      let userWallets: any[] = [];
      if (stored) {
        let parsedWallets = JSON.parse(stored);
        userWallets = parsedWallets.map((w: any) => ({
          ...w,
          isVisible: w.isVisible !== undefined ? w.isVisible : true
        }));
      }
      setWallets(userWallets);

      // 2. Fetch All Available Coins from DB
      const { data: allCoins, error } = await supabase
        .from('all_wallets')
        .select('*');

      if (error) {
        console.error('Error fetching all coins:', error);
      } else if (allCoins) {
        // Filter out coins that are already in userWallets
        // We match by ticker or type to be safe
        const available = allCoins.filter(coin => {
             // Check if user already has this coin (by ticker or name/type)
             const exists = userWallets.some(w => 
                 w.type.toLowerCase() === coin.name.toLowerCase() || 
                 (w.type === 'USDT' && coin.ticker === 'USDT') // Specific check for USDT/Tokens
             );
             return !exists;
        });
        setMoreCoins(available);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveWallets = async (newWallets: any[]) => {
    try {
      setWallets(newWallets);
      await AsyncStorage.setItem(`vloo_wallets_${vloo.id}`, JSON.stringify(newWallets));
    } catch (e) {
      console.error('Error saving wallets:', e);
    }
  };

  const toggleVisibility = (index: number) => {
    const newWallets = [...wallets];
    newWallets[index].isVisible = !newWallets[index].isVisible;
    saveWallets(newWallets);
  };

  const handleAddCoin = (coin: any) => {
      // Logic to generate address for the new coin
      let address = '';
      let tag = coin.is_token ? 'ERC-20' : undefined; // Defaulting to ERC-20 for tokens for now

      // 1. Check if it's an EVM chain or token -> reuse existing EVM address
      const evmWallet = wallets.find(w => 
          w.type === 'Ethereum' || w.type === 'Polygon' || w.type === 'BNB Chain'
      );

      if (coin.chain === 'Ethereum' || coin.chain === 'Polygon' || coin.chain === 'BNB Chain' || coin.chain === 'Lisk') {
          if (evmWallet) {
              address = evmWallet.address;
          } else {
              // Should not happen if created correctly, but fallback
              Alert.alert('Error', 'No base EVM wallet found to derive address.');
              return;
          }
      } else if (coin.chain === 'Bitcoin') {
          // Generate Mock/Real Bitcoin Address
          // Since we don't have the private key here, we use the mock generator
          // In a real app, we might need to prompt for password or handle this differently
          const data = generateMockBitcoinData();
          address = data.address;
      } else if (coin.chain === 'Solana') {
           const data = generateMockSolanaData();
           address = data.address;
      } else {
          address = 'Coming Soon';
      }

      const newWallet = {
          type: coin.ticker === 'USDT' ? 'USDT' : coin.name, // Handle USDT naming convention in current app
          address: address,
          isVisible: true,
          tag: tag,
          ticker: coin.ticker,
          coingeckoId: coin.coingecko_id
      };

      const updatedWallets = [...wallets, newWallet];
      saveWallets(updatedWallets);
      
      // Remove from "More Coins"
      setMoreCoins(prev => prev.filter(c => c.id !== coin.id));
  };

  const getIcon = (iconName: string) => {
      switch(iconName) {
          case 'bitcoin': return <BitcoinIcon width={24} height={24} />;
          case 'ethereum': return <EthIcon width={24} height={24} />;
          case 'solana': return <SolanaIcon width={24} height={24} />;
          case 'polygon': return <PolygonIcon width={24} height={24} />;
          case 'bnb': return <BnbIcon width={24} height={24} />;
          case 'lisk': return <LiskIcon width={24} height={24} />;
          case 'usdt': return <UsdtIcon width={24} height={24} />;
          default: return <View style={{ width: 24, height: 24, backgroundColor: '#eee', borderRadius: 12 }} />;
      }
  };

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<any>) => {
    const index = getIndex();
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.rowItem,
            isActive && { backgroundColor: '#f0f0f0', elevation: 5 }
          ]}
        >
          <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
            <Menu size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.walletIcon}>
            {item.type === 'Bitcoin' ? <BitcoinIcon width={24} height={24} /> :
             item.type === 'Ethereum' ? <EthIcon width={24} height={24} /> :
             item.type === 'Solana' ? <SolanaIcon width={24} height={24} /> :
             item.type === 'Polygon' ? <PolygonIcon width={24} height={24} /> :
             item.type === 'BNB Chain' ? <BnbIcon width={24} height={24} /> :
             item.type === 'Lisk' ? <LiskIcon width={24} height={24} /> :
             item.type === 'USDT' ? <UsdtIcon width={24} height={24} /> :
             <View style={{ width: 24, height: 24, backgroundColor: '#eee', borderRadius: 12 }} />}
          </View>

          <View style={styles.walletInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.walletType}>{item.type}</Text>
                {item.tag && (
                    <View style={{ marginLeft: 6, backgroundColor: '#F2F2F7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, color: '#666', fontFamily: FONTS.bodySemiBold }}>{item.tag}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.walletAddress}>
              {item.address ? `${item.address.slice(0, 6)}...${item.address.slice(-4)}` : ''}
            </Text>
          </View>

          <Switch
            value={item.isVisible}
            onValueChange={() => toggleVisibility(index!)}
            trackColor={{ false: '#767577', true: COLORS.primary }}
            thumbColor={item.isVisible ? '#fff' : '#f4f3f4'}
          />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
           <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Linked Wallets</Text>
        <View style={{ width: 40 }} />
      </View>

      <DraggableFlatList
        data={wallets}
        onDragEnd={({ data }) => saveWallets(data)}
        keyExtractor={(item) => `${item.type}_${item.address}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Current Coins</Text>
          </View>
        }
        ListFooterComponent={
          <>
              {moreCoins.length > 0 && (
                  <>
                      <View style={styles.sectionHeader}>
                          <Text style={styles.sectionTitle}>More Coins</Text>
                      </View>
                      <View style={{ gap: 12 }}>
                          {moreCoins.map((coin, index) => (
                              <TouchableOpacity key={coin.id} style={styles.rowItem} onPress={() => handleAddCoin(coin)}>
                                  <View style={[styles.dragHandle, { opacity: 0 }]}>
                                      <Menu size={20} color="#999" />
                                  </View>

                                  <View style={styles.walletIcon}>
                                      {getIcon(coin.icon)}
                                  </View>

                                  <View style={styles.walletInfo}>
                                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                          <Text style={styles.walletType}>{coin.name}</Text>
                                          {coin.is_token && (
                                              <View style={{ marginLeft: 6, backgroundColor: '#F2F2F7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                  <Text style={{ fontSize: 10, color: '#666', fontFamily: FONTS.bodySemiBold }}>ERC-20</Text>
                                              </View>
                                          )}
                                      </View>
                                      <Text style={styles.walletAddress}>
                                          {coin.chain}
                                      </Text>
                                  </View>

                                  <View style={styles.addButton}>
                                      <Plus size={20} color={COLORS.primary} />
                                  </View>
                              </TouchableOpacity>
                          ))}
                      </View>
                  </>
              )}
              
              <View style={{ height: 40 }} />
          </>
        }
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
  content: {
    flex: 1,
  },
  listContent: {
    padding: 24,
    gap: 12,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  dragHandle: {
    padding: 8,
    marginRight: 4,
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
  sectionHeader: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: '#000',
  },
  addButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
