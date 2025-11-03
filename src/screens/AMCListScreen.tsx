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
                      <Ionicons name="calendar-outline" size={24} color="#3498db" />
                      <Ionicons name="construct-outline" size={16} color="#9b59b6" style={globalStyles.amcListWrenchIcon} />
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
                    backgroundColor: '#f8f9fa',
                    marginHorizontal: 10,
                    marginBottom: 10,
                    borderRadius: 8,
                    padding: 15,
                    borderLeftWidth: 4,
                    borderLeftColor: '#3498db',
                  }}>
                    {/* Customer Information */}
                    {(item.customer_name || item.customer_email || item.customer_phone) && (
                      <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 }}>
                          Customer Information
                        </Text>
                        {item.customer_name && (
                          <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                            <Text style={{ fontWeight: '600' }}>Name:</Text> {item.customer_name}
                          </Text>
                        )}
                        {item.customer_email && (
                          <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                            <Text style={{ fontWeight: '600' }}>Email:</Text> {item.customer_email}
                          </Text>
                        )}
                        {item.customer_phone && (
                          <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                            <Text style={{ fontWeight: '600' }}>Phone:</Text> {item.customer_phone}
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Equipment & Service Details */}
                    <View style={{ marginBottom: 15 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 }}>
                        Equipment & Service
                      </Text>
                      {item.equipment_no && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>Equipment No:</Text> {item.equipment_no}
                        </Text>
                      )}
                      {item.no_of_lifts && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>No. of Lifts:</Text> {item.no_of_lifts}
                        </Text>
                      )}
                      {(item.no_of_services || item.number_of_services) && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>No. of Services:</Text> {item.no_of_services || item.number_of_services}
                        </Text>
                      )}
                      {item.amc_type_name && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>AMC Type:</Text> {item.amc_type_name}
                        </Text>
                      )}
                    </View>

                    {/* Financial Information */}
                    {(item.contract_amount || item.total || item.amount_due) && (
                      <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 }}>
                          Financial Information
                        </Text>
                        {item.contract_amount && (
                          <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                            <Text style={{ fontWeight: '600' }}>Contract Amount:</Text> ₹{parseFloat(item.contract_amount).toLocaleString('en-IN')}
                          </Text>
                        )}
                        {item.total && (
                          <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                            <Text style={{ fontWeight: '600' }}>Total:</Text> ₹{parseFloat(item.total).toLocaleString('en-IN')}
                          </Text>
                        )}
                        {item.amount_due && (
                          <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                            <Text style={{ fontWeight: '600' }}>Amount Due:</Text> ₹{parseFloat(item.amount_due).toLocaleString('en-IN')}
                          </Text>
                        )}
                        {item.total_amount_paid && (
                          <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                            <Text style={{ fontWeight: '600' }}>Amount Paid:</Text> ₹{parseFloat(item.total_amount_paid).toLocaleString('en-IN')}
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Dates */}
                    {(item.start_date || item.end_date) && (
                      <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 }}>
                          Dates
                        </Text>
                        {item.start_date && (
                          <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                            <Text style={{ fontWeight: '600' }}>Start Date:</Text> {new Date(item.start_date).toLocaleDateString('en-IN')}
                          </Text>
                        )}
                        {item.end_date && (
                          <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                            <Text style={{ fontWeight: '600' }}>End Date:</Text> {new Date(item.end_date).toLocaleDateString('en-IN')}
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Location */}
                    {(item.latitude || item.longitude || item.customer_site_address) && (
                      <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 }}>
                          Location
                        </Text>
                        {item.customer_site_address && (
                          <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                            <Text style={{ fontWeight: '600' }}>Address:</Text> {item.customer_site_address}
                          </Text>
                        )}
                        {(item.latitude || item.longitude) && (
                          <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                            <Text style={{ fontWeight: '600' }}>Coordinates:</Text> {item.latitude}, {item.longitude}
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 }}>
                          Notes
                        </Text>
                        <Text style={{ fontSize: 14, color: '#34495e' }}>
                          {item.notes}
                        </Text>
                      </View>
                    )}
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
