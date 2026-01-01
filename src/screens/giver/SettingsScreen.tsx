import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { ChevronLeft, Fingerprint } from 'lucide-react-native';
import { COLORS, FONTS } from '../../lib/theme';

interface SettingsScreenProps {
  onBack: () => void;
  faceIdEnabled: boolean;
  faceIdSupported: boolean;
  onToggleFaceId: () => void;
}

export const SettingsScreen = ({
  onBack,
  faceIdEnabled,
  faceIdSupported,
  onToggleFaceId
}: SettingsScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Security Section */}
        <Text style={styles.sectionTitle}>Security</Text>
        
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={onToggleFaceId}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#E8F2FF' }]}>
              <Fingerprint size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.settingLabel}>Face ID Lock</Text>
          </View>
          <View style={[
            styles.toggle, 
            faceIdEnabled ? { backgroundColor: COLORS.primary } : { backgroundColor: '#E5E5EA' }
          ]}>
            <View style={[
              styles.toggleKnob, 
              faceIdEnabled ? { transform: [{ translateX: 20 }] } : { transform: [{ translateX: 2 }] }
            ]} />
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#000',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#000',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#000',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFF0F0',
    borderRadius: 16,
    gap: 8,
  },
  logoutText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#FF3B30',
  },
});
