import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, TextInput, Platform, StyleSheet, KeyboardAvoidingView, ActivityIndicator, Image, ScrollView } from 'react-native';
import { X, LogOut, Camera } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../../lib/theme';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: any;
  onSave: () => void;
  isSaving: boolean;
  editName: string;
  setEditName: (name: string) => void;
  editAvatarUrl: string;
  setEditAvatarUrl: (url: string) => void;
  onSignOut: () => void;
}

export const EditProfileModal = ({
  visible,
  onClose,
  user,
  onSave,
  isSaving,
  editName,
  setEditName,
  editAvatarUrl,
  setEditAvatarUrl,
  onSignOut
}: EditProfileModalProps) => {

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
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <View style={{ position: 'relative' }}>
                  <Image 
                    source={{ uri: editAvatarUrl || 'https://i.pravatar.cc/150?u=giver' }} 
                    style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0f0f0' }} 
                  />
                  <TouchableOpacity style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#000', padding: 8, borderRadius: 20 }}>
                    <Camera size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#999"
                  value={editName}
                  onChangeText={setEditName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: '#eee', color: '#666' }]}
                  value={user?.email}
                  editable={false}
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryButton, !editName && { opacity: 0.5 }]}
                onPress={onSave}
                disabled={!editName || isSaving}
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
