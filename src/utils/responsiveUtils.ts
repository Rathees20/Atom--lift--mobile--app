import { Dimensions, Platform, PixelRatio } from 'react-native';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Design dimensions (based on iPhone 12 Pro)
const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 844;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  xs: 320,   // Small phones
  sm: 375,   // iPhone SE, iPhone 8
  md: 414,   // iPhone 8 Plus, iPhone 11 Pro Max
  lg: 768,   // Tablets
  xl: 1024,  // Large tablets
};

// Device type detection
export const getDeviceType = (): 'phone' | 'tablet' | 'desktop' => {
  const width = SCREEN_WIDTH;
  if (width < BREAKPOINTS.lg) return 'phone';
  if (width < BREAKPOINTS.xl) return 'tablet';
  return 'desktop';
};

// Screen size detection
export const getScreenSize = (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' => {
  const width = SCREEN_WIDTH;
  if (width < BREAKPOINTS.xs) return 'xs';
  if (width < BREAKPOINTS.sm) return 'sm';
  if (width < BREAKPOINTS.md) return 'md';
  if (width < BREAKPOINTS.lg) return 'lg';
  return 'xl';
};

// Responsive width calculation
export const responsiveWidth = (width: number): number => {
  return (SCREEN_WIDTH * width) / DESIGN_WIDTH;
};

// Responsive height calculation
export const responsiveHeight = (height: number): number => {
  return (SCREEN_HEIGHT * height) / DESIGN_HEIGHT;
};

// Responsive font size calculation
export const responsiveFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / DESIGN_WIDTH;
  const newSize = size * scale;
  
  // Ensure minimum font size for readability
  const minSize = 12;
  const maxSize = size * 1.5;
  
  return Math.max(minSize, Math.min(maxSize, newSize));
};

// Responsive padding/margin calculation
export const responsiveSize = (size: number): number => {
  const scale = Math.min(SCREEN_WIDTH / DESIGN_WIDTH, SCREEN_HEIGHT / DESIGN_HEIGHT);
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

// Check if device is in landscape mode
export const isLandscape = (): boolean => {
  return SCREEN_WIDTH > SCREEN_HEIGHT;
};

// Check if device has notch or dynamic island
export const hasNotch = (): boolean => {
  if (Platform.OS === 'ios') {
    const { height, width } = Dimensions.get('window');
    const aspectRatio = height / width;
    return aspectRatio > 2.0;
  }
  return false;
};

// Get safe area insets
export const getSafeAreaInsets = () => {
  const deviceType = getDeviceType();
  const hasNotchDevice = hasNotch();
  
  // For web, use minimal safe area insets
  if (Platform.OS === 'web') {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
  }
  
  // For mobile devices, ensure proper safe area handling
  const screenSize = getScreenSize();
  const baseTop = hasNotchDevice ? 44 : 20;
  const baseBottom = hasNotchDevice ? 34 : 0;
  
  // Adjust for smaller screens
  const topInset = screenSize === 'xs' ? Math.max(baseTop - 4, 16) : baseTop;
  const bottomInset = screenSize === 'xs' ? Math.max(baseBottom - 4, 0) : baseBottom;
  
  return {
    top: topInset,
    bottom: bottomInset,
    left: 0,
    right: 0,
  };
};

// Get recommended touch target size (minimum 44px for accessibility)
export const getTouchTargetSize = (baseSize: number = 44): number => {
  return Math.max(baseSize, responsiveSize(44));
};

// Get responsive grid columns based on screen size
export const getGridColumns = (): number => {
  const screenSize = getScreenSize();
  switch (screenSize) {
    case 'xs':
    case 'sm':
      return 2;
    case 'md':
      return 2;
    case 'lg':
      return 3;
    case 'xl':
      return 4;
    default:
      return 2;
  }
};

// Get responsive spacing
export const getSpacing = (multiplier: number = 1): number => {
  const baseSpacing = 8;
  const screenSize = getScreenSize();
  
  // Adjust spacing for smaller screens
  const spacingMultiplier = screenSize === 'xs' ? 0.8 : screenSize === 'sm' ? 0.9 : 1;
  
  return responsiveSize(baseSpacing * multiplier * spacingMultiplier);
};

// Get responsive border radius
export const getBorderRadius = (size: number = 8): number => {
  return responsiveSize(size);
};

// Check if device supports haptic feedback
export const supportsHapticFeedback = (): boolean => {
  return Platform.OS === 'ios' || (Platform.OS === 'android' && Number(Platform.Version) >= 23);
};

// Get device pixel ratio
export const getPixelRatio = (): number => {
  return PixelRatio.get();
};

// Convert dp to pixels
export const dpToPx = (dp: number): number => {
  return PixelRatio.getPixelSizeForLayoutSize(dp);
};

// Convert pixels to dp
export const pxToDp = (px: number): number => {
  return px / PixelRatio.get();
};

// Get screen dimensions
export const getScreenDimensions = () => {
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    deviceType: getDeviceType(),
    screenSize: getScreenSize(),
    isLandscape: isLandscape(),
    hasNotch: hasNotch(),
    safeAreaInsets: getSafeAreaInsets(),
  };
};

// Responsive style helper
export const createResponsiveStyle = (styles: any) => {
  const screenSize = getScreenSize();
  const deviceType = getDeviceType();
  
  return {
    ...styles,
    // Add responsive modifications based on screen size
    ...(screenSize === 'xs' && styles.xs),
    ...(screenSize === 'sm' && styles.sm),
    ...(screenSize === 'md' && styles.md),
    ...(screenSize === 'lg' && styles.lg),
    ...(screenSize === 'xl' && styles.xl),
    // Add device type specific styles
    ...(deviceType === 'phone' && styles.phone),
    ...(deviceType === 'tablet' && styles.tablet),
    ...(deviceType === 'desktop' && styles.desktop),
  };
};

// Mobile-specific layout helper
export const getMobileLayoutStyle = () => {
  const screenSize = getScreenSize();
  const deviceType = getDeviceType();
  
  const baseStyle = {
    width: '100%',
    alignSelf: 'stretch' as const,
  };
  
  if (deviceType === 'phone') {
    return {
      ...baseStyle,
      // Ensure proper mobile layout
      flex: 1,
      ...(screenSize === 'xs' && {
        paddingHorizontal: getSpacing(1.5),
      }),
      ...(screenSize === 'sm' && {
        paddingHorizontal: getSpacing(2),
      }),
    };
  }
  
  return baseStyle;
};

// Container style helper for consistent mobile alignment
export const getContainerStyle = () => {
  return {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#f8f9fa',
  };
};
