
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

export default function GiverCreateScreen({ navigation }: any) {
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        Alert.alert('Session Expired', 'Please log in again.', [
          { text: 'OK', onPress: () => navigation.navigate('GiverLogin') }
        ]);
      }
    });
  }, []);

  const [purpose, setPurpose] = useState('Gift');
  const [message, setMessage] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [unlockDate, setUnlockDate] = useState(new Date(Date.now() + 60000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const current = new Date(unlockDate);
      current.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setUnlockDate(current);
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const onChangeTime = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      const current = new Date(unlockDate);
      current.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setUnlockDate(current);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleNext = () => {
    if (!message || !passphrase) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    navigation.navigate('GiverBind', { purpose, message, passphrase, unlockDate: unlockDate.toISOString() });
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create VLOO</Text>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                labelStyle={styles.label}
                placeholderTextColor="#666"
              />

              <Input 
                label="Passphrase"
                placeholder="Enter a secret passphrase" 
                value={passphrase} 
                onChangeText={setPassphrase} 
                secureTextEntry 
                style={styles.input}
                labelStyle={styles.label}
                placeholderTextColor="#666"
              />
              <Text style={styles.hint}>This passphrase will be used to encrypt the key. Don't lose it!</Text>

              <Text style={styles.sectionLabel}>Unlock Date</Text>
              
              {Platform.OS === 'ios' ? (
                <View style={{ alignItems: 'flex-start', marginTop: 8 }}>
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={unlockDate}
                    mode="datetime"
                    display="compact"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) setUnlockDate(selectedDate);
                    }}
                    minimumDate={new Date()}
                    style={{ alignSelf: 'flex-start' }}
                    themeVariant="dark"
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity onPress={showDatepicker} style={styles.dateButton}>
                    <Text style={styles.dateButtonText}>
                      {unlockDate.toLocaleString()}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={unlockDate}
                      mode="date"
                      is24Hour={true}
                      onChange={onChangeDate}
                      minimumDate={new Date()}
                      display="default"
                      themeVariant="dark"
                    />
                  )}

                  {showTimePicker && (
                    <DateTimePicker
                      testID="timePicker"
                      value={unlockDate}
                      mode="time"
                      is24Hour={true}
                      onChange={onChangeTime}
                      display="default"
                      themeVariant="dark"
                    />
                  )}
                </>
              )}

              <View style={{ marginTop: 20 }}>
                <Button 
                  title="Next Step" 
                  onPress={handleNext} 
                  variant="primary" 
                  gradient={['#d199f9', '#9F60D1']}
                />
              </View>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
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
  scroll: {
    padding: 24,
  },
  formCard: {
    backgroundColor: '#111',
    borderColor: '#333',
    padding: 24,
  },
  sectionLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pillContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#333',
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontFamily: FONTS.bodySemiBold,
    color: '#888',
  },
  pillTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#222',
    borderColor: '#444',
    color: '#fff',
  },
  label: {
    color: '#ccc',
  },
  hint: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
    marginTop: -10,
    marginBottom: 24,
  },
  dateButton: {
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    marginTop: 8,
    alignItems: 'center',
  },
  dateButtonText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#fff',
  },
  dateDisplay: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  }
});
