import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { AttendanceData, AttendanceStatus } from '../../types';
import { getAttendanceList, AttendanceRecord, fetchUserDetails, UserDetails } from '../utils/api';
import { formatTime } from '../utils/validation';

interface ViewAttendanceScreenProps {
  onBack: () => void;
}

const ViewAttendanceScreen: React.FC<ViewAttendanceScreenProps> = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  // Calculate attendance stats from fetched data
  const calculateAttendanceStats = (records: AttendanceRecord[]): AttendanceData => {
    const stats: AttendanceData = {
      present: 0,
      absent: 0,
      weekOff: 0,
      publicHoliday: 0,
      halfDay: 0,
      onLeave: 0,
      presentOvertime: 0,
    };

    records.forEach((record) => {
      if (record.is_checked_in && record.is_checked_out) {
        stats.present++;
        // Check if overtime (work duration > 8 hours, if available)
        if (record.work_duration && record.work_duration > 8 * 60) {
          stats.presentOvertime++;
        }
      } else if (record.is_checked_in && !record.is_checked_out) {
        stats.halfDay++; // Checked in but not out yet
      }
      // Note: Absent, Week Off, Public Holiday, On Leave would need additional backend fields
    });

    return stats;
  };

  const attendanceData = calculateAttendanceStats(attendanceRecords);

  const attendanceStatuses: AttendanceStatus[] = [
    { label: 'Present', count: attendanceData.present, color: '#2ecc71' },
    { label: 'Absent', count: attendanceData.absent, color: '#e74c3c' },
    { label: 'Week Off', count: attendanceData.weekOff, color: '#3498db' },
    { label: 'Public Holiday', count: attendanceData.publicHoliday, color: '#95a5a6' },
    { label: 'Half Day', count: attendanceData.halfDay, color: '#1abc9c' },
    { label: 'On Leave', count: attendanceData.onLeave, color: '#16a085' },
    { label: 'Present Overtime', count: attendanceData.presentOvertime, color: '#f39c12' },
  ];

  const totalAttendanceRecords = attendanceStatuses.reduce((sum, status) => sum + status.count, 0);
  const activeAttendanceStatuses = attendanceStatuses.filter((status) => status.count > 0);

  // Fetch attendance records for the selected month
  const fetchAttendanceRecords = async () => {
    try {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // getMonth() returns 0-11
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      
      // Get last day of month
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const response = await getAttendanceList({
        start_date: startDate,
        end_date: endDate,
      });

      setAttendanceRecords(response.results || []);
    } catch (error: any) {
      console.error('Error fetching attendance records:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to fetch attendance records',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, [currentDate]);

  // Fetch user details to display employee name
  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const details = await fetchUserDetails();
        setUserDetails(details);
      } catch (error) {
        console.error('Error fetching user details:', error);
        // Silently fail, component will show fallback
      }
    };

    loadUserDetails();
  }, []);

  // Get employee name with fallback logic (same as CustomDrawer)
  const getEmployeeName = (): string => {
    if (userDetails?.full_name) {
      return userDetails.full_name;
    }
    if (userDetails?.first_name && userDetails?.last_name) {
      return `${userDetails.first_name} ${userDetails.last_name}`.trim();
    }
    if (userDetails?.first_name) {
      return userDetails.first_name;
    }
    if (userDetails?.username) {
      return userDetails.username;
    }
    if (userDetails?.email) {
      return userDetails.email.split('@')[0];
    }
    return 'Employee';
  };

  const formatDateTime = (dateString: string | null, timeString: string | null): string => {
    if (!dateString && !timeString) return 'N/A';
    
    if (dateString && timeString) {
      try {
        const date = new Date(`${dateString}T${timeString}`);
        return date.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (e) {
        return `${dateString} ${timeString}`;
      }
    }
    
    if (dateString) {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      } catch (e) {
        return dateString;
      }
    }
    
    return timeString || 'N/A';
  };

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
    setSelectedDate(null); // Reset selected date when changing months
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
        <Text style={globalStyles.attendanceTitle}>{getEmployeeName()}</Text>
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

          {/* Chart */}
          <View style={globalStyles.attendanceChartContainer}>
            {totalAttendanceRecords > 0 && activeAttendanceStatuses.length > 0 ? (
              <View style={{
                backgroundColor: '#f0f4f7',
                padding: 16,
                borderRadius: 12,
              }}>
                <View style={{
                  flexDirection: 'row',
                  height: 26,
                  borderRadius: 13,
                  overflow: 'hidden',
                  backgroundColor: '#d6dde4',
                }}>
                  {activeAttendanceStatuses.map((status) => (
                    <View
                      key={status.label}
                      style={{
                        flex: status.count,
                        backgroundColor: status.color,
                      }}
                    />
                  ))}
                </View>

                <View style={{ marginTop: 16 }}>
                  {activeAttendanceStatuses.map((status) => {
                    const percentage = Math.round((status.count / totalAttendanceRecords) * 100);
                    return (
                      <View
                        key={`details-${status.label}`}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 3,
                              backgroundColor: status.color,
                              marginRight: 8,
                            }}
                          />
                          <Text style={{
                            fontSize: 13,
                            color: '#34495e',
                            fontWeight: '600',
                          }}>
                            {status.label}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 13, color: '#2c3e50', fontWeight: '600' }}>
                          {status.count} ({percentage}%)
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <Text style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: '#7f8c8d',
                  textAlign: 'right',
                }}>
                  Total records: {totalAttendanceRecords}
                </Text>
              </View>
            ) : (
              <View style={globalStyles.attendanceChartPlaceholder}>
                <Ionicons name="pie-chart-outline" size={60} color="#bdc3c7" />
                <Text style={globalStyles.attendanceChartPlaceholderText}>
                  Attendance data will appear once records are available
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Attendance Records List */}
        <View style={{
          backgroundColor: '#fff',
          marginHorizontal: 12,
          marginVertical: 12,
          padding: 16,
          borderRadius: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 16 }}>
            Attendance Records
          </Text>
          
          {isLoading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#3498db" />
              <Text style={{ marginTop: 10, color: '#666' }}>Loading records...</Text>
            </View>
          ) : attendanceRecords.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={48} color="#bdc3c7" />
              <Text style={{ marginTop: 10, color: '#95a5a6', textAlign: 'center' }}>
                No attendance records found for this month
              </Text>
            </View>
          ) : (
            attendanceRecords.map((record) => (
              <View
                key={record.id}
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: record.is_checked_in && record.is_checked_out ? '#27ae60' : '#f39c12',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#2c3e50' }}>
                    {record.check_in_date || 'N/A'}
                  </Text>
                  <View style={{
                    backgroundColor: record.is_checked_in && record.is_checked_out ? '#27ae60' : '#f39c12',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                  }}>
                    <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
                      {record.is_checked_in && record.is_checked_out ? 'Complete' : 'Pending'}
                    </Text>
                  </View>
                </View>
                
                {record.is_checked_in && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 4 }}>
                      ✓ Check-in
                    </Text>
                    <Text style={{ fontSize: 13, color: '#34495e', marginLeft: 8 }}>
                      Date: {record.check_in_date || 'N/A'}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#34495e', marginLeft: 8 }}>
                      Time: {formatTime(record.check_in_time)}
                    </Text>
                  </View>
                )}
                
                {record.is_checked_out && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 4 }}>
                      ✓ Check-out
                    </Text>
                    <Text style={{ fontSize: 13, color: '#34495e', marginLeft: 8 }}>
                      Date: {record.check_out_date || 'N/A'}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#34495e', marginLeft: 8 }}>
                      Time: {formatTime(record.check_out_time)}
                    </Text>
                  </View>
                )}
                
                {record.work_duration_display && (
                  <View style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                  }}>
                    <Text style={{ fontSize: 13, color: '#3498db', fontWeight: '600' }}>
                      Duration: {record.work_duration_display}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewAttendanceScreen;
