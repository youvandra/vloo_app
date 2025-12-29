import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, TextInput, Platform, StyleSheet, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { X, ArrowLeft, ScanLine, Keyboard } from 'lucide-react-native';
import { COLORS, FONTS as THEME_FONTS } from '../../../../lib/theme';

// Fallback theme
const FONTS = THEME_FONTS || {
  displayBlack: 'MuseoModerno_900Black',
  displayBold: 'MuseoModerno_700Bold',
  displaySemiBold: 'MuseoModerno_600SemiBold',
  bodyRegular: 'BeVietnamPro_400Regular',
  bodySemiBold: 'BeVietnamPro_600SemiBold',
  bodyBold: 'BeVietnamPro_700Bold',
};

interface ScanVlooModalProps {
  visible: boolean;
  onClose: () => void;
  onBack: () => void;
  onBind: (cardId: string) => void;
  isBinding: boolean;
}

export const ScanVlooModal = ({
  visible,
  onClose,
  onBack,
  onBind,
  isBinding
}: ScanVlooModalProps) => {
  const [manualId, setManualId] = useState('');
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');

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

  const handleScan = () => {
    // Simulate scanning
    // In real app, this would trigger NFC manager
    const simulatedId = 'vloo-card-' + Math.floor(Math.random() * 1000000);
    onBind(simulatedId);
  };

  const handleManualSubmit = () => {
    if (manualId.trim()) {
      onBind(manualId.trim());
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
                <Text style={styles.modalTitle}>Bind Card</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <Text style={styles.stepIndicator}>Step 3 of 3</Text>

              <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, mode === 'scan' && styles.activeTab]}
                    onPress={() => setMode('scan')}
                >
                    <ScanLine size={20} color={mode === 'scan' ? COLORS.primary : '#999'} />
                    <Text style={[styles.tabText, mode === 'scan' && styles.activeTabText]}>Tap Card</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, mode === 'manual' && styles.activeTab]}
                    onPress={() => setMode('manual')}
                >
                    <Keyboard size={20} color={mode === 'manual' ? COLORS.primary : '#999'} />
                    <Text style={[styles.tabText, mode === 'manual' && styles.activeTabText]}>Manual Input</Text>
                </TouchableOpacity>
              </View>

              {mode === 'scan' ? (
                <View style={styles.scanContainer}>
                    <View style={styles.scanIconContainer}>
                        <ScanLine size={64} color={COLORS.primary} />
                    </View>
                    <Text style={styles.scanTitle}>Ready to Scan</Text>
                    <Text style={styles.scanDescription}>
                        Hold your Vloo card near the top of your phone to bind it.
                    </Text>
                    
                    <TouchableOpacity 
                        style={styles.scanButton}
                        onPress={handleScan}
                        disabled={isBinding}
                    >
                        {isBinding ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Simulate Tap</Text>
                        )}
                    </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.manualContainer}>
                    <Text style={styles.inputLabel}>Enter Card ID</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. VLOO-1234-5678"
                        placeholderTextColor="#999"
                        value={manualId}
                        onChangeText={setManualId}
                        autoCapitalize="characters"
                    />
                    <Text style={styles.helperText}>
                        You can find the ID printed on the back of your Vloo card.
                    </Text>

                    <TouchableOpacity 
                        style={[styles.primaryButton, !manualId && { opacity: 0.5 }]}
                        onPress={handleManualSubmit}
                        disabled={!manualId || isBinding}
                    >
                        {isBinding ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Bind Card</Text>
                        )}
                    </TouchableOpacity>
                </View>
              )}
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  scanContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  scanIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scanTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: '#000',
    marginBottom: 8,
  },
  scanDescription: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  manualContainer: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.bodyRegular,
    color: '#000',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  helperText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 'auto',
    borderRadius: 8,
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
