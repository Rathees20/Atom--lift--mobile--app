import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { CreateAMCFormData } from '../../types';
import { createAMC, getCustomerList, Customer, getAMCTypes, AMCType, createAMCType } from '../utils/api';

interface CreateAMCScreenProps {
  onBack: () => void;
  onSave: (data: CreateAMCFormData) => void;
}

const CreateAMCScreen: React.FC<CreateAMCScreenProps> = ({ onBack, onSave }) => {
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
      Alert.alert('Error', 'Failed to load customers. Please try again.');
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
      Alert.alert('Error', 'Failed to load AMC types. Please try again.');
    } finally {
      setIsLoadingAMCTypes(false);
    }
  };

  const handleCreateAMCType = async (): Promise<void> => {
    if (!newAMCTypeName.trim()) {
      Alert.alert('Error', 'Please enter AMC type name');
      return;
    }

    setIsCreatingAMCType(true);
    try {
      const result = await createAMCType({ name: newAMCTypeName.trim() });
      
      if (result.success) {
        Alert.alert('Success', result.message || 'AMC type created successfully');
        setNewAMCTypeName('');
        setShowAMCTypeModal(false);
        // Refresh AMC types list
        await fetchAMCTypes();
      } else {
        Alert.alert('Error', result.message || 'Failed to create AMC type');
      }
    } catch (error: any) {
      console.error('Error creating AMC type:', error);
      Alert.alert('Error', error.message || 'Failed to create AMC type. Please try again.');
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
      Alert.alert('Error', 'Please select a customer');
      return;
    }
    if (!formData.startDate.trim()) {
      Alert.alert('Error', 'Please select start date');
      return;
    }
    if (!formData.endDate.trim()) {
      Alert.alert('Error', 'Please select end date');
      return;
    }
    if (!formData.amcType.trim()) {
      Alert.alert('Error', 'Please select AMC type');
      return;
    }
    if (!formData.numberOfServices.trim()) {
      Alert.alert('Error', 'Please enter number of services');
      return;
    }
    if (!formData.paymentAmount.trim()) {
      Alert.alert('Error', 'Please enter payment amount');
      return;
    }

    // Number validation
    if (isNaN(Number(formData.numberOfServices)) || Number(formData.numberOfServices) <= 0) {
      Alert.alert('Error', 'Please enter a valid number of services');
      return;
    }
    if (isNaN(Number(formData.paymentAmount)) || Number(formData.paymentAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount');
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
      
      if (result.success) {
        Alert.alert('Success', result.message || 'AMC created successfully');
        onSave(formData);
      } else {
        Alert.alert('Error', result.message || 'Failed to create AMC');
      }
    } catch (error: any) {
      console.error('Error creating AMC:', error);
      Alert.alert('Error', error.message || 'Failed to create AMC. Please try again.');
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

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={handleDateCancel}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <TouchableOpacity onPress={handleDateCancel}>
                <Text style={{ color: '#3498db', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2c3e50' }}>
                Select {selectedDateField === 'startDate' ? 'Start' : 'End'} Date
              </Text>
              <TouchableOpacity onPress={handleDateConfirm}>
                <Text style={{ color: '#3498db', fontSize: 16, fontWeight: '600' }}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              {/* Day */}
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 10 }}>Day</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#f8f9fa',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setTempDate(newDate);
                    }}
                  >
                    <Ionicons name="chevron-down" size={20} color="#3498db" />
                  </TouchableOpacity>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    marginHorizontal: 15,
                    minWidth: 40,
                    textAlign: 'center'
                  }}>
                    {tempDate.getDate().toString().padStart(2, '0')}
                  </Text>
                  <TouchableOpacity
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#f8f9fa',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setDate(newDate.getDate() + 1);
                      setTempDate(newDate);
                    }}
                  >
                    <Ionicons name="chevron-up" size={20} color="#3498db" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Month */}
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 10 }}>Month</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#f8f9fa',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setTempDate(newDate);
                    }}
                  >
                    <Ionicons name="chevron-down" size={20} color="#3498db" />
                  </TouchableOpacity>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    marginHorizontal: 10,
                    minWidth: 60,
                    textAlign: 'center'
                  }}>
                    {tempDate.toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                  <TouchableOpacity
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#f8f9fa',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setTempDate(newDate);
                    }}
                  >
                    <Ionicons name="chevron-up" size={20} color="#3498db" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Year */}
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 10 }}>Year</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#f8f9fa',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setFullYear(newDate.getFullYear() - 1);
                      setTempDate(newDate);
                    }}
                  >
                    <Ionicons name="chevron-down" size={20} color="#3498db" />
                  </TouchableOpacity>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    marginHorizontal: 10,
                    minWidth: 50,
                    textAlign: 'center'
                  }}>
                    {tempDate.getFullYear()}
                  </Text>
                  <TouchableOpacity
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#f8f9fa',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setFullYear(newDate.getFullYear() + 1);
                      setTempDate(newDate);
                    }}
                  >
                    <Ionicons name="chevron-up" size={20} color="#3498db" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Selected Date Display */}
            <View style={{
              backgroundColor: '#f8f9fa',
              padding: 15,
              borderRadius: 10,
              alignItems: 'center',
              marginBottom: 10,
            }}>
              <Text style={{
                fontSize: 16,
                color: '#2c3e50',
                fontWeight: '600'
              }}>
                Selected Date: {tempDate.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CreateAMCScreen;
