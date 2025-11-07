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
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { globalStyles } from '../styles/globalStyles';
import { createTravelRequest, CreateTravelRequestData } from '../utils/api';
import { useAlert } from '../contexts/AlertContext';

interface TravellingScreenProps {
  onBack: () => void;
  onApplyTravelling: () => void;
}

const TravellingScreen: React.FC<TravellingScreenProps> = ({ onBack, onApplyTravelling }) => {
  const { showSuccessAlert, showErrorAlert } = useAlert();
  const [formData, setFormData] = useState({
    travelBy: '',
    travelDate: '',
    fromPlace: '',
    toPlace: '',
    amount: '',
    attachment: null as string | null,
  });
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOpenDatePicker = (): void => {
    if (formData.travelDate) {
      const date = new Date(formData.travelDate);
      if (!isNaN(date.getTime())) {
        setTempDate(date);
      }
    }
    setShowDatePicker(true);
  };

  const handleConfirmDate = (): void => {
    const formattedDate = formatDateForInput(tempDate);
    handleInputChange('travelDate', formattedDate);
    setShowDatePicker(false);
  };

  const handleCancelDate = (): void => {
    setShowDatePicker(false);
  };

  const handleChooseFile = async (): Promise<void> => {
    try {
      // Open file manager/document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setFormData(prev => ({
          ...prev,
          attachment: file.uri,
        }));
        setSelectedFileName(file.name || 'Selected File');
        showSuccessAlert(`File selected: ${file.name || 'File'}`);
      } else {
        // User cancelled file selection
        console.log('File selection cancelled');
      }
    } catch (error: any) {
      console.error('Error picking file:', error);
      showErrorAlert('Failed to select file. Please try again.');
    }
  };

  const renderDatePickerModal = () => {
    const year = tempDate.getFullYear();
    const month = tempDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return (
      <Modal visible={showDatePicker} transparent={true} animationType="fade" onRequestClose={handleCancelDate}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={handleCancelDate}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              width: '85%',
              maxWidth: 320,
              padding: 15,
            }}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#2c3e50' }}>Select Travel Date</Text>
              <TouchableOpacity onPress={handleCancelDate}>
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(tempDate);
                  newDate.setMonth(tempDate.getMonth() - 1);
                  setTempDate(newDate);
                }}
                style={{ padding: 6 }}
              >
                <Ionicons name="chevron-back" size={20} color="#3498db" />
              </TouchableOpacity>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#2c3e50' }}>
                {tempDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const newDate = new Date(tempDate);
                  newDate.setMonth(tempDate.getMonth() + 1);
                  setTempDate(newDate);
                }}
                style={{ padding: 6 }}
              >
                <Ionicons name="chevron-forward" size={20} color="#3498db" />
              </TouchableOpacity>
            </View>

            {/* Day Names */}
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <View key={day} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#7f8c8d' }}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {days.map((day, index) => {
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
                      borderRadius: 15,
                      backgroundColor: isSelected ? '#3498db' : 'transparent',
                      marginVertical: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: isSelected ? '#fff' : isToday ? '#3498db' : '#2c3e50',
                        fontWeight: isSelected || isToday ? '600' : '400',
                      }}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected Date Display */}
            <View style={{
              backgroundColor: '#f8f9fa',
              padding: 8,
              borderRadius: 6,
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 10,
            }}>
              <Text style={{
                fontSize: 12,
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
            <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
              <TouchableOpacity
                onPress={handleCancelDate}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 6,
                  backgroundColor: '#e74c3c',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDate}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 6,
                  backgroundColor: '#3498db',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Select</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  const handleApplyTravelling = async (): Promise<void> => {
    // Basic validation
    if (!formData.travelBy.trim()) {
      showErrorAlert('Please enter travel mode');
      return;
    }
    if (!formData.travelDate.trim()) {
      showErrorAlert('Please enter travel date');
      return;
    }
    if (!formData.fromPlace.trim()) {
      showErrorAlert('Please enter from place');
      return;
    }
    if (!formData.toPlace.trim()) {
      showErrorAlert('Please enter to place');
      return;
    }
    if (!formData.amount.trim()) {
      showErrorAlert('Please enter amount');
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
        showSuccessAlert(
          result.message || 'Travel request submitted successfully',
          () => {
            // Reset form
            setFormData({
              travelBy: '',
              travelDate: '',
              fromPlace: '',
              toPlace: '',
              amount: '',
              attachment: null,
            });
            setSelectedFileName(null);
            onApplyTravelling(); // Close the form
          }
        );
      } else {
        showErrorAlert(result.message || 'Failed to submit travel request');
      }
    } catch (error: any) {
      console.error('Error submitting travel request:', error);
      showErrorAlert(error.message || 'Failed to submit travel request. Please try again.');
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
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              onPress={handleOpenDatePicker}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: '#fff',
              }}
            >
              <Text style={{
                flex: 1,
                fontSize: 16,
                color: formData.travelDate ? '#2c3e50' : '#999',
              }}>
                {formData.travelDate ? formatDateForDisplay(formData.travelDate) : 'Travel Date'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#3498db" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
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
          <TouchableOpacity 
            style={globalStyles.travellingChooseFileButton}
            onPress={handleChooseFile}
          >
            <Ionicons name="attach-outline" size={18} color="#3498db" style={{ marginRight: 8 }} />
            <Text style={globalStyles.travellingChooseFileText}>
              {selectedFileName ? selectedFileName : 'Choose file'}
            </Text>
          </TouchableOpacity>
          {formData.attachment && selectedFileName && (
            <View style={{ marginTop: 8 }}>
              <Text style={{
                fontSize: 12,
                color: '#27ae60',
                fontStyle: 'italic',
              }}>
                ✓ File attached: {selectedFileName}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setFormData(prev => ({ ...prev, attachment: null }));
                  setSelectedFileName(null);
                }}
                style={{ marginTop: 4 }}
              >
                <Text style={{
                  fontSize: 12,
                  color: '#e74c3c',
                  textDecorationLine: 'underline',
                }}>
                  Remove file
                </Text>
              </TouchableOpacity>
            </View>
          )}
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

      {/* Date Picker Modal */}
      {renderDatePickerModal()}
    </SafeAreaView>
  );
};

export default TravellingScreen;
