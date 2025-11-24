import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { RoutineServiceItem } from '../utils/api';

interface ServiceDetailsScreenProps {
  service: RoutineServiceItem;
  onBack: () => void;
}

const ServiceDetailsScreen: React.FC<ServiceDetailsScreenProps> = ({ service, onBack }) => {
  // Debug: Log service data to see what we're receiving
  React.useEffect(() => {
    console.log('ServiceDetailsScreen - Service data:', JSON.stringify(service, null, 2));
    console.log('ServiceDetailsScreen - AMC Detail:', JSON.stringify(service.amc_detail, null, 2));
  }, [service]);

  const getStatusColor = (status?: string): string => {
    if (!status) return '#7f8c8d';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed')) return '#27ae60';
    if (statusLower.includes('overdue')) return '#e74c3c';
    if (statusLower.includes('due')) return '#f39c12';
    if (statusLower.includes('in_process') || statusLower.includes('in process')) return '#3498db';
    return '#7f8c8d';
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

  const formatDateTime = (dateStr?: string): string => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handlePhonePress = (phoneNumber?: string): void => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number not available');
      return;
    }
    // Remove any non-numeric characters except +
    const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
    if (cleanedNumber) {
      const phoneUrl = `tel:${cleanedNumber}`;
      Linking.openURL(phoneUrl).catch((err) => {
        console.error('Error opening phone dialer:', err);
        Alert.alert('Error', 'Unable to open phone dialer. Please check if your device supports phone calls.');
      });
    } else {
      Alert.alert('Error', 'Invalid phone number');
    }
  };

  const handleEmailPress = (email?: string): void => {
    if (!email) {
      Alert.alert('Error', 'Email address not available');
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Error', 'Invalid email address');
      return;
    }

    const mailUrl = `mailto:${encodeURIComponent(trimmedEmail)}`;
    Linking.openURL(mailUrl).catch((err) => {
      console.error('Error opening email client:', err);
      Alert.alert('Error', 'Unable to open email client. Please try again later.');
    });
  };

  const handleMapPress = (latitude?: string | null, longitude?: string | null, address?: string): void => {
    // If we have coordinates, use them
    if (latitude && longitude) {
      const lat = parseFloat(latitude.toString());
      const lng = parseFloat(longitude.toString());

      if (isNaN(lat) || isNaN(lng)) {
        // If coordinates are invalid, fall through to address search
        if (!address) {
          Alert.alert('Error', 'Location information not available');
          return;
        }
      } else {
        // Open in Google Maps with coordinates
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.openURL(googleMapsUrl).catch((err) => {
          console.error('Error opening maps:', err);
          // Fallback to Apple Maps on iOS or generic maps URL
          const mapsUrl = `geo:${lat},${lng}?q=${lat},${lng}${address ? `(${encodeURIComponent(address)})` : ''}`;
          Linking.openURL(mapsUrl).catch((fallbackErr) => {
            console.error('Error opening fallback maps:', fallbackErr);
            Alert.alert('Error', 'Unable to open maps application. Please try again later.');
          });
        });
        return;
      }
    }

    // If no coordinates but we have address, search by address
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      // Open Google Maps with address search
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      Linking.openURL(googleMapsUrl).catch((err) => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Unable to open maps application. Please try again later.');
      });
    } else {
      Alert.alert('Error', 'Location information not available');
    }
  };

  // Extract data from service - API returns fields directly on service object
  // Customer data is at root level, not nested in amc_detail
  const serviceData = service as any;
  
  // Debug: Log the actual service structure to understand API response
  React.useEffect(() => {
    console.log('=== Service Details Debug ===');
    console.log('Full Service Object:', JSON.stringify(service, null, 2));
    console.log('Customer Name:', serviceData.customer_name);
    console.log('Customer Address:', serviceData.customer_site_address);
    console.log('Customer Phone:', serviceData.customer_phone);
    console.log('Customer Email:', serviceData.customer_email);
    console.log('Latitude:', serviceData.customer_latitude);
    console.log('Longitude:', serviceData.customer_longitude);
    console.log('AMC Reference ID:', serviceData.amc_reference_id);
    console.log('Note:', serviceData.note);
    console.log('=== End Debug ===');
  }, [service, serviceData]);

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
        }}>Service Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={globalStyles.complaintContent} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
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

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Service ID</Text>
              <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                {service.id ? `#${service.id}` : 'N/A'}
              </Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Service Date</Text>
              <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                {formatDate(service.service_date || service.service_date_display || (service as any).date)}
              </Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Status</Text>
              {service.status ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: getStatusColor(service.status),
                    marginRight: 8,
                  }} />
                  <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                    {service.status_display || service.status}
                  </Text>
                </View>
              ) : (
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>N/A</Text>
              )}
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Notes</Text>
              <Text style={{
                fontSize: 16,
                color: '#2c3e50',
                fontWeight: '500',
                lineHeight: 24,
              }}>
                {serviceData.note || service.notes || 'N/A'}
              </Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Created At</Text>
              <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                {formatDateTime(service.created_at || (service as any).created_date)}
              </Text>
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
              fontSize: 20,
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: 15,
            }}>Customer Information</Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Customer Name</Text>
              <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                {serviceData.customer_name || 'N/A'}
              </Text>
            </View>

            {serviceData.customer_job_no && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Job Number</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {serviceData.customer_job_no}
                </Text>
              </View>
            )}

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Site Address</Text>
              <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                {serviceData.customer_site_address || 'N/A'}
              </Text>
            </View>

            {serviceData.customer_phone ? (
              <TouchableOpacity
                onPress={() => handlePhonePress(serviceData.customer_phone)}
                style={{ marginBottom: 12 }}
              >
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Phone</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="call-outline" size={18} color="#3498db" />
                  <Text style={{ fontSize: 16, color: '#3498db', fontWeight: '600', marginLeft: 8 }}>
                    {serviceData.customer_phone}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Phone</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>N/A</Text>
              </View>
            )}

            {serviceData.customer_email ? (
              <TouchableOpacity
                onPress={() => handleEmailPress(serviceData.customer_email)}
                style={{ marginBottom: 12 }}
              >
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Email</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="mail-outline" size={18} color="#3498db" />
                  <Text style={{ fontSize: 16, color: '#3498db', fontWeight: '600', marginLeft: 8 }}>
                    {serviceData.customer_email}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Email</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>N/A</Text>
              </View>
            )}

            {serviceData.amc_reference_id && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>AMC Reference ID</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {serviceData.amc_reference_id}
                </Text>
              </View>
            )}

            {serviceData.employee_name && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Assigned Employee</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {serviceData.employee_name}
                </Text>
              </View>
            )}
          </View>

          {/* Location & Map */}
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

            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="location" size={20} color="#3498db" />
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginLeft: 8 }}>Coordinates</Text>
              </View>
              <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600', marginLeft: 28 }}>
                {serviceData.customer_latitude && serviceData.customer_longitude 
                  ? `${serviceData.customer_latitude}, ${serviceData.customer_longitude}`
                  : 'N/A'}
              </Text>
            </View>

            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Address</Text>
              <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                {serviceData.customer_site_address || 'N/A'}
              </Text>
            </View>

            {serviceData.customer_site_address ? (
              <TouchableOpacity
                onPress={() => handleMapPress(
                  serviceData.customer_latitude, 
                  serviceData.customer_longitude, 
                  serviceData.customer_site_address
                )}
                style={{
                  backgroundColor: serviceData.customer_latitude && serviceData.customer_longitude 
                    ? '#3498db' 
                    : '#f39c12',
                  borderRadius: 8,
                  padding: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 10,
                }}
              >
                <Ionicons name="map-outline" size={20} color="#fff" />
                <Text style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 8,
                }}>
                  {serviceData.customer_latitude && serviceData.customer_longitude 
                    ? 'Open in Maps' 
                    : 'Search Address in Maps'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{
                backgroundColor: '#bdc3c7',
                borderRadius: 8,
                padding: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
              }}>
                <Ionicons name="map-outline" size={20} color="#fff" />
                <Text style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 8,
                }}>
                  Location Not Available
                </Text>
              </View>
            )}
          </View>

          {/* Additional Service Details */}
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
            }}>Additional Information</Text>

            {serviceData.amc_reference_id && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>AMC Reference ID</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {serviceData.amc_reference_id}
                </Text>
              </View>
            )}

            {serviceData.amc_id && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>AMC ID</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {serviceData.amc_id}
                </Text>
              </View>
            )}

            {serviceData.block_wing && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Block/Wing</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                  {serviceData.block_wing}
                </Text>
              </View>
            )}

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Is Overdue</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: serviceData.is_overdue ? '#e74c3c' : '#27ae60',
                  marginRight: 8,
                }} />
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '600' }}>
                  {serviceData.is_overdue ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>

            {serviceData.updated_at && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>Last Updated</Text>
                <Text style={{ fontSize: 16, color: '#2c3e50', fontWeight: '500' }}>
                  {formatDateTime(serviceData.updated_at)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceDetailsScreen;

