
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={COLORS.foreground} size={24} />
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
            />
          )}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 24, 
    paddingBottom: 20, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backButton: { marginRight: 16 },
  headerTitle: { 
    fontFamily: FONTS.displayBold, 
    fontSize: 28, 
    color: COLORS.foreground 
  },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { alignItems: 'center', paddingVertical: 40 },
  iconContainer: { 
    marginBottom: 20, 
    padding: 20, 
    backgroundColor: 'rgba(11, 28, 196, 0.1)', 
    borderRadius: 50 
  },
  title: { 
    fontFamily: FONTS.displayBold, 
    fontSize: 24, 
    color: COLORS.foreground, 
    marginBottom: 10 
  },
  subtitle: { 
    fontFamily: FONTS.bodyRegular, 
    fontSize: 16, 
    textAlign: 'center', 
    color: COLORS.foreground, 
    marginBottom: 30,
    opacity: 0.7
  },
  loader: { alignItems: 'center', marginTop: 20 },
  status: { 
    marginTop: 10, 
    color: COLORS.foreground, 
    fontFamily: FONTS.bodySemiBold 
  }
});
