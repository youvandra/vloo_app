import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, StyleSheet, ScrollView } from 'react-native';
import { Copy } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../lib/theme';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';
import BitcoinIcon from '../../../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../../../assets/icons/chains/bnb.svg';
import LiskIcon from '../../../../assets/icons/chains/lisk.svg';

interface WalletDetailModalProps {
  visible: boolean;
  onClose: () => void;
  wallet: any;
  balance: string;
}

export const WalletDetailModal = ({ visible, onClose, wallet, balance }: WalletDetailModalProps) => {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          onClose();
        }
      },
    })
  ).current;

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFillObject}>
             <View style={styles.modalOverlay} />
          </View>
        </TouchableWithoutFeedback>
        
        <View style={[styles.modalContent, { height: '80%' }]}>
          <View style={styles.modalHeader} {...panResponder.panHandlers}>
            <View style={styles.modalIndicator} />
          </View>
          
          <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 24, paddingHorizontal: 24 }}>
             {/* Logo */}
             <View style={{ marginBottom: 16 }}>
               {wallet?.type === 'Bitcoin' ? (
                 <BitcoinIcon width={64} height={64} />
               ) : wallet?.type === 'Ethereum' || wallet?.type === 'Sepolia' ? (
                 <EthIcon width={64} height={64} />
               ) : wallet?.type === 'Lisk' || wallet?.type === 'Lisk Sepolia' ? (
                 <LiskIcon width={64} height={64} />
               ) : wallet?.type === 'Solana' ? (
                 <SolanaIcon width={64} height={64} />
               ) : wallet?.type === 'Polygon' ? (
                 <PolygonIcon width={64} height={64} />
               ) : wallet?.type === 'BNB Chain' ? (
                 <BnbIcon width={64} height={64} />
               ) : (
                 <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 32 }}>?</Text>
                 </View>
               )}
             </View>

             {/* Chain Name */}
             <Text style={{ fontFamily: FONTS.displayBold, fontSize: 24, color: '#000', marginBottom: 8 }}>
               {wallet?.type}
             </Text>

             {/* Balance */}
             <Text style={{ fontFamily: FONTS.displayBold, fontSize: 36, color: COLORS.primary, marginBottom: 32, textAlign: 'center' }}>
                {balance || '0.00'}
             </Text>

             {/* Address Section */}
             <View style={{ width: '100%', backgroundColor: '#f5f5f5', padding: 16 }}>
                <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 12, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>
                  Wallet Address
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: FONTS.bodyRegular, fontSize: 14, color: '#000', flex: 1, marginRight: 12 }}>
                    {wallet?.address}
                  </Text>
                  <TouchableOpacity 
                    style={{ padding: 8, backgroundColor: '#fff', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
                    onPress={() => copyToClipboard(wallet?.address)}
                  >
                    <Copy size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
             </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    height: '80%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    width: '100%',
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
});
