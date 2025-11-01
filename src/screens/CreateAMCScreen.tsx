import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { CreateAMCFormData } from '../../types';

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

  const [showCustomerDropdown, setShowCustomerDropdown] = useState<boolean>(false);
  const [showAMCTypeDropdown, setShowAMCTypeDropdown] = useState<boolean>(false);
  const [showPaymentTermsDropdown, setShowPaymentTermsDropdown] = useState<boolean>(false);

  // Mock data for dropdowns
  const customers = ['Customer 1', 'Customer 2', 'Customer 3'];
  const amcTypes = ['Annual', 'Semi-Annual', 'Quarterly', 'Monthly'];
  const paymentTerms = ['Net 30', 'Net 60', 'Net 90', 'Cash on Delivery'];

  const handleInputChange = (field: keyof CreateAMCFormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateSelect = (field: 'startDate' | 'endDate'): void => {
    // In a real app, you would open a date picker here
    // For now, we'll just show an alert
    Alert.alert(
      'Select Date',
      `Please select ${field === 'startDate' ? 'start' : 'end'} date`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'OK', 
          onPress: () => {
            // Mock date selection
            const mockDate = new Date().toLocaleDateString();
            handleInputChange(field, mockDate);
          }
        }
      ]
    );
  };

  const handleDropdownSelect = (field: keyof CreateAMCFormData, value: string): void => {
    handleInputChange(field, value);
    if (field === 'selectedCustomer') setShowCustomerDropdown(false);
    if (field === 'amcType') setShowAMCTypeDropdown(false);
    if (field === 'paymentTerms') setShowPaymentTermsDropdown(false);
  };

  const handleSubmit = (): void => {
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
    if (!formData.paymentTerms.trim()) {
      Alert.alert('Error', 'Please select payment terms');
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

    onSave(formData);
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
              {customers.map((customer, index) => (
                <TouchableOpacity
                  key={index}
                  style={globalStyles.amcDropdownItem}
                  onPress={() => handleDropdownSelect('selectedCustomer', customer)}
                >
                  <Text style={globalStyles.amcDropdownItemText}>{customer}</Text>
                </TouchableOpacity>
              ))}
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
          <TouchableOpacity 
            style={globalStyles.amcDropdownContainer}
            onPress={() => setShowAMCTypeDropdown(!showAMCTypeDropdown)}
          >
            <Text style={[globalStyles.amcDropdownText, !formData.amcType && globalStyles.amcPlaceholderText]}>
              {formData.amcType || 'Select Amc Type'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          
          {showAMCTypeDropdown && (
            <View style={globalStyles.amcDropdownList}>
              {amcTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={globalStyles.amcDropdownItem}
                  onPress={() => handleDropdownSelect('amcType', type)}
                >
                  <Text style={globalStyles.amcDropdownItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
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

        {/* Select Payment Terms */}
        <View style={globalStyles.amcFieldContainer}>
          <TouchableOpacity 
            style={globalStyles.amcDropdownContainer}
            onPress={() => setShowPaymentTermsDropdown(!showPaymentTermsDropdown)}
          >
            <Text style={[globalStyles.amcDropdownText, !formData.paymentTerms && globalStyles.amcPlaceholderText]}>
              {formData.paymentTerms || 'Select Payment Terms'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          
          {showPaymentTermsDropdown && (
            <View style={globalStyles.amcDropdownList}>
              {paymentTerms.map((term, index) => (
                <TouchableOpacity
                  key={index}
                  style={globalStyles.amcDropdownItem}
                  onPress={() => handleDropdownSelect('paymentTerms', term)}
                >
                  <Text style={globalStyles.amcDropdownItemText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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

        <TouchableOpacity style={globalStyles.amcSubmitButton} onPress={handleSubmit}>
          <Text style={globalStyles.amcSubmitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateAMCScreen;
