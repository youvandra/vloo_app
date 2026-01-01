import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, SafeAreaView, StatusBar, Alert } from 'react-native';
import { ArrowLeft, Edit2, Copy, Eye, MessageSquare, ArrowDown, ArrowUp, ArrowLeftRight, CreditCard } from 'lucide-react-native';
import { COLORS, FONTS } from '../../lib/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import BitcoinIcon from '../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../assets/icons/chains/bnb.svg';
import LiskIcon from '../../assets/icons/chains/lisk.svg';
import { EditVlooModal } from './components/modals/dashboard/EditVlooModal';
import { supabase } from '../../lib/supabase';

export default function VlooDetailsScreen({ route, navigation }: any) {
  const { vloo } = route.params;
  const [wallets, setWallets] = useState<any[]>([]);
  
  // Edit State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [editUnlockDate, setEditUnlockDate] = useState<Date | null>(new Date());
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (vloo?.id) {
      loadWallets();
    }
  }, [vloo]);

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

  const handleEditPress = () => {
    if (vloo) {
        setEditMessage(vloo.message || '');
        if (vloo.unlock_date) {
            setEditUnlockDate(new Date(vloo.unlock_date));
        } else {
            setEditUnlockDate(new Date(Date.now() + 60000));
        }
        setEditModalVisible(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!vloo?.id) return;
    setEditLoading(true);
    try {
        const { error } = await supabase
            .from('verified_cards')
            .update({
                message: editMessage,
                unlock_date: editUnlockDate?.toISOString()
            })
            .eq('id', vloo.id);

        if (error) throw error;

        // Update local vloo object for immediate feedback
        vloo.message = editMessage;
        vloo.unlock_date = editUnlockDate?.toISOString();

        setEditModalVisible(false);
        Alert.alert('Success', 'Vloo updated successfully');
    } catch (e: any) {
        Alert.alert('Error', e.message);
    } finally {
        setEditLoading(false);
    }
  };

  const handleDelete = async () => {
      // Placeholder for delete logic if needed, or pass it from parent
      Alert.alert('Delete', 'Delete functionality coming soon.');
  };

  if (!vloo) return null;

  const cardColor = vloo.color || COLORS.primary;
  const isLocked = vloo.unlock_date && new Date(vloo.unlock_date) > new Date();
  const status = isLocked ? 'LOCKED' : 'READY';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
           <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vloo Details</Text>
        <TouchableOpacity onPress={handleEditPress} style={styles.iconButton}>
           <Edit2 size={24} color="#000" />
        </TouchableOpacity>
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
             <Text style={styles.cardName}>Vloo Card</Text>
             <Text style={styles.cardBalance}>$0.00</Text>
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
               {wallets.map((wallet: any, index: number) => (
                 <View key={index} style={styles.walletRow}>
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
                     <Text style={styles.walletAddress} numberOfLines={1} ellipsizeMode="middle">{wallet.address}</Text>
                   </View>
                   <TouchableOpacity onPress={() => copyToClipboard(wallet.address)} style={styles.copyButton}>
                     <Copy size={16} color="#666" />
                   </TouchableOpacity>
                 </View>
               ))}
             </View>
          </View>
        )}
      </ScrollView>

      <EditVlooModal 
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
        vloo={vloo}
        editVlooMessage={editMessage}
        setEditVlooMessage={setEditMessage}
        editVlooDate={editUnlockDate}
        setEditVlooDate={setEditUnlockDate}
        isSaving={editLoading}
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
});
