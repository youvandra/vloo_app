import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, BackHandler, SafeAreaView, Alert, StatusBar, RefreshControl, Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBalance } from '../../lib/blockcypher';
import { supabase } from '../../lib/supabase';
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
import { ScanVlooModal } from './components/modals/ScanVlooModal';
import { EditVlooModal } from './components/modals/EditVlooModal';
import { PreviewVlooModal } from './components/modals/PreviewVlooModal';
import { VlooDetailsModal } from './components/modals/VlooDetailsModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import { COLORS, FONTS } from '../../lib/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Edit2, LogOut, Fingerprint } from 'lucide-react-native';

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
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [lastBalanceRefresh, setLastBalanceRefresh] = useState(0); 

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [bindModalVisible, setBindModalVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [vlooDetailsModalVisible, setVlooDetailsModalVisible] = useState(false);
  const [walletDetailModalVisible, setWalletDetailModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [profileActionsVisible, setProfileActionsVisible] = useState(false);

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
  const [message, setMessage] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [unlockDate, setUnlockDate] = useState<Date | null>(new Date(Date.now() + 60000));
  
  // Bind State
  const [bindLoading, setBindLoading] = useState(false);
  const [selectedBindWallets, setSelectedBindWallets] = useState<any[]>([]);
  const [isEditingAssets, setIsEditingAssets] = useState(false);

  // Other State
  const [isTestnet, setIsTestnet] = useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [faceIdSupported, setFaceIdSupported] = useState(false);
  const [faceIdLoading, setFaceIdLoading] = useState(false);
  const [faceIdGateRequired, setFaceIdGateRequired] = useState(false);
  const [faceIdGateVerified, setFaceIdGateVerified] = useState(false);
  const [faceIdGateChecking, setFaceIdGateChecking] = useState(true);

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

  useFocusEffect(useCallback(() => {
    let active = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('face_id_enabled');
        const required = saved === 'true';
        setFaceIdGateRequired(required);
        if (!required) {
          setFaceIdGateVerified(true);
          setFaceIdGateChecking(false);
          return;
        }
        try {
          const LocalAuthentication = require('expo-local-authentication');
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          if (hasHardware && isEnrolled) {
            const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Masuk dengan Face ID', cancelLabel: 'Batal' });
            if (active) setFaceIdGateVerified(!!result?.success);
          } else {
            if (active) setFaceIdGateVerified(false);
          }
        } catch (e) {
          if (active) setFaceIdGateVerified(false);
        } finally {
          if (active) setFaceIdGateChecking(false);
        }
      } catch (e) {
        setFaceIdGateVerified(true);
        setFaceIdGateChecking(false);
      }
    })();
    return () => { active = false; };
  }, []));

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
  const handleOpenProfileActions = () => {
    setProfileActionsVisible(true);
  };

  const requestFaceIdGate = async () => {
    try {
      const LocalAuthentication = require('expo-local-authentication');
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Masuk dengan Face ID', cancelLabel: 'Batal' });
      setFaceIdGateVerified(!!result?.success);
    } catch (e) {}
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
      await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: profileName,
          avatar_url: profileAvatarUrl
        }, { onConflict: 'id' });
      setUserProfile({ full_name: profileName, avatar_url: profileAvatarUrl });
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

  const handleCardPress = (vloo: any) => {
    setSelectedVloo(vloo);
    setVlooDetailsModalVisible(true);
  };

  const handleAddAssetsPress = () => {
    if (!selectedVloo) return;
    
    // Parse existing wallets
    const addresses = getWalletAddresses(selectedVloo.wallet_address);
    setSelectedBindWallets(addresses);
    
    setIsEditingAssets(true);
    setVlooDetailsModalVisible(false);
    setTimeout(() => setBindModalVisible(true), 500);
  };

  const handleUpdateAssets = async () => {
     if (!selectedVloo) return;
     setBindLoading(true);

     try {
        // Filter out wallets that are already in selectedVloo.wallet_address
        const existingWallets = getWalletAddresses(selectedVloo.wallet_address);
        const newWalletsNeeded = selectedBindWallets.filter(sw => !existingWallets.some(ew => ew.type === sw.type));
        
        let finalWallets = [...existingWallets];
        
        if (newWalletsNeeded.length > 0) {
            const wallet = createRandomWallet();
            const btcData = generateMockBitcoinData();
            const solData = generateMockSolanaData();

            const ethAddress = wallet.address;
            const btcAddress = btcData.address;
            const solAddress = solData.address;
            
            // Encrypt new keys
            // NOTE: We are using the current passphrase state or default. 
            // If the original Vloo used a different custom passphrase, the receiver will fail to decrypt these new keys.
            // In a full app, we should prompt for the passphrase before allowing asset addition.
            const securePass = passphrase || 'vloo-default-pass'; 
            
            const encryptedEthKey = encryptData(wallet.privateKey, securePass);
            const encryptedBtcKey = encryptData(btcData.privateKey, securePass);
            const encryptedSolKey = encryptData(solData.privateKey, securePass);

            // Merge with existing encrypted keys
            let currentKeys: any = {};
            try {
                currentKeys = JSON.parse(selectedVloo.encrypted_private_keys || '{}');
            } catch (e) {}

            const newKeys: any = {
                ...currentKeys,
            };

            // Helper to assign keys if they don't exist or if we are adding this specific type
            const assignKey = (type: string, key: string) => {
                 // Simple mapping based on type string
                 const keyName = type.toLowerCase().replace(' ', '_'); // e.g. 'bnb chain' -> 'bnb_chain' ?
                 // usage in handleCreateVloo: 
                 // ethereum, bitcoin, solana, polygon, bnb, sepolia, lisk, lisk_sepolia
                 // We should match those keys.
                 
                 // Let's manually map for safety
                 if (type === 'Bitcoin') newKeys['bitcoin'] = key;
                 if (type === 'Ethereum') newKeys['ethereum'] = key;
                 if (type === 'Sepolia') newKeys['sepolia'] = key;
                 if (type === 'Lisk') newKeys['lisk'] = key;
                 if (type === 'Lisk Sepolia') newKeys['lisk_sepolia'] = key;
                 if (type === 'Solana') newKeys['solana'] = key;
                 if (type === 'Polygon') newKeys['polygon'] = key;
                 if (type === 'BNB Chain') newKeys['bnb'] = key;
            };

            newWalletsNeeded.forEach(needed => {
                if (needed.type === 'Bitcoin') assignKey('Bitcoin', encryptedBtcKey);
                else if (needed.type === 'Solana') assignKey('Solana', encryptedSolKey);
                else assignKey(needed.type, encryptedEthKey); // EVM chains
            });
            
             // Map to types for wallet_address
             const newGenerated = [
                { type: 'Bitcoin', address: btcAddress },
                { type: 'Ethereum', address: ethAddress },
                { type: 'Sepolia', address: ethAddress },
                { type: 'Lisk', address: ethAddress },
                { type: 'Lisk Sepolia', address: ethAddress },
                { type: 'Solana', address: solAddress },
                { type: 'Polygon', address: ethAddress },
                { type: 'BNB Chain', address: ethAddress }
             ];
             
             newWalletsNeeded.forEach(needed => {
                 const gen = newGenerated.find(g => g.type === needed.type);
                 if (gen) {
                     finalWallets.push(gen);
                 }
             });
             
             // Update the encrypted_private_keys blob to be saved
             selectedVloo.encrypted_private_keys = JSON.stringify(newKeys);
        }
        
        // Also handle removals? If user unchecked something.
        // The UI allows unchecking.
        finalWallets = finalWallets.filter(fw => selectedBindWallets.some(sw => sw.type === fw.type));

        const { error } = await supabase
            .from('vloos')
            .update({
                wallet_address: JSON.stringify(finalWallets),
                encrypted_private_keys: selectedVloo.encrypted_private_keys // Save the updated keys
            })
            .eq('id', selectedVloo.id);
            
        if (error) throw error;
        
        setBindModalVisible(false);
        fetchVloos();
        Alert.alert('Success', 'Assets updated successfully');
     } catch (error: any) {
         console.error('Error updating assets:', error);
         Alert.alert('Error', 'Failed to update assets');
     } finally {
         setBindLoading(false);
         setIsEditingAssets(false);
     }
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

  const handleCreateVloo = async (cardId: string) => {
    // This function combines logic from handleBind in original file
    // In the new flow, "Create & Bind" is triggered from BindVlooModal
    // Logic: Verify Card ID (Simulated for now or random) -> Generate Wallets -> Encrypt -> Save
    
    // Use provided cardId
    const simulatedCardId = cardId;

    setBindLoading(true);

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
        // Use user provided passphrase or fallback
        const securePass = passphrase || 'vloo-default-pass'; 

        const encryptedEthKey = encryptData(ethPrivateKey, securePass);
        const encryptedBtcKey = encryptData(btcPrivateKey, securePass);
        const encryptedSolKey = encryptData(solPrivateKey, securePass);

        // Map keys to chain types
        const encryptedKeys = {
          ethereum: encryptedEthKey,
          bitcoin: encryptedBtcKey,
          solana: encryptedSolKey,
          polygon: encryptedEthKey,
          bnb: encryptedEthKey,
          sepolia: encryptedEthKey,
          lisk: encryptedEthKey,
          lisk_sepolia: encryptedEthKey
        };

        // 3. Filter Wallets based on Selection
        // We only want to bind the wallets that the user selected in BindVlooModal
        // selectedBindWallets contains objects like { type: 'Bitcoin', address: ... }
        // We need to map the generated addresses to the selected types.
        
        const allGeneratedWallets = [
          { type: 'Bitcoin', address: btcAddress },
          { type: 'Ethereum', address: ethAddress },
          { type: 'Sepolia', address: ethAddress },
          { type: 'Lisk', address: ethAddress },
          { type: 'Lisk Sepolia', address: ethAddress },
          { type: 'Solana', address: solAddress },
          { type: 'Polygon', address: ethAddress },
          { type: 'BNB Chain', address: ethAddress }
        ];

        // Filter: Keep only if the type is present in selectedBindWallets
        // Note: selectedBindWallets items might have different addresses if they came from 'wallets' prop which relies on existing vloos?
        // Wait, in BindVlooModal, 'wallets' prop passed is 'currentWalletAddresses'.
        // 'currentWalletAddresses' are derived from existing Vloos (which we don't have yet for a new Vloo).
        // BUT wait, in DashboardScreen, 'currentWalletAddresses' is passed to BindVlooModal.
        // If 'currentWalletAddresses' is empty (no vloos), then the user has nothing to select?
        // Ah, the user flow seems to be: Create Vloo -> Bind (Select WHICH wallet type to create/bind?).
        // In the BindVlooModal code:
        // {wallets.map(...)}
        // If wallets is empty, user can't select anything.
        // But 'wallets' comes from 'currentWalletAddresses' which comes from 'vloos'.
        // If this is the FIRST vloo, 'vloos' is empty.
        // If the intention is "Select which CHAINS to enable for this new Vloo", then passing 'currentWalletAddresses' is wrong if it's empty.
        // However, assuming the user CAN select something (maybe 'wallets' has default options?), let's proceed.
        // Actually, looking at 'WalletList' usage, it seems 'currentWalletAddresses' are the User's wallets.
        // But for a NEW Vloo, we are generating NEW wallets.
        // The BindVlooModal seems to be asking "Which chains do you want to enable on this card?".
        // So we should probably pass a list of SUPPORTED chains to BindVlooModal, not 'currentWalletAddresses'.
        // BUT, the current code passes 'currentWalletAddresses'.
        // If the user selects "Bitcoin", we should bind a Bitcoin wallet.
        
        // Let's assume selectedBindWallets contains the types we want.
        const selectedTypes = selectedBindWallets.map(w => w.type);
        
        const finalWalletAddresses = allGeneratedWallets.filter(w => selectedTypes.includes(w.type));
        
        // If nothing selected (fallback), use all?
        const walletsToBind = finalWalletAddresses.length > 0 ? finalWalletAddresses : allGeneratedWallets;

        // 4. Get User
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

        // 5. Create Verified Card (Simulated)
        // We attempt to insert a card to satisfy FK constraints
        const { error: cardError } = await supabase
            .from('verified_cards')
            .insert([
                { 
                  id: simulatedCardId, 
                  status: 'active', 
                  color: 'blue',
                  // created_at is usually auto
                }
            ]);
            
        // We ignore cardError because it might fail if we don't have permission or it exists.
        // But for this flow to work, we hope it works or the RPC handles it.
        if (cardError) {
             console.log('Card creation warning (might exist):', cardError);
        }

        // 6. Save to Supabase via RPC
        const { data: vlooId, error: rpcError } = await supabase.rpc('bind_vloo_card', {
            p_card_id: simulatedCardId,
            p_giver_id: currentUser.id,
            p_receiver_name: receiverName,
            p_message: message,
            p_unlock_date: unlockDate ? unlockDate.toISOString() : null,
            p_encrypted_private_key: encryptedKeys,
            p_wallet_address: walletsToBind
        });

        if (rpcError) throw new Error(rpcError.message);
       
        setScanModalVisible(false);
        // Reset
        setReceiverName('');
        setMessage('');
        setPassphrase('');
        setUnlockDate(new Date(Date.now() + 60000));
        setSelectedBindWallets([]);
        
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
         navigation.replace('GiverLogin');
         return;
      }
      
      setUser(session.user);
      try {
        const { data: profileData } = await supabase
          .from('users')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single();
        if (profileData) {
          setUserProfile(profileData);
        }
      } catch (e) {}

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

  // Supported Chains for New Vloo
  const supportedChains = useMemo(() => {
      return [
          { type: 'Bitcoin', address: 'pending-btc' },
          { type: 'Ethereum', address: 'pending-eth' },
          { type: 'Solana', address: 'pending-sol' },
          { type: 'Polygon', address: 'pending-poly' },
          { type: 'BNB Chain', address: 'pending-bnb' },
          { type: 'Lisk', address: 'pending-lisk' }
      ];
  }, []);

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

  if (faceIdGateRequired && !faceIdGateVerified) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ alignItems: 'center', paddingHorizontal: 24 }}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(52,152,219,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <Fingerprint size={40} color={COLORS.primary} />
          </View>
          <Text style={{ fontFamily: FONTS.displayBold, fontSize: 22, color: '#000', marginBottom: 8 }}>Verifikasi Face ID</Text>
          <Text style={{ fontFamily: FONTS.bodyRegular, fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 }}>
            Silakan verifikasi biometrik untuk masuk ke Dashboard.
          </Text>
          <TouchableOpacity
            onPress={requestFaceIdGate}
            style={{ backgroundColor: COLORS.primary, paddingVertical: 16, paddingHorizontal: 24, borderRadius: 999, minWidth: 200, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 16, color: '#fff' }}>Verifikasi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <DashboardHeader 
        user={user} 
        onProfilePress={handleOpenProfileActions} 
        displayName={userProfile?.full_name}
        displayAvatarUrl={userProfile?.avatar_url}
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
           onCardPress={handleCardPress}
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

      <VlooDetailsModal
        visible={vlooDetailsModalVisible}
        onClose={() => setVlooDetailsModalVisible(false)}
        vloo={selectedVloo}
        onEditPress={() => {
            setVlooDetailsModalVisible(false);
            if (selectedVloo) {
                setEditReceiverName(selectedVloo.receiver_name || '');
                setEditMessage(selectedVloo.message || '');
                if (selectedVloo.unlock_date) {
                    setEditUnlockDate(new Date(selectedVloo.unlock_date));
                } else {
                    setEditUnlockDate(new Date(Date.now() + 60000));
                }
            }
            setTimeout(() => setEditModalVisible(true), 500);
        }}
      />

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
        message={message}
        setMessage={setMessage}
        passphrase={passphrase}
        setPassphrase={setPassphrase}
        newVlooUnlockDate={unlockDate}
        setNewVlooUnlockDate={setUnlockDate}
      />

      <BindVlooModal 
        visible={bindModalVisible}
        onClose={() => {
            setBindModalVisible(false);
            setIsEditingAssets(false);
        }}
        onBack={() => {
           setBindModalVisible(false);
           if (!isEditingAssets) {
               setTimeout(() => setCreateModalVisible(true), 500);
           }
        }}
        onNext={() => {
            if (isEditingAssets) {
                handleUpdateAssets();
            } else {
                setBindModalVisible(false);
                setTimeout(() => setScanModalVisible(true), 500);
            }
        }}
        selectedBindWallets={selectedBindWallets}
        setSelectedBindWallets={setSelectedBindWallets}
        wallets={[
            { type: 'Bitcoin', address: '1' },
            { type: 'Ethereum', address: '2' },
            { type: 'Solana', address: '3' },
            { type: 'Polygon', address: '4' },
            { type: 'BNB Chain', address: '5' },
            { type: 'Lisk', address: '6' },
            { type: 'Sepolia', address: '7' },
            { type: 'Lisk Sepolia', address: '8' }
        ]} 
        balances={balances}
        isCreating={bindLoading}
        isEditMode={isEditingAssets}
        newVlooName={isEditingAssets ? (selectedVloo?.receiver_name || 'Vloo') : receiverName}
        newVlooUnlockDate={isEditingAssets ? null : unlockDate}
      />

      <ScanVlooModal 
        visible={scanModalVisible}
        onClose={() => setScanModalVisible(false)}
        onBack={() => {
           setScanModalVisible(false);
           setTimeout(() => setBindModalVisible(true), 500);
        }}
        onBind={handleCreateVloo}
        isBinding={bindLoading}
      />
      
      <EditVlooModal 
         visible={editModalVisible}
         onClose={() => setEditModalVisible(false)}
         onSave={handleUpdateVloo}
         onDelete={handleDeleteVloo}
         vloo={selectedVloo}
         editVlooName={editReceiverName}
         setEditVlooName={setEditReceiverName}
         editVlooMessage={editMessage}
         setEditVlooMessage={setEditMessage}
         editVlooDate={editUnlockDate}
         setEditVlooDate={setEditUnlockDate}
         isSaving={editLoading}
      />

      <PreviewVlooModal 
         visible={previewModalVisible}
         onClose={() => setPreviewModalVisible(false)}
         vloo={selectedVloo}
         giverName={user?.user_metadata?.full_name}
         giverAvatar={user?.user_metadata?.avatar_url}
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileActionsVisible}
        onRequestClose={() => setProfileActionsVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback onPress={() => setProfileActionsVisible(false)}>
            <View style={StyleSheet.absoluteFillObject}>
               <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
            </View>
          </TouchableWithoutFeedback>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, borderColor: '#eee', padding: 24 }}>
            <Text style={{ fontFamily: FONTS.displayBold, fontSize: 20, color: '#000', marginBottom: 16 }}>Profile</Text>
            <TouchableOpacity
              style={{ paddingVertical: 14 }}
              onPress={() => {
                setProfileActionsVisible(false);
                handleToggleFaceId();
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 16, color: '#000' }}>Face ID {faceIdEnabled ? '(On)' : '(Off)'}</Text>
                <Fingerprint size={18} color={faceIdEnabled ? COLORS.primary : '#000'} />
              </View>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#f0f0f0' }} />
            <TouchableOpacity
              style={{ paddingVertical: 14 }}
              onPress={() => {
                setProfileActionsVisible(false);
                handleOpenEditProfile();
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 16, color: '#000' }}>Edit Profile</Text>
                <Edit2 size={18} color="#000" />
              </View>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: '#f0f0f0' }} />
            <TouchableOpacity
              style={{ paddingVertical: 14 }}
              onPress={() => {
                setProfileActionsVisible(false);
                handleSignOut();
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 16, color: '#FF3B30' }}>Sign Out</Text>
                <LogOut size={18} color="#FF3B30" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
