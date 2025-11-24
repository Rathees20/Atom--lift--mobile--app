import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { getRoutineServices, RoutineServiceItem } from '../utils/api';

interface TodayServicesScreenProps {
  onBack: () => void;
}

const TodayServicesScreen: React.FC<TodayServicesScreenProps> = ({ onBack }) => {
  const [services, setServices] = useState<RoutineServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodayServices();
  }, []);

  const fetchTodayServices = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const today = new Date().toISOString().split('T')[0];
      const data = await getRoutineServices({ date: today });
      setServices(data);
    } catch (err: any) {
      console.error('Error fetching today services:', err);
      setError(err.message || 'Failed to fetch today services');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status?: string): string => {
    if (!status) return '#7f8c8d';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed')) return '#27ae60';
    if (statusLower.includes('overdue')) return '#e74c3c';
    if (statusLower.includes('due')) return '#f39c12';
    if (statusLower.includes('in_process') || statusLower.includes('in process')) return '#3498db';
    return '#7f8c8d';
  };

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
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading services...</Text>
          </View>
        ) : error ? (
          <View style={globalStyles.leaveContent}>
            <Ionicons name="alert-circle-outline" size={80} color="#e74c3c" />
            <Text style={globalStyles.leaveEmptyText}>Error Loading Services</Text>
            <Text style={globalStyles.leaveEmptySubtext}>{error}</Text>
            <TouchableOpacity
              onPress={fetchTodayServices}
              style={{
                marginTop: 20,
                backgroundColor: '#3498db',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : services.length === 0 ? (
          <View style={globalStyles.leaveContent}>
            <Ionicons name="calendar-outline" size={80} color="#bdc3c7" />
            <Text style={globalStyles.leaveEmptyText}>No Services Today</Text>
            <Text style={globalStyles.leaveEmptySubtext}>
              There are no scheduled services for today.{'\n'}
              Check back later or contact your supervisor for updates.
            </Text>
          </View>
        ) : (
          services.map((service) => (
            <View key={service.id} style={globalStyles.routineMaintenanceItem}>
              <View style={globalStyles.routineMaintenanceItemLeft}>
                <View style={[globalStyles.routineMaintenanceIconContainer, { backgroundColor: getStatusColor(service.status) }]}>
                  <Ionicons name="settings-outline" size={24} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={globalStyles.routineMaintenanceItemText}>
                    {service.amc_detail?.site_name || service.amc_detail?.customer_name || 'Service'}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#7f8c8d', marginTop: 4 }}>
                    {formatDate(service.service_date || service.service_date_display)}
                  </Text>
                  {service.status && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: getStatusColor(service.status),
                        marginRight: 6,
                      }} />
                      <Text style={{ fontSize: 12, color: '#34495e' }}>
                        {service.status_display || service.status}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#2c3e50" />
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TodayServicesScreen;
