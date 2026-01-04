import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Linking, Platform } from 'react-native';
import { ArrowLeft, ChevronRight, FileText, Shield, Twitter, Facebook, Instagram, Video } from 'lucide-react-native';
import { COLORS, FONTS } from '../../lib/theme';

interface AboutMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
}

const AboutMenuItem = ({ icon, label, onPress, showChevron = true }: AboutMenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuContent}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    {showChevron && <ChevronRight size={20} color="#C7C7CC" />}
  </TouchableOpacity>
);

export default function AboutScreen({ navigation }: any) {
  
  const openLink = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Legal</Text>
        </View>
        <View style={styles.section}>
          <AboutMenuItem 
            icon={<Shield size={22} color={COLORS.primary} />} 
            label="Privacy Policy" 
            onPress={() => openLink('https://vloo.com/privacy')} // Placeholder URL
          />
          <AboutMenuItem 
            icon={<FileText size={22} color={COLORS.primary} />} 
            label="Terms of Service" 
            onPress={() => openLink('https://vloo.com/terms')} // Placeholder URL
          />
        </View>

        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Follow Us</Text>
        </View>
        <View style={styles.section}>
          <AboutMenuItem 
            icon={<Twitter size={22} color="#000" />} 
            label="X (Twitter)" 
            onPress={() => openLink('https://twitter.com/vloo')} 
          />
          <AboutMenuItem 
            icon={<Facebook size={22} color="#1877F2" />} 
            label="Facebook" 
            onPress={() => openLink('https://facebook.com/vloo')} 
          />
          <AboutMenuItem 
            icon={<Instagram size={22} color="#E4405F" />} 
            label="Instagram" 
            onPress={() => openLink('https://instagram.com/vloo')} 
          />
          <AboutMenuItem 
            icon={<Video size={22} color="#000" />} // Using Video icon for TikTok as placeholder if specific icon missing
            label="TikTok" 
            onPress={() => openLink('https://tiktok.com/@vloo')} 
          />
        </View>

        <View style={styles.footer}>
           <Text style={styles.copyrightText}>© 2024 Vloo. All rights reserved.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.select({ android: 40, ios: 12 }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#000',
  },
  scrollContent: {
    paddingVertical: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
  },
  sectionTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: '#000',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  copyrightText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#999',
  },
});
