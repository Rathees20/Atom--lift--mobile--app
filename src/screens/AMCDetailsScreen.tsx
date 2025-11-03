import React, { useState } from 'react';
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
import { AMCItem } from '../utils/api';

interface AMCDetailsScreenProps {
  amc: AMCItem;
  onBack: () => void;
}

const AMCDetailsScreen: React.FC<AMCDetailsScreenProps> = ({ amc, onBack }) => {
  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active': return '#27ae60'; // Green
      case 'ended': return '#e74c3c'; // Red
      default: return '#7f8c8d'; // Gray
    }
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
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
        }}>AMC Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={globalStyles.complaintContent} showsVerticalScrollIndicator={false}>
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
            }}>Basic Information</Text>

            {/* Reference ID */}
            {(amc.amc_id || amc.amcId || amc.reference_id) && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Reference ID</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {amc.amc_id || amc.amcId || amc.reference_id}
                </Text>
              </View>
            )}

            {/* AMC Name */}
            {(amc.amcname || amc.site_name || amc.siteName) && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>AMC Name</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {amc.amcname || amc.site_name || amc.siteName}
                </Text>
              </View>
            )}

            {/* Customer Name */}
            {(amc.customer_name || amc.customer) && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Customer Name</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {amc.customer_name || amc.customer}
                </Text>
              </View>
            )}

            {/* Customer Email */}
            {amc.customer_email && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Customer Email</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>{amc.customer_email}</Text>
              </View>
            )}

            {/* Customer Phone */}
            {amc.customer_phone && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Customer Phone</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>{amc.customer_phone}</Text>
              </View>
            )}

            {/* Customer Site Address */}
            {amc.customer_site_address && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Site Address</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50' }}>{amc.customer_site_address}</Text>
              </View>
            )}

            {/* Customer Job No */}
            {amc.customer_job_no && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Job Number</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>{amc.customer_job_no}</Text>
              </View>
            )}

            {/* Status */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Status</Text>
              <View style={{
                backgroundColor: getStatusColor(amc.status || ''),
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 15,
                alignSelf: 'flex-start',
              }}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>
                  {(amc.status || 'N/A').toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Duration */}
            {amc.duration && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Duration</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>{amc.duration}</Text>
              </View>
            )}
          </View>

          {/* Dates */}
          {(amc.start_date || amc.end_date) && (
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
              }}>Dates</Text>

              {/* Start Date */}
              {amc.start_date && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Start Date</Text>
                  <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                    {formatDate(amc.start_date)}
                  </Text>
                </View>
              )}

              {/* End Date */}
              {amc.end_date && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>End Date</Text>
                  <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                    {formatDate(amc.end_date)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Equipment Details */}
          {(amc.equipment_no || amc.no_of_lifts) && (
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
              }}>Equipment Details</Text>

              {/* Equipment Number */}
              {amc.equipment_no && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Equipment Number</Text>
                  <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>{amc.equipment_no}</Text>
                </View>
              )}

              {/* Number of Lifts */}
              {amc.no_of_lifts && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Number of Lifts</Text>
                  <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>{amc.no_of_lifts}</Text>
                </View>
              )}
            </View>
          )}

          {/* Financial Information */}
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
            }}>Financial Information</Text>

            {/* Contract Amount */}
            {amc.contract_amount && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Contract Amount</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  ₹{parseFloat(amc.contract_amount).toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {/* Total Amount */}
            {amc.total && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Total Amount</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  ₹{parseFloat(amc.total).toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {/* Amount Due */}
            {amc.amount_due && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Amount Due</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  ₹{parseFloat(amc.amount_due).toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {/* Total Amount Paid */}
            {amc.total_amount_paid && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Total Amount Paid</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  ₹{parseFloat(amc.total_amount_paid).toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {/* Price */}
            {amc.price && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Price</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  ₹{parseFloat(amc.price).toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {/* GST Percentage */}
            {amc.gst_percentage && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>GST Percentage</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>{amc.gst_percentage}%</Text>
              </View>
            )}

            {/* Payment Terms */}
            {amc.payment_terms && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Payment Terms</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {amc.payment_terms}
                </Text>
              </View>
            )}

            {/* Invoice Frequency */}
            {amc.invoice_frequency_display && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Invoice Frequency</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {amc.invoice_frequency_display}
                </Text>
              </View>
            )}
          </View>

          {/* Service Information */}
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
            }}>Service Information</Text>

            {/* AMC Type Name */}
            {amc.amc_type_name && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>AMC Type</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>{amc.amc_type_name}</Text>
              </View>
            )}

            {/* Number of Services */}
            {(amc.no_of_services || amc.number_of_services) && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Number of Services</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {amc.no_of_services || amc.number_of_services}
                </Text>
              </View>
            )}

            {/* Is Generate Contract */}
            {amc.is_generate_contract !== undefined && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Contract Generation</Text>
                <View style={{
                  backgroundColor: amc.is_generate_contract ? '#27ae60' : '#e74c3c',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 15,
                  alignSelf: 'flex-start',
                }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>
                    {amc.is_generate_contract ? 'ENABLED' : 'DISABLED'}
                  </Text>
                </View>
              </View>
            )}

            {/* Notes */}
            {amc.notes && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Notes</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50' }}>{amc.notes}</Text>
              </View>
            )}

            {/* Created Date */}
            {amc.created && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Created Date</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {formatDate(amc.created)}
                </Text>
              </View>
            )}
          </View>

          {/* Location (if available) */}
          {(amc.latitude || amc.longitude) && (
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
              }}>Location</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="location" size={20} color="#3498db" />
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginLeft: 8 }}>Coordinates</Text>
              </View>
              <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                {amc.latitude}, {amc.longitude}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AMCDetailsScreen;
