import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../lib/theme';

interface DashboardHeaderProps {
  user: any;
  onProfilePress: () => void;
}

export const DashboardHeader = ({ user, onProfilePress }: DashboardHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <TouchableOpacity onPress={onProfilePress}>
          <Image 
            source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?u=giver' }} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.greeting}>
            Hello <Text style={{ color: COLORS.accent }}>{user?.user_metadata?.full_name?.split(' ')[0] || 'Giver'}</Text>,
          </Text>
        </View>
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
    marginTop: 10,
    paddingHorizontal: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#eee',
  },
  greeting: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
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
