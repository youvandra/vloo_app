import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { Bell } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../lib/theme';

interface DashboardHeaderProps {
  balance?: string;
}

export const DashboardHeader = ({ balance = '$0.00' }: DashboardHeaderProps) => {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.label}>Total Balance</Text>
        <Text style={styles.balance}>{balance}</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton}>
          <Bell color="#000" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: Platform.select({ android: 60, ios: 0 }),
    paddingHorizontal: 24,
  },
  label: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balance: {
    fontFamily: FONTS.displayBold,
    fontSize: 32,
    color: '#000',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
