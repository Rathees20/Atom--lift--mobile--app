import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import { globalStyles } from '../styles/globalStyles';

interface MarkAttendanceScreenProps {
  onBack: () => void;
}

const MarkAttendanceScreen: React.FC<MarkAttendanceScreenProps> = ({ onBack }) => {
  const [isSelfieTaken, setIsSelfieTaken] = useState<boolean>(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>(CameraType.front);
  const [showCamera, setShowCamera] = useState<boolean>(false);

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

  const handleCaptureSelfie = (): void => {
    // In a real app, this would capture the photo
    // For now, we'll simulate taking a selfie
    setShowCamera(false);
    setIsSelfieTaken(true);
    Alert.alert(
      'Selfie Taken',
      'Selfie has been captured successfully!',
      [{ text: 'OK' }]
    );
  };


  const toggleCameraFacing = () => {
    setFacing(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  const handleSubmit = (): void => {
    if (!isSelfieTaken) {
      Alert.alert(
        'Selfie Required',
        'Please take a selfie before submitting attendance.',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('Submit attendance pressed');
    Alert.alert(
      'Attendance Marked',
      'Your attendance has been marked successfully!',
      [
        {
          text: 'OK',
          onPress: () => {
            setIsSelfieTaken(false);
            onBack(); // Go back to home screen
          },
        },
      ]
    );
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
              !isSelfieTaken && globalStyles.markAttendanceButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!isSelfieTaken}
          >
            <Text style={globalStyles.markAttendanceButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MarkAttendanceScreen;
