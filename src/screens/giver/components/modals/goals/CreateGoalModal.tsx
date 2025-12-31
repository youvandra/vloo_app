import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import { X, Calendar as CalendarIcon, DollarSign, Target } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../../lib/theme';

interface CreateGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (goal: { title: string; targetAmount: string; deadline: string }) => void;
}

export const CreateGoalModal = ({ visible, onClose, onCreate }: CreateGoalModalProps) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleCreate = () => {
    if (title && targetAmount) {
      onCreate({ title, targetAmount, deadline });
      setTitle('');
      setTargetAmount('');
      setDeadline('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.container}
            >
              <View style={styles.modalContent}>
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>New Goal</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <X size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Goal Title</Text>
                    <View style={styles.inputContainer}>
                      <Target size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. New Laptop, Charity"
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Target Amount ($)</Text>
                    <View style={styles.inputContainer}>
                      <DollarSign size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        value={targetAmount}
                        onChangeText={setTargetAmount}
                        keyboardType="numeric"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Target Date (Optional)</Text>
                    <View style={styles.inputContainer}>
                      <CalendarIcon size={20} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        value={deadline}
                        onChangeText={setDeadline}
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.createButton, (!title || !targetAmount) && styles.disabledButton]}
                    onPress={handleCreate}
                    disabled={!title || !targetAmount}
                  >
                    <Text style={styles.createButtonText}>Create Goal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#000',
    height: '100%',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  createButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#fff',
  },
});
