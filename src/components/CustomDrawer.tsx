import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { CustomDrawerProps } from '../../types';
import { fetchUserDetails, UserDetails } from '../utils/api';

interface DrawerItem {
  id: number;
  title: string;
  icon?: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  image?: ImageSourcePropType;
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
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState<boolean>(false);

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

  useEffect(() => {
    const loadUserDetails = async () => {
      setLoadingUserDetails(true);
      try {
        const details = await fetchUserDetails();
        setUserDetails(details);
      } catch (error) {
        console.error('Error fetching user details:', error);
        // Silently fail, component will show mobileNumber as fallback
      } finally {
        setLoadingUserDetails(false);
      }
    };

    loadUserDetails();
  }, []);
  const menuItems: DrawerItem[] = [
    {
      id: 1,
      title: 'Add Complaint',
      image: require('../assets/add complaint.png'),
      color: '#3498db',
    },
    {
      id: 2,
      title: 'Material Requisition',
      image: require('../assets/material  request.png'),
      color: '#9b59b6',
    },
    {
      id: 3,
      title: 'Leave',
      image: require('../assets/leave.png'),
      color: '#e67e22',
    },
    {
      id: 4,
      title: 'Travelling',
      image: require('../assets/travelling.png'),
      color: '#1abc9c',
    },
    {
      id: 5,
      title: 'Add Customer',
      image: require('../assets/add customer.png'),
      color: '#e74c3c',
    },
    {
      id: 6,
      title: 'Create AMC',
      image: require('../assets/Create Amc.png'),
      color: '#f39c12',
    },
    {
      id: 7,
      title: 'View Attendance',
      image: require('../assets/View attendence.png'),
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
            <Ionicons name="person-outline" size={Platform.OS === 'web' ? 24 : 22} color="#fff" />
          </View>
          <View style={globalStyles.drawerUserDetails}>
            {loadingUserDetails ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={globalStyles.drawerUserName}>
                  {userDetails?.full_name || 
                   (userDetails?.first_name && userDetails?.last_name 
                     ? `${userDetails.first_name} ${userDetails.last_name}`.trim()
                     : userDetails?.first_name || 
                       userDetails?.username || 
                       userDetails?.email?.split('@')[0] || 
                       'User')}
                </Text>
                {/* Phone Number */}
                <View style={globalStyles.drawerPhoneInfo}>
                  <Image 
                    source={require('../assets/phone.png')} 
                    style={{ width: Platform.OS === 'web' ? 16 : 14, height: Platform.OS === 'web' ? 16 : 14 }}
                    resizeMode="contain"
                  />
                  <Text style={globalStyles.drawerPhoneNumber}>
                    {userDetails?.phone_number ||
                     userDetails?.profile?.phone_number ||
                     userDetails?.mobile ||
                     userDetails?.phone ||
                     (mobileNumber ? `+91 ${mobileNumber}` : 'Not provided')}
                  </Text>
                </View>
                {/* Email */}
                {userDetails?.email && (
                  <View style={[globalStyles.drawerPhoneInfo, { marginTop: 4 }]}>
                    <Image 
                      source={require('../assets/mail.png')} 
                      style={{ width: Platform.OS === 'web' ? 16 : 14, height: Platform.OS === 'web' ? 16 : 14 }}
                      resizeMode="contain"
                    />
                    <Text style={globalStyles.drawerPhoneNumber}>
                      {userDetails.email}
                    </Text>
                  </View>
                )}
              </>
            )}
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
              <View style={globalStyles.drawerIconContainer}>
                {item.image ? (
                  <Image 
                    source={item.image} 
                    style={{ width: Platform.OS === 'web' ? 20 : 18, height: Platform.OS === 'web' ? 20 : 18 }}
                    resizeMode="contain"
                  />
                ) : item.icon ? (
                  <Ionicons name={item.icon} size={Platform.OS === 'web' ? 20 : 18} color="#fff" />
                ) : null}
              </View>
              <Text style={globalStyles.drawerMenuText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={Platform.OS === 'web' ? 16 : 14} color="#bdc3c7" />
          </TouchableOpacity>
        ))}

        {/* Logout Item */}
        <TouchableOpacity style={globalStyles.drawerMenuItem} onPress={onLogout}>
          <View style={globalStyles.drawerMenuItemLeft}>
            <View style={globalStyles.drawerIconContainer}>
              <Image 
                source={require('../assets/logout.png')} 
                style={{ width: Platform.OS === 'web' ? 20 : 18, height: Platform.OS === 'web' ? 20 : 18 }}
                resizeMode="contain"
              />
            </View>
            <Text style={globalStyles.drawerMenuText}>Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={Platform.OS === 'web' ? 16 : 14} color="#bdc3c7" />
        </TouchableOpacity>

        {/* Separator */}
        <View style={globalStyles.drawerSeparator} />

        {/* App Tips */}
        <TouchableOpacity 
          style={globalStyles.drawerAppTipsContainer}
          onPress={() => handleMenuPress({ id: 8, title: 'App Tips', icon: 'bulb-outline', color: '#f39c12' })}
        >
          <View style={globalStyles.drawerAppTipsHeader}>
            <Ionicons name="bulb-outline" size={Platform.OS === 'web' ? 20 : 18} color="#f39c12" />
            <Text style={globalStyles.drawerAppTipsText}>App Tips</Text>
          </View>
        </TouchableOpacity>

        {/* Developer Info */}
        {/* <View style={globalStyles.drawerDeveloperInfo}>
          <Text style={globalStyles.drawerDeveloperText}>Designed & Developed By</Text>
          <Text style={globalStyles.drawerCompanyName}>Lionsol Infoway Pvt. Ltd.</Text>
          <Text style={globalStyles.drawerWebsite}>https://lionsol.in</Text>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomDrawer;
