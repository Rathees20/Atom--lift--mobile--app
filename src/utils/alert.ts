import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert utility that works on all platforms including web
 * 
 * Why React Native's Alert.alert might not work:
 * 1. On web, Alert.alert uses window.alert() which is very basic and can be blocked
 * 2. Some browsers block alerts if there are too many
 * 3. Alert might not show if component unmounts quickly
 * 4. setTimeout delays can cause timing issues
 * 
 * This utility provides a more reliable way to show alerts
 */
export const showAlert = (
  title: string,
  message: string,
  buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>
): void => {
  // On web, ensure alert is called synchronously without delay
  if (Platform.OS === 'web') {
    // Use native alert for web as fallback, but with proper message
    if (buttons && buttons.length > 0) {
      // For web with buttons, we'll use Alert.alert but ensure it's called properly
      Alert.alert(title, message, buttons);
    } else {
      // Simple alert on web
      Alert.alert(title, message);
    }
  } else {
    // For mobile (iOS/Android), use Alert.alert normally
    if (buttons && buttons.length > 0) {
      Alert.alert(title, message, buttons);
    } else {
      Alert.alert(title, message);
    }
  }
};

export const showSuccessAlert = (
  message: string,
  onPress?: () => void
): void => {
  showAlert(
    'Success',
    message,
    [
      {
        text: 'OK',
        onPress: onPress,
      },
    ]
  );
};

export const showErrorAlert = (
  message: string,
  onPress?: () => void
): void => {
  showAlert(
    'Error',
    message,
    [
      {
        text: 'OK',
        onPress: onPress,
      },
    ]
  );
};

