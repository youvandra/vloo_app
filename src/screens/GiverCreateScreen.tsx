
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, FONTS } from '../lib/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function GiverCreateScreen({ navigation }: any) {
  const [purpose, setPurpose] = useState('Gift');
  const [message, setMessage] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [unlockDate, setUnlockDate] = useState(new Date());

  const handleNext = () => {
    if (!message || !passphrase) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    navigation.navigate('GiverBind', { purpose, message, passphrase, unlockDate: unlockDate.toISOString() });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create VLOO</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Card style={styles.formCard}>
            <Text style={styles.sectionLabel}>Purpose</Text>
            <View style={styles.pillContainer}>
              {['Gift', 'Salary', 'Inheritance'].map(p => (
                <TouchableOpacity 
                  key={p} 
                  style={[styles.pill, purpose === p && styles.pillActive]} 
                  onPress={() => setPurpose(p)}
                >
                  <Text style={[styles.pillText, purpose === p && styles.pillTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input 
              label="Message"
              placeholder="A short message for the receiver..." 
              value={message} 
              onChangeText={setMessage} 
              multiline 
              numberOfLines={3}
              style={{ height: 100, textAlignVertical: 'top' }}
            />

            <Input 
              label="Passphrase"
              placeholder="Enter a secret passphrase" 
              value={passphrase} 
              onChangeText={setPassphrase} 
              secureTextEntry 
            />
            <Text style={styles.hint}>This passphrase will be used to encrypt the key. Don't lose it!</Text>

            <Text style={styles.sectionLabel}>Unlock Date</Text>
            <Text style={styles.dateDisplay}>Defaults to: Now + 1 min (MVP)</Text>

            <View style={{ marginTop: 20 }}>
              <Button title="Next Step" onPress={handleNext} variant="primary" />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scroll: { padding: 24 },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  sectionLabel: { 
    fontFamily: FONTS.bodyBold, 
    fontSize: 16, 
    marginBottom: 12, 
    color: COLORS.foreground 
  },
  pillContainer: { flexDirection: 'row', marginBottom: 24, flexWrap: 'wrap', gap: 10 },
  pill: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 999, 
    backgroundColor: 'rgba(255,255,255,0.5)', 
    borderWidth: 1, 
    borderColor: 'transparent' 
  },
  pillActive: { 
    backgroundColor: COLORS.primary,
  },
  pillText: { fontFamily: FONTS.bodySemiBold, color: COLORS.foreground },
  pillTextActive: { color: COLORS.inverse },
  hint: { 
    fontFamily: FONTS.bodyRegular, 
    fontSize: 12, 
    color: '#666', 
    marginTop: -10, 
    marginBottom: 20 
  },
  dateDisplay: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: COLORS.foreground,
    marginBottom: 20,
  }
});
