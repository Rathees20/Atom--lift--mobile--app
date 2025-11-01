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

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyTravelling = (): void => {
    console.log('Applying travelling:', formData);
    onApplyTravelling();
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
        <TouchableOpacity style={globalStyles.travellingSubmitButton} onPress={handleApplyTravelling}>
          <Text style={globalStyles.travellingSubmitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TravellingScreen;
