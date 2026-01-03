import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { ChevronLeft, Fingerprint, Banknote, Globe } from 'lucide-react-native';
import { COLORS, FONTS } from '../../lib/theme';

interface SettingsScreenProps {
  onBack: () => void;
  faceIdEnabled: boolean;
  faceIdSupported: boolean;
  onToggleFaceId: () => void;
  currency: 'IDR' | 'USD';
  setCurrency: (curr: 'IDR' | 'USD') => void;
  language: 'en' | 'id';
  setLanguage: (lang: 'en' | 'id') => void;
}

export const SettingsScreen = ({
  onBack,
  faceIdEnabled,
  faceIdSupported,
  onToggleFaceId,
  currency,
  setCurrency,
  language,
  setLanguage
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
        
        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>Preferences</Text>

        {/* Currency */}
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => setCurrency(currency === 'IDR' ? 'USD' : 'IDR')}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#E0F7FA' }]}>
              <Banknote size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.settingLabel}>Currency</Text>
          </View>
          <View style={styles.settingRight}>
             <Text style={styles.valueText}>{currency === 'IDR' ? 'Rupiah (IDR)' : 'Dollar (USD)'}</Text>
          </View>
        </TouchableOpacity>

        {/* Language */}
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => setLanguage(language === 'en' ? 'id' : 'en')}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
              <Globe size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.settingLabel}>Language</Text>
          </View>
           <View style={styles.settingRight}>
             <Text style={styles.valueText}>{language === 'en' ? 'English' : 'Indonesia'}</Text>
          </View>
        </TouchableOpacity>

        {/* Security Section */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Security</Text>
        
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
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#8E8E93',
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
