import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { getLeaveList, LeaveItem, deleteLeave, getLeaveCounts, LeaveCountsResponse } from '../utils/api';

interface LeaveListScreenProps {
  onBack: () => void;
  onAddNew: () => void;
  onShowDetails?: (leave: LeaveItem) => void;
  reloadTrigger?: number; // ✅ Add a prop to trigger refresh after adding new leave
}

const LeaveListScreen: React.FC<LeaveListScreenProps> = ({ onBack, onAddNew, onShowDetails, reloadTrigger }) => {
  const [leaveItems, setLeaveItems] = useState<LeaveItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [leaveCounts, setLeaveCounts] = useState<LeaveCountsResponse | null>(null);

  useEffect(() => {
    fetchLeaveList();
    fetchLeaveCounts();
  }, []);

  // ✅ Re-fetch whenever reloadTrigger changes (e.g. after new leave added)
  useEffect(() => {
    if (reloadTrigger) {
      fetchLeaveList();
      fetchLeaveCounts();
    }
  }, [reloadTrigger]);

  const fetchLeaveList = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLeaveList();
      console.log('Leave list API response:', data);

      const normalizedData = Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            status: item.status || 'pending',
            leave_type_display:
              item.leave_type_display ||
              leaveTypeDisplayMap[item.leave_type] ||
              item.leave_type,
          }))
        : [];

      console.log('Normalized leave items:', normalizedData);
      setLeaveItems(normalizedData);
    } catch (error: any) {
      console.error('Error fetching leave list:', error);
      setError(
        error?.message ||
          'Failed to fetch leave list. Please check your connection and try again.'
      );
      setLeaveItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Simple mapping to show readable leave type
  const leaveTypeDisplayMap: Record<string, string> = {
    casual: 'Casual Leave',
    sick: 'Sick Leave',
    earned: 'Earned Leave',
    unpaid: 'Unpaid Leave',
    other: 'Other',
  };

  const fetchLeaveCounts = async (): Promise<void> => {
    try {
      const counts = await getLeaveCounts();
      setLeaveCounts(counts);
    } catch (error: any) {
      console.error('Error fetching leave counts:', error);
      // Don't show error, just silently fail
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([fetchLeaveList(), fetchLeaveCounts()]);
    setRefreshing(false);
  };

  const handleAddNewPress = (): void => {
    onAddNew();
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '#27ae60'; // Green
      case 'rejected':
        return '#e74c3c'; // Red
      case 'pending':
      default:
        return '#f39c12'; // Orange
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString || 'N/A';
    }
  };

  const formatDateRange = (fromDate?: string, toDate?: string): string => {
    if (!fromDate && !toDate) return 'N/A';
    if (fromDate === toDate) return formatDate(fromDate);
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  };

  const handleItemLongPress = (item: LeaveItem): void => {
    if (item.status === 'pending') {
      Alert.alert('Leave Request', 'Choose an action', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEditLeave(item) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteLeave(item) },
      ]);
    }
  };

  const handleEditLeave = (item: LeaveItem): void => {
    Alert.alert('Edit Leave', 'Edit functionality will be implemented soon.');
  };

  const handleDeleteLeave = (item: LeaveItem): void => {
    Alert.alert('Delete Leave', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await deleteLeave(item.id);
            if (result.success) {
              Alert.alert('Deleted', result.message || 'Leave deleted successfully');
              await Promise.all([fetchLeaveList(), fetchLeaveCounts()]);
            } else {
              Alert.alert('Error', result.message || 'Failed to delete leave');
            }
          } catch (error: any) {
            console.error('Error deleting leave:', error);
            Alert.alert('Error', error.message || 'Failed to delete leave. Try again.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={globalStyles.complaintContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />

      {/* Header */}
      <View style={globalStyles.complaintHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.complaintBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={globalStyles.leaveTitle}>Leave Requests</Text>

        <TouchableOpacity onPress={handleAddNewPress} style={globalStyles.leaveAddButton}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={globalStyles.leaveAddText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Leave Counts Summary */}
      {leaveCounts && leaveCounts.counts.length > 0 && (
        <View
          style={{
            backgroundColor: '#fff',
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 8,
            padding: 16,
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12 }}>
            Leave Balance
          </Text>
          {leaveCounts.counts.map((count, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 8,
                borderBottomWidth: index < leaveCounts.counts.length - 1 ? 1 : 0,
                borderBottomColor: '#ecf0f1',
              }}
            >
              <Text style={{ fontSize: 14, color: '#2c3e50', flex: 1 }}>
                {count.leave_type_display || leaveTypeDisplayMap[count.leave_type] || count.leave_type}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                  <Text style={{ fontSize: 12, color: '#7f8c8d' }}>Remaining</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#27ae60' }}>
                    {count.total_remaining}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                  <Text style={{ fontSize: 12, color: '#7f8c8d' }}>Used</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#e74c3c' }}>
                    {count.total_used}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 12, color: '#7f8c8d' }}>Total</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#3498db' }}>
                    {count.total_allotted}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          {leaveCounts.total_all_leaves_remaining !== undefined && (
            <View
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 2,
                borderTopColor: '#3498db',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50' }}>Total</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginRight: 16 }}>
                  Remaining: <Text style={{ fontWeight: '600', color: '#27ae60' }}>{leaveCounts.total_all_leaves_remaining}</Text>
                </Text>
                <Text style={{ fontSize: 14, color: '#7f8c8d' }}>
                  Used: <Text style={{ fontWeight: '600', color: '#e74c3c' }}>{leaveCounts.total_all_leaves_used || 0}</Text>
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={globalStyles.leaveContent}
        contentContainerStyle={
          isLoading || error || leaveItems.length === 0
            ? { flexGrow: 1, paddingVertical: 16 }
            : { paddingVertical: 16 }
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      >
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading leave requests...</Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
            <Text style={{ marginTop: 16, fontSize: 16, color: '#e74c3c', textAlign: 'center' }}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={fetchLeaveList}
              style={{
                backgroundColor: '#3498db',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                marginTop: 16,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : leaveItems.length > 0 ? (
          leaveItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{
                backgroundColor: '#fff',
                marginHorizontal: 16,
                marginVertical: 8,
                padding: 16,
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={() => {
                if (onShowDetails) {
                  onShowDetails(item);
                }
              }}
              onLongPress={() => handleItemLongPress(item)}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  {/* ✅ show user-friendly leave type */}
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 }}>
                    {item.leave_type_display || leaveTypeDisplayMap[item.leave_type] || 'Leave Request'}
                    {item.half_day ? ' (Half Day)' : ''}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>
                    {formatDateRange(item.from_date, item.to_date)}
                  </Text>
                  {item.email && (
                    <Text style={{ fontSize: 12, color: '#95a5a6' }}>{item.email}</Text>
                  )}
                </View>
                <View
                  style={{
                    backgroundColor: getStatusColor(item.status || 'pending') + '20',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: getStatusColor(item.status || 'pending'),
                      fontSize: 12,
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    {item.status || 'Pending'}
                  </Text>
                </View>
              </View>

              {item.reason && (
                <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#ecf0f1' }}>
                  <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 4 }}>Reason:</Text>
                  <Text style={{ fontSize: 14, color: '#2c3e50' }}>{item.reason}</Text>
                </View>
              )}

              {item.created_at && (
                <Text style={{ fontSize: 11, color: '#bdc3c7', marginTop: 8 }}>
                  Created: {formatDate(item.created_at)}
                </Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <Ionicons name="document-text-outline" size={48} color="#bdc3c7" />
            <Text style={globalStyles.leaveEmptyText}>No leave requests found</Text>
            <Text style={globalStyles.leaveEmptySubtext}>Tap "Add" to create a new one</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LeaveListScreen;
