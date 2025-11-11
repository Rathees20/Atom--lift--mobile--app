import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { LeaveItem, deleteLeave, updateLeave, CreateLeaveData } from '../utils/api';

interface LeaveDetailsScreenProps {
  leave: LeaveItem;
  onBack: () => void;
  onEdit?: (leave: LeaveItem) => void;
  onDelete?: () => void;
}

const LeaveDetailsScreen: React.FC<LeaveDetailsScreenProps> = ({ leave, onBack, onEdit, onDelete }) => {
  const [loading, setLoading] = useState<boolean>(false);

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

  const formatDateTime = (dateTimeStr?: string): string => {
    if (!dateTimeStr) return 'N/A';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return dateTimeStr;
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateTimeStr || 'N/A';
    }
  };

  const leaveTypeDisplayMap: Record<string, string> = {
    casual: 'Casual Leave',
    sick: 'Sick Leave',
    earned: 'Earned Leave',
    unpaid: 'Unpaid Leave',
    other: 'Other',
  };

  const handleEdit = (): void => {
    if (leave.status === 'pending') {
      if (onEdit) {
        onEdit(leave);
      }
    } else {
      Alert.alert('Cannot Edit', 'Only pending leave requests can be edited.');
    }
  };

  const completeDelete = async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await deleteLeave(leave.id);
      if (result.success) {
        const handleSuccess = () => {
          if (onDelete) {
            onDelete();
          } else {
            onBack();
          }
        };

        if (Platform.OS === 'web') {
          handleSuccess();
        } else {
          Alert.alert('Success', result.message || 'Leave deleted successfully', [
            { text: 'OK', onPress: handleSuccess },
          ]);
        }
      } else {
        Alert.alert('Error', result.message || 'Failed to delete leave');
      }
    } catch (error: any) {
      console.error('Error deleting leave:', error);
      Alert.alert('Error', error.message || 'Failed to delete leave. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (): void => {
    if (leave.status !== 'pending') {
      Alert.alert('Cannot Delete', 'Only pending leave requests can be deleted.');
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this leave request?');
      if (confirmed) {
        void completeDelete();
      }
      return;
    }

    Alert.alert('Delete Leave', 'Are you sure you want to delete this leave request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void completeDelete();
        },
      },
    ]);
  };

  const canEditOrDelete = leave.status === 'pending';

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />

      {/* Header */}
      <View style={globalStyles.complaintHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.complaintBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            flex: 1,
            textAlign: 'center',
            marginHorizontal: 20,
          }}
        >
          Leave Details
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={globalStyles.complaintContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
          </View>
        ) : (
          <View style={{ padding: 12 }}>
            {/* Status Card - Prominent */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                padding: 14,
                marginBottom: 12,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 6 }}>Status</Text>
              <View
                style={{
                  backgroundColor: getStatusColor(leave.status || 'pending') + '20',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: getStatusColor(leave.status || 'pending'),
                }}
              >
                <Text
                  style={{
                    color: getStatusColor(leave.status || 'pending'),
                    fontSize: 14,
                    fontWeight: '700',
                    textTransform: 'capitalize',
                    letterSpacing: 0.5,
                  }}
                >
                  {leave.status_display || leave.status || 'Pending'}
                </Text>
              </View>
            </View>

            {/* Leave Information Card */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                padding: 14,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View
                  style={{
                    width: 3,
                    height: 18,
                    backgroundColor: '#3498db',
                    borderRadius: 2,
                    marginRight: 10,
                  }}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#2c3e50',
                  }}
                >
                  Leave Information
                </Text>
              </View>

              {/* Leave Type */}
              <View style={{ flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' }}>
                <Ionicons name="calendar-outline" size={18} color="#3498db" style={{ marginRight: 10, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#7f8c8d', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Leave Type</Text>
                  <Text style={{ fontSize: 14, color: '#2c3e50', fontWeight: '600' }}>
                    {leave.leave_type_display ||
                      leaveTypeDisplayMap[leave.leave_type] ||
                      leave.leave_type}
                    {leave.half_day ? ' (Half Day)' : ''}
                  </Text>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: '#f0f0f0', marginVertical: 3 }} />

              {/* Date Range */}
              <View style={{ flexDirection: 'row', marginTop: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                <Ionicons name="time-outline" size={18} color="#3498db" style={{ marginRight: 10, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#7f8c8d', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Date Range</Text>
                  <Text style={{ fontSize: 14, color: '#2c3e50', fontWeight: '600' }}>
                    {formatDate(leave.from_date)} {leave.from_date !== leave.to_date ? `- ${formatDate(leave.to_date)}` : ''}
                  </Text>
                </View>
              </View>

              {/* Email */}
              {leave.email && (
                <>
                  <View style={{ height: 1, backgroundColor: '#f0f0f0', marginVertical: 3 }} />
                  <View style={{ flexDirection: 'row', marginTop: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                    <Ionicons name="mail-outline" size={18} color="#3498db" style={{ marginRight: 10, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#7f8c8d', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</Text>
                      <Text style={{ fontSize: 14, color: '#2c3e50', fontWeight: '500' }}>
                        {leave.email}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {/* Reason */}
              {leave.reason && (
                <>
                  <View style={{ height: 1, backgroundColor: '#f0f0f0', marginVertical: 3 }} />
                  <View style={{ flexDirection: 'row', marginTop: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                    <Ionicons name="document-text-outline" size={18} color="#3498db" style={{ marginRight: 10, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#7f8c8d', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Reason</Text>
                      <Text style={{ fontSize: 14, color: '#2c3e50', fontWeight: '500', lineHeight: 20 }}>
                        {leave.reason}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Timestamp Information */}
            {(leave.created_at || leave.updated_at) && (
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View
                    style={{
                      width: 3,
                      height: 18,
                      backgroundColor: '#95a5a6',
                      borderRadius: 2,
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#7f8c8d',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Timeline
                  </Text>
                </View>

                {/* Created At */}
                {leave.created_at && (
                  <View style={{ flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' }}>
                    <Ionicons name="add-circle-outline" size={16} color="#95a5a6" style={{ marginRight: 10, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#7f8c8d', marginBottom: 3 }}>Created At</Text>
                      <Text style={{ fontSize: 13, color: '#2c3e50', fontWeight: '500' }}>
                        {formatDateTime(leave.created_at)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Updated At */}
                {leave.updated_at && (
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Ionicons name="refresh-outline" size={16} color="#95a5a6" style={{ marginRight: 10, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: '#7f8c8d', marginBottom: 3 }}>Updated At</Text>
                      <Text style={{ fontSize: 13, color: '#2c3e50', fontWeight: '500' }}>
                        {formatDateTime(leave.updated_at)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Action Buttons */}
            {canEditOrDelete && (
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 16,
                  gap: 10,
                }}
              >
                <TouchableOpacity
                  onPress={handleEdit}
                  style={{
                    flex: 1,
                    backgroundColor: '#3498db',
                    paddingVertical: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#3498db',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    flex: 1,
                    backgroundColor: '#e74c3c',
                    paddingVertical: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#e74c3c',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LeaveDetailsScreen;
