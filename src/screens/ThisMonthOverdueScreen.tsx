import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';

interface ThisMonthOverdueScreenProps {
  onBack: () => void;
}

const ThisMonthOverdueScreen: React.FC<ThisMonthOverdueScreenProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={globalStyles.routineMaintenanceContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.routineMaintenanceHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.routineMaintenanceBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={globalStyles.routineMaintenanceTitle}>This Month Overdue</Text>
        <View style={globalStyles.routineMaintenanceHeaderSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={globalStyles.routineMaintenanceContent} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.leaveContent}>
          <Ionicons name="warning-outline" size={80} color="#e74c3c" />
          <Text style={globalStyles.leaveEmptyText}>No Overdue Services</Text>
          <Text style={globalStyles.leaveEmptySubtext}>
            Great! There are no overdue maintenance services this month.{'\n'}
            All services are being completed on time.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ThisMonthOverdueScreen;
