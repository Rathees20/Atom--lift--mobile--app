import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import { globalStyles } from '../styles/globalStyles';
import { checkInAttendance, checkOutAttendance, getTodayAttendance, AttendanceRecord } from '../utils/api';
import { useAlert } from '../contexts/AlertContext';
import { formatTime } from '../utils/validation';

interface MarkAttendanceScreenProps {
  onBack: () => void;
}

const MarkAttendanceScreen: React.FC<MarkAttendanceScreenProps> = ({ onBack }) => {
  const { showSuccessAlert, showErrorAlert } = useAlert();
  const [isSelfieTaken, setIsSelfieTaken] = useState<boolean>(false);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>(CameraType.front);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [cameraRef, setCameraRef] = useState<any>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(false);
  const [hasCheckedOut, setHasCheckedOut] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [cameraRatio, setCameraRatio] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Request camera permission on component mount
    if (!permission?.granted) {
      requestPermission();
    }
    // Fetch today's attendance status
    fetchTodayAttendance();
  }, []);

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

  const handleTakeSelfie = (): void => {
    console.log('Take selfie pressed');
    if (!permission?.granted) {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to take a selfie.',
        [
          {
            text: 'OK',
            onPress: () => requestPermission(),
          },
        ]
      );
      return;
    }
    
    setShowCamera(true);
  };

  const handleCaptureSelfie = async (): Promise<void> => {
    if (cameraRef) {
      try {
        console.log('Capturing selfie...');
        const photo = await cameraRef.takePictureAsync({
          quality: 0.7,
          base64: false,
        });

        // Convert photo URI to File object for FormData
        const response = await fetch(photo.uri);
        const blob = await response.blob();
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

        setSelfieFile(file);
        setShowCamera(false);
        setIsSelfieTaken(true);

        console.log('Selfie captured successfully');
      } catch (error) {
        console.error('Error capturing selfie:', error);
        showErrorAlert('Failed to capture selfie. Please try again.');
      }
    }
  };


  const prepareCameraRatio = async (): Promise<void> => {
    if (!cameraRef || Platform.OS !== 'android') {
      return;
    }

    try {
      const ratios = await cameraRef.getSupportedRatiosAsync();
      if (!ratios || ratios.length === 0) {
        return;
      }

      const preferredRatio = ratios.find((ratio: string) => ratio === '16:9') || ratios[ratios.length - 1];
      setCameraRatio(preferredRatio);
    } catch (error) {
      console.warn('Failed to fetch camera ratios:', error);
    }
  };

  useEffect(() => {
    if (showCamera) {
      prepareCameraRatio();
    }
  }, [showCamera, facing, cameraRef]);

  const toggleCameraFacing = async (): Promise<void> => {
    setFacing(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    await prepareCameraRatio();
  };

  const handleCheckIn = async (): Promise<void> => {
    if (!isSelfieTaken || !selfieFile) {
      showErrorAlert('Please take a selfie before submitting attendance.');
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting attendance check-in...');

    try {
      const checkInData = {
        selfie: selfieFile,
        location: '', // Could add location functionality later
        note: '',
      };

      const response = await checkInAttendance(checkInData);

      console.log('Check-in successful:', response);
      
      // Update state immediately to show check-out button
      setIsSelfieTaken(false);
      setSelfieFile(null);
      
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
        'Your check-out has been marked successfully!',
        () => {
          // Close the page after successful check-out
          onBack();
        }
      );
    } catch (error: any) {
      console.error('Check-out failed:', error);
      showErrorAlert(error.message || 'Failed to check out. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString: string | null, timeString: string | null): string => {
    if (!dateString && !timeString) return 'N/A';
    
    if (dateString && timeString) {
      const date = new Date(`${dateString}T${timeString}`);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    if (dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    
    return timeString || 'N/A';
  };

  return (
    <SafeAreaView style={globalStyles.markAttendanceContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.markAttendanceHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.markAttendanceBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={globalStyles.markAttendanceTitle}>Mark attendance</Text>
        <View style={globalStyles.markAttendanceHeaderSpacer} />
      </View>

      {/* Main Content */}
      <View style={globalStyles.markAttendanceContent}>
        {/* Today's Attendance Status */}
        {isLoadingStatus ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#3498db" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading attendance status...</Text>
          </View>
        ) : todayAttendance && (
          <View style={{
            backgroundColor: '#fff',
            marginHorizontal: 12,
            marginVertical: 12,
            padding: 16,
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12 }}>
              Today's Attendance Status
            </Text>
            {hasCheckedIn && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#27ae60', fontWeight: '600', marginBottom: 4 }}>
                  ✓ Check-in
                </Text>
                <Text style={{ fontSize: 13, color: '#34495e' }}>
                  Date: {todayAttendance.check_in_date || 'N/A'}
                </Text>
                <Text style={{ fontSize: 13, color: '#34495e' }}>
                  Time: {formatTime(todayAttendance.check_in_time)}
                </Text>
              </View>
            )}
            {hasCheckedOut && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#e74c3c', fontWeight: '600', marginBottom: 4 }}>
                  ✓ Check-out
                </Text>
                <Text style={{ fontSize: 13, color: '#34495e' }}>
                  Date: {todayAttendance.check_out_date || 'N/A'}
                </Text>
                <Text style={{ fontSize: 13, color: '#34495e' }}>
                  Time: {formatTime(todayAttendance.check_out_time)}
                </Text>
              </View>
            )}
            {todayAttendance.work_duration_display && (
              <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                <Text style={{ fontSize: 14, color: '#3498db', fontWeight: '600' }}>
                  Work Duration: {todayAttendance.work_duration_display}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Camera Preview Area */}
        <View style={globalStyles.markAttendanceCameraPreview}>
          {showCamera && permission?.granted ? (
            <Camera
              key={facing}
              style={{ flex: 1 }}
              type={facing}
              ref={(ref) => setCameraRef(ref)}
              ratio={cameraRatio}
            >
              <View style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-end',
                paddingBottom: 20,
              }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    padding: 15,
                    borderRadius: 50,
                    marginHorizontal: 10,
                  }}
                  onPress={() => setShowCamera(false)}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    padding: 15,
                    borderRadius: 50,
                    marginHorizontal: 10,
                  }}
                  onPress={handleCaptureSelfie}
                >
                  <Ionicons name="camera" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    padding: 15,
                    borderRadius: 50,
                    marginHorizontal: 10,
                  }}
                  onPress={toggleCameraFacing}
                >
                  <Ionicons name="camera-reverse" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </Camera>
          ) : (
            <>
              <Text style={globalStyles.markAttendancePreviewText}>
                {isSelfieTaken ? 'SELFIE CAPTURED' : 'NO PREVIEW AVAILABLE'}
              </Text>
              {isSelfieTaken && (
                <View style={globalStyles.markAttendanceSuccessIcon}>
                  <Ionicons name="checkmark-circle" size={48} color="#27ae60" />
                </View>
              )}
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={globalStyles.markAttendanceButtons}>
          {!hasCheckedIn ? (
            <>
              <TouchableOpacity
                style={[
                  globalStyles.markAttendanceTakeSelfieButton,
                  isSelfieTaken && globalStyles.markAttendanceButtonDisabled
                ]}
                onPress={handleTakeSelfie}
                disabled={isSelfieTaken}
              >
                <Text style={globalStyles.markAttendanceButtonText}>
                  {isSelfieTaken ? 'Selfie Taken' : 'Take selfie'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  globalStyles.markAttendanceSubmitButton,
                  (!isSelfieTaken || isSubmitting) && globalStyles.markAttendanceButtonDisabled
                ]}
                onPress={handleCheckIn}
                disabled={!isSelfieTaken || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={globalStyles.markAttendanceButtonText}>Check In</Text>
                )}
              </TouchableOpacity>
            </>
          ) : !hasCheckedOut ? (
            <TouchableOpacity
              style={[
                globalStyles.markAttendanceSubmitButton,
                isSubmitting && globalStyles.markAttendanceButtonDisabled
              ]}
              onPress={handleCheckOut}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={globalStyles.markAttendanceButtonText}>Check Out</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={{
              backgroundColor: '#95a5a6',
              borderRadius: 8,
              paddingVertical: 16,
              paddingHorizontal: 20,
              alignItems: 'center',
            }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Already Checked In & Out Today
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MarkAttendanceScreen;
