import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Home, Target, Calendar } from 'lucide-react-native';
import { COLORS } from '../../../lib/theme';

const { width } = Dimensions.get('window');

interface BottomNavigationProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

export const BottomNavigation = ({ activeTab = 'home', onTabPress = () => {} }: BottomNavigationProps) => {
  return (
    <View style={styles.bottomNavContainer}>
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={activeTab === 'home' ? styles.navItemActive : styles.navItem}
          onPress={() => onTabPress('home')}
        >
          {activeTab === 'home' ? (
             <View style={[styles.navIconActive, { backgroundColor: '#fff' }]}>
               <Home size={20} color="#000" />
             </View>
          ) : (
             <Home size={20} color="#fff" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={activeTab === 'goals' ? styles.navItemActive : styles.navItem}
          onPress={() => onTabPress('goals')}
        >
           {activeTab === 'goals' ? (
             <View style={[styles.navIconActive, { backgroundColor: '#fff' }]}>
               <Target size={20} color="#000" />
             </View>
          ) : (
             <Target size={20} color="#fff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={activeTab === 'calendar' ? styles.navItemActive : styles.navItem}
          onPress={() => onTabPress('calendar')}
        >
           {activeTab === 'calendar' ? (
             <View style={[styles.navIconActive, { backgroundColor: '#fff' }]}>
               <Calendar size={20} color="#000" />
             </View>
          ) : (
             <Calendar size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 32,
    width: width - 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  navItem: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  navItemActive: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconActive: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
