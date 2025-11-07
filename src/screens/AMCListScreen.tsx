import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { getAMCList, AMCItem } from '../utils/api';

interface AMCListScreenProps {
  onBack: () => void;
  onShowDetails?: (amc: AMCItem) => void;
}

const AMCListScreen: React.FC<AMCListScreenProps> = ({ onBack, onShowDetails }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [amcItems, setAmcItems] = useState<AMCItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  useEffect(() => {
    fetchAMCList();
  }, []);

  const fetchAMCList = async () => {
    setIsLoading(true);
    try {
      const data = await getAMCList();
      console.log('Raw API response:', data);
      console.log('Data type:', typeof data);
      console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
      
      // Normalize the data to handle different field names from API
      const normalizedData = Array.isArray(data) ? data.map((item) => {
        const normalized = {
          ...item,
          amcId: item.amc_id || item.amcId || item.reference_id || '',
          number: item.number || '',
          siteName: item.site_name || item.siteName || item.amcname || '',
          isOverdue: item.is_overdue || item.isOverdue || false,
        };
        console.log('Normalized item:', normalized);
        return normalized;
      }) : [];
      
      console.log('Final normalized data:', normalizedData);
      console.log('Setting AMC items, count:', normalizedData.length);
      setAmcItems(normalizedData);
    } catch (error: any) {
      console.error('Error fetching AMC list:', error);
      Alert.alert('Error', error.message || 'Failed to fetch AMC list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemPress = (item: AMCItem): void => {
    console.log(`Pressed AMC: ${item.amcId || item.amc_id || item.reference_id}`);
    // Toggle expanded state
    setExpandedItemId(expandedItemId === item.id ? null : item.id);
  };

  const getStatusColor = (status: string, isOverdue: boolean): string => {
    if (status === 'Ended') return '#e74c3c'; // Red
    return '#27ae60'; // Green
  };

  const getStatusText = (item: AMCItem): string => {
    const status = item.status || '';
    if (status === 'Ended') {
      return item.isOverdue ? 'overdue | Ended' : 'Ended';
    }
    return item.isOverdue ? 'overdue | Active' : 'Active';
  };

  const handleSearchPress = (): void => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchQuery('');
    }
  };

  const filteredAMCItems = amcItems.filter((item) => {
    const searchText = `${item.amcId || item.amc_id || item.reference_id} ${item.number} ${item.siteName || item.site_name || item.amcname} ${item.duration} ${item.status}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  const handlePhonePress = (phoneNumber: string): void => {
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

  const handleEmailPress = (email: string): void => {
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

  console.log('Render - amcItems.length:', amcItems.length);
  console.log('Render - filteredAMCItems.length:', filteredAMCItems.length);
  console.log('Render - isLoading:', isLoading);

  return (
    <SafeAreaView style={globalStyles.amcListContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.amcListHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.amcListBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={globalStyles.amcListTitle}>AMC List</Text>
        <TouchableOpacity style={globalStyles.amcListSearchButton} onPress={handleSearchPress}>
          <Ionicons name={showSearchInput ? "close" : "search"} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      {showSearchInput && (
        <View style={globalStyles.amcListSearchContainer}>
          <TextInput
            style={globalStyles.amcListSearchInput}
            placeholder="Search AMC items..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
        </View>
      )}

      {/* Content */}
      <ScrollView style={globalStyles.amcListContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading AMC list...</Text>
          </View>
        ) : filteredAMCItems.length > 0 ? (
          filteredAMCItems.map((item) => {
            const isExpanded = expandedItemId === item.id;
            return (
              <View key={item.id}>
                <TouchableOpacity
                  style={globalStyles.amcListItem}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={globalStyles.amcListItemLeft}>
                    <View style={globalStyles.amcListIconContainer}>
                      <Image 
                        source={require('../assets/Amc list.png')} 
                        style={{ width: 24, height: 24 }}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={globalStyles.amcListItemDetails}>
                      <Text style={globalStyles.amcListItemTitle}>
                        {item.amcId || item.amc_id || item.reference_id} {item.number ? `# ${item.number}` : ''} - {item.siteName || item.site_name || item.amcname}
                      </Text>
                      <Text style={globalStyles.amcListItemSubtitle}>
                        {item.duration ? `${item.duration} ` : ''}{item.isOverdue ? 'overdue' : ''} |
                        <Text style={[globalStyles.amcListStatusText, { color: getStatusColor(item.status || '', item.isOverdue || false) }]}>
                          {' '}{getStatusText(item)}
                        </Text>
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#2c3e50"
                  />
                </TouchableOpacity>

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={{
                    backgroundColor: '#ffffff',
                    marginHorizontal: 12,
                    marginBottom: 12,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#e8e8e8',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                    {/* Status Badge - Compact */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: getStatusColor(item.status || '', item.isOverdue || false),
                          marginRight: 8,
                        }} />
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#2c3e50' }}>{getStatusText(item)}</Text>
                      </View>
                      {item.isOverdue ? (
                        <View style={{
                          backgroundColor: '#e74c3c',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}>
                          <Text style={{ fontSize: 10, color: '#fff', fontWeight: '600' }}>OVERDUE</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Compact Info Grid */}
                    <View style={{ marginBottom: 16 }}>
                      {item.customer_name ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="person" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>{item.customer_name}</Text>
                        </View>
                      ) : null}
                      {item.customer_email ? (
                        <TouchableOpacity
                          style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}
                          onPress={() => handleEmailPress(item.customer_email || '')}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="mail" size={14} color="#3498db" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#3498db', flex: 1, fontWeight: '500', textDecorationLine: 'underline' }}>
                            {item.customer_email}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      {item.customer_phone ? (
                        <TouchableOpacity 
                          style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}
                          onPress={() => handlePhonePress(item.customer_phone || '')}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="call" size={14} color="#3498db" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#3498db', flex: 1, fontWeight: '500', textDecorationLine: 'underline' }}>
                            {item.customer_phone}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      {item.equipment_no ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="hardware-chip" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>{item.equipment_no}</Text>
                        </View>
                      ) : null}
                      {(item.no_of_lifts || item.no_of_services || item.number_of_services) ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="construct" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>
                            {item.no_of_lifts ? `${item.no_of_lifts} Lifts` : ''}
                            {(item.no_of_lifts && (item.no_of_services || item.number_of_services)) ? ', ' : ''}
                            {(item.no_of_services || item.number_of_services) ? `${item.no_of_services || item.number_of_services} Services` : ''}
                          </Text>
                        </View>
                      ) : null}
                      {item.amc_type_name ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="layers" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>{item.amc_type_name}</Text>
                        </View>
                      ) : null}
                      {item.contract_amount ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="document-text" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#2c3e50', flex: 1, fontWeight: '600' }}>
                            Contract: ₹{parseFloat(item.contract_amount).toLocaleString('en-IN')}
                          </Text>
                        </View>
                      ) : null}
                      {item.total_amount_paid ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="checkmark-circle" size={14} color="#27ae60" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#27ae60', flex: 1, fontWeight: '600' }}>
                            Paid: ₹{parseFloat(item.total_amount_paid).toLocaleString('en-IN')}
                          </Text>
                        </View>
                      ) : null}
                      {item.amount_due ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="alert-circle" size={14} color="#e74c3c" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#e74c3c', flex: 1, fontWeight: '600' }}>
                            Due: ₹{parseFloat(item.amount_due).toLocaleString('en-IN')}
                          </Text>
                        </View>
                      ) : null}
                      {(item.start_date || item.end_date) ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="calendar" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>
                            {item.start_date ? new Date(item.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                            {item.start_date && item.end_date ? ' - ' : ''}
                            {item.end_date ? new Date(item.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                          </Text>
                        </View>
                      ) : null}
                      {item.duration ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="time" size={14} color="#3498db" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#3498db', flex: 1, fontWeight: '500' }}>Duration: {item.duration}</Text>
                        </View>
                      ) : null}
                      {item.customer_site_address ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
                          <Ionicons name="location" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18, marginTop: 2 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1, lineHeight: 18 }}>{item.customer_site_address}</Text>
                        </View>
                      ) : null}
                      {(item.latitude || item.longitude) ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="navigate" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1, fontFamily: 'monospace' }}>
                            {item.latitude}, {item.longitude}
                          </Text>
                        </View>
                      ) : null}
                      {item.notes ? (
                        <View style={{ marginBottom: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                          <Text style={{ fontSize: 11, color: '#7f8c8d', marginBottom: 4 }}>Notes</Text>
                          <Text style={{ fontSize: 13, color: '#34495e', lineHeight: 18, fontStyle: 'italic' }} numberOfLines={3}>
                            {item.notes}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 16 }}>No AMC items found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AMCListScreen;
