import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, BackHandler, SafeAreaView, Alert, StatusBar, RefreshControl, Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBalance } from '../../lib/blockcypher';
import { supabase } from '../../lib/supabase';
import { createRandomWallet, generateMockBitcoinData, generateMockSolanaData, generateMockTronData, generateMockMoneroData, generateMockXrpData, generateMockHederaData, getWalletFromPrivateKey } from '../../lib/wallet';
import { encryptData, generateDeterministicPrivateKey, generateCommitmentHash } from '../../lib/crypto';

// Components
import { DashboardHeader } from './components/DashboardHeader';
import { CardStack } from './components/CardStack';
import { BottomNavigation } from './components/BottomNavigation';
import { CreateVlooModal } from './components/modals/dashboard/CreateVlooModal';
import { ScanVlooModal } from './components/modals/dashboard/ScanVlooModal';

import { MoreScreen } from './MoreScreen';
import { SettingsScreen } from './SettingsScreen';
import { COLORS, FONTS } from '../../lib/theme';
import { Skeleton } from '../../components/Skeleton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fingerprint } from 'lucide-react-native';

const getWalletAddresses = (data: any) => {
  let addresses: any[] = [];
  if (Array.isArray(data)) {
      addresses = [...data];
  } else if (typeof data === 'string' && data) {
    if (data.startsWith('[') || data.startsWith('{')) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) addresses = parsed;
      } catch (e) {}
    } else {
       addresses = [{ type: 'Ethereum', address: data }];
    }
  }
  return addresses;
};

