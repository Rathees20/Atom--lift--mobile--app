import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { AddCustomerFormData } from '../../types';
import { createCustomer } from '../utils/api';

interface AddCustomerScreenProps {
  onBack: () => void;
  onSave: (data: AddCustomerFormData) => void;
}

const AddCustomerScreen: React.FC<AddCustomerScreenProps> = ({ onBack, onSave }) => {
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
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    // Basic validation
    if (!formData.customerSiteName.trim()) {
      Alert.alert('Error', 'Please enter customer site name');
      return;
    }
    if (!formData.mobileNumber.trim()) {
      Alert.alert('Error', 'Please enter mobile number');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter email');
      return;
    }
    if (!formData.siteId.trim()) {
      Alert.alert('Error', 'Please enter site ID');
      return;
    }
    if (!formData.siteAddress.trim()) {
      Alert.alert('Error', 'Please enter site address');
      return;
    }
    if (!formData.contactPersonName.trim()) {
      Alert.alert('Error', 'Please enter contact person name');
      return;
    }
    if (!formData.city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Mobile number validation (basic)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobileNumber.replace(/\D/g, ''))) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
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
      
      if (result.success) {
        Alert.alert('Success', result.message || 'Customer created successfully');
        onSave(formData);
      } else {
        Alert.alert('Error', result.message || 'Failed to create customer');
      }
    } catch (error: any) {
      console.error('Error creating customer:', error);
      Alert.alert('Error', error.message || 'Failed to create customer. Please try again.');
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
