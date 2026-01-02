import React, { useRef } from 'react';
import { View, Text, Modal, TouchableWithoutFeedback, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import { X, Copy } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { COLORS, FONTS } from '../../../../../lib/theme';

interface WalletDetailModalProps {
  visible: boolean;
  onClose: () => void;
  wallet: any;
  price: number;
}

export const WalletDetailModal = ({ visible, onClose, wallet, price }: WalletDetailModalProps) => {
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

  if (!wallet) return null;

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(wallet.address);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  const getSymbol = (type: string) => {
    if (!type) return '';
    const lower = type.toLowerCase();
    if (lower.includes('bitcoin') || lower === 'btc') return 'BTC';
    if (lower.includes('ethereum') || lower === 'eth') return 'ETH';
    if (lower.includes('solana') || lower === 'sol') return 'SOL';
    if (lower.includes('polygon') || lower === 'pol' || lower === 'matic') return 'POL';
    if (lower.includes('bnb')) return 'BNB';
    if (lower.includes('lisk')) return 'LSK';
    return '';
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFillObject}>
             <View style={styles.backdrop} />
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.content} {...panResponder.panHandlers}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{wallet.type}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.qrContainer}>
             <QRCode value={wallet.address} size={200} />
          </View>

          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Address</Text>
            <TouchableOpacity style={styles.addressRow} onPress={copyToClipboard}>
              <Text style={styles.addressText}>{wallet.address}</Text>
              <Copy size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Current Price</Text>
            <Text style={styles.priceText}>1 {getSymbol(wallet.type)} ≈ {formatPrice(price)}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    minHeight: 450,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    alignSelf: 'center',
  },
  addressContainer: {
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  addressLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  addressText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13,
    color: '#000',
    flex: 1,
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 18,
    color: COLORS.primary,
  },
});
