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

interface LastMonthOverdueScreenProps {
  onBack: () => void;
}

const LastMonthOverdueScreen: React.FC<LastMonthOverdueScreenProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={globalStyles.routineMaintenanceContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.routineMaintenanceHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.routineMaintenanceBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={globalStyles.routineMaintenanceTitle}>Last Month Overdue</Text>
        <View style={globalStyles.routineMaintenanceHeaderSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={globalStyles.routineMaintenanceContent} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.leaveContent}>
          <Ionicons name="checkmark-circle-outline" size={80} color="#27ae60" />
          <Text style={globalStyles.leaveEmptyText}>No Overdue Services</Text>
          <Text style={globalStyles.leaveEmptySubtext}>
            Excellent! There were no overdue maintenance services last month.{'\n'}
            All services were completed on schedule.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LastMonthOverdueScreen;
