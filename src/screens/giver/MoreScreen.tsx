import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, Platform } from 'react-native';
import { 
  CreditCard, 
  Settings, 
  BookOpen, 
  HelpCircle, 
  Mail, 
  Star, 
  Info, 
  ChevronRight 
} from 'lucide-react-native';
import { COLORS, FONTS } from '../../lib/theme';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

const MenuItem = ({ icon, label, onPress }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuIconContainer}>
      {icon}
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
    <ChevronRight size={20} color="#C7C7CC" />
  </TouchableOpacity>
);

interface MoreScreenProps {
  onNavigate: (screen: string) => void;
}

export const MoreScreen = ({ onNavigate }: MoreScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <MenuItem 
            icon={<CreditCard size={22} color={COLORS.primary} />} 
            label="Buy Vloo Card" 
            onPress={() => onNavigate('buy_card')} 
          />
          <MenuItem 
            icon={<Settings size={22} color={COLORS.primary} />} 
            label="Setting" 
            onPress={() => onNavigate('settings')} 
          />
        </View>

        <View style={styles.section}>
          <MenuItem 
            icon={<BookOpen size={22} color={COLORS.primary} />} 
            label="New User Guide" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon={<HelpCircle size={22} color={COLORS.primary} />} 
            label="FAQ" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon={<Mail size={22} color={COLORS.primary} />} 
            label="Contact Us" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.section}>
          <MenuItem 
            icon={<Star size={22} color={COLORS.primary} />} 
            label="Rate Us" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon={<Info size={22} color={COLORS.primary} />} 
            label="About" 
            onPress={() => onNavigate('about')} 
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS grouped background style
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingTop: Platform.select({ android: 60, ios: 16 }),
  },
  headerTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#000',
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 100,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#000',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  versionText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#8E8E93',
  },
});
