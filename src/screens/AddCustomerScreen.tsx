import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { AddCustomerFormData } from '../../types';
import { createCustomer } from '../utils/api';
import { validateMobileNumber, validateEmail, formatMobileNumber, getMobileNumberError, getEmailError } from '../utils/validation';
import { useAlert } from '../contexts/AlertContext';

interface AddCustomerScreenProps {
  onBack: () => void;
  onSave: (data: AddCustomerFormData) => void;
}

const AddCustomerScreen: React.FC<AddCustomerScreenProps> = ({ onBack, onSave }) => {
  const { showSuccessAlert, showErrorAlert } = useAlert();
  const [formData, setFormData] = useState<AddCustomerFormData>({
    customerSiteName: '',
    mobileNumber: '',
    email: '',
    customerSiteAddress: '',
    siteId: '',
    siteAddress: '',
    contactPersonName: '',
    city: '',
    jobNo: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (field: keyof AddCustomerFormData, value: string): void => {
    // Format mobile number input
    if (field === 'mobileNumber') {
      value = formatMobileNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    // Basic validation
    if (!formData.customerSiteName.trim()) {
      console.log('Validation: customer site name missing'); // Debug log
      showErrorAlert('Please enter customer site name');
      return;
    }
    if (!formData.siteId.trim()) {
      showErrorAlert('Please enter site ID');
      return;
    }
    if (!formData.siteAddress.trim()) {
      showErrorAlert('Please enter site address');
      return;
    }
    if (!formData.contactPersonName.trim()) {
      showErrorAlert('Please enter contact person name');
      return;
    }
    if (!formData.city.trim()) {
      showErrorAlert('Please enter city');
      return;
    }

    // Mobile number validation
    const mobileError = getMobileNumberError(formData.mobileNumber);
    if (mobileError) {
      showErrorAlert(mobileError);
      return;
    }

    // Email validation
    const emailError = getEmailError(formData.email);
    if (emailError) {
      showErrorAlert(emailError);
      return;
    }

    setIsLoading(true);
    try {
      // Prepare the data to send to API
      const customerData: any = {
        site_name: formData.customerSiteName,
        phone: formData.mobileNumber,
        email: formData.email,
        site_id: formData.siteId,
        site_address: formData.siteAddress,
        contact_person_name: formData.contactPersonName,
        city: formData.city,
      };

      // Add job_no only if provided
      if (formData.jobNo && formData.jobNo.trim()) {
        customerData.job_no = formData.jobNo;
      }

      const result = await createCustomer(customerData);
      
      console.log('Customer result:', result); // Debug log
      
      // Check if result has success field, or assume success if no error thrown
      if (result && (result.success === true || result.success === undefined)) {
        const successMessage = result.message || (result as any).msg || 'Customer created successfully';
        console.log('Showing success alert:', successMessage); // Debug log
        showSuccessAlert(
          successMessage,
          () => {
            console.log('Success alert OK pressed, closing form'); // Debug log
            onSave(formData);
            onBack(); // Close the form after success
          }
        );
      } else {
        const errorMsg = result?.message || (result as any)?.error || 'Failed to create customer';
        console.log('Showing error alert:', errorMsg); // Debug log
        showErrorAlert(errorMsg);
      }
    } catch (error: any) {
      console.error('Error creating customer:', error);
      showErrorAlert(error.message || 'Failed to create customer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.customerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.customerHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.customerBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={globalStyles.customerTitle}>Add Customer</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form Content */}
      <ScrollView style={globalStyles.customerContent} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.customerFieldContainer}>
          <TextInput
            style={globalStyles.customerInput}
            placeholder="Customer Site Name *"
            value={formData.customerSiteName}
            onChangeText={(value) => handleInputChange('customerSiteName', value)}
            placeholderTextColor="#999"
          />
        </View>

        <View style={globalStyles.customerFieldContainer}>
          <TextInput
            style={globalStyles.customerInput}
            placeholder="Site ID *"
            value={formData.siteId}
            onChangeText={(value) => handleInputChange('siteId', value)}
            placeholderTextColor="#999"
          />
        </View>

        <View style={globalStyles.customerFieldContainer}>
          <TextInput
            style={globalStyles.customerInput}
            placeholder="Job No (Optional)"
            value={formData.jobNo}
            onChangeText={(value) => handleInputChange('jobNo', value)}
            placeholderTextColor="#999"
          />
        </View>

        <View style={globalStyles.customerFieldContainer}>
          <TextInput
            style={globalStyles.customerInput}
            placeholder="Mobile Number *"
            value={formData.mobileNumber}
            onChangeText={(value) => handleInputChange('mobileNumber', value)}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
        </View>

        <View style={globalStyles.customerFieldContainer}>
          <TextInput
            style={globalStyles.customerInput}
            placeholder="Email *"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        <View style={globalStyles.customerFieldContainer}>
          <TextInput
            style={globalStyles.customerInput}
            placeholder="Contact Person Name *"
            value={formData.contactPersonName}
            onChangeText={(value) => handleInputChange('contactPersonName', value)}
            placeholderTextColor="#999"
          />
        </View>

        <View style={globalStyles.customerFieldContainer}>
          <TextInput
            style={globalStyles.customerInput}
            placeholder="City *"
            value={formData.city}
            onChangeText={(value) => handleInputChange('city', value)}
            placeholderTextColor="#999"
          />
        </View>

        <View style={globalStyles.customerFieldContainer}>
          <TextInput
            style={[globalStyles.customerInput, globalStyles.customerTextArea]}
            placeholder="Site Address *"
            value={formData.siteAddress}
            onChangeText={(value) => handleInputChange('siteAddress', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity 
          style={[globalStyles.customerSubmitButton, isLoading && { opacity: 0.6 }]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={globalStyles.customerSubmitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddCustomerScreen;
