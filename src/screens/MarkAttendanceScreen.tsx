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
import { checkInAttendance } from '../utils/api';

interface MarkAttendanceScreenProps {
  onBack: () => void;
}

const MarkAttendanceScreen: React.FC<MarkAttendanceScreenProps> = ({ onBack }) => {
  const [isSelfieTaken, setIsSelfieTaken] = useState<boolean>(false);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>(CameraType.front);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [cameraRef, setCameraRef] = useState<any>(null);

  useEffect(() => {
    // Request camera permission on component mount
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

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
        Alert.alert(
          'Error',
          'Failed to capture selfie. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };


  const toggleCameraFacing = () => {
    setFacing(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!isSelfieTaken || !selfieFile) {
      Alert.alert(
        'Selfie Required',
        'Please take a selfie before submitting attendance.',
        [{ text: 'OK' }]
      );
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
      Alert.alert(
        'Success',
        'Your attendance has been marked successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsSelfieTaken(false);
              setSelfieFile(null);
              onBack(); // Go back to home screen
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Check-in failed:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to mark attendance. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Camera Preview Area */}
        <View style={globalStyles.markAttendanceCameraPreview}>
          {showCamera && permission?.granted ? (
            <Camera
              style={{ flex: 1 }}
              type={facing}
              ref={(ref) => setCameraRef(ref)}
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
            onPress={handleSubmit}
            disabled={!isSelfieTaken || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={globalStyles.markAttendanceButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MarkAttendanceScreen;