export default function GiverDashboardScreen({ navigation }: any) {
  const [vloos, setVloos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Modals

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [moreScreenView, setMoreScreenView] = useState<'menu' | 'settings'>('menu');

  // Selected Items
  const [selectedVloo, setSelectedVloo] = useState<any>(null);

  // Create Vloo State
  const [passphrase, setPassphrase] = useState('');
  const [pendingCardId, setPendingCardId] = useState('');
  const [bindLoading, setBindLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState('home');

  // Other State
  const [isTestnet, setIsTestnet] = useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [faceIdSupported, setFaceIdSupported] = useState(false);
  const [faceIdLoading, setFaceIdLoading] = useState(false);

  // App Settings
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR');
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  
  // Balance State
  const [vlooBalances, setVlooBalances] = useState<{[key: string]: number}>({});
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalBalanceSecondary, setTotalBalanceSecondary] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const savedFaceId = await AsyncStorage.getItem('face_id_enabled');
        setFaceIdEnabled(savedFaceId === 'true');

        const savedCurrency = await AsyncStorage.getItem('app_currency');
        if (savedCurrency) setCurrency(savedCurrency as 'IDR' | 'USD');

        const savedLanguage = await AsyncStorage.getItem('app_language');
        if (savedLanguage) setLanguage(savedLanguage as 'en' | 'id');

        let supported = false;
        try {
          const LocalAuthentication = require('expo-local-authentication');
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          supported = hasHardware && isEnrolled;
        } catch (e) {
          supported = false;
        }
        setFaceIdSupported(supported);
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    if (vloos.length > 0) {
      updateBalances();
    }
  }, [vloos, currency]);

  const getCoinIdFromType = (type: string) => {
    if (!type) return '';
    const lower = type.toLowerCase();
    if (lower.includes('bitcoin')) return 'bitcoin';
    if (lower.includes('ethereum')) return 'ethereum';
    if (lower.includes('solana')) return 'solana';
    if (lower.includes('polygon') || lower.includes('matic')) return 'matic-network';
    if (lower.includes('bnb')) return 'binancecoin';
    if (lower.includes('lisk')) return 'lisk';
    if (lower.includes('hedera') || lower.includes('hbar')) return 'hedera-hashgraph';
    return '';
  };

  const updateBalances = async () => {
    let newVlooBalances: {[key: string]: number} = {};
    let newTotalBalance = 0;
    let newTotalBalanceSec = 0;
    
    const coinIds = new Set<string>();
    const allWallets: {vlooId: string, address: string, type: string}[] = [];

    for (const vloo of vloos) {
        try {
            const stored = await AsyncStorage.getItem(`vloo_wallets_${vloo.id}`);
            if (stored) {
                const wallets = JSON.parse(stored);
                wallets.forEach((w: any) => {
                    allWallets.push({vlooId: vloo.id, address: w.address, type: w.type});
                    const coinId = getCoinIdFromType(w.type);
                    if (coinId) coinIds.add(coinId);
                });
            }
        } catch (e) {}
    }

    let prices: any = {};
    if (coinIds.size > 0) {
        try {
            const ids = Array.from(coinIds).join(',');
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,idr`);
            prices = await response.json();
        } catch (e) {
            console.error('Error fetching prices:', e);
        }
    }
    
    // Process wallets in parallel to speed up
    await Promise.all(allWallets.map(async (w) => {
        try {
            const balanceStr = await fetchBalance(w.address, w.type);
            const [amountStr] = balanceStr.split(' ');
            const amount = parseFloat(amountStr) || 0;
            
            const coinId = getCoinIdFromType(w.type);
            const priceUSD = prices[coinId]?.['usd'] || 0;
            const priceIDR = prices[coinId]?.['idr'] || 0;
            
            const price = currency === 'IDR' ? priceIDR : priceUSD;
            const priceSec = currency === 'IDR' ? priceUSD : priceIDR;
            
            const value = amount * price;
            const valueSec = amount * priceSec;
            
            newVlooBalances[w.vlooId] = (newVlooBalances[w.vlooId] || 0) + value;
            newTotalBalance += value;
            newTotalBalanceSec += valueSec;
        } catch (e) {
             console.error('Error fetching balance for wallet:', e);
        }
    }));
    
    setVlooBalances(newVlooBalances);
    setTotalBalance(newTotalBalance);
    setTotalBalanceSecondary(newTotalBalanceSec);
  };

  const formatCurrency = (amount: number) => {
    const locale = currency === 'IDR' ? 'id-ID' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
  };

  const formatSecondaryCurrency = (amount: number) => {
    const secCurrency = currency === 'IDR' ? 'USD' : 'IDR';
    const locale = secCurrency === 'IDR' ? 'id-ID' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: secCurrency }).format(amount);
  };

  // --- Handlers ---

  const handleSetCurrency = async (curr: 'IDR' | 'USD') => {
      setCurrency(curr);
      await AsyncStorage.setItem('app_currency', curr);
  };

  const handleSetLanguage = async (lang: 'en' | 'id') => {
      setLanguage(lang);
      await AsyncStorage.setItem('app_language', lang);
  };


  const handleWalletPress = (wallet: any) => {
    // Deprecated wallet press logic
    console.log('Wallet pressed', wallet);
  };

  const handleToggleFaceId = async () => {
    if (!faceIdSupported) {
      Alert.alert('Tidak Didukung', 'Perangkat tidak mendukung Face ID atau belum tersetel.');
      return;
    }
    setFaceIdLoading(true);
    try {
      if (!faceIdEnabled) {
        let success = false;
        try {
          const LocalAuthentication = require('expo-local-authentication');
          const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Aktifkan Face ID', cancelLabel: 'Batal' });
          success = !!result?.success;
        } catch (e) {}
        if (!success) {
          Alert.alert('Gagal', 'Verifikasi biometrik dibatalkan atau gagal.');
          return;
        }
      }
      const newVal = !faceIdEnabled;
      setFaceIdEnabled(newVal);
      await AsyncStorage.setItem('face_id_enabled', newVal ? 'true' : 'false');
      Alert.alert('Berhasil', newVal ? 'Face ID diaktifkan.' : 'Face ID dimatikan.');
    } finally {
      setFaceIdLoading(false);
    }
  };



  const handleCardPress = (vloo: any) => {
    setSelectedVloo(vloo);
    navigation.navigate('VlooDetails', { vloo });
  };

  const saveCardIdLocally = async (id: string) => {
    try {
        const stored = await AsyncStorage.getItem('my_card_ids');
        const ids = stored ? JSON.parse(stored) : [];
        if (!ids.includes(id)) {
            ids.push(id);
            await AsyncStorage.setItem('my_card_ids', JSON.stringify(ids));
        }
    } catch (e) {
        console.error('Error saving card locally:', e);
    }
  };

  const getLocalCardIds = async () => {
    try {
        const stored = await AsyncStorage.getItem('my_card_ids');
        // Fallback to old key for migration
        if (!stored) {
             const oldStored = await AsyncStorage.getItem('my_vloo_ids');
             return oldStored ? JSON.parse(oldStored) : [];
        }
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
  };

  const handleCreateVloo = async (cardId: string, pass: string) => {
    setBindLoading(true);

    try {
        console.log('Checking card existence for:', cardId);
        
        // Check if card exists in DB (Read Only)
        // Use ilike for case-insensitive match and maybeSingle to handle not found gracefully
        const { data: existingCard, error: fetchError } = await supabase
            .from('verified_cards')
            .select('id')
            .ilike('id', cardId.trim())
            .maybeSingle();

        if (fetchError) {
             console.error('Error fetching card:', fetchError);
             // Distinguish network/permission errors from logic
             throw new Error('Failed to verify card status. Please check your internet connection.');
        }

        if (!existingCard) {
            console.warn('Card not found in DB:', cardId);
            throw new Error('This card is not registered in Vloo. Please use a genuine Vloo card.');
        }

        // Generate Private Key and Derive Public Keys
        const privateKey = generateDeterministicPrivateKey(cardId, pass);
        const wallet = getWalletFromPrivateKey(privateKey);
        const evmAddress = wallet.address;

        // Generate addresses for other chains deterministically
        const btcData = generateMockBitcoinData(privateKey);
        const solData = generateMockSolanaData(privateKey);
        const tronData = generateMockTronData(privateKey);
        const xmrData = generateMockMoneroData(privateKey);
        const xrpData = generateMockXrpData(privateKey);
        const hbarData = generateMockHederaData(privateKey);

        // Generate Commitment Hash (to lock the card on server)
        const commitment = generateCommitmentHash(cardId, pass);

        // Call RPC to register commitment (Securely locks the card)
        const { data: rpcData, error: rpcError } = await supabase.rpc('register_card_commitment', {
            p_card_id: existingCard.id,
            p_commitment: commitment
        });

        if (rpcError) {
            console.error('RPC Error:', rpcError);
            throw new Error('Failed to lock card. Please try again.');
        }

        if (!rpcData.success) {
            throw new Error(rpcData.message || 'Card is already bound to another passphrase.');
        }

        // Create Wallet List (EVM compatible chains share address)
        const wallets = [
          { type: 'Ethereum', ticker: 'ETH', address: evmAddress, isVisible: true },
          { type: 'USDT', ticker: 'USDT', address: evmAddress, tag: 'ERC-20', isVisible: true },
          { type: 'Polygon', ticker: 'POL', address: evmAddress, isVisible: true },
          { type: 'BNB Chain', ticker: 'BNB', address: evmAddress, isVisible: true },
          { type: 'Lisk', ticker: 'LSK', address: evmAddress, isVisible: true },
          // Hidden by default, enable in Settings
          { type: 'Bitcoin', ticker: 'BTC', address: btcData.address, isVisible: false },
          { type: 'Solana', ticker: 'SOL', address: solData.address, isVisible: false },
          { type: 'Tron', ticker: 'TRX', address: tronData.address, isVisible: false },
          { type: 'Monero', ticker: 'XMR', address: xmrData.address, isVisible: false },
          { type: 'XRP', ticker: 'XRP', address: xrpData.address, isVisible: false },
          { type: 'Hedera', ticker: 'HBAR', address: hbarData.address, isVisible: false },
        ];

        // Save locally for guest/user persistence
        await saveCardIdLocally(cardId);
        
        // Save Derived Wallets Locally
        await AsyncStorage.setItem(`vloo_wallets_${cardId}`, JSON.stringify(wallets));

        setCreateModalVisible(false);
        // Reset
        setPassphrase('');
        setPendingCardId('');
        
        // Refresh
        fetchVloos(); 
        Alert.alert('Success', 'Vloo Created & Bound Successfully');

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to bind VLOO');
    } finally {
      setBindLoading(false);
    }
  };

  const fetchVloos = async () => {
    try {
      // Attempt to update expired statuses before fetching (if RPC still exists/valid)
      // Note: RPC update_expired_vloos might reference 'vloos' table, so it might fail.
      // We should check/update the RPC later. For now, we wrap in try/catch.
      try {
        // await supabase.rpc('update_expired_vloos'); 
      } catch (e) {
        console.log('Auto-update status skipped:', e);
      }

      // Fetch Cards based on Local Storage IDs
      const localIds = await getLocalCardIds();

      if (localIds.length === 0) {
          setVloos([]);
          setLoading(false);
          setRefreshing(false);
          return;
      }

      const { data, error } = await supabase
        .from('verified_cards')
        .select('*')
        .in('id', localIds);

      if (error) throw error;
      
      // Sort data based on localIds order
      const sortedData = (data || []).sort((a, b) => {
          const indexA = localIds.indexOf(a.id);
          const indexB = localIds.indexOf(b.id);
          return indexA - indexB;
      });

      setVloos(sortedData);
    } catch (error) {
      console.error('Error fetching vloos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVloos();
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchVloos();
  };

  const handleDeleteCard = async (vloo: any) => {
    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this card locally? You can restore it later by scanning it again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
             try {
                 const currentIds = await getLocalCardIds();
                 const newIds = currentIds.filter((id: string) => id !== vloo.id);
                 await AsyncStorage.setItem('my_card_ids', JSON.stringify(newIds));
                 
                 // Update UI
                 setVloos(prev => prev.filter(v => v.id !== vloo.id));
             } catch (e) {
                 Alert.alert('Error', 'Failed to remove card locally');
             }
          }
        }
      ]
    );
  };

  const renderSkeleton = () => {
    return (
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <View style={[styles.skeletonCardStack, { backgroundColor: 'transparent', height: 'auto', marginBottom: 24 }]}>
           <Skeleton width="100%" height={220} style={{ borderRadius: 24 }} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Skeleton width={120} height={24} />
          <Skeleton width={40} height={24} />
        </View>

        <View>
          {[1, 2, 3].map((key) => (
            <View key={key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, padding: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f0f0f0' }}>
              <Skeleton width={40} height={40} style={{ borderRadius: 20 }} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width={80} height={16} style={{ marginBottom: 6 }} />
                <Skeleton width={120} height={12} />
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                 <Skeleton width={60} height={16} style={{ marginBottom: 6 }} />
                 <Skeleton width={40} height={12} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {activeTab === 'home' ? (
        <>
          <DashboardHeader 
            balance={formatCurrency(totalBalance)} 
            secondaryBalance={formatSecondaryCurrency(totalBalanceSecondary)}
          />
          
          {loading ? (
            renderSkeleton()
          ) : (
            <ScrollView 
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" enabled={!isEditing} />}
              scrollEnabled={!isEditing}
            >
              <CardStack 
                 vloos={vloos.map(v => ({...v, balance: vlooBalances[v.id] || 0}))}
                 isEditing={isEditing}
                 onAddPress={() => setScanModalVisible(true)}
                 onBuyPress={() => navigation.navigate('BuyCard')}
                 onEditPress={() => setIsEditing(!isEditing)}
                 onCardPress={handleCardPress}
                 onReorder={async (fromIndex, toIndex) => {
                    const updatedVloos = [...vloos];
                    const [movedItem] = updatedVloos.splice(fromIndex, 1);
                    updatedVloos.splice(toIndex, 0, movedItem);
                    setVloos(updatedVloos);

                    // Save new order to AsyncStorage
                    const newOrderIds = updatedVloos.map(v => v.id);
                    await AsyncStorage.setItem('my_card_ids', JSON.stringify(newOrderIds));
                 }}
                 onDeletePress={handleDeleteCard}
                 currency={currency}
              />
            </ScrollView>
          )}
        </>
      ) : activeTab === 'more' ? (
        moreScreenView === 'settings' ? (
          <SettingsScreen 
            onBack={() => setMoreScreenView('menu')}
            faceIdEnabled={faceIdEnabled}
            faceIdSupported={faceIdSupported}
            onToggleFaceId={handleToggleFaceId}
            currency={currency}
            setCurrency={handleSetCurrency}
            language={language}
            setLanguage={handleSetLanguage}
          />
        ) : (
          <MoreScreen onNavigate={(screen) => {
            if (screen === 'buy_card') {
                navigation.navigate('BuyCard');
            } else if (screen === 'about') {
                navigation.navigate('About');
            } else {
                setMoreScreenView(screen as any);
            }
          }} />
        )
      ) : (
        <View style={{ flex: 1 }} />
      )}

      <BottomNavigation 
        activeTab={activeTab} 
        onTabPress={setActiveTab} 
        onScanPress={() => setScanModalVisible(true)}
      />



      <CreateVlooModal 
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onBack={() => {
           setCreateModalVisible(false);
           setTimeout(() => setScanModalVisible(true), 500);
        }}
        onNext={() => {
           // Final Step: Create Vloo
           handleCreateVloo(pendingCardId, passphrase);
        }}
        passphrase={passphrase}
        setPassphrase={setPassphrase}
        isLoading={bindLoading}
      />

      <ScanVlooModal 
        visible={scanModalVisible}
        onClose={() => setScanModalVisible(false)}
        onBack={() => {
           setScanModalVisible(false);
        }}
        onBind={async (cardId) => {
           setScanLoading(true);
           try {
               // Check if card exists in DB (Read Only)
               const { data: existingCard, error: fetchError } = await supabase
                   .from('verified_cards')
                   .select('id')
                   .ilike('id', cardId.trim())
                   .maybeSingle();

               if (fetchError) {
                   console.error('Error verifying card:', fetchError);
                   Alert.alert('Error', 'Failed to verify card status. Please check your internet connection.');
                   return;
               }

               if (!existingCard) {
                   Alert.alert('Error', 'This card is not registered in Vloo system.');
                   return;
               }

               // Valid Card
               setPendingCardId(cardId);
               setScanModalVisible(false);
               // Step 2: Input Passphrase
               setTimeout(() => setCreateModalVisible(true), 500);

           } catch (e) {
               console.error('Error in onBind:', e);
               Alert.alert('Error', 'An unexpected error occurred.');
           } finally {
               setScanLoading(false);
           }
        }}
        isBinding={scanLoading}
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skeletonCardStack: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 24,
  },
});
