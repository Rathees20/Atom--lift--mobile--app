import React, { createContext, useContext, useState, ReactNode } from 'react';
import CustomAlert from '../components/CustomAlert';

interface AlertConfig {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onPress?: () => void;
  buttonText?: string;
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  showSuccessAlert: (message: string, onPress?: () => void) => void;
  showErrorAlert: (message: string, onPress?: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = (config: AlertConfig): void => {
    console.log('Showing alert:', config); // Debug log
    setAlertConfig(config);
    setVisible(true);
  };

  const hideAlert = (): void => {
    setVisible(false);
    // Clear config after animation
    setTimeout(() => {
      setAlertConfig(null);
    }, 300);
  };

  const handlePress = (): void => {
    if (alertConfig?.onPress) {
      alertConfig.onPress();
    }
    hideAlert();
  };

  const showSuccessAlert = (message: string, onPress?: () => void): void => {
    showAlert({
      title: 'Success',
      message,
      type: 'success',
      onPress,
    });
  };

  const showErrorAlert = (message: string, onPress?: () => void): void => {
    showAlert({
      title: 'Error',
      message,
      type: 'error',
      onPress,
    });
  };

  return (
    <AlertContext.Provider value={{ showAlert, showSuccessAlert, showErrorAlert }}>
      {children}
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={hideAlert}
          onPress={handlePress}
          buttonText={alertConfig.buttonText}
        />
      )}
    </AlertContext.Provider>
  );
};

