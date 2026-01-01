import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, BackHandler, SafeAreaView, Alert, StatusBar, RefreshControl, Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBalance } from '../../lib/blockcypher';
import { supabase } from '../../lib/supabase';
import { createRandomWallet, generateMockBitcoinData, generateMockSolanaData, getWalletFromPrivateKey } from '../../lib/wallet';
import { encryptData, generateDeterministicPrivateKey } from '../../lib/crypto';

// Components
import { DashboardHeader } from './components/DashboardHeader';
import { CardStack } from './components/CardStack';
import { BottomNavigation } from './components/BottomNavigation';
import { CreateVlooModal } from './components/modals/dashboard/CreateVlooModal';
import { ScanVlooModal } from './components/modals/dashboard/ScanVlooModal';
import { AddVlooOptionsModal } from './components/modals/dashboard/AddVlooOptionsModal';
import { MoreScreen } from './MoreScreen';
import { SettingsScreen } from './SettingsScreen';
import { COLORS, FONTS } from '../../lib/theme';
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
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Modals
  const [addOptionsModalVisible, setAddOptionsModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [moreScreenView, setMoreScreenView] = useState<'menu' | 'settings'>('menu');

  // Selected Items
  const [selectedVloo, setSelectedVloo] = useState<any>(null);

  // Create Vloo State
  const [message, setMessage] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [unlockDate, setUnlockDate] = useState<Date | null>(new Date(Date.now() + 60000));
  const [bindLoading, setBindLoading] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState('home');

  // Other State
  const [isTestnet, setIsTestnet] = useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [faceIdSupported, setFaceIdSupported] = useState(false);
  const [faceIdLoading, setFaceIdLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('face_id_enabled');
        setFaceIdEnabled(saved === 'true');
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

  // --- Handlers ---

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

  const handleCreateVloo = async (cardId: string) => {
    setBindLoading(true);

    try {
        // Generate Private Key and Derive Public Keys
        const privateKey = generateDeterministicPrivateKey(cardId, passphrase);
        const wallet = getWalletFromPrivateKey(privateKey);
        const evmAddress = wallet.address;

        // Create Wallet List (EVM compatible chains share address)
        const wallets = [
          { type: 'Ethereum', address: evmAddress },
          { type: 'Polygon', address: evmAddress },
          { type: 'BNB Chain', address: evmAddress },
          { type: 'Lisk', address: evmAddress },
          // Note: Bitcoin and Solana require specific libraries not currently available in this env
          // { type: 'Bitcoin', address: 'Coming Soon' }, 
          // { type: 'Solana', address: 'Coming Soon' }
        ];

        // Create/Bind Card directly in verified_cards
        const { error: cardError } = await supabase
            .from('verified_cards')
            .upsert([
                { 
                  id: cardId, 
                  message: message,
                  unlock_date: unlockDate ? unlockDate.toISOString() : null,
                  color: 'blue' 
                }
            ]);

        if (cardError) throw cardError;
       
        // Save locally for guest/user persistence
        await saveCardIdLocally(cardId);
        
        // Save Derived Wallets Locally
        await AsyncStorage.setItem(`vloo_wallets_${cardId}`, JSON.stringify(wallets));

        setScanModalVisible(false);
        // Reset
        setMessage('');
        setPassphrase('');
        setUnlockDate(new Date(Date.now() + 60000));
        
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
        .in('id', localIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map data to match expected structure if needed, or just use as is
      // Previously: id, message, unlock_date, status, verified_cards(id, color)
      // Now: id (is card id), message, unlock_date, status, color
      // We might need to adapt the UI to use 'id' as card ID
      setVloos(data || []);
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



  const renderSkeleton = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.skeletonCardStack}>
          <View style={styles.skeletonCard} />
        </View>

        <View style={styles.skeletonWalletHeader}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonToggle} />
        </View>

        <View>
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.skeletonWalletItem}>
              <View style={styles.skeletonWalletIcon} />
              <View style={{ flex: 1 }}>
                <View style={styles.skeletonWalletText1} />
                <View style={styles.skeletonWalletText2} />
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
          <DashboardHeader balance="$0.00" />
          
          {loading ? (
            renderSkeleton()
          ) : (
            <ScrollView 
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />}
            >
              <CardStack 
                 vloos={vloos}
                 onAddPress={() => setAddOptionsModalVisible(true)}
                 onCardPress={handleCardPress}
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
          />
        ) : (
          <MoreScreen onNavigate={(screen) => setMoreScreenView(screen as any)} />
        )
      ) : (
        <View style={{ flex: 1 }} />
      )}

      <BottomNavigation 
        activeTab={activeTab} 
        onTabPress={setActiveTab} 
        onScanPress={() => setAddOptionsModalVisible(true)}
      />

      <AddVlooOptionsModal 
        visible={addOptionsModalVisible}
        onClose={() => setAddOptionsModalVisible(false)}
        onNewCard={() => {
           setAddOptionsModalVisible(false);
           setTimeout(() => setCreateModalVisible(true), 500);
        }}
        onImportCard={() => {
           setAddOptionsModalVisible(false);
           Alert.alert('Coming Soon', 'Import Card feature will be available soon.');
        }}
      />

      <CreateVlooModal 
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onNext={() => {
           setCreateModalVisible(false);
           setTimeout(() => setScanModalVisible(true), 500);
        }}
        message={message}
        setMessage={setMessage}
        passphrase={passphrase}
        setPassphrase={setPassphrase}
        newVlooUnlockDate={unlockDate}
        setNewVlooUnlockDate={setUnlockDate}
      />

      <ScanVlooModal 
        visible={scanModalVisible}
        onClose={() => setScanModalVisible(false)}
        onBack={() => {
           setScanModalVisible(false);
           setTimeout(() => setCreateModalVisible(true), 500);
        }}
        onBind={handleCreateVloo}
        isBinding={bindLoading}
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
  skeletonCard: {
    width: '100%',
    height: 400,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    marginHorizontal: 24,
  },
  skeletonWalletHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  skeletonTitle: {
    width: 120,
    height: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  skeletonToggle: {
    width: 140,
    height: 32,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  skeletonWalletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 24,
  },
  skeletonWalletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 16,
  },
  skeletonWalletText1: {
    width: '40%',
    height: 16,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonWalletText2: {
    width: '20%',
    height: 12,
    backgroundColor: '#eee',
    borderRadius: 4,
  },
});
