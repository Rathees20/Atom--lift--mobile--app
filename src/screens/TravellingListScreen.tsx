import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';

interface TravellingListScreenProps {
  onBack: () => void;
  onAddNew: () => void;
}

const TravellingListScreen: React.FC<TravellingListScreenProps> = ({ onBack, onAddNew }) => {
  const handleAddNewPress = (): void => {
    console.log('Add Travelling button pressed in TravellingListScreen');
    onAddNew();
  };

  return (
    <SafeAreaView style={globalStyles.complaintContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.complaintHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.complaintBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={globalStyles.travellingTitle}>Travelling</Text>
        
        <TouchableOpacity onPress={handleAddNewPress} style={globalStyles.travellingAddButton}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={globalStyles.travellingAddText}>Add Travelling</Text>
        </TouchableOpacity>
      </View>

      {/* Empty Content Area */}
      <View style={globalStyles.travellingContent}>
        <Text style={globalStyles.travellingEmptyText}>No travel requests found</Text>
        <Text style={globalStyles.travellingEmptySubtext}>Tap "Add Travelling" to create a travel request</Text>
      </View>
    </SafeAreaView>
  );
};

export default TravellingListScreen;
