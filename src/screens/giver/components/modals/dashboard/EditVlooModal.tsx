import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, TextInput, Platform, StyleSheet, KeyboardAvoidingView, ActivityIndicator, ScrollView } from 'react-native';
import { X, Calendar, Trash2 } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../../lib/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

interface EditVlooModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  vloo: any;
  editVlooMessage: string;
  setEditVlooMessage: (message: string) => void;
  editVlooDate: Date | null;
  setEditVlooDate: (date: Date | null) => void;
  isSaving: boolean;
}

export const EditVlooModal = ({
  visible,
  onClose,
  onSave,
  onDelete,
  vloo,
  editVlooMessage,
  setEditVlooMessage,
  editVlooDate,
  setEditVlooDate,
  isSaving
}: EditVlooModalProps) => {
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
                <Text style={styles.modalTitle}>Edit Vloo</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Message"
                  placeholderTextColor="#999"
                  value={editVlooMessage}
                  onChangeText={setEditVlooMessage}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Unlock Date</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(!showDatePicker)}
                >
                  <Text style={[styles.dateText, !editVlooDate && { color: '#999' }]}>
                    {editVlooDate ? editVlooDate.toLocaleDateString() : 'Set Date'}
                  </Text>
                  <Calendar size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <View style={Platform.OS === 'ios' && styles.datePickerContainer}>
                  <DateTimePicker
                    value={editVlooDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') {
                        setShowDatePicker(false);
                      }
                      if (selectedDate) {
                        setEditVlooDate(selectedDate);
                      }
                    }}
                    minimumDate={new Date()}
                    textColor="#000"
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity 
                      style={styles.datePickerDoneButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.datePickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <TouchableOpacity 
                style={[styles.primaryButton, !editVlooMessage && { opacity: 0.5 }]}
                onPress={onSave}
                disabled={!editVlooMessage || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Save Changes</Text>
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
  modalBody: {
    padding: 24,
    paddingBottom: 40,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#000',
  },
  closeButton: {
    padding: 4,
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
    borderRadius: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
  },
  dateText: {
    fontSize: 16,
    fontFamily: FONTS.bodyRegular,
    color: '#000',
  },
  datePickerContainer: {
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    overflow: 'hidden',
  },
  datePickerDoneButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  datePickerDoneText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: COLORS.primary,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
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
