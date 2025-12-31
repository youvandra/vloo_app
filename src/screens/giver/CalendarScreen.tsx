import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  StatusBar, 
  Dimensions,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { COLORS, FONTS } from '../../lib/theme';
import { ChevronLeft, ChevronRight, Bell, Plus, Calendar as CalendarIcon, MoreVertical, Edit2, Trash2 } from 'lucide-react-native';
import { CreateReminderModal } from './components/modals/calendar/CreateReminderModal';
import { MonthYearPickerModal } from './components/modals/calendar/MonthYearPickerModal';
import { ReminderDetailsModal } from './components/modals/calendar/ReminderDetailsModal';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const CELL_WIDTH = (width - 48) / 7;
const INFO_MAX_WIDTH = Math.max(160, width - 216);

interface Reminder {
  id: string;
  title: string;
  amount?: string;
  coin?: string;
  date: Date;
  cardAmounts?: Record<string, { amount: string; coin: string }>;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarScreenProps {
  vloos?: any[];
  onCardPress?: (vloo: any) => void;
}

export const CalendarScreen = ({ vloos = [], onCardPress }: CalendarScreenProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [allRemindersVisible, setAllRemindersVisible] = useState(false);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [actionMenuReminder, setActionMenuReminder] = useState<Reminder | null>(null);
  
  const remindersByDate = useMemo(() => {
    const groups: Record<string, Reminder[]> = {};
    reminders.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    // sort each group by title
    Object.keys(groups).forEach(k => {
      groups[k].sort((a, b) => a.title.localeCompare(b.title));
    });
    return groups;
  }, [reminders]);
  
  const formatDateLabel = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const [reminderToEdit, setReminderToEdit] = useState<Reminder | null>(null);

  const fetchReminders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_calendar')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const formattedReminders: Reminder[] = data.map((item: any) => {
          // Calculate total amount and display coin logic
          const amounts = Object.values(item.card_amounts || {}) as { amount: string; coin: string }[];
          const totalAmount = amounts.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
          const coins = new Set(amounts.map(a => a.coin));
          const displayCoin = coins.size === 1 ? amounts[0]?.coin : (coins.size > 1 ? 'Mixed' : '');

          return {
            id: item.id,
            title: item.title,
            amount: totalAmount > 0 ? totalAmount.toString() : undefined,
            coin: displayCoin,
            date: new Date(item.date),
            cardAmounts: item.card_amounts
          };
        });
        setReminders(formattedReminders);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

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

  const handleMonthSelect = (date: Date) => {
    setCurrentMonth(date);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const hasReminder = (date: Date) => {
    return reminders.some(r => isSameDay(r.date, date));
  };

  const handleCreateReminder = async (newReminder: { title: string; date: Date; cardAmounts: Record<string, { amount: string; coin: string }>, id?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to set a reminder');
        return;
      }

      if (newReminder.id) {
        // Update existing reminder
        const { error } = await supabase
          .from('user_calendar')
          .update({
            title: newReminder.title,
            date: newReminder.date.toISOString(),
            card_amounts: newReminder.cardAmounts
          })
          .eq('id', newReminder.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new reminder
        const { error } = await supabase
          .from('user_calendar')
          .insert({
            user_id: user.id,
            title: newReminder.title,
            date: newReminder.date.toISOString(),
            card_amounts: newReminder.cardAmounts
          });

        if (error) throw error;
      }

      // Refresh list
      fetchReminders();
      setSelectedDate(newReminder.date);
      setReminderToEdit(null); // Reset edit state
    } catch (error: any) {
      console.error('Error saving reminder:', error);
      Alert.alert('Error', error.message || 'Failed to save reminder');
    }
  };

  const handleDeleteReminder = (reminderId: string) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('user_calendar')
                .delete()
                .eq('id', reminderId);
                
              if (error) throw error;
              
              setDetailsModalVisible(false);
              fetchReminders();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete reminder');
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleEditReminder = (reminder: Reminder) => {
    setDetailsModalVisible(false);
    setReminderToEdit(reminder);
    setModalVisible(true);
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

  const renderReminderItem = ({ item }: { item: Reminder }) => {
    const cardCount = item.cardAmounts ? Object.keys(item.cardAmounts).length : 0;
    const cardCountText = `${cardCount} CARD${cardCount !== 1 ? 'S' : ''} REMINDING`;

     return (
       <TouchableOpacity 
         style={styles.reminderCard}
         onPress={() => {
           setSelectedReminder(item);
           setDetailsModalVisible(true);
         }}
       >
         <View style={styles.reminderIcon}>
           <Bell size={20} color={COLORS.primary} />
         </View>
         <View style={styles.reminderInfo}>
           <Text style={styles.reminderTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
           <Text style={styles.reminderLabel}>{cardCountText}</Text>
         </View>
         <View style={styles.reminderActions}>
           <TouchableOpacity 
             onPress={() => {
               setActionMenuReminder(item);
               setActionMenuVisible(true);
             }} 
             style={styles.actionButton}
           >
             <MoreVertical size={16} color="#666" />
           </TouchableOpacity>
         </View>
       </TouchableOpacity>
     );
   };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.allRemindersWrapper}>
        <TouchableOpacity 
          style={styles.allRemindersButton}
          onPress={() => setAllRemindersVisible(true)}
        >
          <View style={styles.allRemindersContent}>
            <CalendarIcon size={16} color={COLORS.primary} />
            <Text style={styles.allRemindersText}>All Reminders</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMonthPickerVisible(true)}>
          <Text style={styles.monthTitle}>
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
        </TouchableOpacity>
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
              {selectedDate.toLocaleDateString('default', { weekday: 'short', month: 'long', day: 'numeric' })}
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
        onClose={() => {
          setModalVisible(false);
          setReminderToEdit(null);
        }}
        onCreate={handleCreateReminder}
        initialDate={selectedDate}
        cards={vloos}
        reminderToEdit={reminderToEdit}
      />
      
      <MonthYearPickerModal
        visible={monthPickerVisible}
        onClose={() => setMonthPickerVisible(false)}
        onSelect={handleMonthSelect}
        initialDate={currentMonth}
      />

      <Modal
        visible={allRemindersVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAllRemindersVisible(false)}
      >
        <View style={styles.allModalRoot}>
          <TouchableWithoutFeedback onPress={() => setAllRemindersVisible(false)}>
            <View style={styles.allModalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.allModalSheet}>
            <View style={styles.allModalHeader}>
              <Text style={styles.allModalTitle}>All Reminders</Text>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
              {Object.keys(remindersByDate)
                .sort((a, b) => {
                  // sort by actual date
                  const [ay, am, ad] = a.split('-').map(Number);
                  const [by, bm, bd] = b.split('-').map(Number);
                  return new Date(ay, am - 1, ad).getTime() - new Date(by, bm - 1, bd).getTime();
                })
                    .map(key => (
                      <View style={styles.groupContainer} key={key}>
                        <TouchableOpacity
                          onPress={() => {
                            const [y, m, d] = key.split('-').map(Number);
                            const target = new Date(y, m - 1, d);
                            setCurrentMonth(new Date(y, m - 1, 1));
                            setSelectedDate(target);
                            setAllRemindersVisible(false);
                          }}
                        >
                          <Text style={styles.groupDateHeader}>{formatDateLabel(key)}</Text>
                        </TouchableOpacity>
                        {remindersByDate[key].map(rem => (
                          <TouchableOpacity
                            key={rem.id}
                            style={styles.nameItem}
                            onPress={() => {
                          setAllRemindersVisible(false);
                          setSelectedReminder(rem);
                          setDetailsModalVisible(true);
                        }}
                      >
                        <Text style={styles.nameItemText} numberOfLines={1} ellipsizeMode="tail">
                          {rem.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ReminderDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        reminder={selectedReminder}
        vloos={vloos}
        onCardPress={(vloo) => {
          if (onCardPress) {
            onCardPress(vloo);
          }
        }}
        onEdit={handleEditReminder}
        onDelete={handleDeleteReminder}
      />
      
      <Modal
        visible={actionMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setActionMenuVisible(false);
          setActionMenuReminder(null);
        }}
      >
        <View style={styles.actionsModalRoot}>
          <TouchableWithoutFeedback onPress={() => {
            setActionMenuVisible(false);
            setActionMenuReminder(null);
          }}>
            <View style={styles.actionsModalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.actionsModalSheet}>
          <View style={styles.actionsModalHeader}>
              <Text style={styles.actionsModalTitle}>{actionMenuReminder?.title || 'Actions'}</Text>
            </View>
            <View style={{ paddingHorizontal: 24, paddingVertical: 8 }}>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => {
                  if (actionMenuReminder) handleEditReminder(actionMenuReminder);
                  setActionMenuVisible(false);
                  setActionMenuReminder(null);
                }}
              >
                <Text style={styles.actionRowText}>Edit</Text>
                <Edit2 size={16} color="#000" />
              </TouchableOpacity>
              <View style={styles.actionDivider} />
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => {
                  if (actionMenuReminder) handleDeleteReminder(actionMenuReminder.id);
                  setActionMenuVisible(false);
                  setActionMenuReminder(null);
                }}
              >
                <Text style={[styles.actionRowText, { color: COLORS.error || '#FF3B30' }]}>Delete</Text>
                <Trash2 size={16} color={COLORS.error || '#FF3B30'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 12,
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
    marginBottom: 12,
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
    marginBottom: 12,
  },
  allRemindersWrapper: {
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 12,
  },
  allRemindersButton: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  allRemindersContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allRemindersText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.primary,
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
  allModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  allModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  allModalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingTop: 16,
    paddingBottom: 24,
  },
  allModalHeader: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  allModalTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#000',
  },
  groupContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  groupDateHeader: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  nameItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  nameItemText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#000',
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 8,
    paddingTop: 16,
  },
  remindersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 24,
    paddingBottom: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reminderInfo: {
    flex: 1,
    marginRight: 12,
    maxWidth: INFO_MAX_WIDTH,
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  reminderLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
  },
  reminderTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  reminderAmount: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#000',
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
  actionsModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  actionsModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  actionsModalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  actionsModalHeader: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionsModalTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#000',
  },
  actionRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionRowText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#000',
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});
