import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';

interface MaterialRequisitionScreenProps {
  onBack: () => void;
  onSave: () => void;
}

const MaterialRequisitionScreen: React.FC<MaterialRequisitionScreenProps> = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    unit: '',
    description: '',
    priority: '',
    department: '',
  });

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (): void => {
    console.log('Saving material requisition:', formData);
    onSave();
  };

  return (
    <SafeAreaView style={globalStyles.complaintContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.complaintHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.complaintBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSave} style={globalStyles.complaintSaveButton}>
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={globalStyles.complaintSaveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Form Content */}
      <ScrollView style={globalStyles.complaintContent} showsVerticalScrollIndicator={false}>
        {/* Item Name Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Item Name:</Text>
          <TextInput
            style={globalStyles.complaintTextInput}
            placeholder="Enter Item Name"
            value={formData.itemName}
            onChangeText={(value) => handleInputChange('itemName', value)}
          />
        </View>

        {/* Quantity Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Quantity:</Text>
          <TextInput
            style={globalStyles.complaintTextInput}
            placeholder="Enter Quantity"
            value={formData.quantity}
            onChangeText={(value) => handleInputChange('quantity', value)}
            keyboardType="numeric"
          />
        </View>

        {/* Unit Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Unit:</Text>
          <View style={globalStyles.complaintDropdownContainer}>
            <TextInput
              style={globalStyles.complaintDropdownInput}
              placeholder="Select Unit"
              value={formData.unit}
              onChangeText={(value) => handleInputChange('unit', value)}
            />
            <Ionicons name="chevron-down" size={20} color="#666" />
          </View>
        </View>

        {/* Priority Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Priority:</Text>
          <View style={globalStyles.complaintDropdownContainer}>
            <TextInput
              style={globalStyles.complaintDropdownInput}
              placeholder="Select Priority"
              value={formData.priority}
              onChangeText={(value) => handleInputChange('priority', value)}
            />
            <Ionicons name="chevron-down" size={20} color="#666" />
          </View>
        </View>

        {/* Department Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Department:</Text>
          <View style={globalStyles.complaintDropdownContainer}>
            <TextInput
              style={globalStyles.complaintDropdownInput}
              placeholder="Select Department"
              value={formData.department}
              onChangeText={(value) => handleInputChange('department', value)}
            />
            <Ionicons name="chevron-down" size={20} color="#666" />
          </View>
        </View>

        {/* Description Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Description</Text>
          <TextInput
            style={globalStyles.complaintMessageInput}
            placeholder="Enter description here..."
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MaterialRequisitionScreen;
