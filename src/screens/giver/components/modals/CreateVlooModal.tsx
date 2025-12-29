import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, TextInput, Platform, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import { X, Calendar } from 'lucide-react-native';
import { COLORS, FONTS as THEME_FONTS } from '../../../../lib/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  onNext: () => void;
  newVlooName: string;
  setNewVlooName: (name: string) => void;
  message: string;
  setMessage: (message: string) => void;
  passphrase: string;
  setPassphrase: (passphrase: string) => void;
  newVlooUnlockDate: Date | null;
  setNewVlooUnlockDate: (date: Date | null) => void;
}

export const CreateVlooModal = ({
  visible,
  onClose,
  onNext,
  newVlooName,
  setNewVlooName,
  message,
  setMessage,
  passphrase,
  setPassphrase,
  newVlooUnlockDate,
  setNewVlooUnlockDate
}: CreateVlooModalProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

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
                <Text style={styles.modalTitle}>Create New Vloo</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <Text style={styles.stepIndicator}>Step 1 of 3</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Who is this for?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alice's Birthday"
                  placeholderTextColor="#999"
                  value={newVlooName}
                  onChangeText={setNewVlooName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Write a heartfelt message..."
                  placeholderTextColor="#999"
                  value={message}
                  onChangeText={setMessage}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Passphrase (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Secure your Vloo"
                  placeholderTextColor="#999"
                  value={passphrase}
                  onChangeText={setPassphrase}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Unlock Date</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.dateText, !newVlooUnlockDate && { color: '#999' }]}>
                    {newVlooUnlockDate ? newVlooUnlockDate.toLocaleDateString() : 'Set Date'}
                  </Text>
                  <Calendar size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={newVlooUnlockDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setNewVlooUnlockDate(selectedDate);
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}

              <TouchableOpacity 
                style={[styles.primaryButton, !newVlooName && { opacity: 0.5 }]}
                onPress={onNext}
                disabled={!newVlooName}
              >
                <Text style={styles.primaryButtonText}>Next</Text>
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
    marginBottom: 32,
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
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.bodyRegular,
    color: '#000',
    backgroundColor: '#f9f9f9',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    fontFamily: FONTS.bodyRegular,
    color: '#000',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
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
