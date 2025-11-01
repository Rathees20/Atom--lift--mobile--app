import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { AttendanceData, AttendanceStatus } from '../../types';

interface ViewAttendanceScreenProps {
  onBack: () => void;
}

const ViewAttendanceScreen: React.FC<ViewAttendanceScreenProps> = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mock attendance data
  const attendanceData: AttendanceData = {
    present: 0,
    absent: 0,
    weekOff: 0,
    publicHoliday: 0,
    halfDay: 0,
    onLeave: 0,
    presentOvertime: 0,
  };

  const attendanceStatuses: AttendanceStatus[] = [
    { label: 'Present', count: attendanceData.present, color: '#2ecc71' },
    { label: 'Absent', count: attendanceData.absent, color: '#e74c3c' },
    { label: 'Week Off', count: attendanceData.weekOff, color: '#3498db' },
    { label: 'Public Holiday', count: attendanceData.publicHoliday, color: '#95a5a6' },
    { label: 'Half Day', count: attendanceData.halfDay, color: '#1abc9c' },
    { label: 'On Leave', count: attendanceData.onLeave, color: '#16a085' },
    { label: 'Present Overtime', count: attendanceData.presentOvertime, color: '#f39c12' },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        date: prevMonthDay.getDate(),
        isCurrentMonth: false,
        fullDate: prevMonthDay,
      });
    }
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: new Date(year, month, day),
      });
    }
    
    // Add empty cells for days after the last day of the month
    const remainingCells = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDay.getDate(),
        isCurrentMonth: false,
        fullDate: nextMonthDay,
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SafeAreaView style={globalStyles.attendanceContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.attendanceHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.attendanceBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={globalStyles.attendanceTitle}>Soundahr</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={globalStyles.attendanceContent} showsVerticalScrollIndicator={false}>
        {/* Calendar Section */}
        <View style={globalStyles.attendanceCalendarCard}>
          {/* Calendar Navigation */}
          <View style={globalStyles.attendanceCalendarNav}>
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <Ionicons name="chevron-back" size={24} color="#2c3e50" />
            </TouchableOpacity>
            <Text style={globalStyles.attendanceMonthYear}>
              {formatMonthYear(currentDate)}
            </Text>
            <View style={globalStyles.attendanceNavRight}>
              <TouchableOpacity style={globalStyles.attendanceWeeksButton}>
                <Text style={globalStyles.attendanceWeeksButtonText}>2 weeks</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateMonth('next')}>
                <Ionicons name="chevron-forward" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Days of Week */}
          <View style={globalStyles.attendanceWeekDays}>
            {weekDays.map((day) => (
              <Text key={day} style={globalStyles.attendanceWeekDayText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={globalStyles.attendanceCalendarGrid}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  globalStyles.attendanceCalendarDay,
                  !day.isCurrentMonth && globalStyles.attendanceCalendarDayInactive,
                  selectedDate && 
                    day.fullDate.toDateString() === selectedDate.toDateString() && 
                    globalStyles.attendanceCalendarDaySelected
                ]}
                onPress={() => setSelectedDate(day.fullDate)}
              >
                <Text style={[
                  globalStyles.attendanceCalendarDayText,
                  !day.isCurrentMonth && globalStyles.attendanceCalendarDayTextInactive,
                  selectedDate && 
                    day.fullDate.toDateString() === selectedDate.toDateString() && 
                    globalStyles.attendanceCalendarDayTextSelected
                ]}>
                  {day.date}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Attendance Summary Section */}
        <View style={globalStyles.attendanceSummaryCard}>
          <Text style={globalStyles.attendanceSummaryTitle}>
            Graphical view of {formatMonthYear(currentDate)} Attendance
          </Text>
          
          {/* Legend */}
          <View style={globalStyles.attendanceLegend}>
            {attendanceStatuses.map((status, index) => (
              <View key={index} style={globalStyles.attendanceLegendItem}>
                <View style={[globalStyles.attendanceLegendCircle, { backgroundColor: status.color }]} />
                <Text style={globalStyles.attendanceLegendText}>{status.label}</Text>
                <Text style={globalStyles.attendanceLegendCount}>{status.count}</Text>
              </View>
            ))}
          </View>

          {/* Chart Placeholder */}
          <View style={globalStyles.attendanceChartContainer}>
            <View style={globalStyles.attendanceChartPlaceholder}>
              <Ionicons name="pie-chart-outline" size={60} color="#bdc3c7" />
              <Text style={globalStyles.attendanceChartPlaceholderText}>
                Attendance Chart
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewAttendanceScreen;
