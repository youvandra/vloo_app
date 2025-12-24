
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Dimensions, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { ArrowLeft, Gift } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

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
  const [receiverName, setReceiverName] = useState('');
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
    if (!receiverName || !message || !passphrase) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    navigation.navigate('GiverBind', { purpose, receiverName, message, passphrase, unlockDate: unlockDate.toISOString() });
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header - Matches ReceiverScanScreen/ClaimScreen */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>CREATE VLOO</Text>
          </View>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <View style={styles.iconContainer}>
              <Gift color={COLORS.accent} size={60} />
            </View>
            <Text style={styles.headline}>
              Send <Text style={styles.headlineHighlight}>Value</Text>
            </Text>
            <Text style={styles.subheadline}>
              Create a digital gift card that unlocks at a future date.
            </Text>

            <View style={styles.formSection}>
              {/* Purpose Selection */}
              <Text style={styles.inputLabel}>PURPOSE</Text>
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

              {/* Receiver Name */}
              <Text style={styles.inputLabel}>RECEIVER NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter receiver's name"
                placeholderTextColor="#666"
                value={receiverName}
                onChangeText={setReceiverName}
              />

              {/* Message */}
              <Text style={styles.inputLabel}>MESSAGE</Text>
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="A short message for the receiver..."
                placeholderTextColor="#666"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
              />

              {/* Passphrase */}
              <Text style={styles.inputLabel}>PASSPHRASE</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a secret passphrase"
                placeholderTextColor="#666"
                value={passphrase}
                onChangeText={setPassphrase}
                secureTextEntry
              />
              <Text style={styles.hint}>This passphrase will be used to encrypt the key. Don't lose it!</Text>

              {/* Unlock Date */}
              <Text style={styles.inputLabel}>UNLOCK DATE</Text>
              {Platform.OS === 'ios' ? (
                <View style={styles.datePickerContainerIOS}>
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={unlockDate}
                    mode="datetime"
                    display="compact"
                    themeVariant="dark"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) setUnlockDate(selectedDate);
                    }}
                    minimumDate={new Date()}
                    style={{ alignSelf: 'flex-start' }}
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
                    />
                  )}
                </>
              )}

              <View style={{ marginTop: 40 }}>
                <Button 
                  title="Next Step" 
                  onPress={handleNext} 
                  variant="primary" 
                  gradient={['#d199f9', '#9F60D1']}
                  style={styles.actionButton}
                />
              </View>
            </View>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  headline: {
    fontFamily: FONTS.displayBold,
    fontSize: 32,
    color: '#fff',
    lineHeight: 40,
    marginBottom: 8,
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
    marginBottom: 32,
  },
  formSection: {
    width: '100%',
  },
  inputLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    fontFamily: FONTS.bodyRegular,
    marginBottom: 24,
  },
  pillContainer: { 
    flexDirection: 'row', 
    marginBottom: 24, 
    flexWrap: 'wrap', 
    gap: 10 
  },
  pill: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 999, 
    backgroundColor: '#111', 
    borderWidth: 1, 
    borderColor: '#333' 
  },
  pillActive: { 
    backgroundColor: 'rgba(209, 153, 249, 0.2)', // Tinted accent
    borderColor: COLORS.accent,
  },
  pillText: { 
    fontFamily: FONTS.bodySemiBold, 
    color: '#666' 
  },
  pillTextActive: { 
    color: COLORS.accent 
  },
  hint: { 
    fontFamily: FONTS.bodyRegular, 
    fontSize: 12, 
    color: '#666', 
    marginTop: -16, 
    marginBottom: 24,
    marginLeft: 4,
  },
  dateButton: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 24,
  },
  dateButtonText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#fff',
  },
  datePickerContainerIOS: {
    backgroundColor: '#111',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  actionButton: {
    width: '100%',
    height: 56,
  },
});
