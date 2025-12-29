import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../../lib/theme';
import { Check, Copy, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Button } from '../../components/Button';

export default function ClaimSuccessScreen({ route, navigation }: any) {
  const { decryptedKeys } = route.params;

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard!`);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                <ArrowLeft color="#000" size={24} />
            </TouchableOpacity>
            <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>SUCCESS</Text>
            </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.successIconContainer}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={48} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.title}>VLOO Claimed!</Text>
          <Text style={styles.subtitle}>
            You have successfully unlocked your gift. Below are your private keys for different networks.
          </Text>
          
          <View style={styles.warningBox}>
             <Text style={styles.warningTitle}>⚠️ IMPORTANT SECURITY WARNING</Text>
             <Text style={styles.warningText}>
               These are your raw private keys. ANYONE with these keys can access your funds. 
               Copy them immediately to a secure wallet (like MetaMask, Phantom, or Trust Wallet) and 
               NEVER share them with anyone.
             </Text>
          </View>

          <View style={styles.keysContainer}>
            {decryptedKeys.map((item: any, index: number) => (
              <View key={index} style={styles.keyCard}>
                <View style={styles.keyHeader}>
                   <Text style={styles.keyLabel}>{item.label}</Text>
                   {/* Icon based on label could go here */}
                </View>
                <View style={styles.keyValueContainer}>
                   <Text style={styles.keyValue} numberOfLines={1} ellipsizeMode="middle">
                      {item.key}
                   </Text>
                </View>
                <TouchableOpacity 
                   style={styles.copyButton}
                   onPress={() => copyToClipboard(item.key, item.label)}
                >
                   <Copy size={16} color="#333" />
                   <Text style={styles.copyButtonText}>Copy Private Key</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Button 
            title="Done" 
            onPress={() => navigation.navigate('Home')}
            variant="primary"
            style={styles.doneButton}
          />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  brandBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E6F4EA', // Light green
    borderWidth: 1,
    borderColor: '#CEEAD6',
  },
  brandBadgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#1E8E3E', // Green text
    letterSpacing: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  successIconContainer: {
    marginVertical: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(52, 199, 89, 0.1)', // Light primary color
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 32,
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  warningBox: {
    width: '100%',
    backgroundColor: '#FFF4E5', // Light orange
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  warningTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#D84315', // Deep orange
    marginBottom: 8,
  },
  warningText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#BF360C',
    lineHeight: 20,
  },
  keysContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  keyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  keyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  keyLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#374151',
    textTransform: 'uppercase',
  },
  keyValueContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
  },
  keyValue: {
    fontFamily: 'Courier', // Monospace for keys
    fontSize: 14,
    color: '#666',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  copyButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#333',
  },
  doneButton: {
    width: '100%',
  },
});
