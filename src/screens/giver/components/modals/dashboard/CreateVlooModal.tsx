import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, TextInput, Platform, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import { X, Calendar, HelpCircle, ArrowLeft } from 'lucide-react-native';
import { COLORS, FONTS as THEME_FONTS } from '../../../../../lib/theme';

// Fallback in case import fails (fix for ReferenceError)
const FONTS = THEME_FONTS || {
  displayBlack: 'MuseoModerno_900Black',
  displayBold: 'MuseoModerno_700Bold',
  displaySemiBold: 'MuseoModerno_600SemiBold',
  bodyRegular: 'BeVietnamPro_400Regular',
  bodySemiBold: 'BeVietnamPro_600SemiBold',
  bodyBold: 'BeVietnamPro_700Bold',
};

interface CreateVlooModalProps {
  visible: boolean;
  onClose: () => void;
  onBack?: () => void;
  onNext: () => void;
  passphrase: string;
  setPassphrase: (passphrase: string) => void;
  isLoading?: boolean;
  title?: string;
  buttonText?: string;
}

export const CreateVlooModal = ({
  visible,
  onClose,
  onBack,
  onNext,
  passphrase,
  setPassphrase,
  isLoading = false,
  title = "Create New Vloo",
  buttonText = "Create Vloo"
}: CreateVlooModalProps) => {

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
      animationType="fade"
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
            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.modalTitleRow}>
                {onBack ? (
                  <TouchableOpacity onPress={onBack} style={styles.closeButton}>
                    <ArrowLeft size={24} color="#000" />
                  </TouchableOpacity>
                ) : <View style={{width: 40}} />}
                
                <Text style={styles.modalTitle}>{title}</Text>
                
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <Text style={styles.stepIndicator}>Step 2 of 2</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Passphrase (for key generation) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter a secret passphrase"
                  placeholderTextColor="#999"
                  value={passphrase}
                  onChangeText={setPassphrase}
                  secureTextEntry={true}
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity 
                style={[
                  styles.primaryButton, 
                  (!passphrase || isLoading) && { opacity: 0.5 }
                ]}
                onPress={onNext}
                disabled={!passphrase || isLoading}
              >
                <Text style={styles.primaryButtonText}>{isLoading ? 'Processing...' : buttonText}</Text>
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
    height: '80%',
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
  modalBody: {
    padding: 24,
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
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 999,
  },
  stepIndicator: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.accent,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#eee',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dateText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#000',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  datePickerDoneButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  datePickerDoneText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: COLORS.primary,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  primaryButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#fff',
  },
});
