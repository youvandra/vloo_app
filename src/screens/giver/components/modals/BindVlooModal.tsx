import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, TextInput, Platform, StyleSheet, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { X, ArrowLeft, Check } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../../lib/theme';
import BitcoinIcon from '../../../../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../../../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../../../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../../../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../../../../assets/icons/chains/bnb.svg';
import LiskIcon from '../../../../../assets/icons/chains/lisk.svg';

interface BindVlooModalProps {
  visible: boolean;
  onClose: () => void;
  onBack: () => void;
  onCreate: () => void;
  selectedBindWallet: any;
  setSelectedBindWallet: (wallet: any) => void;
  bindAmount: string;
  setBindAmount: (amount: string) => void;
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
  onCreate,
  selectedBindWallet,
  setSelectedBindWallet,
  bindAmount,
  setBindAmount,
  wallets,
  balances,
  isCreating,
  newVlooName,
  newVlooUnlockDate
}: BindVlooModalProps) => {

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
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.modalContent, { height: '90%' }]}>
          <View style={styles.modalHeader} {...panResponder.panHandlers}>
            <View style={styles.modalIndicator} />
          </View>

          <View style={styles.modalBody}>
            <View style={styles.modalTitleRow}>
              <TouchableOpacity onPress={onBack} style={styles.closeButton}>
                <ArrowLeft size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Bind Assets</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.stepIndicator}>Step 2 of 2</Text>

            <Text style={styles.summaryText}>
              Creating <Text style={{ fontFamily: FONTS.bodyBold }}>{newVlooName}</Text>
              {newVlooUnlockDate && ` • Unlocks ${newVlooUnlockDate.toLocaleDateString()}`}
            </Text>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>Select Wallet to Bind</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingVertical: 8 }}
              >
                {wallets.map((wallet: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.walletOption,
                      selectedBindWallet?.address === wallet.address && selectedBindWallet?.type === wallet.type && styles.walletOptionSelected
                    ]}
                    onPress={() => setSelectedBindWallet(wallet)}
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
                      <Text style={styles.walletOptionBalance}>
                        {balances[`${wallet.type}-${wallet.address}`] || '0.00'}
                      </Text>
                    </View>
                    {selectedBindWallet?.address === wallet.address && selectedBindWallet?.type === wallet.type && (
                      <View style={styles.checkIcon}>
                        <Check size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount to Bind</Text>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  value={bindAmount}
                  onChangeText={setBindAmount}
                />
                <Text style={styles.currencyLabel}>
                  {selectedBindWallet ? 
                    (selectedBindWallet.type === 'Bitcoin' ? 'BTC' : 
                     selectedBindWallet.type === 'Solana' ? 'SOL' : 
                     'ETH') 
                    : 'ETH'}
                </Text>
              </View>
              <Text style={styles.helperText}>
                Funds will be locked in the smart contract until the unlock date.
              </Text>
            </View>

            <View style={{ flex: 1 }} />

            <TouchableOpacity 
              style={[styles.primaryButton, (!selectedBindWallet || !bindAmount) && { opacity: 0.5 }]}
              onPress={onCreate}
              disabled={!selectedBindWallet || !bindAmount || isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Create & Bind Vloo</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
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
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingRight: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
    minWidth: 140,
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
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 16,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 24,
    fontFamily: FONTS.displayBold,
    color: '#000',
  },
  currencyLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#999',
    marginLeft: 8,
  },
  helperText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
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
