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
                      <Image 
                        source={require('../assets/user (1).png')} 
                        style={{ width: 20, height: 20 }}
                        resizeMode="contain"
                      />
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
                    {/* Compact Info Grid */}
                    <View style={{ marginBottom: 16 }}>
                      {item.contact_person_name ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="person" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>{item.contact_person_name}</Text>
                        </View>
                      ) : null}
                      {item.designation ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="briefcase" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>{item.designation}</Text>
                        </View>
                      ) : null}
                      {item.email ? (
                        <TouchableOpacity
                          style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}
                          onPress={() => handleEmailPress(item.email || '')}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="mail" size={14} color="#3498db" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#3498db', flex: 1, fontWeight: '500', textDecorationLine: 'underline' }}>
                            {item.email}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      {(item.phone || item.mobile) ? (
                        <TouchableOpacity 
                          style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}
                          onPress={() => handlePhonePress(item.mobile || item.phone || '')}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="call" size={14} color="#3498db" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#3498db', flex: 1, fontWeight: '500', textDecorationLine: 'underline' }}>
                            {item.mobile || item.phone}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      {item.site_id ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="key" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>{item.site_id}</Text>
                        </View>
                      ) : null}
                      {item.site_address ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
                          <Ionicons name="location" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18, marginTop: 2 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1, lineHeight: 18 }}>{item.site_address}</Text>
                        </View>
                      ) : null}
                      {(item.city || item.province_state_name) ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="map" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>
                            {[item.city, item.province_state_name].filter(Boolean).join(', ')}
                          </Text>
                        </View>
                      ) : null}
                      {item.sector ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="grid" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>{item.sector}</Text>
                        </View>
                      ) : null}
                      {item.branch_name ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="business" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>{item.branch_name}</Text>
                        </View>
                      ) : null}
                      {item.route_name ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="trail-sign" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>{item.route_name}</Text>
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
            <Text style={{ color: '#666', fontSize: 16 }}>No customers found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomersScreen;
