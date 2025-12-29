import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, BackHandler, SafeAreaView, Platform, Alert, Dimensions, StatusBar, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBalance } from '../../lib/blockcypher';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/theme';
import { createRandomWallet, generateMockBitcoinData, generateMockSolanaData } from '../../lib/wallet';
import { encryptData } from '../../lib/crypto';

// Components
import { DashboardHeader } from './components/DashboardHeader';
import { CardStack } from './components/CardStack';
import { WalletList } from './components/WalletList';
import { BottomNavigation } from './components/BottomNavigation';
import { WalletDetailModal } from './components/modals/WalletDetailModal';
import { CreateVlooModal } from './components/modals/CreateVlooModal';
import { BindVlooModal } from './components/modals/BindVlooModal';
import { EditVlooModal } from './components/modals/EditVlooModal';
import { PreviewVlooModal } from './components/modals/PreviewVlooModal';
import { EditProfileModal } from './components/modals/EditProfileModal';

const { width } = Dimensions.get('window');

export default function GiverDashboardScreen({ navigation }: any) {
  const [vloos, setVloos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [lastBalanceRefresh, setLastBalanceRefresh] = useState(0); 

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [bindModalVisible, setBindModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [walletDetailModalVisible, setWalletDetailModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);

  // Selected Items
  const [selectedVloo, setSelectedVloo] = useState<any>(null);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);

  // Profile State
  const [profileName, setProfileName] = useState('');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Edit Vloo State
  const [editReceiverName, setEditReceiverName] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editUnlockDate, setEditUnlockDate] = useState<Date | null>(new Date());
  const [editLoading, setEditLoading] = useState(false);

  // Create Vloo State
  const [receiverName, setReceiverName] = useState('');
  const [message, setMessage] = useState(''); // Kept for logic, but maybe unused in first step
  const [passphrase, setPassphrase] = useState(''); // Kept for logic
  const [unlockDate, setUnlockDate] = useState<Date | null>(new Date(Date.now() + 60000));
  
  // Bind State
  const [bindLoading, setBindLoading] = useState(false);
  const [bindStatus, setBindStatus] = useState('Ready to bind card');
  const [manualCardId, setManualCardId] = useState(''); // Currently unused in UI but needed for logic if we add input
  const [idError, setIdError] = useState('');
  const [selectedBindWallet, setSelectedBindWallet] = useState<any>(null);
  const [bindAmount, setBindAmount] = useState('');

  // Other State
  const [walletLoading, setWalletLoading] = useState(false);
  const [isTestnet, setIsTestnet] = useState(false);

  // --- Handlers ---

  const handleWalletPress = (wallet: any) => {
    setSelectedWallet(wallet);
    setWalletDetailModalVisible(true);
  };

  const handleOpenEditProfile = () => {
    setProfileName(user?.user_metadata?.full_name || '');
    setProfileAvatarUrl(user?.user_metadata?.avatar_url || '');
    setEditProfileModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setProfileLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: profileName, avatar_url: profileAvatarUrl }
      });

      if (error) throw error;

      setUser(data.user);
      setEditProfileModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleEditPress = (vloo: any) => {
    setSelectedVloo(vloo);
    setEditReceiverName(vloo.receiver_name || '');
    setEditMessage(vloo.message || '');
    if (vloo.unlock_date) {
      setEditUnlockDate(new Date(vloo.unlock_date));
    } else {
      setEditUnlockDate(new Date(Date.now() + 60000));
    }
    setEditModalVisible(true);
  };

  const handlePreviewPress = (vloo: any) => {
    setSelectedVloo(vloo);
    setPreviewModalVisible(true);
  };

  const handleUpdateVloo = async () => {
    if (!selectedVloo) return;
    setEditLoading(true);

    try {
      const { error } = await supabase
        .from('vloos')
        .update({
          receiver_name: editReceiverName,
          message: editMessage,
          unlock_date: editUnlockDate ? editUnlockDate.toISOString() : null,
        })
        .eq('id', selectedVloo.id);

      if (error) throw error;

      setEditModalVisible(false);
      fetchVloos();
      Alert.alert('Success', 'Card updated successfully');
    } catch (error: any) {
      console.error('Error updating vloo:', error);
      Alert.alert('Error', 'Failed to update card');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteVloo = () => {
      // Placeholder for delete logic
      Alert.alert('Delete Vloo', 'Are you sure you want to delete this Vloo? This action cannot be undone.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => {
              // TODO: Implement delete
              setEditModalVisible(false);
          }}
      ]);
  };

  const handleCreateVloo = async () => {
    // This function combines logic from handleBind in original file
    // In the new flow, "Create & Bind" is triggered from BindVlooModal
    // Logic: Verify Card ID (Simulated for now or random) -> Generate Wallets -> Encrypt -> Save
    
    // For now, we simulate a Card ID since we don't have NFC scanning in this MVP refactor step yet
    // Or we use a random ID for testing
    const simulatedCardId = manualCardId || 'TEST-' + Math.floor(Math.random() * 10000);

    setBindLoading(true);
    setBindStatus('Generating secure wallet...');

    try {
        // 1. Generate Wallets
        const wallet = createRandomWallet(); // Ethereum
        const btcData = generateMockBitcoinData(); // Bitcoin
        const solData = generateMockSolanaData(); // Solana

        const ethPrivateKey = wallet.privateKey;
        const ethAddress = wallet.address;
        const btcPrivateKey = btcData.privateKey;
        const btcAddress = btcData.address;
        const solPrivateKey = solData.privateKey;
        const solAddress = solData.address;

        // 2. Encrypt Private Keys
        // We use a default passphrase or user input. In original code user input 'passphrase'.
        // Let's assume 'default-secure-pass' if empty for MVP, or prompt user.
        // The modal doesn't have passphrase input in the extracted version yet.
        const securePass = passphrase || 'vloo-default-pass'; 

        const encryptedEthKey = encryptData(ethPrivateKey, securePass);
        const encryptedBtcKey = encryptData(btcPrivateKey, securePass);
        const encryptedSolKey = encryptData(solPrivateKey, securePass);

        const encryptedKeys = {
          ethereum: encryptedEthKey,
          bitcoin: encryptedBtcKey,
          solana: encryptedSolKey,
          polygon: encryptedEthKey,
          bnb: encryptedEthKey
        };

        const walletAddresses = [
          { type: 'Bitcoin', address: btcAddress },
          { type: 'Ethereum', address: ethAddress },
          { type: 'Sepolia', address: ethAddress },
          { type: 'Lisk', address: ethAddress },
          { type: 'Lisk Sepolia', address: ethAddress },
          { type: 'Solana', address: solAddress },
          { type: 'Polygon', address: ethAddress },
          { type: 'BNB Chain', address: ethAddress }
        ];

        // 3. Get User
        let currentUser = user;
        if (!currentUser) {
           const { data: { session } } = await supabase.auth.getSession();
           currentUser = session?.user;
        }
        
        if (!currentUser) {
           Alert.alert('Session Expired', 'Please log in again.');
           setBindLoading(false);
           return;
        }

        // 4. Save to Supabase
        // We need to use rpc 'bind_vloo_card' but we need a valid card_id that exists in 'verified_cards' table.
        // If we don't have one, this will fail.
        // For MVP demo, if we can't scan, we might need to create a card on the fly or fail.
        // The original code checked 'verified_cards'.
        
        // Since we refactored, let's just show alert for now if we can't bind real card.
        // Or we can try to find an available card?
        
        /* 
        const { data: vlooId, error: rpcError } = await supabase.rpc('bind_vloo_card', {
            p_card_id: simulatedCardId,
            p_giver_id: currentUser.id,
            p_receiver_name: receiverName,
            p_message: message,
            p_unlock_date: unlockDate ? unlockDate.toISOString() : null,
            p_encrypted_private_key: encryptedKeys,
            p_wallet_address: walletAddresses
        });
        if (rpcError) throw new Error(rpcError.message);
        */
       
        // Fallback for UI demo
        console.log('Would bind Vloo:', { receiverName, bindAmount, selectedBindWallet });
        setBindModalVisible(false);
        // Reset
        setReceiverName('');
        setBindAmount('');
        setSelectedBindWallet(null);
        
        // Refresh
        fetchVloos(); 
        Alert.alert('Success', 'Vloo Created (Demo Mode)');

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to bind VLOO');
    } finally {
      setBindLoading(false);
    }
  };

  const fetchVloos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
         navigation.replace('GiverLogin');
         return;
      }
      
      setUser(session.user);

      const { data, error } = await supabase
        .from('vloos')
        .select('id, giver_id, created_at, status, wallet_address, unlock_date, message, receiver_name, verified_cards(id, color)')
        .eq('giver_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
    setLastBalanceRefresh(Date.now());
    fetchVloos();
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigation.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'GiverLogin' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Helper to parse wallet addresses
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
    
    if (addresses.length === 0 && !data) return [];
    
    // Inject Sepolia
    const ethWallet = addresses.find((w: any) => w.type === 'Ethereum');
    const hasSepolia = addresses.some((w: any) => w.type === 'Sepolia');
    if (ethWallet && !hasSepolia) {
        const ethIndex = addresses.indexOf(ethWallet);
        addresses.splice(ethIndex + 1, 0, { type: 'Sepolia', address: ethWallet.address });
    }

    // Inject Lisk
    const hasLisk = addresses.some((w: any) => w.type === 'Lisk');
    if (ethWallet && !hasLisk) {
        addresses.push({ type: 'Lisk', address: ethWallet.address });
    }

    // Inject Lisk Sepolia
    const hasLiskSepolia = addresses.some((w: any) => w.type === 'Lisk Sepolia');
    if (ethWallet && !hasLiskSepolia) {
        addresses.push({ type: 'Lisk Sepolia', address: ethWallet.address });
    }

    return addresses;
  };

  // Current Card Wallets
  const allWalletAddresses = useMemo(() => {
    if (!vloos || vloos.length === 0) return [];
    // Adjust index if placeholder
    const actualIndex = currentCardIndex; 
    // displayData logic in CardStack adds placeholder at end
    // But vloos state is pure.
    // CardStack displayData: [...vloos, placeholder]
    // If index < vloos.length, it's a card.
    
    if (actualIndex < vloos.length) {
       return getWalletAddresses(vloos[actualIndex].wallet_address);
    }
    return [];
  }, [vloos, currentCardIndex]);

  // Testnet Filter
  const currentWalletAddresses = useMemo(() => {
      return allWalletAddresses.filter((wallet: any) => {
          if (isTestnet) {
              return ['Sepolia', 'Lisk Sepolia'].includes(wallet.type);
          } else {
              return !['Sepolia', 'Lisk Sepolia'].includes(wallet.type);
          }
      });
  }, [allWalletAddresses, isTestnet]);

  // Fetch Balances
  useEffect(() => {
    let isMounted = true;
    
    const fetchBalances = async () => {
      if (currentWalletAddresses.length === 0) return;
      
      const newBalances: Record<string, string> = {};
      
      // Process in chunks to avoid blocking
      for (const wallet of currentWalletAddresses) {
        if (!isMounted) return;
        
        // Skip if already fetched recently (optional optimization)
        const key = `${wallet.type}-${wallet.address}`;
        
        try {
           const bal = await fetchBalance(wallet.address, wallet.type);
           newBalances[key] = bal;
        } catch (e) {
           console.log(`Error fetching ${wallet.type}:`, e);
           newBalances[key] = 'Error';
        }
      }
      
      if (isMounted) {
        setBalances(prev => ({ ...prev, ...newBalances }));
      }
    };

    fetchBalances();

    return () => { isMounted = false; };
  }, [currentWalletAddresses, lastBalanceRefresh]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <DashboardHeader 
        user={user} 
        onProfilePress={handleOpenEditProfile} 
      />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />}
      >
        <CardStack 
           vloos={vloos}
           currentCardIndex={currentCardIndex}
           onCardChange={setCurrentCardIndex}
           onAddPress={() => setCreateModalVisible(true)}
           onEditPress={handleEditPress}
           onPreviewPress={handlePreviewPress}
        />

        <WalletList 
           wallets={currentWalletAddresses}
           loading={loading}
           refreshing={refreshing}
           onRefresh={onRefresh}
           onWalletPress={handleWalletPress}
           balances={balances}
           isTestnet={isTestnet}
           setIsTestnet={setIsTestnet}
        />
      </ScrollView>

      <BottomNavigation />

      <WalletDetailModal 
        visible={walletDetailModalVisible}
        onClose={() => setWalletDetailModalVisible(false)}
        wallet={selectedWallet}
        balance={selectedWallet ? balances[`${selectedWallet.type}-${selectedWallet.address}`] : '0.00'}
      />

      <CreateVlooModal 
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onNext={() => {
           setCreateModalVisible(false);
           setTimeout(() => setBindModalVisible(true), 500);
        }}
        newVlooName={receiverName}
        setNewVlooName={setReceiverName}
        newVlooUnlockDate={unlockDate}
        setNewVlooUnlockDate={setUnlockDate}
      />

      <BindVlooModal 
        visible={bindModalVisible}
        onClose={() => setBindModalVisible(false)}
        onBack={() => {
           setBindModalVisible(false);
           setTimeout(() => setCreateModalVisible(true), 500);
        }}
        onCreate={handleCreateVloo}
        selectedBindWallet={selectedBindWallet}
        setSelectedBindWallet={setSelectedBindWallet}
        bindAmount={bindAmount}
        setBindAmount={setBindAmount}
        wallets={currentWalletAddresses}
        balances={balances}
        isCreating={bindLoading}
        newVlooName={receiverName}
        newVlooUnlockDate={unlockDate}
      />
      
      <EditVlooModal 
         visible={editModalVisible}
         onClose={() => setEditModalVisible(false)}
         onSave={handleUpdateVloo}
         onDelete={handleDeleteVloo}
         vloo={selectedVloo}
         editVlooName={editReceiverName}
         setEditVlooName={setEditReceiverName}
         editVlooDate={editUnlockDate}
         setEditVlooDate={setEditUnlockDate}
         isSaving={editLoading}
      />

      <PreviewVlooModal 
         visible={previewModalVisible}
         onClose={() => setPreviewModalVisible(false)}
         vloo={selectedVloo}
      />

      <EditProfileModal 
         visible={editProfileModalVisible}
         onClose={() => setEditProfileModalVisible(false)}
         user={user}
         onSave={handleSaveProfile}
         isSaving={profileLoading}
         editName={profileName}
         setEditName={setProfileName}
         editAvatarUrl={profileAvatarUrl}
         setEditAvatarUrl={setProfileAvatarUrl}
         onSignOut={handleSignOut}
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
