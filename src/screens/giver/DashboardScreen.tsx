import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, RefreshControl, BackHandler, Dimensions, FlatList, Platform, Alert, Modal, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, PanResponder, Switch } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Circle as SvgCircle } from 'react-native-svg';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Bell, Plus, Send, Wallet, Copy, Home, BarChart2, CreditCard, Grid, LogOut, User, ArrowDown, Settings, Gift, Radio, ArrowLeft, Edit2, Eye } from 'lucide-react-native';
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
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [bindModalVisible, setBindModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedVloo, setSelectedVloo] = useState<any>(null);
  
  // Edit Form State
  const [editReceiverName, setEditReceiverName] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editUnlockDate, setEditUnlockDate] = useState(new Date());
  const [isEditUnlockDateEnabled, setIsEditUnlockDateEnabled] = useState(true);
  const [editLoading, setEditLoading] = useState(false);

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
  const [purpose, setPurpose] = useState('Gift');
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
    setCreateModalVisible(false);
    setBindModalVisible(true);
  };

  const handleBind = async (mock: boolean = false) => {
    setBindLoading(true);
    setBindStatus('Generating secure wallet...');

    try {
        // 1. Generate Wallets (ETH + BTC + SOL + Polygon + BNB)
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
          { type: 'Solana', address: solAddress },
          { type: 'Polygon', address: ethAddress },
          { type: 'BNB Chain', address: ethAddress }
        ];

        // 3. Get NFC ID (Mock or Real)
      let cardId = '';
      if (mock) {
        cardId = 'mock-nfc-id-' + Math.floor(Math.random() * 10000);
      } else {
        cardId = 'simulated-real-id'; // Fallback for MVP
      }

      // 4. Get User (Already have 'user' state, but refresh if needed)
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

      // 5. Save to Supabase
      setBindStatus('Saving to VLOO network...');
      
      // Ensure wallet_address is stored as a stringified JSON if the DB column is text
      const walletAddressPayload = JSON.stringify(walletAddresses);
      
      const insertPayload = {
        encrypted_private_key: encryptedKeys,
        wallet_address: walletAddressPayload,
        unlock_date: isUnlockDateEnabled ? unlockDate.toISOString() : null,
        message: message,
        status: 'locked',
        giver_id: currentUser.id,
        receiver_name: receiverName
      };
      
      const { data: vlooData, error: vlooError } = await supabase
        .from('vloos')
        .insert([insertPayload])
        .select()
        .single();

      if (vlooError) throw new Error(vlooError.message);

      const { error: cardError } = await supabase
        .from('cards')
        .insert([{
          id: cardId,
          vloo_id: vlooData.id
        }]);

      if (cardError) throw cardError;

      setBindModalVisible(false);
      // Reset Form
      setReceiverName('');
      setMessage('');
      setPassphrase('');
      setPurpose('Gift');
      
      navigation.navigate('GiverSuccess', { address: ethAddress, cardId, walletAddresses });
      fetchVloos(); // Refresh list

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to bind VLOO');
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
        .select('*, cards(id)')
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
    return (
      <View style={[styles.mainCard, { backgroundColor: '#000' }]}>
        <View style={styles.cardTop}>
          <Image 
            source={require('../../assets/logo-min.png')} 
            style={styles.cardLogo} 
            resizeMode="contain"
          />
          <View style={styles.nfcIdContainer}>
             <Text style={[styles.nfcIdLabel, { color: '#666' }]}>CARD ID</Text>
             <Text style={[styles.nfcIdValue, { color: '#fff' }]}>{item.cards?.[0]?.id || '••••'}</Text>
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
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      // Check if it's a JSON string
      if (data.startsWith('[') || data.startsWith('{')) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // ignore
        }
      }
      // Legacy simple string
      return [{ type: 'Ethereum', address: data }];
    }
    return [];
  };

  const currentWalletAddresses = currentCardIndex < vloos.length ? getWalletAddresses(vloos[currentCardIndex]?.wallet_address) : [];

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

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
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
                <Text style={styles.greeting}>Morning {user?.user_metadata?.full_name?.split(' ')[0] || 'Giver'},</Text>
                <Text style={styles.accountType}>Free Account</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton}>
                <Bell color="#000" size={20} />
              </TouchableOpacity>
            </View>
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
                setCurrentCardIndex(index);
              }}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2 }}
              snapToAlignment="center"
            />
          </View>

          {/* Wallet Address Section */}
          {currentWalletAddresses.length > 0 && (
            <View style={styles.walletSection}>
              <View style={styles.walletHeader}>
                <Text style={styles.walletTitle}>Linked Wallets</Text>
              </View>
              
              {currentWalletAddresses.map((wallet: any, index: number) => (
                <View key={index} style={styles.walletRow}>
                  <View style={styles.walletIconContainer}>
                    {/* Icon based on type */}
                    {wallet.type === 'Bitcoin' ? (
                      <BitcoinIcon width={24} height={24} />
                    ) : wallet.type === 'Ethereum' ? (
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
                    <Text style={styles.walletAddress} numberOfLines={1} ellipsizeMode="middle">
                      {wallet.address}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => {
                      // Clipboard.setString(wallet.address);
                      Alert.alert('Copied', `${wallet.type} address copied to clipboard`);
                    }}
                  >
                    <Copy size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
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
      </ScrollView>

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
              <Text style={styles.inputLabel}>PURPOSE</Text>
              <View style={styles.pillContainer}>
                {['Gift', 'Salary', 'Inheritance'].map(p => (
                  <TouchableOpacity 
                    key={p} 
                    style={[styles.pill, purpose === p && styles.pillActive]} 
                    onPress={() => setPurpose(p)}
                  >
                    <Text style={[styles.pillText, purpose === p && styles.pillTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>

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
                      themeVariant="dark"
                      onChange={(event, selectedDate) => {
                        if (selectedDate) setUnlockDate(selectedDate);
                      }}
                      minimumDate={new Date()}
                      style={{ alignSelf: 'flex-start' }}
                    />
                  </View>
                ) : (
                  <>
                    <TouchableOpacity onPress={showDatepicker} style={styles.dateButton}>
                      <Text style={styles.dateButtonText}>
                        {unlockDate.toLocaleString()}
                      </Text>
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
                  <Button 
                    title="Tap to Simulate NFC (Dev)" 
                    onPress={() => handleBind(true)} 
                    variant="primary" 
                    style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
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
                 <Gift size={32} color={COLORS.accent} />
               </View>
               <Text style={[styles.headline, { textAlign: 'center', fontSize: 24 }]}>
                 Message for {selectedVloo?.receiver_name}
               </Text>
            </View>

            <View style={{ 
              backgroundColor: '#111', 
              padding: 24, 
              borderRadius: 20, 
              borderWidth: 1, 
              borderColor: '#333',
              minHeight: 200
            }}>
              <Text style={{ 
                fontFamily: FONTS.displaySemiBold, 
                fontSize: 20, 
                color: '#fff', 
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
                variant="outline"
                style={styles.actionButton}
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
            
            <TouchableOpacity style={styles.profileMenuItem} onPress={() => {
              setShowProfileMenu(false);
              // Navigate to edit profile
            }}>
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
    width: 30,
    height: 30,
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
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
});