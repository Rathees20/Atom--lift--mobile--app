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

interface TodayServicesScreenProps {
  onBack: () => void;
}

const TodayServicesScreen: React.FC<TodayServicesScreenProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={globalStyles.routineMaintenanceContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.routineMaintenanceHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.routineMaintenanceBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={globalStyles.routineMaintenanceTitle}>Today's Services</Text>
        <View style={globalStyles.routineMaintenanceHeaderSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={globalStyles.routineMaintenanceContent} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.leaveContent}>
          <Ionicons name="calendar-outline" size={80} color="#bdc3c7" />
          <Text style={globalStyles.leaveEmptyText}>No Services Today</Text>
          <Text style={globalStyles.leaveEmptySubtext}>
            There are no scheduled services for today.{'\n'}
            Check back later or contact your supervisor for updates.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TodayServicesScreen;
