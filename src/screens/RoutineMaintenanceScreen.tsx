import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';

interface RoutineMaintenanceScreenProps {
  onBack: () => void;
  onNavigateToTodayServices: () => void;
  onNavigateToThisMonthDue: () => void;
  onNavigateToThisMonthOverdue: () => void;
  onNavigateToLastMonthOverdue: () => void;
}

interface MaintenanceItem {
  id: number;
  title: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  color: string;
}

const RoutineMaintenanceScreen: React.FC<RoutineMaintenanceScreenProps> = ({ 
  onBack,
  onNavigateToTodayServices,
  onNavigateToThisMonthDue,
  onNavigateToThisMonthOverdue,
  onNavigateToLastMonthOverdue,
}) => {
  // Filter modal state
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>('');
  const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);
  const [showTimeFrameDropdown, setShowTimeFrameDropdown] = useState<boolean>(false);

  // Filter options
  const statusOptions = ['all', 'due', 'overdue', 'in_process', 'completed'];
  const timeFrameOptions = [
    'All',
    'Previous Day',
    'Next 3 days',
    'Next 7 days',
    'Next 15 days',
    'Next 30 days',
    'Next 45 days',
    
  ];

  // Format status for display (show as-is from image: lowercase with underscores)
  const formatStatusDisplay = (status: string): string => {
    if (!status) return '';
    return status; // Display exactly as in the image
  };

  const maintenanceItems: MaintenanceItem[] = [
    {
      id: 1,
      title: "Today's Services",
      icon: 'settings-outline' as const,
      color: '#3498db',
    },
    {
      id: 2,
      title: 'This Month Due',
      icon: 'settings-outline' as const,
      color: '#3498db',
    },
    {
      id: 3,
      title: 'This Month Overdue',
      icon: 'settings-outline' as const,
      color: '#3498db',
    },
    {
      id: 4,
      title: 'Last Month Overdue',
      icon: 'settings-outline' as const,
      color: '#3498db',
    },
    {
      id: 5,
      title: 'More Filter',
      icon: 'settings-outline' as const,
      color: '#3498db',
    },
  ];

  const handleItemPress = (item: MaintenanceItem): void => {
    switch (item.id) {
      case 1:
        onNavigateToTodayServices();
        break;
      case 2:
        onNavigateToThisMonthDue();
        break;
      case 3:
        onNavigateToThisMonthOverdue();
        break;
      case 4:
        onNavigateToLastMonthOverdue();
        break;
      case 5:
        setShowFilterModal(true);
        break;
      default:
        console.log(`Pressed: ${item.title}`);
        break;
    }
  };

  return (
    <SafeAreaView style={globalStyles.routineMaintenanceContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.routineMaintenanceHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.routineMaintenanceBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={globalStyles.routineMaintenanceTitle}>Routine Maintenance</Text>
        <View style={globalStyles.routineMaintenanceHeaderSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={globalStyles.routineMaintenanceContent} showsVerticalScrollIndicator={false}>
        {maintenanceItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={globalStyles.routineMaintenanceItem}
            onPress={() => handleItemPress(item)}
          >
            <View style={globalStyles.routineMaintenanceItemLeft}>
              <View style={[globalStyles.routineMaintenanceIconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={24} color="#fff" />
              </View>
              <Text style={globalStyles.routineMaintenanceItemText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2c3e50" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Options Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 12,
              paddingHorizontal: 20,
              paddingBottom: 30,
              maxHeight: '70%',
            }}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* Drag Indicator */}
            <View style={{
              width: 40,
              height: 4,
              backgroundColor: '#bdc3c7',
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 20,
            }} />

            {/* Title */}
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#3498db',
              marginBottom: 8,
            }}>
              Filter Options
            </Text>

            {/* Description */}
            <Text style={{
              fontSize: 14,
              color: '#7f8c8d',
              marginBottom: 24,
            }}>
              Select your preferences below to filter results.
            </Text>

            {/* Status Filter */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: 8,
              }}>
                Status
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e1e8ed',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowTimeFrameDropdown(false);
                  setShowStatusDropdown(!showStatusDropdown);
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: selectedStatus ? '#2c3e50' : '#999',
                }}>
                  {selectedStatus ? formatStatusDisplay(selectedStatus) : 'Select Status'}
                </Text>
                <Ionicons 
                  name={showStatusDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>

              {/* Status Dropdown */}
              {showStatusDropdown && (
                <ScrollView
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#e1e8ed',
                    marginTop: 4,
                    maxHeight: 200,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {statusOptions.map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: status !== statusOptions[statusOptions.length - 1] ? 1 : 0,
                        borderBottomColor: '#f0f0f0',
                        backgroundColor: selectedStatus === status ? '#e3f2fd' : '#fff',
                      }}
                      onPress={() => {
                        setSelectedStatus(status);
                        setShowStatusDropdown(false);
                      }}
                    >
                      <Text style={{
                        fontSize: 15,
                        color: selectedStatus === status ? '#3498db' : '#2c3e50',
                        fontWeight: selectedStatus === status ? '600' : '400',
                      }}>
                        {formatStatusDisplay(status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* For (Time Frame) Filter */}
            <View style={{ marginBottom: 30 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: 8,
              }}>
                For
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e1e8ed',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowStatusDropdown(false);
                  setShowTimeFrameDropdown(!showTimeFrameDropdown);
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: selectedTimeFrame ? '#2c3e50' : '#999',
                }}>
                  {selectedTimeFrame || 'Select Time Frame'}
                </Text>
                <Ionicons 
                  name={showTimeFrameDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>

              {/* Time Frame Dropdown */}
              {showTimeFrameDropdown && (
                <ScrollView
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#e1e8ed',
                    marginTop: 4,
                    maxHeight: 200,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {timeFrameOptions.map((timeFrame) => (
                    <TouchableOpacity
                      key={timeFrame}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: timeFrame !== timeFrameOptions[timeFrameOptions.length - 1] ? 1 : 0,
                        borderBottomColor: '#f0f0f0',
                        backgroundColor: selectedTimeFrame === timeFrame ? '#e3f2fd' : '#fff',
                      }}
                      onPress={() => {
                        setSelectedTimeFrame(timeFrame);
                        setShowTimeFrameDropdown(false);
                      }}
                    >
                      <Text style={{
                        fontSize: 15,
                        color: selectedTimeFrame === timeFrame ? '#3498db' : '#2c3e50',
                        fontWeight: selectedTimeFrame === timeFrame ? '600' : '400',
                      }}>
                        {timeFrame}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Search Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#3498db',
                borderRadius: 8,
                paddingVertical: 16,
                alignItems: 'center',
                shadowColor: '#3498db',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={() => {
                // Handle search/filter logic here
                console.log('Filter applied:', { status: selectedStatus, timeFrame: selectedTimeFrame });
                setShowFilterModal(false);
                // You can add your filter logic here
              }}
            >
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold',
                letterSpacing: 1,
              }}>
                SEARCH
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default RoutineMaintenanceScreen;