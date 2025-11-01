import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { CustomDrawerProps } from '../../types';

interface DrawerItem {
  id: number;
  title: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  color: string;
}

const CustomDrawer: React.FC<CustomDrawerProps> = (props) => {
  const { 
    onClose, 
    onLogout, 
    onNavigateToComplaint, 
    onNavigateToMaterialRequisition, 
    onNavigateToLeave, 
    onNavigateToTravelling, 
    onNavigateToAddCustomer, 
    onNavigateToCreateAMC, 
    onNavigateToViewAttendance, 
    onShowTips, 
    mobileNumber 
  } = props;
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);
  const menuItems: DrawerItem[] = [
    {
      id: 1,
      title: 'Add Complaint',
      icon: 'call-outline' as const,
      color: '#3498db',
    },
    {
      id: 2,
      title: 'Material Requisition',
      icon: 'add-circle-outline' as const,
      color: '#9b59b6',
    },
    {
      id: 3,
      title: 'Leave',
      icon: 'umbrella-outline' as const,
      color: '#e67e22',
    },
    {
      id: 4,
      title: 'Travelling',
      icon: 'airplane-outline' as const,
      color: '#1abc9c',
    },
    {
      id: 5,
      title: 'Add Customer',
      icon: 'person-add-outline' as const,
      color: '#e74c3c',
    },
    {
      id: 6,
      title: 'Create AMC',
      icon: 'calendar-outline' as const,
      color: '#f39c12',
    },
    {
      id: 7,
      title: 'View Attendance',
      icon: 'pie-chart-outline' as const,
      color: '#2ecc71',
    },
  ];

  const handleMenuPress = (item: DrawerItem): void => {
    console.log(`Pressed: ${item.title}`);
    if (item.title === 'Add Complaint') {
      onNavigateToComplaint();
    } else if (item.title === 'Material Requisition') {
      onNavigateToMaterialRequisition();
    } else if (item.title === 'Leave') {
      onNavigateToLeave();
    } else if (item.title === 'Travelling') {
      onNavigateToTravelling();
    } else if (item.title === 'Add Customer') {
      onNavigateToAddCustomer();
    } else if (item.title === 'Create AMC') {
      onNavigateToCreateAMC();
    } else if (item.title === 'View Attendance') {
      onNavigateToViewAttendance();
    } else if (item.title === 'App Tips') {
      onShowTips();
    }
    onClose(); // Close drawer after selection
  };

  return (
    <SafeAreaView style={globalStyles.drawerContainer}>
      {/* Header Section */}
      <View style={globalStyles.drawerHeader}>
        {/* Time Display */}
        <View style={globalStyles.drawerTimeContainer}>
          <Text style={globalStyles.drawerTimeText}>{currentTime}</Text>
        </View>
        
        {/* User Info */}
        <View style={globalStyles.drawerUserInfo}>
          <View style={globalStyles.drawerUserIconContainer}>
            <Ionicons name="person-outline" size={24} color="#fff" />
          </View>
          <View style={globalStyles.drawerUserDetails}>
            <Text style={globalStyles.drawerUserName}>soundahr</Text>
            <View style={globalStyles.drawerPhoneInfo}>
              <Ionicons name="call-outline" size={16} color="#fff" />
              <Text style={globalStyles.drawerPhoneNumber}>
                {mobileNumber ? `+91 ${mobileNumber}` : '*******4821'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={globalStyles.drawerMenuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={globalStyles.drawerMenuItem}
            onPress={() => handleMenuPress(item)}
          >
            <View style={globalStyles.drawerMenuItemLeft}>
              <View style={[globalStyles.drawerIconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={20} color="#fff" />
              </View>
              <Text style={globalStyles.drawerMenuText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#bdc3c7" />
          </TouchableOpacity>
        ))}

        {/* Logout Item */}
        <TouchableOpacity style={globalStyles.drawerMenuItem} onPress={onLogout}>
          <View style={globalStyles.drawerMenuItemLeft}>
            <View style={[globalStyles.drawerIconContainer, { backgroundColor: '#e74c3c' }]}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
            </View>
            <Text style={globalStyles.drawerMenuText}>Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#bdc3c7" />
        </TouchableOpacity>

        {/* Separator */}
        <View style={globalStyles.drawerSeparator} />

        {/* App Tips */}
        <TouchableOpacity 
          style={globalStyles.drawerAppTipsContainer}
          onPress={() => handleMenuPress({ id: 8, title: 'App Tips', icon: 'bulb-outline', color: '#f39c12' })}
        >
          <View style={globalStyles.drawerAppTipsHeader}>
            <Ionicons name="bulb-outline" size={20} color="#f39c12" />
            <Text style={globalStyles.drawerAppTipsText}>App Tips</Text>
          </View>
        </TouchableOpacity>

        {/* Developer Info */}
        <View style={globalStyles.drawerDeveloperInfo}>
          <Text style={globalStyles.drawerDeveloperText}>Designed & Developed By</Text>
          <Text style={globalStyles.drawerCompanyName}>Lionsol Infoway Pvt. Ltd.</Text>
          <Text style={globalStyles.drawerWebsite}>https://lionsol.in</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomDrawer;
