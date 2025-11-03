import { Platform, StatusBar, Dimensions } from 'react-native';

/**
 * Get the status bar height for the current platform
 */
export const getStatusBarHeight = (): number => {
  if (Platform.OS === 'ios') {
    // For iOS, we need to account for the status bar height
    return StatusBar.currentHeight || 44; // Default to 44 for newer iPhones
  } else {
    // For Android, StatusBar.currentHeight gives us the height
    return StatusBar.currentHeight || 24; // Default to 24 for most Android devices
  }
};

/**
 * Get safe area padding for headers
 * This ensures headers are properly positioned below the status bar
 */
export const getHeaderPaddingTop = (): number => {
  const statusBarHeight = getStatusBarHeight();
  // Add extra padding for better visual spacing
  return statusBarHeight + 10;
};

/**
 * Get screen dimensions
 */
export const getScreenDimensions = () => {
  return Dimensions.get('window');
};

/**
 * Check if device has notch or dynamic island
 */
export const hasNotch = (): boolean => {
  const { height, width } = getScreenDimensions();
  const aspectRatio = height / width;
  
  // Devices with notch typically have aspect ratios > 2.0
  return aspectRatio > 2.0;
};

/**
 * Get recommended header height including status bar
 */
export const getRecommendedHeaderHeight = (): number => {
  return getHeaderPaddingTop() + 56; // 56 is standard header height
};
