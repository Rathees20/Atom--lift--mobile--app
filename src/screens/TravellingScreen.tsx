import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { createTravelRequest, CreateTravelRequestData } from '../utils/api';

interface TravellingScreenProps {
  onBack: () => void;
  onApplyTravelling: () => void;
}

const TravellingScreen: React.FC<TravellingScreenProps> = ({ onBack, onApplyTravelling }) => {
  const [formData, setFormData] = useState({
    travelBy: '',
    travelDate: '',
    fromPlace: '',
    toPlace: '',
    amount: '',
    attachment: null,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyTravelling = async (): Promise<void> => {
    // Basic validation
    if (!formData.travelBy.trim()) {
      Alert.alert('Error', 'Please enter travel mode');
      return;
    }
    if (!formData.travelDate.trim()) {
      Alert.alert('Error', 'Please enter travel date');
      return;
    }
    if (!formData.fromPlace.trim()) {
      Alert.alert('Error', 'Please enter from place');
      return;
    }
    if (!formData.toPlace.trim()) {
      Alert.alert('Error', 'Please enter to place');
      return;
    }
    if (!formData.amount.trim()) {
      Alert.alert('Error', 'Please enter amount');
      return;
    }

    setIsLoading(true);
    try {
      const travelRequestData: CreateTravelRequestData = {
        travel_by: formData.travelBy.trim(),
        travel_date: formData.travelDate.trim(),
        from_place: formData.fromPlace.trim(),
        to_place: formData.toPlace.trim(),
        amount: formData.amount.trim(),
        attachment: formData.attachment || undefined,
      };

      const result = await createTravelRequest(travelRequestData);

      if (result.success) {
        Alert.alert('Success', result.message || 'Travel request submitted successfully');
        // Reset form
        setFormData({
          travelBy: '',
          travelDate: '',
          fromPlace: '',
          toPlace: '',
          amount: '',
          attachment: null,
        });
        onApplyTravelling();
      } else {
        Alert.alert('Error', result.message || 'Failed to submit travel request');
      }
    } catch (error: any) {
      console.error('Error submitting travel request:', error);
      Alert.alert('Error', error.message || 'Failed to submit travel request. Please try again.');
    } finally {
      setIsLoading(false);
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
        
        <Text style={globalStyles.travellingTitle}>Traveling</Text>
        
        <View style={{ width: 60 }} />
      </View>

      {/* Form Content */}
      <ScrollView style={globalStyles.travellingFormContent} showsVerticalScrollIndicator={false}>
        {/* Travel by Field */}
        <View style={globalStyles.travellingFieldContainer}>
          <TextInput
            style={globalStyles.travellingFormInput}
            placeholder="Travel by"
            value={formData.travelBy}
            onChangeText={(value) => handleInputChange('travelBy', value)}
          />
        </View>

        {/* Travel Date Field */}
        <View style={globalStyles.travellingFieldContainer}>
          <TextInput
            style={globalStyles.travellingFormInput}
            placeholder="Travel Date"
            value={formData.travelDate}
            onChangeText={(value) => handleInputChange('travelDate', value)}
          />
        </View>

        {/* From Place Field */}
        <View style={globalStyles.travellingFieldContainer}>
          <TextInput
            style={globalStyles.travellingFormInput}
            placeholder="From Place"
            value={formData.fromPlace}
            onChangeText={(value) => handleInputChange('fromPlace', value)}
          />
        </View>

        {/* To Place Field */}
        <View style={globalStyles.travellingFieldContainer}>
          <TextInput
            style={globalStyles.travellingFormInput}
            placeholder="To Place"
            value={formData.toPlace}
            onChangeText={(value) => handleInputChange('toPlace', value)}
          />
        </View>

        {/* Amount Field */}
        <View style={globalStyles.travellingFieldContainer}>
          <TextInput
            style={globalStyles.travellingFormInput}
            placeholder="Amount"
            value={formData.amount}
            onChangeText={(value) => handleInputChange('amount', value)}
            keyboardType="numeric"
          />
        </View>

        {/* Attachment Section */}
        <View style={globalStyles.travellingFieldContainer}>
          <Text style={globalStyles.travellingAttachmentLabel}>Attach reference</Text>
          <TouchableOpacity style={globalStyles.travellingChooseFileButton}>
            <Text style={globalStyles.travellingChooseFileText}>Choose file</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[globalStyles.travellingSubmitButton, isLoading && { opacity: 0.6 }]}
          onPress={handleApplyTravelling}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={globalStyles.travellingSubmitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TravellingScreen;
