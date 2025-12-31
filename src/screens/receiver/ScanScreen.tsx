
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, StatusBar, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { ArrowLeft, Scan, XCircle } from 'lucide-react-native';

export default function ReceiverScanScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Waiting for card...');
  const [manualCardId, setManualCardId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (mock: boolean = false) => {
    setError(null);
    if (!mock && !manualCardId.trim()) {
       setError('Please enter a Card ID or tap simulate.');
       return;
    }

    setLoading(true);
    setStatus('Reading card...');

    try {
      // 1. Get NFC ID (Mock or Real)
      let cardId = mock ? 'simulated-real-id' : manualCardId.trim();

      // 2. Fetch VLOO Data
      setStatus('Fetching VLOO status...');
      
      const { data: cardData, error: cardError } = await supabase
        .from('verified_cards')
        .select('vloo_id, vloos(id, status, message, unlock_date, receiver_name, wallet_address)')
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

      if (cardData?.vloos?.id) {
        // Increment scan count
        await supabase.rpc('increment_vloo_scan_count', { 
          p_vloo_id: cardData.vloos.id 
        });
      }

      navigation.navigate('ReceiverClaim', { vloo: cardData.vloos });

    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Failed to scan card');
      setStatus('Scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <ArrowLeft color="#000" size={24} />
              </TouchableOpacity>
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>SCAN VLOO</Text>
              </View>
            </View>
            
            <View style={styles.content}>
              {error ? (
                 <View style={styles.errorContainer}>
                   <XCircle color={COLORS.error} size={64} />
                   <Text style={styles.errorTitle}>Scan Failed</Text>
                   <Text style={styles.errorMessage}>{error}</Text>
                   <Button 
                     title="Try Again" 
                     onPress={() => setError(null)} 
                     variant="primary"
                     style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                   />
                 </View>
              ) : (
                <>
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
                      <View style={styles.inputContainer}>
                         <Text style={styles.inputLabel}>MANUAL CARD ID</Text>
                         <TextInput
                            style={styles.input}
                            placeholder="Enter Card ID"
                            placeholderTextColor="#999"
                            value={manualCardId}
                            onChangeText={setManualCardId}
                            autoCapitalize="none"
                            autoCorrect={false}
                         />
                      </View>
    
                      <Button 
                        title="Check Card" 
                        onPress={() => handleScan(false)} 
                        variant="primary"
                        style={[styles.actionButton, { backgroundColor: '#000', marginBottom: 12 }]}
                      />
    
                      <Button 
                        title="Tap to Simulate Scan (Dev)" 
                        onPress={() => handleScan(true)} 
                        variant="primary"
                        style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                      />
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  brandBadgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#000',
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
    color: '#000',
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
    color: '#666',
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
    color: '#000',
  },
  actionContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  inputLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#666',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: FONTS.bodyRegular,
    color: '#000',
    backgroundColor: '#f9f9f9',
  },
  actionButton: {
    width: '100%',
    height: 56,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    width: '100%',
  },
  errorTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: COLORS.error,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
});
