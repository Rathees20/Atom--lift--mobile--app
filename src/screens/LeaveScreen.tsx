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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { createLeave, CreateLeaveData, getLeaveTypes, LeaveType } from '../utils/api';

interface LeaveScreenProps {
  onBack: () => void;
  onApplyLeave: () => void;
}

const LeaveScreen: React.FC<LeaveScreenProps> = ({ onBack, onApplyLeave }) => {
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
      Alert.alert('Info', 'Loading leave types...');
    }
  };

  const closeDropdown = (): void => {
    setShowDropdown(false);
  };

  const validateForm = (): boolean => {
    if (!formData.leaveType.trim()) {
      Alert.alert('Validation Error', 'Please select a leave type');
      return false;
    }
    if (!formData.fromDate.trim()) {
      Alert.alert('Validation Error', 'Please select from date');
      return false;
    }
    if (!formData.toDate.trim()) {
      Alert.alert('Validation Error', 'Please select to date');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.reason.trim()) {
      Alert.alert('Validation Error', 'Please enter a reason for leave');
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
      
      if (result.success) {
        Alert.alert(
          'Success',
          result.message || 'Leave request submitted successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                onApplyLeave();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to submit leave request');
      }
    } catch (error: any) {
      console.error('Error applying leave:', error);
      Alert.alert('Error', error.message || 'Failed to submit leave request. Please try again.');
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
          <TextInput
            style={globalStyles.leaveTextInput}
            placeholder="YYYY-MM-DD (e.g., 2024-01-15)"
            value={formData.fromDate}
            onChangeText={(value) => handleInputChange('fromDate', value)}
          />
        </View>

        {/* To Date Field */}
        <View style={globalStyles.leaveFieldContainer}>
          <Text style={globalStyles.leaveFieldLabel}>To date</Text>
          <TextInput
            style={globalStyles.leaveTextInput}
            placeholder="YYYY-MM-DD (e.g., 2024-01-20)"
            value={formData.toDate}
            onChangeText={(value) => handleInputChange('toDate', value)}
          />
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
    </SafeAreaView>
  );
};

export default LeaveScreen;
