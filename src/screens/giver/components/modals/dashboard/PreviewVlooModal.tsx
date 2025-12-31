import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, StyleSheet, ScrollView, Image } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../../lib/theme';

interface PreviewVlooModalProps {
  visible: boolean;
  onClose: () => void;
  vloo: any;
  giverName?: string;
  giverAvatar?: string;
}

export const PreviewVlooModal = ({
  visible,
  onClose,
  vloo,
  giverName,
  giverAvatar
}: PreviewVlooModalProps) => {

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

  if (!vloo) return null;

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

        <View style={[styles.modalContent, { height: '80%' }]}>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalTitle}>Message Preview</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.messageSection}>
              <View style={styles.avatarWrapper}>
                {giverAvatar ? (
                  <Image source={{ uri: giverAvatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#666' }}>
                      {giverName ? giverName.charAt(0).toUpperCase() : 'G'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.giverName}>{giverName || 'Giver'}</Text>
              <Text style={styles.messageText}>"{vloo.message || 'No message provided'}"</Text>
            </View>

          </ScrollView>
        </View>
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
  messageSection: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  avatarWrapper: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  giverName: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#666',
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  messageText: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 28,
    color: '#000',
    textAlign: 'center',
    lineHeight: 36,
  },
});
