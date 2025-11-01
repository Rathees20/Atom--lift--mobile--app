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

interface LeaveListScreenProps {
  onBack: () => void;
  onAddNew: () => void;
}

const LeaveListScreen: React.FC<LeaveListScreenProps> = ({ onBack, onAddNew }) => {
  const handleAddNewPress = (): void => {
    console.log('Add new button pressed in LeaveListScreen');
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
        
        <Text style={globalStyles.leaveTitle}>Leave</Text>
        
        <TouchableOpacity onPress={handleAddNewPress} style={globalStyles.leaveAddButton}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={globalStyles.leaveAddText}>Add new</Text>
        </TouchableOpacity>
      </View>

      {/* Empty Content Area */}
      <View style={globalStyles.leaveContent}>
        <Text style={globalStyles.leaveEmptyText}>No leave requests found</Text>
        <Text style={globalStyles.leaveEmptySubtext}>Tap "Add new" to create a leave request</Text>
      </View>
    </SafeAreaView>
  );
};

export default LeaveListScreen;
