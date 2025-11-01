import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { AddCustomerFormData } from '../../types';

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
  });

  const handleInputChange = (field: keyof AddCustomerFormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (): void => {
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
    if (!formData.customerSiteAddress.trim()) {
      Alert.alert('Error', 'Please enter customer site address');
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

    onSave(formData);
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
      <View style={globalStyles.customerContent}>
        <View style={globalStyles.customerFieldContainer}>
          <TextInput
            style={globalStyles.customerInput}
            placeholder="Customer Site Name"
            value={formData.customerSiteName}
            onChangeText={(value) => handleInputChange('customerSiteName', value)}
            placeholderTextColor="#999"
          />
        </View>

        <View style={globalStyles.customerFieldContainer}>
          <TextInput
            style={globalStyles.customerInput}
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChangeText={(value) => handleInputChange('mobileNumber', value)}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
        </View>

        <View style={globalStyles.customerFieldContainer}>
          <TextInput
            style={globalStyles.customerInput}
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        <View style={globalStyles.customerFieldContainer}>
          <TextInput
            style={[globalStyles.customerInput, globalStyles.customerTextArea]}
            placeholder="Customer Site Address"
            value={formData.customerSiteAddress}
            onChangeText={(value) => handleInputChange('customerSiteAddress', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={globalStyles.customerSubmitButton} onPress={handleSubmit}>
          <Text style={globalStyles.customerSubmitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddCustomerScreen;
