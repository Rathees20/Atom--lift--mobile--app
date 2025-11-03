import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  onPress?: () => void;
  buttonText?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  onPress,
  buttonText = 'OK',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Start animation when visible
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when hidden
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    onClose();
  };

  const handleBackdropPress = () => {
    // Optional: Close on backdrop press
    // onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={40} color="#27ae60" />;
      case 'error':
        return <Ionicons name="close-circle" size={40} color="#e74c3c" />;
      default:
        return <Ionicons name="information-circle" size={40} color="#3498db" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#27ae60';
      case 'error':
        return '#e74c3c';
      default:
        return '#3498db';
    }
  };

  const getIconBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(39, 174, 96, 0.1)';
      case 'error':
        return 'rgba(231, 76, 60, 0.1)';
      default:
        return 'rgba(52, 152, 219, 0.1)';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdrop}
          onPress={handleBackdropPress}
        />
        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: scaleAnim,
            },
          ]}
        >
          <View style={[styles.iconWrapper, { backgroundColor: getIconBackgroundColor() }]}>
            {getIcon()}
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: getBackgroundColor() }]}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: SCREEN_WIDTH * 0.75,
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 14,
    color: '#5a6c7d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default CustomAlert;

