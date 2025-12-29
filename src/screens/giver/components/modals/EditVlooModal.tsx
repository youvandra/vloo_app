import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, TextInput, Platform, StyleSheet, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { X, Calendar, Trash2 } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../../lib/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

interface EditVlooModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  vloo: any;
  editVlooName: string;
  setEditVlooName: (name: string) => void;
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
  editVlooName,
  setEditVlooName,
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
              <Text style={styles.modalTitle}>Edit Vloo</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Recipient Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#999"
                value={editVlooName}
                onChangeText={setEditVlooName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Unlock Date</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateText, !editVlooDate && { color: '#999' }]}>
                  {editVlooDate ? editVlooDate.toLocaleDateString() : 'Set Date'}
                </Text>
                <Calendar size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={editVlooDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setEditVlooDate(selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            <TouchableOpacity 
              style={[styles.primaryButton, !editVlooName && { opacity: 0.5 }]}
              onPress={onSave}
              disabled={!editVlooName || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={onDelete}
            >
               <Trash2 size={20} color="#FF3B30" />
               <Text style={styles.deleteButtonText}>Delete Vloo</Text>
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
    marginTop: 8,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 16,
    gap: 8,
  },
  deleteButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#FF3B30',
  },
});
