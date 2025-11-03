import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { createLeave, CreateLeaveData, getLeaveTypes, LeaveType } from '../utils/api';
import { getEmailError } from '../utils/validation';
import { useAlert } from '../contexts/AlertContext';

interface LeaveScreenProps {
  onBack: () => void;
  onApplyLeave: () => void;
}

const LeaveScreen: React.FC<LeaveScreenProps> = ({ onBack, onApplyLeave }) => {
  const { showSuccessAlert, showErrorAlert } = useAlert();
  const [formData, setFormData] = useState({
    halfDay: false,
    leaveType: '',
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    email: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedLeaveTypeName, setSelectedLeaveTypeName] = useState<string>('');
  const [showFromDatePicker, setShowFromDatePicker] = useState<boolean>(false);
  const [showToDatePicker, setShowToDatePicker] = useState<boolean>(false);
  const [tempFromDate, setTempFromDate] = useState<Date>(new Date());
  const [tempToDate, setTempToDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async (): Promise<void> => {
    setLoadingTypes(true);
    try {
      const types = await getLeaveTypes();
      setLeaveTypes(types);
    } catch (error: any) {
      console.error('Error fetching leave types:', error);
      setLeaveTypes([]);
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ FIXED: use leaveType.key instead of leaveType.name
  const handleSelectLeaveType = (leaveType: LeaveType): void => {
    setFormData(prev => ({
      ...prev,
      leaveType: leaveType.key,  // ✅ Send backend key like 'casual'
      leaveTypeId: leaveType.id.toString(),
    }));
    setSelectedLeaveTypeName(leaveType.name);  // ✅ Show user-friendly label
    setShowDropdown(false);
  };

  const openDropdown = (): void => {
    if (leaveTypes.length > 0) {
      setShowDropdown(true);
    } else {
      showErrorAlert('Loading leave types...');
    }
  };

  const closeDropdown = (): void => {
    setShowDropdown(false);
  };

  const validateForm = (): boolean => {
    if (!formData.leaveType.trim()) {
      showErrorAlert('Please select a leave type');
      return false;
    }
    if (!formData.fromDate.trim()) {
      showErrorAlert('Please select from date');
      return false;
    }
    if (!formData.toDate.trim()) {
      showErrorAlert('Please select to date');
      return false;
    }
    // Email validation
    const emailError = getEmailError(formData.email);
    if (emailError) {
      showErrorAlert(emailError);
      return false;
    }
    if (!formData.reason.trim()) {
      showErrorAlert('Please enter a reason for leave');
      return false;
    }
    return true;
  };

  const formatDate = (dateString: string): string => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return dateString;
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Try parsing as YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      return dateString;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOpenFromDatePicker = (): void => {
    if (formData.fromDate) {
      const date = new Date(formData.fromDate);
      if (!isNaN(date.getTime())) {
        setTempFromDate(date);
      }
    }
    setShowFromDatePicker(true);
  };

  const handleOpenToDatePicker = (): void => {
    if (formData.toDate) {
      const date = new Date(formData.toDate);
      if (!isNaN(date.getTime())) {
        setTempToDate(date);
      }
    }
    setShowToDatePicker(true);
  };

  const handleConfirmFromDate = (): void => {
    const formattedDate = formatDateForInput(tempFromDate);
    handleInputChange('fromDate', formattedDate);
    setShowFromDatePicker(false);
  };

  const handleConfirmToDate = (): void => {
    const formattedDate = formatDateForInput(tempToDate);
    handleInputChange('toDate', formattedDate);
    setShowToDatePicker(false);
  };

  const renderDatePickerModal = (
    visible: boolean,
    date: Date,
    onDateChange: (newDate: Date) => void,
    onConfirm: () => void,
    onCancel: () => void
  ) => {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return (
      <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onCancel}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={onCancel}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              width: '90%',
              maxWidth: 400,
              padding: 20,
            }}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#2c3e50' }}>
                {monthNames[date.getMonth()]} {date.getFullYear()}
              </Text>
              <TouchableOpacity onPress={onCancel}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(date);
                  newDate.setMonth(date.getMonth() - 1);
                  onDateChange(newDate);
                }}
                style={{ padding: 8 }}
              >
                <Ionicons name="chevron-back" size={24} color="#3498db" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(date);
                  newDate.setMonth(date.getMonth() + 1);
                  onDateChange(newDate);
                }}
                style={{ padding: 8 }}
              >
                <Ionicons name="chevron-forward" size={24} color="#3498db" />
              </TouchableOpacity>
            </View>

            {/* Day Names */}
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              {dayNames.map((day) => (
                <View key={day} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#7f8c8d' }}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {days.map((day, index) => {
                if (day === null) {
                  return <View key={`empty-${index}`} style={{ width: '14.28%', aspectRatio: 1 }} />;
                }
                const isSelected = day === date.getDate();
                const isToday = day === new Date().getDate() && 
                               date.getMonth() === new Date().getMonth() && 
                               date.getFullYear() === new Date().getFullYear();
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => {
                      const newDate = new Date(date);
                      newDate.setDate(day);
                      onDateChange(newDate);
                    }}
                    style={{
                      width: '14.28%',
                      aspectRatio: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 20,
                      backgroundColor: isSelected ? '#3498db' : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: isSelected ? '#fff' : isToday ? '#3498db' : '#2c3e50',
                        fontWeight: isSelected || isToday ? '600' : '400',
                      }}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
              <TouchableOpacity
                onPress={onCancel}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#e74c3c',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onConfirm}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#3498db',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Select</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  const handleApplyLeave = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const leaveData: CreateLeaveData = {
        half_day: formData.halfDay,
        leave_type: formData.leaveType.trim(),  // ✅ now this sends backend key (e.g. 'casual')
        from_date: formatDate(formData.fromDate.trim()),
        to_date: formatDate(formData.toDate.trim()),
        email: formData.email.trim(),
        reason: formData.reason.trim(),
      };

      const result = await createLeave(leaveData);
      
      console.log('Leave result:', result); // Debug log
      
      if (result && result.success === true) {
        showSuccessAlert(
          result.message || 'Leave request submitted successfully',
          () => {
            onApplyLeave(); // Close the form and navigate back
          }
        );
      } else {
        const errorMessage = result?.message || result?.error || 'Failed to submit leave request';
        showErrorAlert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error applying leave:', error);
      showErrorAlert(error.message || 'Failed to submit leave request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.complaintContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.complaintHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.complaintBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={globalStyles.leaveTitle}>Apply Leave</Text>
        
        <TouchableOpacity 
          onPress={handleApplyLeave} 
          style={globalStyles.complaintSaveButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={globalStyles.complaintSaveText}>Apply</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Form Content */}
      <ScrollView style={globalStyles.leaveFormContent} showsVerticalScrollIndicator={false}>
        {/* Half Day Checkbox */}
        <View style={globalStyles.leaveCheckboxContainer}>
          <TouchableOpacity
            onPress={() => handleInputChange('halfDay', !formData.halfDay)}
            style={globalStyles.leaveCheckbox}
          >
            <Ionicons 
              name={formData.halfDay ? "checkbox" : "square-outline"} 
              size={24} 
              color={formData.halfDay ? "#3498db" : "#bdc3c7"} 
            />
          </TouchableOpacity>
          <Text style={globalStyles.leaveCheckboxLabel}>Half Day</Text>
        </View>

        {/* Leave Type Field */}
        <View style={globalStyles.leaveFieldContainer}>
          <Text style={globalStyles.leaveFieldLabel}>Leave Type</Text>
          <TouchableOpacity
            style={globalStyles.leaveDropdownContainer}
            onPress={openDropdown}
            disabled={loadingTypes}
          >
            <Text style={[
              globalStyles.leaveDropdownInput,
              { color: selectedLeaveTypeName ? '#2c3e50' : '#999' }
            ]}>
              {selectedLeaveTypeName || 'Select Leave Type'}
            </Text>
            {loadingTypes ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Ionicons name="chevron-down" size={20} color="#666" />
            )}
          </TouchableOpacity>
        </View>

        {/* From Date Field */}
        <View style={globalStyles.leaveFieldContainer}>
          <Text style={globalStyles.leaveFieldLabel}>From Date</Text>
          <TouchableOpacity
            style={[globalStyles.leaveTextInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            onPress={handleOpenFromDatePicker}
          >
            <Text style={{ color: formData.fromDate ? '#2c3e50' : '#999', fontSize: 16 }}>
              {formData.fromDate ? formatDateForDisplay(formData.fromDate) : 'Select From Date'}
            </Text>
            <Ionicons name="calendar-outline" size={24} color="#3498db" />
          </TouchableOpacity>
        </View>

        {/* To Date Field */}
        <View style={globalStyles.leaveFieldContainer}>
          <Text style={globalStyles.leaveFieldLabel}>To Date</Text>
          <TouchableOpacity
            style={[globalStyles.leaveTextInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            onPress={handleOpenToDatePicker}
          >
            <Text style={{ color: formData.toDate ? '#2c3e50' : '#999', fontSize: 16 }}>
              {formData.toDate ? formatDateForDisplay(formData.toDate) : 'Select To Date'}
            </Text>
            <Ionicons name="calendar-outline" size={24} color="#3498db" />
          </TouchableOpacity>
        </View>

        {/* Email Field */}
        <View style={globalStyles.leaveFieldContainer}>
          <Text style={globalStyles.leaveFieldLabel}>Email</Text>
          <TextInput
            style={globalStyles.leaveTextInput}
            placeholder="Enter Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Reason Field */}
        <View style={globalStyles.leaveFieldContainer}>
          <Text style={globalStyles.leaveFieldLabel}>Reason</Text>
          <TextInput
            style={globalStyles.leaveTextInput}
            placeholder="Enter reason for leave"
            value={formData.reason}
            onChangeText={(value) => handleInputChange('reason', value)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Apply Leave Button */}
        <TouchableOpacity 
          style={[globalStyles.leaveApplyButton, isSubmitting && { opacity: 0.6 }]} 
          onPress={handleApplyLeave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={globalStyles.leaveApplyButtonText}>Apply Leave</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Leave Type Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={closeDropdown}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              width: '80%',
              maxHeight: '60%',
              padding: 10,
            }}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 5 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#2c3e50' }}>Select Leave Type</Text>
              <TouchableOpacity onPress={closeDropdown}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={leaveTypes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                    backgroundColor: selectedLeaveTypeName === item.name ? '#f0f8ff' : '#fff',
                  }}
                  onPress={() => handleSelectLeaveType(item)}
                >
                  <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: selectedLeaveTypeName === item.name ? '600' : '400' }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#666' }}>No leave types available</Text>
                </View>
              }
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* From Date Picker Modal */}
      {renderDatePickerModal(
        showFromDatePicker,
        tempFromDate,
        setTempFromDate,
        handleConfirmFromDate,
        () => setShowFromDatePicker(false)
      )}

      {/* To Date Picker Modal */}
      {renderDatePickerModal(
        showToDatePicker,
        tempToDate,
        setTempToDate,
        handleConfirmToDate,
        () => setShowToDatePicker(false)
      )}
    </SafeAreaView>
  );
};

export default LeaveScreen;
