
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { CheckCircle } from 'lucide-react-native';

export default function GiverSuccessScreen({ route, navigation }: any) {
  const { cardId } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle color={COLORS.accent} size={80} />
        </View>

        <Text style={styles.title}>VLOO Created!</Text>
        <Text style={styles.subtitle}>
          The card is now bound successfully.
        </Text>
        
        <View style={styles.idContainer}>
          <Text style={styles.idLabel}>CARD ID</Text>
          <Text style={styles.idValue}>{cardId}</Text>
        </View>

        <Button 
          title="Done" 
          onPress={() => navigation.navigate('GiverDashboard')} 
          variant="primary"
          gradient={['#d199f9', '#9F60D1']}
          style={styles.doneButton}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
  },
  content: { 
    flex: 1, 
    padding: 24, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  iconContainer: { 
    marginBottom: 32,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { 
    fontFamily: FONTS.displayBold, 
    fontSize: 32, 
    color: '#fff', 
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: { 
    fontFamily: FONTS.bodyRegular, 
    fontSize: 16, 
    color: '#999', 
    textAlign: 'center', 
    marginBottom: 48,
    maxWidth: 280,
  },
  idContainer: {
    backgroundColor: '#111',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    marginBottom: 48,
  },
  idLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    letterSpacing: 1,
  },
  idValue: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1,
  },
  doneButton: { 
    width: '100%', 
    height: 56,
  }
});
