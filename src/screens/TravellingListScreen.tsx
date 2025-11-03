import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { getTravelRequestList, TravelRequestItem } from '../utils/api';

interface TravellingListScreenProps {
  onBack: () => void;
  onAddNew: () => void;
}

const TravellingListScreen: React.FC<TravellingListScreenProps> = ({ onBack, onAddNew }) => {
  const [travelRequests, setTravelRequests] = useState<TravelRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTravelRequests();
  }, []);

  const fetchTravelRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getTravelRequestList();
      setTravelRequests(data);
    } catch (error: any) {
      console.error('Error fetching travel requests:', error);
      Alert.alert('Error', 'Failed to load travel requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewPress = (): void => {
    console.log('Add Travelling button pressed in TravellingListScreen');
    onAddNew();
  };

  const getTravelModeDisplay = (travelBy: string): string => {
    const modes: { [key: string]: string } = {
      'bus': 'Bus',
      'train': 'Train',
      'flight': 'Flight',
      'car': 'Car',
      'taxi': 'Taxi',
      'other': 'Other',
    };
    return modes[travelBy] || travelBy;
  };

  return (
    <SafeAreaView style={globalStyles.complaintContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />

      {/* Header */}
      <View style={globalStyles.complaintHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.complaintBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={globalStyles.travellingTitle}>Travelling</Text>

        <TouchableOpacity onPress={handleAddNewPress} style={globalStyles.travellingAddButton}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={globalStyles.travellingAddText}>Add Travelling</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={globalStyles.travellingContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading travel requests...</Text>
          </View>
        ) : travelRequests.length > 0 ? (
          travelRequests.map((request) => (
            <View key={request.id} style={{
              backgroundColor: '#fff',
              marginHorizontal: 10,
              marginBottom: 10,
              borderRadius: 8,
              padding: 15,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 }}>
                    {request.from_place} → {request.to_place}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 2 }}>
                    <Text style={{ fontWeight: '600' }}>Travel by:</Text> {getTravelModeDisplay(request.travel_by)}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 2 }}>
                    <Text style={{ fontWeight: '600' }}>Date:</Text> {new Date(request.travel_date).toLocaleDateString()}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 2 }}>
                    <Text style={{ fontWeight: '600' }}>Amount:</Text> ₹{request.amount}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 4 }}>
                    Requested by: {request.created_by} on {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={globalStyles.travellingEmptyText}>No travel requests found</Text>
            <Text style={globalStyles.travellingEmptySubtext}>Tap "Add Travelling" to create a travel request</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TravellingListScreen;
