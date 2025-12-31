import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  StatusBar, 
  Dimensions 
} from 'react-native';
import { COLORS, FONTS } from '../../lib/theme';
import { ChevronLeft, ChevronRight, Bell, Plus, Calendar as CalendarIcon } from 'lucide-react-native';
import { CreateReminderModal } from './components/modals/calendar/CreateReminderModal';

const { width } = Dimensions.get('window');
const CELL_WIDTH = (width - 48) / 7;

interface Reminder {
  id: string;
  title: string;
  amount?: string;
  date: Date;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const CalendarScreen = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Fund Birthday Card',
      amount: '50',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2) // 2 days from now
    },
    {
      id: '2',
      title: 'Monthly Savings',
      amount: '100',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 15) // 15th of this month
    }
  ]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
    
    const days = [];
    
    // Previous month padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1);
    setCurrentMonth(newDate);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const hasReminder = (date: Date) => {
    return reminders.some(r => isSameDay(r.date, date));
  };

  const handleCreateReminder = (newReminder: { title: string; amount: string; date: Date }) => {
    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      amount: newReminder.amount,
      date: newReminder.date
    };
    setReminders([...reminders, reminder]);
    setSelectedDate(newReminder.date); // Switch to the date of the new reminder
  };

  const selectedDateReminders = reminders.filter(r => isSameDay(r.date, selectedDate));

  const renderDay = ({ item }: { item: Date | null }) => {
    if (!item) {
      return <View style={{ width: CELL_WIDTH, height: CELL_WIDTH }} />;
    }

    const isSelected = isSameDay(item, selectedDate);
    const isToday = isSameDay(item, new Date());
    const hasDot = hasReminder(item);

    return (
      <TouchableOpacity 
        style={[
          styles.dayCell, 
          isSelected && styles.selectedDayCell,
          isToday && !isSelected && styles.todayCell
        ]}
        onPress={() => setSelectedDate(item)}
      >
        <Text style={[
          styles.dayText, 
          isSelected && styles.selectedDayText,
          isToday && !isSelected && styles.todayText
        ]}>
          {item.getDate()}
        </Text>
        {hasDot && (
          <View style={[styles.dot, isSelected && styles.selectedDot]} />
        )}
      </TouchableOpacity>
    );
  };

  const renderReminderItem = ({ item }: { item: Reminder }) => (
    <View style={styles.reminderCard}>
      <View style={styles.reminderIcon}>
        <Bell size={20} color={COLORS.primary} />
      </View>
      <View style={styles.reminderInfo}>
        <Text style={styles.reminderTitle}>{item.title}</Text>
        <Text style={styles.reminderTime}>All Day</Text>
      </View>
      {item.amount ? (
        <Text style={styles.reminderAmount}>${item.amount}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton}>
          <ChevronRight size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Weekdays */}
      <View style={styles.weekdays}>
        {WEEKDAYS.map((day, index) => (
          <View key={index} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        <FlatList
          data={days}
          renderItem={renderDay}
          keyExtractor={(item, index) => index.toString()}
          numColumns={7}
          contentContainerStyle={styles.calendarGrid}
          scrollEnabled={false}
        />
      </View>

      {/* Reminders List */}
      <View style={styles.remindersContainer}>
        <View style={styles.remindersHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            <Text style={styles.reminderCount}>
              {selectedDateReminders.length} {selectedDateReminders.length === 1 ? 'Reminder' : 'Reminders'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.addReminderButton}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.addReminderText}>Add Reminder</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={selectedDateReminders}
          renderItem={renderReminderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.remindersList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <CalendarIcon size={40} color="#ddd" />
              <Text style={styles.emptyStateText}>No reminders for this day</Text>
              <TouchableOpacity 
                style={styles.addReminderLink}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.addReminderLinkText}>Set a reminder</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      <CreateReminderModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreateReminder}
        initialDate={selectedDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  arrowButton: {
    padding: 8,
  },
  monthTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: '#000',
  },
  weekdays: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  weekdayCell: {
    width: CELL_WIDTH,
    alignItems: 'center',
  },
  weekdayText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#999',
  },
  calendarContainer: {
    paddingHorizontal: 24,
  },
  calendarGrid: {
    // 
  },
  dayCell: {
    width: CELL_WIDTH,
    height: CELL_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: CELL_WIDTH / 2,
  },
  selectedDayCell: {
    backgroundColor: COLORS.primary,
  },
  todayCell: {
    backgroundColor: '#f0f0f0',
  },
  dayText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#000',
  },
  selectedDayText: {
    color: '#fff',
    fontFamily: FONTS.bodyBold,
  },
  todayText: {
    color: COLORS.primary,
    fontFamily: FONTS.bodyBold,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    position: 'absolute',
    bottom: 8,
  },
  selectedDot: {
    backgroundColor: '#fff',
  },
  remindersContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 24,
    padding: 24,
    paddingBottom: 0, // FAB space handled by FlatList contentContainerStyle usually, but here container padding
  },
  remindersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#000',
    marginBottom: 4,
  },
  reminderCount: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#666',
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(52,152,219,0.1)',
  },
  addReminderText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.primary,
  },
  remindersList: {
    paddingBottom: 100, // Space for FAB
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#000',
  },
  reminderTime: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
  },
  reminderAmount: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#999',
    marginVertical: 12,
  },
  addReminderLink: {
    padding: 8,
  },
  addReminderLinkText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 24, // Inside container
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100, // Ensure it's on top
  },
});
