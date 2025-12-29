import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, TextInput, Platform, StyleSheet, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { X, ArrowLeft, Check } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../lib/theme';
import BitcoinIcon from '../../../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../../../assets/icons/chains/bnb.svg';
import LiskIcon from '../../../../assets/icons/chains/lisk.svg';

interface BindVlooModalProps {
  visible: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  selectedBindWallets: any[];
  setSelectedBindWallets: (wallets: any[]) => void;
  wallets: any[];
  balances: Record<string, string>;
  isCreating: boolean;
  newVlooName: string;
  newVlooUnlockDate: Date | null;
}

export const BindVlooModal = ({
  visible,
  onClose,
  onBack,
  onNext,
  selectedBindWallets,
  setSelectedBindWallets,
  wallets,
  balances,
  isCreating,
  newVlooName,
  newVlooUnlockDate
}: BindVlooModalProps) => {

  const toggleWallet = (wallet: any) => {
    const isSelected = selectedBindWallets.some((w: any) => w.address === wallet.address && w.type === wallet.type);
    if (isSelected) {
      setSelectedBindWallets(selectedBindWallets.filter((w: any) => !(w.address === wallet.address && w.type === wallet.type)));
    } else {
      setSelectedBindWallets([...selectedBindWallets, wallet]);
    }
  };

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

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: '100%', height: '80%' }}
        >
          <View style={[styles.modalContent, { height: '100%' }]}>
            <View style={styles.modalHeader} {...panResponder.panHandlers}>
              <View style={styles.modalIndicator} />
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.modalTitleRow}>
                <TouchableOpacity onPress={onBack} style={styles.closeButton}>
                  <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Bind Assets</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <Text style={styles.stepIndicator}>Step 2 of 3</Text>

              <Text style={styles.summaryText}>
                Creating <Text style={{ fontFamily: FONTS.bodyBold }}>{newVlooName}</Text>
                {newVlooUnlockDate && ` • Unlocks ${newVlooUnlockDate.toLocaleDateString()}`}
              </Text>

              <View style={styles.sectionContainer}>
                <Text style={styles.sectionLabel}>Select Wallet to Bind</Text>
                <View style={styles.walletListContainer}>
                  {wallets.map((wallet: any, index: number) => {
                    const isSelected = selectedBindWallets.some((w: any) => w.address === wallet.address && w.type === wallet.type);
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.walletOption,
                          isSelected && styles.walletOptionSelected
                        ]}
                        onPress={() => toggleWallet(wallet)}
                      >
                        <View style={styles.walletOptionIcon}>
                          {wallet.type === 'Bitcoin' ? (
                            <BitcoinIcon width={24} height={24} />
                          ) : wallet.type === 'Ethereum' || wallet.type === 'Sepolia' ? (
                            <EthIcon width={24} height={24} />
                          ) : wallet.type === 'Lisk' || wallet.type === 'Lisk Sepolia' ? (
                            <LiskIcon width={24} height={24} />
                          ) : wallet.type === 'Solana' ? (
                            <SolanaIcon width={24} height={24} />
                          ) : wallet.type === 'Polygon' ? (
                            <PolygonIcon width={24} height={24} />
                          ) : wallet.type === 'BNB Chain' ? (
                            <BnbIcon width={24} height={24} />
                          ) : (
                            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#eee' }} />
                          )}
                        </View>
                        <View>
                          <Text style={styles.walletOptionType}>{wallet.type}</Text>
                        </View>
                        {isSelected && (
                          <View style={styles.checkIcon}>
                            <Check size={12} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ flex: 1 }} />

              <TouchableOpacity 
                style={[styles.primaryButton, selectedBindWallets.length === 0 && { opacity: 0.5 }]}
                onPress={onNext}
                disabled={selectedBindWallets.length === 0 || isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Next</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    flex: 1,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  stepIndicator: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  summaryText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
  },
  walletListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12, // For modern React Native
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingRight: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    width: '48%', // Show 2 per row
    borderRadius: 16,
  },
  walletOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(52, 152, 219, 0.05)',
  },
  walletOptionIcon: {
    marginRight: 12,
  },
  walletOptionType: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: '#000',
  },
  walletOptionBalance: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 10,
    color: '#666',
  },
  checkIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    borderRadius: 999,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#fff',
  },
});
