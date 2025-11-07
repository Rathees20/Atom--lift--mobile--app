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
import { createLeave, updateLeave, CreateLeaveData, getLeaveTypes, LeaveType, LeaveItem, getLeaveCounts, LeaveCountsResponse } from '../utils/api';
import { getEmailError } from '../utils/validation';
import { useAlert } from '../contexts/AlertContext';

interface LeaveScreenProps {
  onBack: () => void;
  onApplyLeave: () => void;
  editingLeave?: LeaveItem | null;
}

type LeaveMutationResult = {
  success: boolean;
  message?: string;
  error?: string;
  leave?: LeaveItem;
};

const LeaveScreen: React.FC<LeaveScreenProps> = ({ onBack, onApplyLeave, editingLeave }) => {
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
  const [leaveCounts, setLeaveCounts] = useState<LeaveCountsResponse | null>(null);

  useEffect(() => {
    fetchLeaveTypes();
    fetchLeaveCounts();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (editingLeave) {
      setFormData({
        halfDay: editingLeave.half_day || false,
        leaveType: editingLeave.leave_type || '',
        leaveTypeId: '',
        fromDate: editingLeave.from_date || '',
        toDate: editingLeave.to_date || '',
        email: editingLeave.email || '',
        reason: editingLeave.reason || '',
      });
      
      // Set the selected leave type name for display
      const leaveType = leaveTypes.find(lt => lt.key === editingLeave.leave_type);
      if (leaveType) {
        setSelectedLeaveTypeName(leaveType.name);
      }
    } else {
      // Reset form for new leave
      setFormData({
        halfDay: false,
        leaveType: '',
        leaveTypeId: '',
        fromDate: '',
        toDate: '',
        email: '',
        reason: '',
      });
      setSelectedLeaveTypeName('');
    }
  }, [editingLeave, leaveTypes]);

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

  const fetchLeaveCounts = async (): Promise<void> => {
    try {
      const counts = await getLeaveCounts();
      setLeaveCounts(counts);
    } catch (error: any) {
      console.error('Error fetching leave counts:', error);
      // Don't show error, just silently fail
    }
  };

  // Mapping to show readable leave type
  const leaveTypeDisplayMap: Record<string, string> = {
    casual: 'Casual Leave',
    sick: 'Sick Leave',
    earned: 'Earned Leave',
    unpaid: 'Unpaid Leave',
    other: 'Other',
  };

  const handleInputChange = (field: string, value: string | boolean): void => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // If half day is checked and fromDate is set, automatically set toDate to fromDate
      if (field === 'halfDay' && value === true && prev.fromDate) {
        updated.toDate = prev.fromDate;
      } else if (field === 'halfDay' && value === true && !prev.fromDate) {
        // If half day is checked but no fromDate yet, clear toDate
        updated.toDate = '';
      } else if (field === 'fromDate' && prev.halfDay) {
        // If half day is checked and fromDate changes, update toDate to match
        updated.toDate = value as string;
      }
      
      return updated;
    });
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

  const compareDates = (date1Str: string, date2Str: string): number => {
    // Parse dates in YYYY-MM-DD format
    const date1 = new Date(date1Str);
    const date2 = new Date(date2Str);
    // Reset time to compare only dates
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    return date1.getTime() - date2.getTime();
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
    // Only require toDate if not half day
    if (!formData.halfDay && !formData.toDate.trim()) {
      showErrorAlert('Please select to date');
      return false;
    }
    // Validate that toDate is not before fromDate
    if (!formData.halfDay && formData.fromDate && formData.toDate) {
      const dateComparison = compareDates(formData.toDate, formData.fromDate);
      if (dateComparison < 0) {
        showErrorAlert('To Date cannot be before From Date. Please select a valid date range.');
        return false;
      }
    }
    // Email validation - required
    if (!formData.email.trim()) {
      showErrorAlert('Please enter your email address');
      return false;
    }
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
    } else if (formData.fromDate) {
      // If no toDate but fromDate exists, set tempToDate to fromDate
      const date = new Date(formData.fromDate);
      if (!isNaN(date.getTime())) {
        setTempToDate(date);
      }
    }
    setShowToDatePicker(true);
  };

  const handleConfirmFromDate = (): void => {
    const formattedDate = formatDateForInput(tempFromDate);
    
    // If toDate exists and is before the new fromDate, show error and don't update
    if (!formData.halfDay && formData.toDate) {
      const dateComparison = compareDates(formData.toDate, formattedDate);
      if (dateComparison < 0) {
        showErrorAlert('From Date cannot be after To Date. Please select To Date first or update it.');
        setShowFromDatePicker(false);
        return;
      }
    }
    
    handleInputChange('fromDate', formattedDate);
    // If half day is selected, also set toDate to the same date
    if (formData.halfDay) {
      handleInputChange('toDate', formattedDate);
    }
    setShowFromDatePicker(false);
  };

  const handleConfirmToDate = (): void => {
    const formattedDate = formatDateForInput(tempToDate);
    
    // Validate that toDate is not before fromDate
    if (formData.fromDate) {
      const dateComparison = compareDates(formattedDate, formData.fromDate);
      if (dateComparison < 0) {
        showErrorAlert('To Date cannot be before From Date. Please select a date on or after the From Date.');
        setShowToDatePicker(false);
        return;
      }
    }
    
    handleInputChange('toDate', formattedDate);
    setShowToDatePicker(false);
  };

  const renderDatePickerModal = (
    visible: boolean,
    date: Date,
    onDateChange: (newDate: Date) => void,
    onConfirm: () => void,
    onCancel: () => void,
    isToDatePicker: boolean = false
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
              width: '85%',
              maxWidth: 320,
              padding: 15,
            }}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#2c3e50' }}>
                {monthNames[date.getMonth()]} {date.getFullYear()}
              </Text>
              <TouchableOpacity onPress={onCancel}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(date);
                  newDate.setMonth(date.getMonth() - 1);
                  onDateChange(newDate);
                }}
                style={{ padding: 6 }}
              >
                <Ionicons name="chevron-back" size={20} color="#3498db" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(date);
                  newDate.setMonth(date.getMonth() + 1);
                  onDateChange(newDate);
                }}
                style={{ padding: 6 }}
              >
                <Ionicons name="chevron-forward" size={20} color="#3498db" />
              </TouchableOpacity>
            </View>

            {/* Day Names */}
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
              {dayNames.map((day) => (
                <View key={day} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#7f8c8d' }}>{day}</Text>
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
                
                // Check if this date should be disabled (for To Date picker, disable dates before From Date)
                let isDisabled = false;
                if (isToDatePicker && formData.fromDate) {
                  const currentDayDate = new Date(date.getFullYear(), date.getMonth(), day);
                  const fromDateObj = new Date(formData.fromDate);
                  currentDayDate.setHours(0, 0, 0, 0);
                  fromDateObj.setHours(0, 0, 0, 0);
                  isDisabled = currentDayDate < fromDateObj;
                }
                
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => {
                      if (isDisabled) return;
                      const newDate = new Date(date);
                      newDate.setDate(day);
                      onDateChange(newDate);
                    }}
                    disabled={isDisabled}
                    style={{
                      width: '14.28%',
                      aspectRatio: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 15,
                      backgroundColor: isSelected ? '#3498db' : 'transparent',
                      marginVertical: 1,
                      opacity: isDisabled ? 0.3 : 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: isDisabled 
                          ? '#bdc3c7' 
                          : isSelected 
                            ? '#fff' 
                            : isToday 
                              ? '#3498db' 
                              : '#2c3e50',
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
            <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
              <TouchableOpacity
                onPress={onCancel}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 6,
                  backgroundColor: '#e74c3c',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onConfirm}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 6,
                  backgroundColor: '#3498db',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Select</Text>
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
          to_date: formData.halfDay ? formatDate(formData.fromDate.trim()) : formatDate(formData.toDate.trim()),
          email: formData.email.trim(),
          reason: formData.reason.trim(),
        };

        let result: LeaveMutationResult | null = null;
        if (editingLeave) {
          // Update existing leave
          try {
            const updateResponse = await updateLeave(editingLeave.id, leaveData);
            result = {
              ...updateResponse,
              message: updateResponse.message || 'Leave request updated successfully',
            };
            console.log('Leave updated:', updateResponse);
          } catch (error: any) {
            showErrorAlert(error.message || 'Failed to update leave request');
            return;
          }
        } else {
          // Create new leave
          result = await createLeave(leaveData);
          console.log('Leave result:', result); // Debug log
        }

        if (result && result.success === true) {
          showSuccessAlert(
            result.message || (editingLeave ? 'Leave request updated successfully' : 'Leave request submitted successfully'),
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
        
        <Text style={globalStyles.leaveTitle}>{editingLeave ? 'Edit Leave' : 'Apply Leave'}</Text>
        
        <View style={{ width: 40 }} />
      </View>

      {/* Form Content */}
      <ScrollView style={globalStyles.leaveFormContent} showsVerticalScrollIndicator={false}>
        {/* Leave Balance Summary */}
        {leaveCounts && leaveCounts.counts.length > 0 && (
          <View
            style={{
              backgroundColor: '#fff',
              marginBottom: 20,
              padding: 14,
              borderRadius: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View
                style={{
                  width: 3,
                  height: 18,
                  backgroundColor: '#3498db',
                  borderRadius: 2,
                  marginRight: 10,
                }}
              />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50' }}>
                Leave Balance
              </Text>
            </View>
            {leaveCounts.counts.map((count, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderBottomWidth: index < leaveCounts.counts.length - 1 ? 1 : 0,
                  borderBottomColor: '#f0f0f0',
                }}
              >
                <Text style={{ fontSize: 14, color: '#2c3e50', flex: 1, fontWeight: '500' }}>
                  {count.leave_type_display || leaveTypeDisplayMap[count.leave_type] || count.leave_type}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ alignItems: 'center', minWidth: 50 }}>
                    <Text style={{ fontSize: 11, color: '#7f8c8d', marginBottom: 2 }}>Remaining</Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#27ae60' }}>
                      {count.total_remaining}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center', minWidth: 45 }}>
                    <Text style={{ fontSize: 11, color: '#7f8c8d', marginBottom: 2 }}>Used</Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#e74c3c' }}>
                      {count.total_used}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

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
          <Text style={globalStyles.leaveFieldLabel}>
            Leave Type <Text style={{ color: '#e74c3c' }}>*</Text>
          </Text>
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
          <Text style={globalStyles.leaveFieldLabel}>
            From Date <Text style={{ color: '#e74c3c' }}>*</Text>
          </Text>
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
          <Text style={globalStyles.leaveFieldLabel}>
            To Date {!formData.halfDay && <Text style={{ color: '#e74c3c' }}>*</Text>}
          </Text>
          <TouchableOpacity
            style={[
              globalStyles.leaveTextInput, 
              { 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                opacity: formData.halfDay ? 0.5 : 1
              }
            ]}
            onPress={formData.halfDay ? undefined : handleOpenToDatePicker}
            disabled={formData.halfDay}
          >
            <Text style={{ color: formData.toDate ? '#2c3e50' : '#999', fontSize: 16 }}>
              {formData.halfDay 
                ? (formData.fromDate ? formatDateForDisplay(formData.fromDate) : 'Same as From Date')
                : (formData.toDate ? formatDateForDisplay(formData.toDate) : 'Select To Date')
              }
            </Text>
            <Ionicons name="calendar-outline" size={24} color={formData.halfDay ? "#bdc3c7" : "#3498db"} />
          </TouchableOpacity>
          {formData.halfDay && (
            <Text style={{ fontSize: 12, color: '#7f8c8d', marginTop: 4 }}>
              To Date is automatically set to From Date for half day leave
            </Text>
          )}
        </View>

        {/* Email Field */}
        <View style={globalStyles.leaveFieldContainer}>
          <Text style={globalStyles.leaveFieldLabel}>
            Email <Text style={{ color: '#e74c3c' }}>*</Text>
          </Text>
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
                          <Text style={globalStyles.leaveApplyButtonText}>{editingLeave ? 'Update Leave' : 'Apply Leave'}</Text>
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
        () => setShowFromDatePicker(false),
        false
      )}

      {/* To Date Picker Modal */}
      {renderDatePickerModal(
        showToDatePicker,
        tempToDate,
        setTempToDate,
        handleConfirmToDate,
        () => setShowToDatePicker(false),
        true
      )}
    </SafeAreaView>
  );
};

export default LeaveScreen;
