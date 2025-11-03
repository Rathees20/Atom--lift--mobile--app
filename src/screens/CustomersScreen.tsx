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
import { getCustomerList, Customer } from '../utils/api';

interface CustomersScreenProps {
  onBack: () => void;
}

const CustomersScreen: React.FC<CustomersScreenProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [customerItems, setCustomerItems] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  useEffect(() => {
    fetchCustomerList();
  }, []);

  const fetchCustomerList = async () => {
    setIsLoading(true);
    try {
      const data = await getCustomerList();
      setCustomerItems(data);
      console.log('Fetched customer data:', data);
    } catch (error: any) {
      console.error('Error fetching customer list:', error);
      Alert.alert('Error', error.message || 'Failed to fetch customer list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemPress = (item: Customer): void => {
    console.log(`Pressed Customer: ${item.reference_id || 'N/A'} - ${item.site_name}`);
    // Toggle expanded state
    setExpandedItemId(expandedItemId === item.id ? null : item.id);
  };

  const formatCustomerDisplay = (item: Customer): string => {
    const referenceId = item.reference_id || '';
    const jobNo = item.job_no || '';
    const siteName = item.site_name || '';
    
    if (referenceId && jobNo) {
      return `${referenceId} # ${jobNo} - ${siteName}`;
    } else if (referenceId) {
      return `${referenceId} - ${siteName}`;
    } else if (jobNo) {
      return `# ${jobNo} - ${siteName}`;
    }
    return siteName;
  };

  const handleSearchPress = (): void => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchQuery('');
    }
  };

  const filteredCustomers = customerItems.filter((item) => {
    const displayText = `${item.site_name} ${item.reference_id || ''} ${item.job_no || ''}`.toLowerCase();
    return displayText.includes(searchQuery.toLowerCase());
  });

  return (
    <SafeAreaView style={globalStyles.customersContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.customersHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.customersBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={globalStyles.customersTitle}>Customers</Text>
        <TouchableOpacity style={globalStyles.customersSearchButton} onPress={handleSearchPress}>
          <Ionicons name={showSearchInput ? "close" : "search"} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      {showSearchInput && (
        <View style={globalStyles.customersSearchContainer}>
          <TextInput
            style={globalStyles.customersSearchInput}
            placeholder="Search customers..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
        </View>
      )}

      {/* Content */}
      <ScrollView style={globalStyles.customersContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading customers...</Text>
          </View>
        ) : filteredCustomers.length > 0 ? (
          filteredCustomers.map((item) => {
            const isExpanded = expandedItemId === item.id;
            return (
              <View key={item.id}>
                <TouchableOpacity
                  style={globalStyles.customersItem}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={globalStyles.customersItemLeft}>
                    <View style={globalStyles.customersIconContainer}>
                      <Ionicons name="person-outline" size={20} color="#3498db" />
                    </View>
                    <Text style={globalStyles.customersItemText}>
                      {formatCustomerDisplay(item)}
                    </Text>
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
                    {/* Contact Information */}
                    <View style={{ marginBottom: 15 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 }}>
                        Contact Information
                      </Text>
                      {item.contact_person_name && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>Contact Person:</Text> {item.contact_person_name}
                        </Text>
                      )}
                      {item.designation && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>Designation:</Text> {item.designation}
                        </Text>
                      )}
                      {item.email && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>Email:</Text> {item.email}
                        </Text>
                      )}
                      {item.phone && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>Phone:</Text> {item.phone}
                        </Text>
                      )}
                      {item.mobile && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>Mobile:</Text> {item.mobile}
                        </Text>
                      )}
                    </View>

                    {/* Site Information */}
                    <View style={{ marginBottom: 15 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 }}>
                        Site Information
                      </Text>
                      {item.site_id && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>Site ID:</Text> {item.site_id}
                        </Text>
                      )}
                      {item.site_address && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>Site Address:</Text> {item.site_address}
                        </Text>
                      )}
                      {item.city && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>City:</Text> {item.city}
                        </Text>
                      )}
                      {item.province_state_name && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>Province/State:</Text> {item.province_state_name}
                        </Text>
                      )}
                      {item.sector && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '600' }}>Sector:</Text> {item.sector}
                        </Text>
                      )}
                    </View>

                    {/* Additional Information */}
                    {(item.branch_name || item.route_name) && (
                      <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 }}>
                          Additional Information
                        </Text>
                        {item.branch_name && (
                          <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                            <Text style={{ fontWeight: '600' }}>Branch Name:</Text> {item.branch_name}
                          </Text>
                        )}
                        {item.route_name && (
                          <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 4 }}>
                            <Text style={{ fontWeight: '600' }}>Route Name:</Text> {item.route_name}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 16 }}>No customers found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomersScreen;
