import React, { useState, useEffect } from 'react';
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
import { ComplaintItem } from '../utils/api';

interface ComplaintDetailsScreenProps {
  complaint: ComplaintItem;
  onBack: () => void;
}

const ComplaintDetailsScreen: React.FC<ComplaintDetailsScreenProps> = ({ complaint, onBack }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open': return '#e67e22'; // Orange
      case 'in progress': return '#3498db'; // Blue
      case 'closed': return '#27ae60'; // Green
      default: return '#7f8c8d'; // Gray
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high': return '#e74c3c'; // Red
      case 'medium': return '#f39c12'; // Orange
      case 'low': return '#27ae60'; // Green
      default: return '#7f8c8d'; // Gray
    }
  };

  const formatDateTime = (dateTimeStr: string): string => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return dateTimeStr;
    }
  };

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />

      {/* Header */}
      <View style={globalStyles.complaintHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.complaintBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold',
          flex: 1,
          textAlign: 'center',
          marginHorizontal: 20,
        }}>Complaint Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={globalStyles.complaintContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading details...</Text>
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            {/* Basic Information */}
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 20,
              marginBottom: 15,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: 15,
              }}>
                {complaint.title}
              </Text>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#2c3e50',
                }}>
                  {complaint.reference}
                </Text>
                <View style={{
                  backgroundColor: getStatusColor(complaint.status),
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}>
                    {complaint.status}
                  </Text>
                </View>
              </View>

              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
              }}>
                <Text style={{ fontSize: 14, color: '#666' }}>
                  Created: {formatDateTime(complaint.dateTime)}
                </Text>
                <View style={{
                  backgroundColor: getPriorityColor(complaint.priority),
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}>
                  <Text style={{
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}>
                    {complaint.priority} Priority
                  </Text>
                </View>
              </View>
            </View>

            {/* Customer Information */}
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 20,
              marginBottom: 15,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: 15,
              }}>
                Customer Information
              </Text>

              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>Customer Name</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                  {complaint.customer_name}
                </Text>
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>Site Address</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                  {complaint.siteAddress}
                </Text>
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>Contact Person</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                  {complaint.contact_person}
                </Text>
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>Mobile Number</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                  {complaint.mobileNumber}
                </Text>
              </View>

              {complaint.block_wing && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>Block/Wing</Text>
                  <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                    {complaint.block_wing}
                  </Text>
                </View>
              )}
            </View>

            {/* Complaint Details */}
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 20,
              marginBottom: 15,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: 15,
              }}>
                Complaint Details
              </Text>

              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>Type</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                  {complaint.amcType}
                </Text>
              </View>

              {complaint.subject && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>Subject</Text>
                  <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                    {complaint.subject}
                  </Text>
                </View>
              )}

              {complaint.message && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>Message</Text>
                  <Text style={{
                    fontSize: 16,
                    color: '#2c3e50',
                    fontWeight: '500',
                    lineHeight: 24,
                  }}>
                    {complaint.message}
                  </Text>
                </View>
              )}

              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>Assigned To</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                  {complaint.assigned_to}
                </Text>
              </View>
            </View>

            {/* Resolution */}
            {(complaint.technician_remark || complaint.solution) && (
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                padding: 20,
                marginBottom: 15,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  marginBottom: 15,
                }}>
                  Resolution
                </Text>

                {complaint.technician_remark && (
                  <View style={{ marginBottom: 15 }}>
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Technician Remark</Text>
                    <Text style={{
                      fontSize: 16,
                      color: '#2c3e50',
                      fontWeight: '500',
                      lineHeight: 24,
                      backgroundColor: '#f8f9fa',
                      padding: 10,
                      borderRadius: 5,
                    }}>
                      {complaint.technician_remark}
                    </Text>
                  </View>
                )}

                {complaint.solution && (
                  <View style={{ marginBottom: 15 }}>
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>Solution</Text>
                    <Text style={{
                      fontSize: 16,
                      color: '#2c3e50',
                      fontWeight: '500',
                      lineHeight: 24,
                      backgroundColor: '#f8f9fa',
                      padding: 10,
                      borderRadius: 5,
                    }}>
                      {complaint.solution}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Signatures */}
            {(complaint.technician_signature || complaint.customer_signature) && (
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                padding: 20,
                marginBottom: 15,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  marginBottom: 15,
                }}>
                  Signatures
                </Text>

                {complaint.technician_signature && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>Technician Signature</Text>
                    <View style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 5,
                      height: 80,
                      backgroundColor: '#f8f9fa',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ color: '#27ae60', fontSize: 14, fontWeight: 'bold' }}>
                        ✓ Digital Signature Captured
                      </Text>
                    </View>
                  </View>
                )}

                {complaint.customer_signature && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>Customer Signature</Text>
                    <View style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 5,
                      height: 80,
                      backgroundColor: '#f8f9fa',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ color: '#27ae60', fontSize: 14, fontWeight: 'bold' }}>
                        ✓ Digital Signature Captured
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ComplaintDetailsScreen;
