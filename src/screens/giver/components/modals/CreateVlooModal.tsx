import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, TextInput, Platform, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { X, Calendar } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../../lib/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CreateVlooModalProps {
  visible: boolean;
  onClose: () => void;
  onNext: () => void;
  newVlooName: string;
  setNewVlooName: (name: string) => void;
  newVlooUnlockDate: Date | null;
  setNewVlooUnlockDate: (date: Date | null) => void;
}

export const CreateVlooModal = ({
  visible,
  onClose,
  onNext,
  newVlooName,
  setNewVlooName,
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
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.modalContent, { height: 'auto', minHeight: 500 }]}>
          <View style={styles.modalHeader} {...panResponder.panHandlers}>
            <View style={styles.modalIndicator} />
          </View>

          <View style={styles.modalBody}>
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalTitle}>Create New Vloo</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.stepIndicator}>Step 1 of 2</Text>

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
              <Text style={styles.inputLabel}>When should it unlock? (Optional)</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateText, !newVlooUnlockDate && { color: '#999' }]}>
                  {newVlooUnlockDate ? newVlooUnlockDate.toLocaleDateString() : 'Select Date'}
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
    height: '80%',
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
    borderRadius: 16,
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
    borderRadius: 16,
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
    borderRadius: 16,
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
