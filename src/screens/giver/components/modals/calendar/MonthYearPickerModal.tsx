import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../../lib/theme';

interface MonthYearPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate: Date;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 
  'May', 'June', 'July', 'August', 
  'September', 'October', 'November', 'December'
];

export const MonthYearPickerModal = ({ 
  visible, 
  onClose, 
  onSelect, 
  initialDate 
}: MonthYearPickerModalProps) => {
  const [year, setYear] = useState(initialDate.getFullYear());

  useEffect(() => {
    if (visible) {
      setYear(initialDate.getFullYear());
    }
  }, [visible, initialDate]);

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(year, monthIndex, 1);
    onSelect(newDate);
    onClose();
  };

  const changeYear = (increment: number) => {
    setYear(prev => prev + increment);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Select Date</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={styles.yearSelector}>
                <TouchableOpacity onPress={() => changeYear(-1)} style={styles.arrowButton}>
                  <ChevronLeft size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.yearText}>{year}</Text>
                <TouchableOpacity onPress={() => changeYear(1)} style={styles.arrowButton}>
                  <ChevronRight size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.monthsGrid}>
                {MONTHS.map((month, index) => {
                  const isSelected = 
                    year === initialDate.getFullYear() && 
                    index === initialDate.getMonth();

                  return (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.monthCell,
                        isSelected && styles.selectedMonthCell
                      ]}
                      onPress={() => handleMonthSelect(index)}
                    >
                      <Text style={[
                        styles.monthText,
                        isSelected && styles.selectedMonthText
                      ]}>
                        {month.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  arrowButton: {
    padding: 8,
    backgroundColor: 'rgba(52,152,219,0.1)',
    borderRadius: 12,
  },
  yearText: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: COLORS.primary,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  monthCell: {
    width: '30%', // Approx 3 columns
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  selectedMonthCell: {
    backgroundColor: COLORS.primary,
  },
  monthText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#000',
  },
  selectedMonthText: {
    color: '#fff',
  },
});
