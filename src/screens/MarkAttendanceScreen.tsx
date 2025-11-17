import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { checkInAttendance, checkOutAttendance, getTodayAttendance, AttendanceRecord, fetchUserDetails, UserDetails } from '../utils/api';
import { useAlert } from '../contexts/AlertContext';
import { formatTime } from '../utils/validation';

interface MarkAttendanceScreenProps {
  onBack: () => void;
}

const MarkAttendanceScreen: React.FC<MarkAttendanceScreenProps> = ({ onBack }) => {
  const { showSuccessAlert, showErrorAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(false);
  const [hasCheckedOut, setHasCheckedOut] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    // Fetch today's attendance status
    fetchTodayAttendance();
    // Fetch user details
    loadUserDetails();
  }, []);

  const loadUserDetails = async (): Promise<void> => {
    try {
      const details = await fetchUserDetails();
      setUserDetails(details);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const getUserName = (): string => {
    if (userDetails?.full_name) {
      return userDetails.full_name;
    }
    if (userDetails?.first_name && userDetails?.last_name) {
      return `${userDetails.first_name} ${userDetails.last_name}`.trim();
    }
    if (userDetails?.first_name) {
      return userDetails.first_name;
    }
    if (userDetails?.username) {
      return userDetails.username;
    }
    if (userDetails?.email) {
      return userDetails.email.split('@')[0];
    }
    return 'User';
  };

  const fetchTodayAttendance = async (): Promise<void> => {
    try {
      setIsLoadingStatus(true);
      const response = await getTodayAttendance();
      setHasCheckedIn(response.has_checked_in);
      setHasCheckedOut(response.has_checked_out);
      setTodayAttendance(response.attendance);
    } catch (error: any) {
      console.error('Error fetching today attendance:', error);
      // Don't show error alert, just set defaults
      setHasCheckedIn(false);
      setHasCheckedOut(false);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleCheckIn = async (): Promise<void> => {
    setIsSubmitting(true);
    console.log('Submitting attendance check-in...');

    try {
      const checkInData = {
        location: '', // Could add location functionality later
        note: '',
      };

      const response = await checkInAttendance(checkInData);

      console.log('Check-in successful:', response);
      
      // Update attendance data from response
      if (response.attendance) {
        setTodayAttendance(response.attendance);
        // Use the actual attendance data to set check-in status
        setHasCheckedIn(response.attendance.is_checked_in || true);
        setHasCheckedOut(response.attendance.is_checked_out || false);
      } else {
        // Fallback: if no attendance data, assume check-in was successful
        setHasCheckedIn(true);
      }
      
      showSuccessAlert(
        'Your attendance has been marked successfully!',
        async () => {
          // Refresh today's attendance status to get latest data
          await fetchTodayAttendance();
        }
      );
    } catch (error: any) {
      console.error('Check-in failed:', error);
      showErrorAlert(error.message || 'Failed to mark attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (): Promise<void> => {
    setIsSubmitting(true);
    console.log('Submitting attendance check-out...');

    try {
      const checkOutData = {
        location: '', // Could add location functionality later
        note: '',
      };

      const response = await checkOutAttendance(checkOutData);

      console.log('Check-out successful:', response);
      
      // Update state immediately with attendance data from response
      if (response.attendance) {
        setTodayAttendance(response.attendance);
        // Use the actual attendance data to set check-out status
        setHasCheckedIn(response.attendance.is_checked_in || false);
        setHasCheckedOut(response.attendance.is_checked_out || true);
      } else {
        // Fallback: if no attendance data, assume check-out was successful
        setHasCheckedOut(true);
      }
      
      showSuccessAlert(
        'Your punch out has been marked successfully!',
        () => {
          // Close the page after successful punch out
          onBack();
        }
      );
    } catch (error: any) {
      console.error('Check-out failed:', error);
      showErrorAlert(error.message || 'Failed to punch out. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header with back button */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingTop: 10,
        paddingBottom: 10 
      }}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Main Content - Centered */}
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: 20 
      }}>
        {isLoadingStatus ? (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={{ marginTop: 10, color: '#666', fontSize: 16 }}>Loading...</Text>
          </View>
        ) : hasCheckedIn && hasCheckedOut ? (
          <View style={{ alignItems: 'center' }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#27ae60',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Ionicons name="checkmark" size={50} color="#fff" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 }}>
              {getUserName()}
            </Text>
            <Text style={{ fontSize: 18, color: '#95a5a6', marginBottom: 40 }}>
              Already punched in & out today
            </Text>
          </View>
        ) : (
          <>
            {/* Profile Picture */}
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#27ae60',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Ionicons name="person" size={50} color="#fff" />
            </View>

            {/* User Name */}
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: '#2c3e50', 
              marginBottom: 30 
            }}>
              {getUserName()}
            </Text>

            {/* Question */}
            <Text style={{ 
              fontSize: 18, 
              color: '#34495e', 
              marginBottom: 40,
              textAlign: 'center'
            }}>
              {!hasCheckedIn ? 'Want to punch in?' : 'Want to punch out?'}
            </Text>

            {/* Large Green Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#27ae60',
                borderRadius: 16,
                paddingVertical: 24,
                paddingHorizontal: 40,
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 200,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
                marginBottom: 20,
              }}
              onPress={!hasCheckedIn ? handleCheckIn : handleCheckOut}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Image 
                  source={require('../assets/Punch in.png')} 
                  style={{ 
                    width: 60, 
                    height: 60,
                    transform: hasCheckedIn ? [{ scaleX: -1 }] : []
                  }}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>

            {/* Instruction Text */}
            <Text style={{ 
              fontSize: 14, 
              color: '#95a5a6',
              textAlign: 'center'
            }}>
              Click to {!hasCheckedIn ? 'punch in' : 'punch out'}
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default MarkAttendanceScreen;
