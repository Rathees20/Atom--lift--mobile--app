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

  const handleDelete = (): void => {
    if (leave.status === 'pending') {
      Alert.alert('Delete Leave', 'Are you sure you want to delete this leave request?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await deleteLeave(leave.id);
              if (result.success) {
                Alert.alert('Success', result.message || 'Leave deleted successfully', [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (onDelete) {
                        onDelete();
                      } else {
                        onBack();
                      }
                    },
                  },
                ]);
              } else {
                Alert.alert('Error', result.message || 'Failed to delete leave');
              }
            } catch (error: any) {
              console.error('Error deleting leave:', error);
              Alert.alert('Error', error.message || 'Failed to delete leave. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]);
    } else {
      Alert.alert('Cannot Delete', 'Only pending leave requests can be deleted.');
    }
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
            {/* Leave Information */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                padding: 18,
                marginBottom: 15,
                minHeight: 200,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  marginBottom: 15,
                }}
              >
                Leave Information
              </Text>

              {/* Leave Type */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Leave Type</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {leave.leave_type_display ||
                    leaveTypeDisplayMap[leave.leave_type] ||
                    leave.leave_type}
                  {leave.half_day ? ' (Half Day)' : ''}
                </Text>
              </View>

              {/* Date Range */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Date Range</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {formatDate(leave.from_date)} {leave.from_date !== leave.to_date ? `- ${formatDate(leave.to_date)}` : ''}
                </Text>
              </View>

              {/* Status */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Status</Text>
                <View
                  style={{
                    backgroundColor: getStatusColor(leave.status || 'pending') + '20',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text
                    style={{
                      color: getStatusColor(leave.status || 'pending'),
                      fontSize: 14,
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    {leave.status_display || leave.status || 'Pending'}
                  </Text>
                </View>
              </View>

              {/* Email */}
              {leave.email && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Email</Text>
                  <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                    {leave.email}
                  </Text>
                </View>
              )}

              {/* Reason */}
              {leave.reason && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Reason</Text>
                  <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                    {leave.reason}
                  </Text>
                </View>
              )}

              {/* Created At */}
              {leave.created_at && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>
                    Created At
                  </Text>
                  <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                    {formatDateTime(leave.created_at)}
                  </Text>
                </View>
              )}

              {/* Updated At */}
              {leave.updated_at && (
                <View>
                  <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>
                    Updated At
                  </Text>
                  <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                    {formatDateTime(leave.updated_at)}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            {canEditOrDelete && (
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 15,
                }}
              >
                <TouchableOpacity
                  onPress={handleEdit}
                  style={{
                    flex: 1,
                    backgroundColor: '#3498db',
                    paddingVertical: 14,
                    borderRadius: 8,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Ionicons name="create-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Edit</Text>
                </TouchableOpacity>

                <View style={{ width: 12 }} />

                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    flex: 1,
                    backgroundColor: '#e74c3c',
                    paddingVertical: 14,
                    borderRadius: 8,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Delete</Text>
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
