import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { CreateAMCFormData } from '../../types';
import { createAMC, getCustomerList, Customer, getAMCTypes, AMCType, createAMCType } from '../utils/api';
import { useAlert } from '../contexts/AlertContext';

interface CreateAMCScreenProps {
  onBack: () => void;
  onSave: (data: CreateAMCFormData) => void;
}

const CreateAMCScreen: React.FC<CreateAMCScreenProps> = ({ onBack, onSave }) => {
  const { showSuccessAlert, showErrorAlert } = useAlert();
  const [formData, setFormData] = useState<CreateAMCFormData>({
    selectedCustomer: '',
    startDate: '',
    endDate: '',
    amcType: '',
    numberOfServices: '',
    paymentAmount: '',
    paymentTerms: '',
    notes: '',
  });

  // Store selected IDs separately
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedAMCTypeId, setSelectedAMCTypeId] = useState<number | null>(null);

  const [showCustomerDropdown, setShowCustomerDropdown] = useState<boolean>(false);
  const [showAMCTypeDropdown, setShowAMCTypeDropdown] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState<boolean>(false);
  const [amcTypes, setAmcTypes] = useState<AMCType[]>([]);
  const [isLoadingAMCTypes, setIsLoadingAMCTypes] = useState<boolean>(false);
  
  // AMC Type creation modal state
  const [showAMCTypeModal, setShowAMCTypeModal] = useState<boolean>(false);
  const [newAMCTypeName, setNewAMCTypeName] = useState<string>('');
  const [isCreatingAMCType, setIsCreatingAMCType] = useState<boolean>(false);

  // Date picker modal state
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDateField, setSelectedDateField] = useState<'startDate' | 'endDate' | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchCustomers();
    fetchAMCTypes();
  }, []);

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const data = await getCustomerList();
      setCustomers(data);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      showErrorAlert('Failed to load customers. Please try again.');
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchAMCTypes = async () => {
    setIsLoadingAMCTypes(true);
    try {
      const data = await getAMCTypes();
      setAmcTypes(data);
    } catch (error: any) {
      console.error('Error fetching AMC types:', error);
      showErrorAlert('Failed to load AMC types. Please try again.');
    } finally {
      setIsLoadingAMCTypes(false);
    }
  };

  const handleCreateAMCType = async (): Promise<void> => {
    if (!newAMCTypeName.trim()) {
      showErrorAlert('Please enter AMC type name');
      return;
    }

    setIsCreatingAMCType(true);
    try {
      const result = await createAMCType({ name: newAMCTypeName.trim() });
      
      if (result.success) {
        showSuccessAlert(result.message || 'AMC type created successfully');
        setNewAMCTypeName('');
        setShowAMCTypeModal(false);
        // Refresh AMC types list
        await fetchAMCTypes();
      } else {
        showErrorAlert(result.message || 'Failed to create AMC type');
      }
    } catch (error: any) {
      console.error('Error creating AMC type:', error);
      showErrorAlert(error.message || 'Failed to create AMC type. Please try again.');
    } finally {
      setIsCreatingAMCType(false);
    }
  };

  const handleInputChange = (field: keyof CreateAMCFormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateSelect = (field: 'startDate' | 'endDate'): void => {
    setSelectedDateField(field);
    // Initialize temp date with existing date if available, otherwise use today
    const existingDate = formData[field];
    if (existingDate) {
      // Try to parse the existing date string
      const parsedDate = new Date(existingDate);
      if (!isNaN(parsedDate.getTime())) {
        setTempDate(parsedDate);
      } else {
        setTempDate(new Date());
      }
    } else {
      setTempDate(new Date());
    }
    setShowDatePicker(true);
  };

  const handleDateConfirm = (): void => {
    if (selectedDateField) {
      // Format date as YYYY-MM-DD for API
      const formattedDate = tempDate.toISOString().split('T')[0];
      handleInputChange(selectedDateField, formattedDate);
    }
    setShowDatePicker(false);
    setSelectedDateField(null);
  };

  const handleDateCancel = (): void => {
    setShowDatePicker(false);
    setSelectedDateField(null);
  };

  const handleCustomerSelect = (customer: Customer): void => {
    setFormData(prev => ({
      ...prev,
      selectedCustomer: customer.site_name,
    }));
    setSelectedCustomerId(customer.id);
    setShowCustomerDropdown(false);
  };

  const handleAMCTypeSelect = (amcType: AMCType): void => {
    setFormData(prev => ({
      ...prev,
      amcType: amcType.name,
    }));
    setSelectedAMCTypeId(amcType.id);
    setShowAMCTypeDropdown(false);
  };

  const handleSubmit = async (): Promise<void> => {
    // Basic validation
    if (!formData.selectedCustomer.trim()) {
      showErrorAlert('Please select a customer');
      return;
    }
    if (!formData.startDate.trim()) {
      showErrorAlert('Please select start date');
      return;
    }
    if (!formData.endDate.trim()) {
      showErrorAlert('Please select end date');
      return;
    }
    if (!formData.amcType.trim()) {
      showErrorAlert('Please select AMC type');
      return;
    }
    if (!formData.numberOfServices.trim()) {
      showErrorAlert('Please enter number of services');
      return;
    }
    if (!formData.paymentAmount.trim()) {
      showErrorAlert('Please enter payment amount');
      return;
    }

    // Number validation
    if (isNaN(Number(formData.numberOfServices)) || Number(formData.numberOfServices) <= 0) {
      showErrorAlert('Please enter a valid number of services');
      return;
    }
    if (isNaN(Number(formData.paymentAmount)) || Number(formData.paymentAmount) <= 0) {
      showErrorAlert('Please enter a valid payment amount');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare the data to send to API - use IDs instead of names
      const amcData = {
        customer: selectedCustomerId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        amc_type: selectedAMCTypeId,
        number_of_services: Number(formData.numberOfServices),
        payment_amount: Number(formData.paymentAmount),
        notes: formData.notes || '',
      };

      const result = await createAMC(amcData);
      
      console.log('AMC creation result:', result); // Debug log
      
      // Get the message from result
      const resultMessage = result.message || (result as any).msg || 'AMC created successfully';
      
      // Check if message indicates success (case-insensitive)
      const isSuccessMessage = resultMessage.toLowerCase().includes('success') || 
                               resultMessage.toLowerCase().includes('created successfully') ||
                               resultMessage.toLowerCase().includes('successfully');
      
      // If no error was thrown and we got a result, treat as success
      // Also check if message indicates success or if success field is true/undefined
      if (result && (result.success === true || result.success === undefined || isSuccessMessage)) {
        console.log('Showing success alert:', resultMessage); // Debug log
        showSuccessAlert(
          resultMessage,
          () => {
            console.log('Success alert OK pressed, closing form'); // Debug log
            onSave(formData);
            onBack(); // Close the form after success
          }
        );
      } else {
        showErrorAlert(resultMessage || 'Failed to create AMC');
      }
    } catch (error: any) {
      console.error('Error creating AMC:', error);
      showErrorAlert(error.message || 'Failed to create AMC. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.amcContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.amcHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.amcBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={globalStyles.amcTitle}>Create AMC</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form Content */}
      <ScrollView style={globalStyles.amcContent} showsVerticalScrollIndicator={false}>
        {/* Select Customer */}
        <View style={globalStyles.amcFieldContainer}>
          <TouchableOpacity 
            style={globalStyles.amcDropdownContainer}
            onPress={() => setShowCustomerDropdown(!showCustomerDropdown)}
          >
            <Text style={[globalStyles.amcDropdownText, !formData.selectedCustomer && globalStyles.amcPlaceholderText]}>
              {formData.selectedCustomer || 'Select Customer'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          
          {showCustomerDropdown && (
            <View style={globalStyles.amcDropdownList}>
              {isLoadingCustomers ? (
                <View style={{ padding: 10, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#3498db" />
                </View>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <TouchableOpacity
                    key={customer.id}
                    style={globalStyles.amcDropdownItem}
                    onPress={() => handleCustomerSelect(customer)}
                  >
                    <Text style={globalStyles.amcDropdownItemText}>{customer.site_name}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ padding: 10 }}>
                  <Text style={{ color: '#666', textAlign: 'center' }}>No customers found</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Select Start & End Date */}
        <View style={globalStyles.amcFieldContainer}>
          <Text style={globalStyles.amcSectionLabel}>Select Start & End Date</Text>
          <View style={globalStyles.amcDateRow}>
            <TouchableOpacity 
              style={globalStyles.amcDateButton}
              onPress={() => handleDateSelect('startDate')}
            >
              <Text style={globalStyles.amcDateButtonText}>
                {formData.startDate || 'Start Date:'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={globalStyles.amcDateButton}
              onPress={() => handleDateSelect('endDate')}
            >
              <Text style={globalStyles.amcDateButtonText}>
                {formData.endDate || 'End Date:'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Select AMC Type */}
        <View style={globalStyles.amcFieldContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity 
              style={[globalStyles.amcDropdownContainer, { flex: 1 }]}
              onPress={() => setShowAMCTypeDropdown(!showAMCTypeDropdown)}
            >
              <Text style={[globalStyles.amcDropdownText, !formData.amcType && globalStyles.amcPlaceholderText]}>
                {formData.amcType || 'Select Amc Type'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                marginLeft: 10,
                width: 44,
                height: 44,
                backgroundColor: '#3498db',
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                setShowAMCTypeDropdown(false);
                setShowAMCTypeModal(true);
              }}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {showAMCTypeDropdown && (
            <View style={globalStyles.amcDropdownList}>
              {isLoadingAMCTypes ? (
                <View style={{ padding: 10, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#3498db" />
                </View>
              ) : amcTypes.length > 0 ? (
                amcTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={globalStyles.amcDropdownItem}
                    onPress={() => handleAMCTypeSelect(type)}
                  >
                    <Text style={globalStyles.amcDropdownItemText}>{type.name}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ padding: 10 }}>
                  <Text style={{ color: '#666', textAlign: 'center' }}>No AMC types found</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Enter No. of service */}
        <View style={globalStyles.amcFieldContainer}>
          <Text style={globalStyles.amcLabel}>Enter No. of service</Text>
          <TextInput
            style={globalStyles.amcUnderlineInput}
            value={formData.numberOfServices}
            onChangeText={(value) => handleInputChange('numberOfServices', value)}
            keyboardType="numeric"
            placeholder="Enter number of services"
            placeholderTextColor="#999"
          />
        </View>

        {/* Enter payment amount */}
        <View style={globalStyles.amcFieldContainer}>
          <Text style={globalStyles.amcLabel}>Enter payment amount (Without TAX)</Text>
          <TextInput
            style={globalStyles.amcUnderlineInput}
            value={formData.paymentAmount}
            onChangeText={(value) => handleInputChange('paymentAmount', value)}
            keyboardType="numeric"
            placeholder="Enter payment amount"
            placeholderTextColor="#999"
          />
        </View>

        {/* Notes */}
        <View style={globalStyles.amcFieldContainer}>
          <Text style={globalStyles.amcLabel}>Notes</Text>
          <TextInput
            style={[globalStyles.amcUnderlineInput, globalStyles.amcNotesInput]}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Enter notes (optional)"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity 
          style={[globalStyles.amcSubmitButton, isLoading && { opacity: 0.6 }]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={globalStyles.amcSubmitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Add AMC Type Modal */}
      <Modal
        visible={showAMCTypeModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAMCTypeModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 15,
            padding: 25,
            width: '85%',
            maxWidth: 400,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: 20,
              textAlign: 'center',
            }}>
              Add New AMC Type
            </Text>

            <View style={{ marginBottom: 20 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: '#2c3e50',
                }}
                placeholder="Enter AMC Type Name"
                placeholderTextColor="#999"
                value={newAMCTypeName}
                onChangeText={setNewAMCTypeName}
                autoFocus={true}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#e74c3c',
                  paddingVertical: 12,
                  borderRadius: 8,
                  marginRight: 10,
                }}
                onPress={() => {
                  setShowAMCTypeModal(false);
                  setNewAMCTypeName('');
                }}
                disabled={isCreatingAMCType}
              >
                <Text style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#3498db',
                  paddingVertical: 12,
                  borderRadius: 8,
                  marginLeft: 10,
                }}
                onPress={handleCreateAMCType}
                disabled={isCreatingAMCType}
              >
                {isCreatingAMCType ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}>
                    Add
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal - Calendar View */}
      <Modal
        visible={showDatePicker}
        animationType="fade"
        transparent={true}
        onRequestClose={handleDateCancel}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={handleDateCancel}
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
                Select {selectedDateField === 'startDate' ? 'Start' : 'End'} Date
              </Text>
              <TouchableOpacity onPress={handleDateCancel}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(tempDate);
                  newDate.setMonth(tempDate.getMonth() - 1);
                  setTempDate(newDate);
                }}
                style={{ padding: 8 }}
              >
                <Ionicons name="chevron-back" size={24} color="#3498db" />
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#2c3e50' }}>
                {tempDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(tempDate);
                  newDate.setMonth(tempDate.getMonth() + 1);
                  setTempDate(newDate);
                }}
                style={{ padding: 8 }}
              >
                <Ionicons name="chevron-forward" size={24} color="#3498db" />
              </TouchableOpacity>
            </View>

            {/* Day Names */}
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <View key={day} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#7f8c8d' }}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {(() => {
                const year = tempDate.getFullYear();
                const month = tempDate.getMonth();
                const firstDayOfMonth = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const days = [];
                
                // Empty cells for days before month starts
                for (let i = 0; i < firstDayOfMonth; i++) {
                  days.push(null);
                }
                // Days of the month
                for (let day = 1; day <= daysInMonth; day++) {
                  days.push(day);
                }

                return days.map((day, index) => {
                  if (day === null) {
                    return <View key={`empty-${index}`} style={{ width: '14.28%', aspectRatio: 1 }} />;
                  }
                  const isSelected = day === tempDate.getDate();
                  const isToday = day === new Date().getDate() && 
                                 month === new Date().getMonth() && 
                                 year === new Date().getFullYear();
                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => {
                        const newDate = new Date(tempDate);
                        newDate.setDate(day);
                        setTempDate(newDate);
                      }}
                      style={{
                        width: '14.28%',
                        aspectRatio: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 20,
                        backgroundColor: isSelected ? '#3498db' : 'transparent',
                        marginVertical: 2,
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
                });
              })()}
            </View>

            {/* Selected Date Display */}
            <View style={{
              backgroundColor: '#f8f9fa',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 15,
              marginBottom: 15,
            }}>
              <Text style={{
                fontSize: 14,
                color: '#2c3e50',
                fontWeight: '500'
              }}>
                {tempDate.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
              <TouchableOpacity
                onPress={handleDateCancel}
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
                onPress={handleDateConfirm}
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
    </SafeAreaView>
  );
};

export default CreateAMCScreen;
