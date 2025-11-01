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

interface ThisMonthDueScreenProps {
  onBack: () => void;
}

const ThisMonthDueScreen: React.FC<ThisMonthDueScreenProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={globalStyles.routineMaintenanceContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.routineMaintenanceHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.routineMaintenanceBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={globalStyles.routineMaintenanceTitle}>This Month Due</Text>
        <View style={globalStyles.routineMaintenanceHeaderSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={globalStyles.routineMaintenanceContent} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.leaveContent}>
          <Ionicons name="time-outline" size={80} color="#bdc3c7" />
          <Text style={globalStyles.leaveEmptyText}>No Services Due This Month</Text>
          <Text style={globalStyles.leaveEmptySubtext}>
            There are no maintenance services due this month.{'\n'}
            All scheduled services are up to date.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ThisMonthDueScreen;
