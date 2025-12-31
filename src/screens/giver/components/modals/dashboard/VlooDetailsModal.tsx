import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, StyleSheet, ScrollView, Image } from 'react-native';
import { X, Edit2, Wallet } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../../lib/theme';
import BitcoinIcon from '../../../../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../../../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../../../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../../../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../../../../assets/icons/chains/bnb.svg';
import LiskIcon from '../../../../../assets/icons/chains/lisk.svg';

interface VlooDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  vloo: any;
  onEditPress: () => void;
}

export const VlooDetailsModal = ({
  visible,
  onClose,
  vloo,
  onEditPress,
}: VlooDetailsModalProps) => {

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

  if (!vloo) return null;

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

    if (addresses.length === 0) return [];

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

  const boundWallets = getWalletAddresses(vloo.wallet_address);

  const renderChainIcon = (type: string) => {
    switch (type) {
        case 'Bitcoin': return <BitcoinIcon width={32} height={32} />;
        case 'Ethereum':
        case 'Sepolia': return <EthIcon width={32} height={32} />;
        case 'Lisk':
        case 'Lisk Sepolia': return <LiskIcon width={32} height={32} />;
        case 'Solana': return <SolanaIcon width={32} height={32} />;
        case 'Polygon': return <PolygonIcon width={32} height={32} />;
        case 'BNB Chain': return <BnbIcon width={32} height={32} />;
        default: return <Wallet size={32} color="#666" />;
    }
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

          <ScrollView contentContainerStyle={styles.modalBody}>
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalTitle}>Vloo Details</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                 <TouchableOpacity onPress={() => { onClose(); onEditPress(); }} style={styles.iconButton}>
                    <Edit2 size={24} color="#000" />
                 </TouchableOpacity>
                 <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                    <X size={24} color="#000" />
                 </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoSection}>
               <Text style={styles.label}>Recipient</Text>
               <Text style={styles.value}>{vloo.receiver_name || 'VLOO Gift'}</Text>
            </View>

            <View style={styles.infoSection}>
               <Text style={styles.label}>Unlock Date</Text>
               <Text style={styles.value}>
                 {vloo.unlock_date ? new Date(vloo.unlock_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Whenever'}
               </Text>
            </View>

            <View style={styles.assetsSection}>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={styles.sectionTitle}>Assets Bound</Text>
               </View>

               <View style={styles.walletList}>
                  {boundWallets.length > 0 ? (
                      boundWallets.map((wallet: any, index: number) => (
                          <View key={index} style={styles.walletItem}>
                              {renderChainIcon(wallet.type)}
                              <Text style={styles.walletType}>{wallet.type}</Text>
                          </View>
                      ))
                  ) : (
                      <Text style={{ color: '#999', fontFamily: FONTS.bodyRegular }}>No assets bound yet.</Text>
                  )}
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
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
  modalBody: {
    padding: 24,
    paddingBottom: 40,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#000',
  },
  iconButton: {
    padding: 4,
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
  value: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 18,
    color: '#000',
  },
  assetsSection: {
    marginTop: 12,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#000',
  },
  walletList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  walletType: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#000',
  },
});
