
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Card } from '../../components/Card';
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan VLOO</Text>
        </View>
        
        <View style={styles.content}>
          <Card style={styles.card}>
            <View style={styles.iconContainer}>
              <Scan color={COLORS.primary} size={60} />
            </View>
            
            <Text style={styles.title}>Tap to Receive</Text>
            <Text style={styles.subtitle}>
              Hold your VLOO card near the phone to check its status and claim your gift.
            </Text>
            
            {loading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.status}>{status}</Text>
              </View>
            ) : (
              <Button 
                title="Tap to Simulate Scan (Dev)" 
                onPress={() => handleScan(true)} 
                variant="primary"
                style={{ marginTop: 20, width: '100%' }}
                gradient={['#d199f9', '#9F60D1']}
              />
            )}
          </Card>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#fff',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#111',
    borderColor: '#333',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(11, 28, 196, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loader: {
    marginTop: 20,
    alignItems: 'center',
  },
  status: {
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.accent,
    marginTop: 12,
  }
});
