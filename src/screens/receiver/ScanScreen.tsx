
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { ArrowLeft, Scan } from 'lucide-react-native';

export default function ReceiverScanScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Waiting for card...');

  const handleScan = async (mock: boolean = false) => {
    setLoading(true);
    setStatus('Reading card...');

    try {
      // 1. Get NFC ID (Mock or Real)
      let cardId = '';
      if (mock) {
        // In a real scenario, this would come from the NFC tag
        // For MVP, we'll try to fetch a known card or just simulate one
        cardId = 'simulated-real-id'; 
      }

      // 2. Fetch VLOO Data
      setStatus('Fetching VLOO status...');
      
      const { data: cardData, error: cardError } = await supabase
        .from('cards')
        .select('vloo_id, vloos(*)')
        .eq('id', cardId)
        .single();

      if (cardError || !cardData) {
        // Fallback for demo if no card found
        if (mock) {
            // Demo fallback
            navigation.navigate('ReceiverClaim', { 
                vloo: {
                    id: 'demo-id',
                    status: 'locked',
                    message: 'Happy Birthday! Here is your gift.',
                    unlock_date: new Date().toISOString(),
                    encrypted_private_key: 'demo-key'
                }
            });
            return;
        }
        throw new Error('Card not found or not bound to a VLOO');
      }

      navigation.navigate('ReceiverClaim', { vloo: cardData.vloos });

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to scan card');
      setStatus('Scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>SCAN VLOO</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Scan color={COLORS.accent} size={80} />
          </View>
          
          <View style={styles.textWrapper}>
            <Text style={styles.headline}>
              Tap to <Text style={styles.headlineHighlight}>Receive</Text>
            </Text>
            <Text style={styles.subheadline}>
              Hold your VLOO card near the phone to check its status and claim your gift.
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.statusText}>{status}</Text>
            </View>
          ) : (
            <View style={styles.actionContainer}>
              <Button 
                title="Tap to Simulate Scan (Dev)" 
                onPress={() => handleScan(true)} 
                variant="primary"
                gradient={['#d199f9', '#9F60D1']}
                style={styles.actionButton}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandBadgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#fff',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  textWrapper: {
    marginBottom: 48,
  },
  headline: {
    fontFamily: FONTS.displayBold,
    fontSize: 32,
    color: '#fff',
    lineHeight: 40,
    marginBottom: 16,
    textAlign: 'center',
  },
  headlineHighlight: {
    color: COLORS.accent,
  },
  subheadline: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 280,
    alignSelf: 'center',
  },
  loader: {
    alignItems: 'center',
    gap: 16,
  },
  statusText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: '#fff',
  },
  actionContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  actionButton: {
    width: '100%',
    height: 56,
  },
});
