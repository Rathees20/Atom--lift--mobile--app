import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';

interface CustomersScreenProps {
  onBack: () => void;
}

interface CustomerItem {
  id: number;
  customerId: string;
  number: string;
  name: string;
}

const CustomersScreen: React.FC<CustomersScreenProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const customerItems: CustomerItem[] = [
    {
      id: 1,
      customerId: 'null',
      number: '1',
      name: 'porur',
    },
    {
      id: 2,
      customerId: 'AL9876',
      number: '988888',
      name: 'Test Site 1',
    },
    {
      id: 3,
      customerId: 'test0003',
      number: '123',
      name: 'Test Site',
    },
    {
      id: 4,
      customerId: 'AL999',
      number: '9999',
      name: 'test2',
    },
    {
      id: 5,
      customerId: 'AL206',
      number: 'Coimbatore',
      name: 'Mr.Madhan',
    },
    {
      id: 6,
      customerId: 'AL205',
      number: 'Potheri 1',
      name: 'Ms.Seshas Home And Lands',
    },
    {
      id: 7,
      customerId: 'AL204',
      number: 'Urapakkam 2',
      name: 'Ms.Seshas Homes And Lands',
    },
    {
      id: 8,
      customerId: 'AL199',
      number: 'Kodambakkam 5',
      name: 'Mr.Anandhan',
    },
    {
      id: 9,
      customerId: 'AL197',
      number: 'Aynavaram 2',
      name: 'Mr.M.G.Subramaniyam',
    },
    {
      id: 10,
      customerId: '',
      number: 'Ayanavaram 2',
      name: 'Ms. K.S Construction',
    },
    {
      id: 11,
      customerId: 'AL194',
      number: 'Thousand Lights 2',
      name: 'Ms. Bravoo Realcors',
    },
    {
      id: 12,
      customerId: 'AL195',
      number: 'Sriperumbudur 2',
      name: 'Mr. Naresh',
    },
  ];

  const handleItemPress = (item: CustomerItem): void => {
    console.log(`Pressed Customer: ${item.customerId} - ${item.name}`);
    // Add navigation logic here for customer details
  };

  const formatCustomerDisplay = (item: CustomerItem): string => {
    if (item.customerId === 'null' || item.customerId === '') {
      return `# ${item.number} - ${item.name}`;
    }
    return `${item.customerId} # ${item.number} - ${item.name}`;
  };

  const handleSearchPress = (): void => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchQuery('');
    }
  };

  const filteredCustomers = customerItems.filter((item) => {
    const displayText = formatCustomerDisplay(item).toLowerCase();
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
        {filteredCustomers.map((item) => (
          <TouchableOpacity
            key={item.id}
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
            <Ionicons name="chevron-down" size={16} color="#2c3e50" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomersScreen;
