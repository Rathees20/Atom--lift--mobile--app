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

interface AMCListScreenProps {
  onBack: () => void;
}

interface AMCItem {
  id: number;
  amcId: string;
  number: string;
  siteName: string;
  duration: string;
  status: 'Active' | 'Ended';
  isOverdue: boolean;
}

const AMCListScreen: React.FC<AMCListScreenProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const amcItems: AMCItem[] = [
    {
      id: 1,
      amcId: 'AL9876',
      number: '35',
      siteName: 'Test Site 1',
      duration: '41 days',
      status: 'Ended',
      isOverdue: true,
    },
    {
      id: 2,
      amcId: 'CE025',
      number: '34',
      siteName: 'Mr.Krishna Sripada',
      duration: '330 Days',
      status: 'Active',
      isOverdue: false,
    },
    {
      id: 3,
      amcId: 'test0003',
      number: '33',
      siteName: 'Test Site',
      duration: '327 Days',
      status: 'Active',
      isOverdue: false,
    },
    {
      id: 4,
      amcId: 'AL164',
      number: '15',
      siteName: 'Ms. Kanthimathi & co',
      duration: '253 Days',
      status: 'Active',
      isOverdue: false,
    },
    {
      id: 5,
      amcId: 'AL999',
      number: '14',
      siteName: 'test2',
      duration: '244 Days',
      status: 'Active',
      isOverdue: false,
    },
    {
      id: 6,
      amcId: 'AL085',
      number: '13',
      siteName: 'Ms.G S Builders - Mr.Sathish',
      duration: '29 days',
      status: 'Ended',
      isOverdue: true,
    },
    {
      id: 7,
      amcId: 'AL170',
      number: '8',
      siteName: 'Ms.RR Foundation',
      duration: '118 Days',
      status: 'Active',
      isOverdue: false,
    },
    {
      id: 8,
      amcId: 'AL056',
      number: '7',
      siteName: 'Mr.Manivannan',
      duration: '16 days',
      status: 'Ended',
      isOverdue: true,
    },
    {
      id: 9,
      amcId: 'AL135',
      number: '6',
      siteName: 'Mr.Prabhu kumar',
      duration: '56 Days',
      status: 'Active',
      isOverdue: false,
    },
    {
      id: 10,
      amcId: 'AL161',
      number: '5',
      siteName: 'Ms. Pioneer Dines',
      duration: '122 Days',
      status: 'Active',
      isOverdue: false,
    },
  ];

  const handleItemPress = (item: AMCItem): void => {
    console.log(`Pressed AMC: ${item.amcId}`);
    // Add navigation logic here for AMC details
  };

  const getStatusColor = (status: string, isOverdue: boolean): string => {
    if (status === 'Ended') return '#e74c3c'; // Red
    return '#27ae60'; // Green
  };

  const getStatusText = (item: AMCItem): string => {
    if (item.status === 'Ended') {
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
    const searchText = `${item.amcId} ${item.number} ${item.siteName} ${item.duration} ${item.status}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

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
        {filteredAMCItems.map((item) => (
          <TouchableOpacity
            key={item.id}
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
                  {item.amcId} # {item.number} - {item.siteName}
                </Text>
                <Text style={globalStyles.amcListItemSubtitle}>
                  {item.duration} {item.isOverdue ? 'overdue' : ''} | 
                  <Text style={[globalStyles.amcListStatusText, { color: getStatusColor(item.status, item.isOverdue) }]}>
                    {' '}{getStatusText(item)}
                  </Text>
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2c3e50" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AMCListScreen;
