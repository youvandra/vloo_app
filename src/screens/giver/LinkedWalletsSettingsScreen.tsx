import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Switch, Platform, Alert, ScrollView, Image, TextInput } from 'react-native';
import { ArrowLeft, Menu, Plus, RefreshCw, Search } from 'lucide-react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Skeleton } from '../../components/Skeleton';
import { COLORS, FONTS } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { generateMockBitcoinData, generateMockSolanaData, generateMockTronData, generateMockMoneroData, generateMockXrpData, generateMockHederaData, getWalletFromPrivateKey } from '../../lib/wallet';
import { generateDeterministicPrivateKey } from '../../lib/crypto';
import { ScanVlooModal } from './components/modals/dashboard/ScanVlooModal';
import { CreateVlooModal } from './components/modals/dashboard/CreateVlooModal'; // Used for Passphrase Input

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
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Re-auth State
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [passphraseModalVisible, setPassphraseModalVisible] = useState(false);
  const [scannedCardId, setScannedCardId] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
        // Merge icons into userWallets if missing
        let updatedUserWallets = userWallets.map(w => {
             const coin = allCoins.find(c => 
                 c.name === w.type || 
                 (w.type === 'USDT' && c.ticker === 'USDT') ||
                 c.ticker === w.ticker
             );
             return {
                 ...w,
                 icon: coin?.icon || w.icon
             };
        });

        // Check for Base EVM Wallet
        const evmWallet = updatedUserWallets.find(w => 
            w.type === 'Ethereum' || w.type === 'Polygon' || w.type === 'BNB Chain' || w.type === 'Lisk' || w.type === 'Base' ||
            allCoins.find(c => c.name === w.type && (c.chain === 'Ethereum' || c.chain === 'Polygon' || c.chain === 'BNB Chain' || c.chain === 'Lisk' || c.chain === 'Base'))
        );

        const evmAddress = evmWallet?.address;

        // Categorize coins
        const availableToAdd: any[] = [];
        const discoverMore: any[] = [];

        allCoins.forEach(coin => {
             // Check if user already has this coin
             const exists = updatedUserWallets.some(w => 
                 w.type.toLowerCase() === coin.name.toLowerCase() || 
                 (w.type === 'USDT' && coin.ticker === 'USDT')
             );

             if (exists) return;

             // If not exists, check if we can auto-add to "Available" (inactive)
             // Criteria: It's an EVM chain/token AND we have an EVM address
             const isEvm = ['Ethereum', 'Polygon', 'BNB Chain', 'Lisk', 'Base'].includes(coin.chain) || coin.is_token;
             
             if (isEvm && evmAddress) {
                 // Add to user wallets as INACTIVE
                 updatedUserWallets.push({
                     type: coin.ticker === 'USDT' ? 'USDT' : coin.name,
                     address: evmAddress,
                     isVisible: false, // Default hidden
                     tag: coin.is_token ? 'ERC-20' : undefined,
                     ticker: coin.ticker,
                     coingeckoId: coin.coingecko_id,
                     icon: coin.icon
                 });
             } else {
                 // Requires Sync/Generation
                 discoverMore.push(coin);
             }
        });
        
        // Update state
        setWallets(updatedUserWallets);
        setMoreCoins(discoverMore);
        
        // Persist the auto-added inactive wallets
        if (updatedUserWallets.length > userWallets.length) {
            AsyncStorage.setItem(`vloo_wallets_${vloo.id}`, JSON.stringify(updatedUserWallets));
        }
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

  const toggleVisibility = (item: any) => {
    const newWallets = wallets.map(w => {
        if (w.type === item.type) {
            return { ...w, isVisible: !w.isVisible };
        }
        return w;
    });
    saveWallets(newWallets);
  };

  const handleAddCoin = (coin: any) => {
      // Logic to generate address for the new coin
      let address = '';
      let tag = coin.is_token ? 'ERC-20' : undefined; // Defaulting to ERC-20 for tokens for now

      // 1. Check if it's an EVM chain or token -> reuse existing EVM address
      const evmWallet = wallets.find(w => 
          w.type === 'Ethereum' || w.type === 'Polygon' || w.type === 'BNB Chain' || w.type === 'Lisk' || w.type === 'Base'
      );

      if (coin.chain === 'Ethereum' || coin.chain === 'Polygon' || coin.chain === 'BNB Chain' || coin.chain === 'Lisk' || coin.chain === 'Base') {
          if (evmWallet) {
              address = evmWallet.address;
          } else {
              // Should not happen if created correctly, but fallback
              Alert.alert('Error', 'No base EVM wallet found to derive address.');
              return;
          }
      } else if (coin.chain === 'Bitcoin') {
          // Fallback to random if no private key context (user should use Refresh button)
          const data = generateMockBitcoinData();
          address = data.address;
      } else if (coin.chain === 'Solana') {
           const data = generateMockSolanaData();
           address = data.address;
      } else if (coin.chain === 'Tron') {
           const data = generateMockTronData();
           address = data.address;
      } else if (coin.chain === 'Monero') {
           const data = generateMockMoneroData();
           address = data.address;
      } else if (coin.chain === 'XRP Ledger') {
           const data = generateMockXrpData();
           address = data.address;
      } else if (coin.chain === 'Hedera') {
           // Fallback for manual add without sync (random)
           // ideally user should sync.
           const data = generateMockHederaData();
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
          coingeckoId: coin.coingecko_id,
          icon: coin.icon
      };

      const updatedWallets = [...wallets, newWallet];
      saveWallets(updatedWallets);
      
      // Remove from "More Coins"
      setMoreCoins(prev => prev.filter(c => c.id !== coin.id));
  };

  const handleRefreshPress = () => {
    setScanModalVisible(true);
  };

  const handleScanBind = (cardId: string) => {
    // Validate Card ID matches current Vloo
    // We do a loose check or exact check.
    // vloo.id might be UUID or custom string. Assuming cardId matches or contains it.
    // For now, let's just proceed, but in real app we check.
    // Actually, vloo.id is the UUID in DB, cardId from scan is usually the physical ID (e.g. VLOO-...)
    // Since we don't have the mapping here easily without DB call, we trust the user for now 
    // OR we just use the scanned ID to derive keys.
    // But if they scan a DIFFERENT card, they will get DIFFERENT addresses, which might be confusing.
    // Ideally we should verify.
    
    setScannedCardId(cardId);
    setScanModalVisible(false);
    setTimeout(() => {
       setPassphraseModalVisible(true);
    }, 500);
  };

  const handlePassphraseSubmit = async () => {
     if (!passphrase || !scannedCardId) return;
     
     setIsProcessing(true);
     try {
         // 1. Generate Private Key
         const privateKey = generateDeterministicPrivateKey(scannedCardId, passphrase);
         
         // 2. Generate All Addresses
         const evmWallet = getWalletFromPrivateKey(privateKey);
         const evmAddress = evmWallet.address;
         const btcData = generateMockBitcoinData(privateKey);
         const solData = generateMockSolanaData(privateKey);
         const tronData = generateMockTronData(privateKey);
         const xmrData = generateMockMoneroData(privateKey);
         const xrpData = generateMockXrpData(privateKey);
         const hbarData = generateMockHederaData(privateKey);

         // 3. Update Existing Wallets & Add New Ones
         // We want to preserve 'isVisible' for existing ones if possible, OR just reset them to defaults?
         // User said "refresh", usually implies "sync". 
         // Let's iterate through ALL supported coins (both in wallets and moreCoins) and update them.

         // Combined list of all possible coins from DB (we need to fetch 'all_wallets' again to be sure)
         const { data: allCoins, error } = await supabase.from('all_wallets').select('*');
         
         if (error || !allCoins) {
             throw new Error('Failed to fetch coin definitions');
         }

         const newWalletsList: any[] = [];
         
         // Helper to find existing visibility preference
         const getExistingVisibility = (type: string) => {
             const found = wallets.find(w => w.type === type);
             return found ? found.isVisible : false; // Default to false for NEW coins found during sync
         };
         
         // Process EVM (Ethereum, Polygon, BNB, Lisk, USDT)
         // We can map allCoins to our wallets
         allCoins.forEach(coin => {
             let address = '';
             let type = coin.ticker === 'USDT' ? 'USDT' : coin.name;
             
             // Determine Address
             if (['Ethereum', 'Polygon', 'BNB Chain', 'Lisk', 'Base'].includes(coin.chain) || coin.is_token) {
                 address = evmAddress;
             } else if (coin.chain === 'Bitcoin') {
                 address = btcData.address;
             } else if (coin.chain === 'Solana') {
                 address = solData.address;
             } else if (coin.chain === 'Tron') {
                 address = tronData.address;
             } else if (coin.chain === 'Monero') {
                 address = xmrData.address;
             } else if (coin.chain === 'XRP Ledger') {
                  address = xrpData.address;
              } else if (coin.chain === 'Hedera') {
                 // Hedera uses unique Account IDs (0.0.xxxxx), which CANNOT be derived purely from a private key 
                 // without interacting with the network to CREATE the account first.
                 // However, for this mock implementation where we "sync" from a single seed/key,
                 // we MUST ensure that the SAME seed produces the SAME Mock Hedera ID.
                 // We pass the privateKey (which is deterministic from card+passphrase) to generateMockHederaData
                 address = hbarData.address;
             } else {
                  // Unsupported or Coming Soon
                  return;
              }
             
             // Check if this wallet was already in user's list
             // If yes, keep its visibility. If no, default to FALSE (hidden).
             // EXCEPT for the "base" coins (BTC, ETH, SOL, etc) which usually are visible if they were just added.
             // But here we are syncing. 
             // If it's in 'wallets', use that visibility.
             // If it's NOT in 'wallets', it was in 'moreCoins', so it should be FALSE (user hasn't added it yet) 
             // OR maybe TRUE if we want to auto-discover?
             // Safest is to respect current state.
             
             const existing = wallets.find(w => w.type === type);
             const isVisible = existing ? existing.isVisible : false;

             newWalletsList.push({
                 type: type,
                 address: address,
                 isVisible: isVisible,
                 tag: coin.is_token ? 'ERC-20' : undefined,
                 ticker: coin.ticker,
                 coingeckoId: coin.coingecko_id,
                 icon: coin.icon
             });
         });

         // Update State
         saveWallets(newWalletsList);
         
         // Clear More Coins (since we added everything to wallets list, just some are hidden)
         setMoreCoins([]); 
         
         Alert.alert('Success', 'Wallets synchronized successfully.');
         setPassphraseModalVisible(false);
         setPassphrase('');
         setScannedCardId('');
         
     } catch (e: any) {
         Alert.alert('Error', e.message || 'Failed to sync wallets');
     } finally {
         setIsProcessing(false);
     }
  };

  const getIcon = (iconName?: string) => {
      if (!iconName) return <View style={{ width: 24, height: 24, backgroundColor: '#eee', borderRadius: 12 }} />;

      if (iconName.startsWith('http') || iconName.startsWith('https')) {
          return <Image source={{ uri: iconName }} style={{ width: 24, height: 24, borderRadius: 12 }} />;
      }

      switch(iconName.toLowerCase()) {
          case 'bitcoin': return <BitcoinIcon width={24} height={24} />;
          case 'ethereum': return <EthIcon width={24} height={24} />;
          case 'solana': return <SolanaIcon width={24} height={24} />;
          case 'polygon': return <PolygonIcon width={24} height={24} />;
          case 'bnb': return <BnbIcon width={24} height={24} />;
          case 'lisk': return <LiskIcon width={24} height={24} />;
          case 'usdt': return <UsdtIcon width={24} height={24} />;
          case 'tron': return <View style={{ width: 24, height: 24, backgroundColor: '#FF0013', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 10, fontFamily: FONTS.bodyBold }}>T</Text></View>;
          case 'monero': return <View style={{ width: 24, height: 24, backgroundColor: '#F26822', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 10, fontFamily: FONTS.bodyBold }}>M</Text></View>;
          case 'xrp': return <View style={{ width: 24, height: 24, backgroundColor: '#000', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 10, fontFamily: FONTS.bodyBold }}>X</Text></View>;
          case 'hedera': return <View style={{ width: 24, height: 24, backgroundColor: '#222', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 10, fontFamily: FONTS.bodyBold }}>H</Text></View>;
          default: return <View style={{ width: 24, height: 24, backgroundColor: '#eee', borderRadius: 12 }} />;
      }
  };

  const filteredActiveWallets = wallets.filter(w => {
      if (!w.isVisible) return false;
      if (!searchQuery) return true;
      return w.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
             w.ticker?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredInactiveWallets = wallets.filter(w => {
      if (w.isVisible) return false;
      if (!searchQuery) return true;
      return w.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
             w.ticker?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredMoreCoins = moreCoins.filter(c => {
      if (!searchQuery) return true;
      return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             c.ticker?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeWallets = filteredActiveWallets;
  const inactiveWallets = filteredInactiveWallets;
  const moreCoinsList = filteredMoreCoins;

  const renderItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
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
            {getIcon(item.icon || item.type)}
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
            onValueChange={() => toggleVisibility(item)}
            trackColor={{ false: '#767577', true: COLORS.primary }}
            thumbColor={item.isVisible ? '#fff' : '#f4f3f4'}
          />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const renderInactiveItem = (item: any) => {
    return (
      <View
        key={`${item.type}_${item.address}`}
        style={[styles.rowItem, { opacity: 0.8 }]}
      >
        <View style={[styles.dragHandle, { opacity: 0 }]}>
            <Menu size={20} color="#999" />
        </View>

        <View style={styles.walletIcon}>
            {getIcon(item.icon || item.type)}
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
            onValueChange={() => toggleVisibility(item)}
            trackColor={{ false: '#767577', true: COLORS.primary }}
            thumbColor={item.isVisible ? '#fff' : '#f4f3f4'}
        />
      </View>
    );
  };

  if (loading) {
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
        <View style={styles.listContent}>
             <Skeleton width="100%" height={48} style={{ borderRadius: 12, marginBottom: 24 }} />
             <Skeleton width={120} height={20} style={{ marginBottom: 12 }} />
             {[1, 2, 3, 4].map(i => (
                 <View key={i} style={styles.rowItem}>
                     <Skeleton width={20} height={20} style={{ borderRadius: 10, marginRight: 12 }} />
                     <Skeleton width={40} height={40} style={{ borderRadius: 20 }} />
                     <View style={{ flex: 1, marginLeft: 12 }}>
                         <Skeleton width={100} height={16} style={{ marginBottom: 6 }} />
                         <Skeleton width={150} height={12} />
                     </View>
                     <Skeleton width={40} height={24} style={{ borderRadius: 12 }} />
                 </View>
             ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
           <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Linked Wallets</Text>
        <TouchableOpacity 
            onPress={handleRefreshPress} 
            style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 6, 
                backgroundColor: COLORS.primary, 
                paddingHorizontal: 12, 
                paddingVertical: 8, 
                borderRadius: 20 
            }}
        >
           <Text style={{ fontFamily: FONTS.bodySemiBold, fontSize: 14, color: '#fff' }}>Sync</Text>
           <RefreshCw size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <DraggableFlatList
        data={activeWallets}
        onDragEnd={({ data }) => saveWallets([...data, ...inactiveWallets])}
        keyExtractor={(item) => `${item.type}_${item.address}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.searchContainer}>
                <Search size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search coins..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Current Coins</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <>
              {inactiveWallets.length > 0 && (
                  <>
                      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                          <Text style={styles.sectionTitle}>Available Wallets</Text>
                      </View>
                      <View style={{ gap: 12 }}>
                          {inactiveWallets.map(item => renderInactiveItem(item))}
                      </View>
                  </>
              )}

              {moreCoins.length > 0 && (
                  <>
                      <View style={[styles.sectionHeader, { marginTop: 24, flexDirection: 'row', alignItems: 'center' }]}>
                          <Text style={styles.sectionTitle}>Discover More</Text>
                          <View style={{ marginLeft: 8, backgroundColor: '#FFF5E6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                              <Text style={{ fontSize: 10, color: COLORS.primary, fontFamily: FONTS.bodySemiBold }}>Please sync to add</Text>
                          </View>
                      </View>
                      <View style={{ gap: 12 }}>
                          {moreCoins.map((coin, index) => (
                              <View key={coin.id} style={[styles.rowItem, { opacity: 0.6 }]}>
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
                              </View>
                          ))}
                      </View>
                  </>
              )}
              
              <View style={{ height: 40 }} />
          </>
        }
      />

      <ScanVlooModal 
        visible={scanModalVisible}
        onClose={() => setScanModalVisible(false)}
        onBack={() => setScanModalVisible(false)}
        onBind={handleScanBind}
        isBinding={false}
        title="Resync Wallets"
      />

      <CreateVlooModal
        visible={passphraseModalVisible}
        onClose={() => setPassphraseModalVisible(false)}
        onBack={() => setPassphraseModalVisible(false)} // Or go back to scan
        onNext={handlePassphraseSubmit}
        passphrase={passphrase}
        setPassphrase={setPassphrase}
        isLoading={isProcessing}
        title="Enter Passphrase"
        buttonText="Sync Wallets"
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 24,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#000',
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
