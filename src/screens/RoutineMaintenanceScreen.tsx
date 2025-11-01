import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
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
        console.log(`Pressed: ${item.title}`);
        // Add navigation logic here for More Filter
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
    </SafeAreaView>
  );
};

export default RoutineMaintenanceScreen;