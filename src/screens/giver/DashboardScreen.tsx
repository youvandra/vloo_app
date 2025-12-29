import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, RefreshControl, BackHandler, Dimensions, FlatList, Platform, Alert, Modal, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, PanResponder, Switch } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Circle as SvgCircle } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { fetchBalance } from '../../lib/blockcypher';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Bell, Plus, Send, Wallet, Copy, Home, BarChart2, CreditCard, Grid, LogOut, User, ArrowDown, Settings, MessageSquare, Radio, ArrowLeft, Edit2, Eye, Calendar } from 'lucide-react-native';
import { Button } from '../../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createRandomWallet, generateMockBitcoinData, generateMockSolanaData } from '../../lib/wallet';
import { encryptData } from '../../lib/crypto';
import { ActivityIndicator } from 'react-native';
import BitcoinIcon from '../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../assets/icons/chains/bnb.svg';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82; // Slightly wider for better peek
const CARD_SPACING = 12;

export default function GiverDashboardScreen({ navigation }: any) {
  const [vloos, setVloos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [lastBalanceRefresh, setLastBalanceRefresh] = useState(0); // To trigger re-fetch
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [bindModalVisible, setBindModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedVloo, setSelectedVloo] = useState<any>(null);
  
  // Wallet Detail State
  const [walletDetailModalVisible, setWalletDetailModalVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  
  // Profile Edit State
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Edit Form State
  const [editReceiverName, setEditReceiverName] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editUnlockDate, setEditUnlockDate] = useState(new Date());
  const [isEditUnlockDateEnabled, setIsEditUnlockDateEnabled] = useState(true);
  const [editLoading, setEditLoading] = useState(false);

  const [walletLoading, setWalletLoading] = useState(false);

  // ... (existing PanResponders)

  const editPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          setEditModalVisible(false);
        }
      },
    })
  ).current;

  const previewPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          setPreviewModalVisible(false);
        }
      },
    })
  ).current;

  const walletDetailPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          setWalletDetailModalVisible(false);
        }
      },
    })
  ).current;

  const handleWalletPress = (wallet: any) => {
    setSelectedWallet(wallet);
    setWalletDetailModalVisible(true);
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  const handleOpenEditProfile = () => {
    setProfileName(user?.user_metadata?.full_name || '');
    setEditProfileModalVisible(true);
    setShowProfileMenu(false);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setProfileLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: profileName }
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
      setIsEditUnlockDateEnabled(true);
    } else {
      setEditUnlockDate(new Date(Date.now() + 60000));
      setIsEditUnlockDateEnabled(false);
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
          unlock_date: isEditUnlockDateEnabled ? editUnlockDate.toISOString() : null,
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
  const [receiverName, setReceiverName] = useState('');
  const [message, setMessage] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [unlockDate, setUnlockDate] = useState(new Date(Date.now() + 60000));
  const [isUnlockDateEnabled, setIsUnlockDateEnabled] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Bind State
  const [bindLoading, setBindLoading] = useState(false);
  const [bindStatus, setBindStatus] = useState('Ready to bind card');
  const [manualCardId, setManualCardId] = useState('');
  const [idError, setIdError] = useState('');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          setCreateModalVisible(false);
        }
      },
    })
  ).current;

  const bindPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          setBindModalVisible(false);
        }
      },
    })
  ).current;

  const profilePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          setShowProfileMenu(false);
        }
      },
    })
  ).current;

  const profileEditPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          setEditProfileModalVisible(false);
        }
      },
    })
  ).current;

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const current = new Date(unlockDate);
      current.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setUnlockDate(current);
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      const current = new Date(unlockDate);
      current.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setUnlockDate(current);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleNext = () => {
    if (!receiverName || !message || !passphrase) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    setIdError(''); // Clear any previous ID errors
    setCreateModalVisible(false);
    setBindModalVisible(true);
  };

  const handleBind = async () => {
    setIdError(''); // Clear previous errors
    if (!manualCardId.trim()) {
        setIdError('Please input the right id');
        return;
    }

    setBindLoading(true);
    setBindStatus('Verifying Card...');

    try {
        // 0. Verify Card ID
        const { data: cardData, error: cardCheckError } = await supabase
            .from('verified_cards')
            .select('*')
            .eq('id', manualCardId.trim())
            .single();

        if (cardCheckError || !cardData) {
            throw new Error('ID is not registered');
        }

        if (cardData.vloo_id !== null) {
            throw new Error('Card is already in use');
        }

        // 1. Generate Wallets (ETH + BTC + SOL + Polygon + BNB)
        setBindStatus('Generating secure wallet...');
        const wallet = createRandomWallet(); // Ethereum (EVM compatible)
        const btcData = generateMockBitcoinData(); // Bitcoin
        const solData = generateMockSolanaData(); // Solana

        const ethPrivateKey = wallet.privateKey;
        const ethAddress = wallet.address;
        const btcPrivateKey = btcData.privateKey;
        const btcAddress = btcData.address;
        const solPrivateKey = solData.privateKey;
        const solAddress = solData.address;

        // 2. Encrypt Private Keys (All chains)
        setBindStatus('Encrypting keys...');
        const encryptedEthKey = encryptData(ethPrivateKey, passphrase);
        const encryptedBtcKey = encryptData(btcPrivateKey, passphrase);
        const encryptedSolKey = encryptData(solPrivateKey, passphrase);

        const encryptedKeys = {
          ethereum: encryptedEthKey,
          bitcoin: encryptedBtcKey,
          solana: encryptedSolKey,
          polygon: encryptedEthKey, // Reusing EVM key
          bnb: encryptedEthKey // Reusing EVM key
        };

        const walletAddresses = [
          { type: 'Bitcoin', address: btcAddress },
          { type: 'Ethereum', address: ethAddress },
          { type: 'Sepolia', address: ethAddress },
          { type: 'Solana', address: solAddress },
          { type: 'Polygon', address: ethAddress },
          { type: 'BNB Chain', address: ethAddress }
        ];

        // 3. Get User (Already have 'user' state, but refresh if needed)
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
        setBindStatus('Saving to VLOO network...');
        
        const { data: vlooId, error: rpcError } = await supabase.rpc('bind_vloo_card', {
            p_card_id: manualCardId.trim(),
            p_giver_id: currentUser.id,
            p_receiver_name: receiverName,
            p_message: message,
            p_unlock_date: isUnlockDateEnabled ? unlockDate.toISOString() : null,
            p_encrypted_private_key: encryptedKeys,
            p_wallet_address: walletAddresses
        });

        if (rpcError) throw new Error(rpcError.message);

        setBindModalVisible(false);
        // Reset Form
        setReceiverName('');
        setMessage('');
        setPassphrase('');
        setManualCardId('');
        setIdError('');
        
        navigation.navigate('GiverSuccess', { address: ethAddress, cardId: manualCardId.trim(), walletAddresses });
        fetchVloos(); // Refresh list

    } catch (error: any) {
      console.error(error);
      if (error.message === 'ID is not registered' || error.message === 'Card is already in use') {
          setIdError(error.message);
      } else {
          Alert.alert('Error', error.message || 'Failed to bind VLOO');
      }
      setBindStatus('Failed');
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
    fetchVloos();
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Reset stack to ensure clean history (Home -> Login)
      navigation.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'GiverLogin' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const displayData = useMemo(() => {
    return [...vloos, { id: 'placeholder', isPlaceholder: true }];
  }, [vloos]);

  const renderCardItem = ({ item }: { item: any }) => {
    if (item.isPlaceholder) {
      return (
        <TouchableOpacity 
          style={[styles.mainCard, styles.placeholderCard]}
          onPress={() => setCreateModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.placeholderContent}>
            <View style={styles.placeholderIconContainer}>
              <Plus size={40} color="#fff" />
            </View>
            <Text style={styles.placeholderText}>Create New Vloo Card</Text>
            <Text style={styles.placeholderSubtext}>Tap to add another recipient</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return renderCard(item);
  };

  const renderCard = (item: any) => {
    const cardColor = item.verified_cards?.[0]?.color === 'blue' ? COLORS.primary : '#000';
    
    return (
      <View style={[styles.mainCard, { backgroundColor: cardColor }]}>
        <View style={styles.cardTop}>
          <Image 
            source={require('../../assets/logo-min.png')} 
            style={styles.cardLogo} 
            resizeMode="contain"
          />
          <View style={styles.nfcIdContainer}>
             <Text style={[styles.nfcIdLabel, { color: '#666' }]}>CARD ID</Text>
             <Text style={[styles.nfcIdValue, { color: '#fff' }]}>{item.verified_cards?.[0]?.id || '••••'}</Text>
          </View>
        </View>
        
        <View style={styles.cardCenter}>
          <Text style={[styles.receiverNameLabel, { color: '#666' }]}>Sending to</Text>
          <Text style={[styles.receiverName, { color: '#fff' }]} numberOfLines={1} adjustsFontSizeToFit>
            {item.receiver_name || 'VLOO Gift'}
          </Text>
        </View>
        
        <View style={styles.cardBottom}>
          <View>
            <Text style={[styles.cardLabel, { color: '#666' }]}>Unlock Date</Text>
            <Text style={[styles.cardValue, { color: '#fff' }]}>
              {item.unlock_date ? new Date(item.unlock_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Whenever'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              style={[styles.cardSettingsButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
              onPress={() => handlePreviewPress(item)}
            >
               <Eye size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cardSettingsButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
              onPress={() => handleEditPress(item)}
            >
               <Edit2 size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };


  // Helper to parse wallet addresses
  const getWalletAddresses = (data: any) => {
    let addresses: any[] = [];
    
    if (Array.isArray(data)) {
        addresses = [...data];
    } else if (typeof data === 'string' && data) {
      // Check if it's a JSON string
      if (data.startsWith('[') || data.startsWith('{')) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) addresses = parsed;
        } catch (e) {
          // ignore
        }
      } else {
         // Legacy simple string
         addresses = [{ type: 'Ethereum', address: data }];
      }
    }
    
    if (addresses.length === 0 && !data) return [];
    
    // Inject Sepolia if Ethereum exists but Sepolia doesn't
    const ethWallet = addresses.find((w: any) => w.type === 'Ethereum');
    const hasSepolia = addresses.some((w: any) => w.type === 'Sepolia');
    
    if (ethWallet && !hasSepolia) {
        // Insert Sepolia after Ethereum
        const ethIndex = addresses.indexOf(ethWallet);
        addresses.splice(ethIndex + 1, 0, { type: 'Sepolia', address: ethWallet.address });
    }
    
    return addresses;
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    if (addr.length < 10) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const currentWalletAddresses = currentCardIndex < vloos.length ? getWalletAddresses(vloos[currentCardIndex]?.wallet_address) : [];

  useEffect(() => {
    let isMounted = true;
    const loadBalances = async () => {
      if (currentWalletAddresses.length === 0) return;

      const newBalances: Record<string, string> = {};
      
      // Sequential fetching to respect rate limits (3 req/sec)
      for (const wallet of currentWalletAddresses) {
        if (!isMounted) break;
        
        const key = `${wallet.type}-${wallet.address}`;
        
        // If not forcing refresh (lastBalanceRefresh > 0) and cached, skip
        // But if lastBalanceRefresh changed, we should re-fetch even if cached?
        // Actually, we can just check if we have it. 
        // If we want to support refresh, we should ignore cache if triggered by refresh.
        // But the simplest logic: 
        // If key exists AND we are not "refreshing" (based on some logic), skip.
        // But here we want to fetch if key is missing OR if we want to update.
        // Let's assume onRefresh clears balances or we just fetch regardless?
        // Fetching regardless is safer for "Update" button, but expensive for navigation.
        // Let's rely on the fact that we won't call loadBalances too often.
        
        // Check cache ONLY if not recently refreshed (we can use a flag or just fetch always on mount if small list)
        // Optimization: Check cache if lastBalanceRefresh is 0 (initial load)
        // But we added lastBalanceRefresh to dependency, so it runs when it changes.
        // If it runs due to lastBalanceRefresh change, we should fetch.
        // If it runs due to scroll (currentCardIndex), we should fetch if missing.
        
        // Let's use a local variable/check.
        // Actually, let's just fetch. The rate limit protection below handles safety.
        // But to avoid re-fetching on every render/scroll if data is fresh:
        // We can check `balances[key]` but we need to know if we *should* refresh.
        // Since we don't have a "isRefreshing" passed here easily without more state...
        // Let's just fetch. It's 5 addresses max per card. 
        // BlockCypher 3/sec. 5 addresses = 2 seconds.
        // If user scrolls fast, we might pile up requests.
        
        if (balances[key] && lastBalanceRefresh === 0) continue; // Skip if cached and not forced refresh

        const bal = await fetchBalance(wallet.address, wallet.type);
        if (isMounted) {
            newBalances[key] = bal;
            // Update state progressively or batch? 
            // Batching at end is better for renders, but progressive shows progress.
            // Let's batch per loop or just at end.
        }
        
        // Add delay to respect rate limit (334ms = 3 req/sec)
        await new Promise(resolve => setTimeout(resolve, 340));
      }

      if (isMounted && Object.keys(newBalances).length > 0) {
        setBalances(prev => ({ ...prev, ...newBalances }));
      }
    };

    loadBalances();

    return () => { isMounted = false; };
  }, [currentCardIndex, vloos, lastBalanceRefresh]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background Glow */}
      <View style={styles.glowContainer}>
        <Svg height={width} width={width} viewBox={`0 0 ${width} ${width}`}>
          <Defs>
            <RadialGradient
              id="grad"
              cx={width / 2}
              cy={width / 2}
              rx={width / 2}
              ry={width / 2}
              fx={width / 2}
              fy={width / 2}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={COLORS.primary} stopOpacity="0.1" />
              <Stop offset="1" stopColor={COLORS.primary} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <SvgCircle cx={width / 2} cy={width / 2} r={width / 2} fill="url(#grad)" />
        </Svg>
      </View>

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={() => setShowProfileMenu(true)}>
                <Image 
                  source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?u=giver' }} 
                  style={styles.avatar} 
                />
              </TouchableOpacity>
              <View>
                <Text style={styles.greeting}>Hello <Text style={{ color: COLORS.accent }}>{user?.user_metadata?.full_name?.split(' ')[0] || 'Giver'}</Text>,</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton}>
                <Bell color="#000" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Cards Header */}
          <View style={[styles.walletHeader, { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
             <Text style={styles.walletTitle}>Cards ({vloos.length})</Text>
             {vloos.length > 5 && (
               <TouchableOpacity 
                 onPress={() => setCreateModalVisible(true)}
                 style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
               >
                 <Plus size={16} color={COLORS.primary} />
                 <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.primary }}>Add Card</Text>
               </TouchableOpacity>
             )}
          </View>

          {/* Cards Stack (Always visible now, even if empty, to show placeholder) */}
          <View style={styles.cardStackContainer}>
            <FlatList
              data={displayData}
              renderItem={renderCardItem}
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => item.id || index.toString()}
              onMomentumScrollEnd={(ev) => {
                const index = Math.round(ev.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
                if (index !== currentCardIndex) {
                  setWalletLoading(true);
                  setCurrentCardIndex(index);

                  // Simulate loading delay for better UX (optional, but requested)
                  setTimeout(() => setWalletLoading(false), 500);
                }
              }}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2 }}
              snapToAlignment="center"
            />
            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
              {(() => {
                const MAX_DOTS = 5;
                const total = displayData.length;
                
                // Calculate window based on current index to keep active dot at the end when possible
                // This ensures "swiping back" keeps the dot at the right edge of the visible set
                let end = Math.max(MAX_DOTS - 1, currentCardIndex);
                end = Math.min(total - 1, end);
                let start = end - MAX_DOTS + 1;
                start = Math.max(0, start);

                return displayData.map((_, index) => {
                  if (index < start || index > end) return null;
                  
                  return (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        index === currentCardIndex ? styles.paginationDotActive : null
                      ]}
                    />
                  );
                });
              })()}
            </View>
          </View>

          {/* Wallet Address Section - Scrollable */}
          <View style={{ flex: 1, marginTop: 4 }}>
            {currentWalletAddresses.length > 0 && (
              <View style={[styles.walletHeader, { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                <Text style={styles.walletTitle}>Linked Wallets</Text>
                <TouchableOpacity 
                  onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                    <Plus size={16} color={COLORS.primary} />
                    <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.primary }}>Add More</Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView 
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />}
            >
              {walletLoading ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : (
                currentWalletAddresses.length > 0 && currentWalletAddresses.map((wallet: any, index: number) => (
                  <TouchableOpacity key={index} style={styles.walletRow} onPress={() => handleWalletPress(wallet)}>
                    <View style={styles.walletIconContainer}>
                      {/* Icon based on type */}
                      {wallet.type === 'Bitcoin' ? (
                        <BitcoinIcon width={24} height={24} />
                      ) : wallet.type === 'Ethereum' || wallet.type === 'Sepolia' ? (
                        <EthIcon width={24} height={24} />
                      ) : wallet.type === 'Solana' ? (
                        <SolanaIcon width={24} height={24} />
                      ) : wallet.type === 'Polygon' ? (
                        <PolygonIcon width={24} height={24} />
                      ) : wallet.type === 'BNB Chain' ? (
                        <BnbIcon width={24} height={24} />
                      ) : (
                        <Text style={{ fontSize: 20 }}>?</Text>
                      )}
                    </View>
                    <View style={styles.walletInfo}>
                      <Text style={styles.walletTypeLabel}>{wallet.type}</Text>
                      <Text style={styles.walletAddress}>
                        {formatAddress(wallet.address)}
                      </Text>
                    </View>
                    <Text style={styles.balanceText}>{balances[`${wallet.type}-${wallet.address}`] || '0.00'}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
          
          {/* Action Buttons (Removed) */}
          {/* 
          <View style={styles.actionsContainer}>
            {currentCardIndex < vloos.length ? (
              <Button
                title="Confirm Deposit"
                onPress={() => console.log('Deposit pressed')}
                variant="primary"
                style={styles.depositButton}
                gradient={['#d199f9', '#9F60D1']} // Pink gradient like first screen
              />
            ) : (
              <Button
                title="Create New Card"
                onPress={() => setCreateModalVisible(true)}
                variant="primary"
                style={styles.depositButton}
              />
            )}
          </View>
          */}

        </SafeAreaView>

      {/* Create Vloo Modal */}
      <Modal
            animationType="slide"
            transparent={true}
            visible={createModalVisible}
            onRequestClose={() => setCreateModalVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <TouchableWithoutFeedback onPress={() => setCreateModalVisible(false)}>
                <View style={styles.modalOverlay} />
              </TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader} {...panResponder.panHandlers}>
                  <View style={styles.modalIndicator} />
                </View>
                <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                  <Text style={styles.headline}>
                    Create New Vloo
                  </Text>

             <View style={styles.formSection}>
              <Text style={styles.inputLabel}>RECEIVER NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter receiver's name"
                placeholderTextColor="#666"
                value={receiverName}
                onChangeText={setReceiverName}
              />

              <Text style={styles.inputLabel}>MESSAGE</Text>
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="A short message for the receiver..."
                placeholderTextColor="#666"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>PASSPHRASE</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a secret passphrase"
                placeholderTextColor="#666"
                value={passphrase}
                onChangeText={setPassphrase}
                secureTextEntry
              />
              <Text style={styles.hint}>This passphrase will be used to encrypt the key. Don't lose it!</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 }}>
                <Text style={[styles.inputLabel, { marginTop: 0, marginBottom: 0 }]}>UNLOCK DATE</Text>
                <Switch
                  value={isUnlockDateEnabled}
                  onValueChange={setIsUnlockDateEnabled}
                  trackColor={{ false: '#333', true: COLORS.accent }}
                  thumbColor={'#fff'}
                  ios_backgroundColor="#333"
                />
              </View>

              {isUnlockDateEnabled ? (
                Platform.OS === 'ios' ? (
                  <View style={styles.datePickerContainerIOS}>
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={unlockDate}
                      mode="datetime"
                      display="compact"
                      themeVariant="light"
                      onChange={(event, selectedDate) => {
                        if (selectedDate) setUnlockDate(selectedDate);
                      }}
                      minimumDate={new Date()}
                      style={{ alignSelf: 'flex-start' }}
                    />
                  </View>
                ) : (
                  <>
                    <TouchableOpacity onPress={showDatepicker} style={[styles.dateButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderColor: COLORS.primary, borderWidth: 1.5 }]}>
                      <Text style={styles.dateButtonText}>
                        {unlockDate.toLocaleString()}
                      </Text>
                      <Calendar size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        testID="dateTimePicker"
                        value={unlockDate}
                        mode="date"
                        is24Hour={true}
                        onChange={onChangeDate}
                        minimumDate={new Date()}
                        display="default"
                      />
                    )}
                    {showTimePicker && (
                      <DateTimePicker
                        testID="timePicker"
                        value={unlockDate}
                        mode="time"
                        is24Hour={true}
                        onChange={onChangeTime}
                        display="default"
                      />
                    )}
                  </>
                )
              ) : (
                <View style={[styles.input, { justifyContent: 'center' }]}>
                  <Text style={{ color: '#888', fontFamily: FONTS.bodyRegular }}>Whenever (No unlock date)</Text>
                </View>
              )}

              <View style={{ marginTop: 20 }}>
                <Button 
                  title="Next Step" 
                  onPress={handleNext} 
                  variant="primary" 
                  style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                />
              </View>
            </View>
          </ScrollView>
        </View>
            </KeyboardAvoidingView>
      </Modal>

      {/* Bind Vloo Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={bindModalVisible}
        onRequestClose={() => setBindModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setBindModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader} {...bindPanResponder.panHandlers}>
            <View style={styles.modalIndicator} />
          </View>
          
          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.iconContainer}>
              <Radio color={COLORS.accent} size={60} />
            </View>
            
            <Text style={[styles.headline, { textAlign: 'center' }]}>
              Bind Vloo Card
            </Text>
            <Text style={styles.subheadline}>
              Hold the NFC card near the phone to securely bind this VLOO.
            </Text>

            <View style={styles.formSection}>
              {bindLoading ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <ActivityIndicator size="large" color={COLORS.accent} />
                  <Text style={{ color: '#888', marginTop: 16, fontFamily: FONTS.bodyRegular }}>
                    {bindStatus}
                  </Text>
                </View>
              ) : (
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.inputLabel}>CARD ID (DEV MODE)</Text>
                <TextInput
                    style={[styles.input, idError ? { borderColor: '#FF4D4D', marginBottom: 8 } : null]}
                    placeholder="Enter Card ID"
                    placeholderTextColor="#666"
                    value={manualCardId}
                    onChangeText={(text) => {
                        setManualCardId(text);
                        if (idError) setIdError('');
                    }}
                    autoCapitalize="none"
                  />
                  {idError ? (
                    <Text style={{ color: '#FF4D4D', fontFamily: FONTS.bodyRegular, fontSize: 12, marginBottom: 24 }}>
                      {idError}
                    </Text>
                  ) : null}
                  <Button 
                    title="Verify & Bind Vloo" 
                    onPress={handleBind} 
                    variant="primary" 
                    style={[styles.actionButton, { backgroundColor: COLORS.primary, marginTop: 16 }]}
                  />
                  <TouchableOpacity 
                    style={{ marginTop: 16, alignItems: 'center' }}
                    onPress={() => {
                      setBindModalVisible(false);
                      setCreateModalVisible(true);
                    }}
                  >
                    <Text style={{ color: '#666', fontFamily: FONTS.bodyRegular }}>Back to details</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Preview Message Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={previewModalVisible}
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPreviewModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader} {...previewPanResponder.panHandlers}>
            <View style={styles.modalIndicator} />
          </View>
          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
               <View style={{ 
                 width: 60, 
                 height: 60, 
                 borderRadius: 30, 
                 backgroundColor: 'rgba(209, 153, 249, 0.1)', 
                 justifyContent: 'center', 
                 alignItems: 'center',
                 marginBottom: 16
               }}>
                 <MessageSquare size={32} color={COLORS.accent} />
               </View>
               <Text style={[styles.headline, { textAlign: 'center', fontSize: 24 }]}>
                 Message for {selectedVloo?.receiver_name}
               </Text>
            </View>

            <View style={{ 
              backgroundColor: '#fff', 
              padding: 24, 
              borderRadius: 20, 
              borderWidth: 1, 
              borderColor: '#000',
              minHeight: 200
            }}>
              <Text style={{ 
                fontFamily: FONTS.displaySemiBold, 
                fontSize: 20, 
                color: '#000', 
                lineHeight: 32,
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                "{selectedVloo?.message || 'No message provided'}"
              </Text>
            </View>

            <View style={{ marginTop: 32 }}>
              <Button 
                title="Close Preview" 
                onPress={() => setPreviewModalVisible(false)} 
                variant="primary"
                style={[styles.actionButton, { backgroundColor: '#000' }]}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Vloo Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader} {...editPanResponder.panHandlers}>
              <View style={styles.modalIndicator} />
            </View>
            <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.headline}>
                Edit Vloo Card
              </Text>

              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>RECEIVER NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter receiver's name"
                  placeholderTextColor="#666"
                  value={editReceiverName}
                  onChangeText={setEditReceiverName}
                />

                <Text style={styles.inputLabel}>MESSAGE</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="A short message for the receiver..."
                  placeholderTextColor="#666"
                  value={editMessage}
                  onChangeText={setEditMessage}
                  multiline
                  numberOfLines={3}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 }}>
                  <Text style={[styles.inputLabel, { marginTop: 0, marginBottom: 0 }]}>UNLOCK DATE</Text>
                  <Switch
                    value={isEditUnlockDateEnabled}
                    onValueChange={setIsEditUnlockDateEnabled}
                    trackColor={{ false: '#333', true: COLORS.accent }}
                    thumbColor={'#fff'}
                    ios_backgroundColor="#333"
                  />
                </View>

                {isEditUnlockDateEnabled ? (
                  Platform.OS === 'ios' ? (
                    <View style={styles.datePickerContainerIOS}>
                      <DateTimePicker
                        value={editUnlockDate}
                        mode="datetime"
                        display="compact"
                        themeVariant="dark"
                        onChange={(event, selectedDate) => {
                          if (selectedDate) setEditUnlockDate(selectedDate);
                        }}
                        minimumDate={new Date()}
                        style={{ alignSelf: 'flex-start' }}
                      />
                    </View>
                  ) : (
                    <>
                      {/* Android DatePicker Logic would go here if needed, reusing state or creating separate handlers */}
                      <View style={[styles.input, { justifyContent: 'center' }]}>
                        <Text style={{ color: '#fff', fontFamily: FONTS.bodyRegular }}>
                          {editUnlockDate.toLocaleString()}
                        </Text>
                      </View>
                    </>
                  )
                ) : (
                  <View style={[styles.input, { justifyContent: 'center' }]}>
                    <Text style={{ color: '#888', fontFamily: FONTS.bodyRegular }}>Whenever (No unlock date)</Text>
                  </View>
                )}

                <View style={{ marginTop: 20 }}>
                  <Button 
                    title={editLoading ? "Updating..." : "Save Changes"}
                    onPress={handleUpdateVloo} 
                    variant="primary" 
                    disabled={editLoading}
                    style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                  />
                  <TouchableOpacity 
                    style={{ marginTop: 16, alignItems: 'center' }}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={{ color: '#666', fontFamily: FONTS.bodyRegular }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showProfileMenu}
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowProfileMenu(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalContent, { height: '30%' }]}>
          <View style={styles.modalHeader} {...profilePanResponder.panHandlers}>
            <View style={styles.modalIndicator} />
          </View>
          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.headline, { textAlign: 'left', fontSize: 24, marginBottom: 24 }]}>
              Account
            </Text>
            
            <TouchableOpacity style={styles.profileMenuItem} onPress={handleOpenEditProfile}>
              <User size={24} color="#000" />
              <Text style={styles.profileMenuText}>Edit Profile</Text>
            </TouchableOpacity>
            
            <View style={styles.profileMenuDivider} />
            
            <TouchableOpacity style={styles.profileMenuItem} onPress={() => {
              setShowProfileMenu(false);
              handleLogout();
            }}>
              <LogOut size={24} color="#FF4D4D" />
              <Text style={[styles.profileMenuText, { color: '#FF4D4D' }]}>Log Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editProfileModalVisible}
        onRequestClose={() => setEditProfileModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={() => setEditProfileModalVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={[styles.modalContent, { height: '50%' }]}>
            <View style={styles.modalHeader} {...profileEditPanResponder.panHandlers}>
              <View style={styles.modalIndicator} />
            </View>
            <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <Text style={[styles.headline, { textAlign: 'left', fontSize: 24, marginBottom: 24 }]}>
                Edit Profile
              </Text>
              
              <View style={styles.formSection}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#666"
                  value={profileName}
                  onChangeText={setProfileName}
                />
                
                <Text style={styles.inputLabel}>EMAIL</Text>
                <View style={[styles.input, { backgroundColor: '#f5f5f5', borderColor: '#eee' }]}>
                  <Text style={{ color: '#888', fontFamily: FONTS.bodyRegular }}>
                    {user?.email}
                  </Text>
                </View>

                <View style={{ marginTop: 20 }}>
                  <Button 
                    title={profileLoading ? "Saving..." : "Save Changes"}
                    onPress={handleSaveProfile} 
                    variant="primary" 
                    disabled={profileLoading}
                    style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                  />
                  <TouchableOpacity 
                    style={{ marginTop: 16, alignItems: 'center' }}
                    onPress={() => setEditProfileModalVisible(false)}
                  >
                    <Text style={{ color: '#666', fontFamily: FONTS.bodyRegular }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Wallet Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={walletDetailModalVisible}
        onRequestClose={() => setWalletDetailModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setWalletDetailModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalContent, { height: 'auto', minHeight: 400 }]}>
          <View style={styles.modalHeader} {...walletDetailPanResponder.panHandlers}>
            <View style={styles.modalIndicator} />
          </View>
          
          <View style={{ alignItems: 'center', paddingVertical: 24, paddingHorizontal: 24 }}>
             {/* Logo */}
             <View style={{ marginBottom: 16 }}>
               {selectedWallet?.type === 'Bitcoin' ? (
                 <BitcoinIcon width={64} height={64} />
               ) : selectedWallet?.type === 'Ethereum' || selectedWallet?.type === 'Sepolia' ? (
                 <EthIcon width={64} height={64} />
               ) : selectedWallet?.type === 'Solana' ? (
                 <SolanaIcon width={64} height={64} />
               ) : selectedWallet?.type === 'Polygon' ? (
                 <PolygonIcon width={64} height={64} />
               ) : selectedWallet?.type === 'BNB Chain' ? (
                 <BnbIcon width={64} height={64} />
               ) : (
                 <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 32 }}>?</Text>
                 </View>
               )}
             </View>

             {/* Chain Name */}
             <Text style={{ fontFamily: FONTS.displayBold, fontSize: 24, color: '#000', marginBottom: 8 }}>
               {selectedWallet?.type}
             </Text>

             {/* Balance */}
             <Text style={{ fontFamily: FONTS.displayBold, fontSize: 36, color: COLORS.primary, marginBottom: 32, textAlign: 'center' }}>
                {balances[`${selectedWallet?.type}-${selectedWallet?.address}`] || '0.00'}
             </Text>

             {/* Address Section */}
             <View style={{ width: '100%', backgroundColor: '#f5f5f5', borderRadius: 16, padding: 16 }}>
                <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 12, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>
                  Wallet Address
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: FONTS.bodyRegular, fontSize: 14, color: '#000', flex: 1, marginRight: 12 }}>
                    {selectedWallet?.address}
                  </Text>
                  <TouchableOpacity 
                    style={{ padding: 8, backgroundColor: '#fff', borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
                    onPress={() => copyToClipboard(selectedWallet?.address)}
                  >
                    <Copy size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
             </View>

          </View>
        </View>
      </Modal>

      {/* Floating Bottom Navigation */}
      {vloos.length > 0 && (
        <View style={styles.bottomNavContainer}>
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItemActive}>
              <View style={[styles.navIconActive, { backgroundColor: '#fff' }]}>
                <Home size={20} color="#000" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.navItem}>
              <BarChart2 size={20} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.navItem}>
              <CreditCard size={20} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.navItem}>
              <Grid size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  glowContainer: {
    position: 'absolute',
    top: -width * 0.1,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  safeArea: {
    // paddingHorizontal: 24, // Removed to allow full-screen card swiping
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
    paddingHorizontal: 24, // Added padding here
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#eee',
  },
  greeting: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#000',
  },
  accountType: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#888',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Profile Menu Styles
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  profileMenuText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: '#000',
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },

  // Card Stack
  cardStackContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },

  // Wallet Section
  walletSection: {
    width: '100%',
    paddingTop: 20,
    marginBottom: 100, // Space for bottom nav
  },
  walletHeader: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  walletTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#666',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  walletIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  walletInfo: {
    flex: 1,
    marginRight: 12,
  },
  walletAddress: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#000',
  },
  walletTypeLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  copyButton: {
    padding: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  balanceText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#000',
  },

  // Modal Styles
  mainCard: {
    width: CARD_WIDTH, // Explicit width for FlatList items
    height: 220,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginRight: CARD_SPACING,
  },
  placeholderCard: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0, // No shadow for placeholder
    elevation: 0,
  },
  placeholderContent: {
    alignItems: 'center',
    gap: 12,
  },
  placeholderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLogo: {
    width: 50,
    height: 50,
    marginTop: -10,
  },
  nfcIdContainer: {
    alignItems: 'flex-end',
  },
  nfcIdLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  nfcIdValue: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  cardCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  receiverNameLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  receiverName: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align items vertically
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: -24,
    marginBottom: -24,
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  cardLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  cardValue: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#fff',
  },
  cardSettingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Message Section (Removed but keeping commented for reference or clean up completely)
  /* 
  messageSection: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 24, // Increased padding
  },
  messageLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    marginLeft: 4,
  },
  messageContainer: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 8,
  },
  messageText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  messageContextText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginRight: 4,
  },
  */

  // Actions (Removed)
  /*
  actionsContainer: {
    width: '100%',
    marginBottom: 120,
    paddingHorizontal: 24,
  },
  depositButton: {
    width: '100%',
    height: 56,
  },
  */

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    height: '80%',
    backgroundColor: '#fff',
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeader: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  modalScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  headline: {
    fontFamily: FONTS.displayBold,
    fontSize: 32,
    color: '#000',
    lineHeight: 40,
    marginBottom: 8,
    textAlign: 'left',
  },
  headlineHighlight: {
    color: COLORS.primary,
  },
  subheadline: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 280,
    alignSelf: 'center',
    marginBottom: 32,
  },
  formSection: {
    width: '100%',
  },
  inputLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#000',
    fontFamily: FONTS.bodyRegular,
    marginBottom: 24,
  },
  pillContainer: { 
    flexDirection: 'row', 
    marginBottom: 24, 
    flexWrap: 'wrap', 
    gap: 10 
  },
  pill: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 999, 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#eee' 
  },
  pillActive: { 
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: { 
    fontFamily: FONTS.bodySemiBold, 
    color: '#666' 
  },
  pillTextActive: { 
    color: '#fff' 
  },
  hint: { 
    fontFamily: FONTS.bodyRegular, 
    fontSize: 12, 
    color: '#666', 
    marginTop: -16, 
    marginBottom: 24,
    marginLeft: 4,
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 24,
  },
  dateButtonText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#000',
  },
  datePickerContainerIOS: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  actionButton: {
    width: '100%',
    height: 56,
  },

  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: 16,
    paddingHorizontal: 24, // Added padding
  },
  emptyStateText: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    maxWidth: 260,
  },
  arrowContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // Bouncing animation could be added here later
  },

  // Floating Nav
  bottomNavContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Spread items out
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 32,
    width: width - 48, // Make it almost full width (24px margin on each side)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  navItem: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  navItemActive: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconActive: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 8,
  },
  navAddButtonWrapper: {
    width: 60,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  navFloatingButton: {
    position: 'absolute',
    top: -10,
    marginHorizontal: 0,
  },
  
  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  paginationDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
});