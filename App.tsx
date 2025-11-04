import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, SafeAreaView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import { getAuthToken, getUserData, logout } from './src/utils/api';
import { AlertProvider } from './src/contexts/AlertContext';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing authentication on app startup
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = await getAuthToken();
        const userData = await getUserData();

        if (token && userData) {
          // Extract mobile number from user data (assuming it has phone_number or mobile field)
          const mobile = userData.phone_number || userData.mobile || userData.phone || '';
          setMobileNumber(mobile);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking existing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingAuth();
  }, []);

  const handleLogin = (user: any, token: string) => {
    // Extract mobile number from user data
    const mobile = user.phone_number || user.mobile || user.phone || '';
    setMobileNumber(mobile);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
    setMobileNumber('');
    setIsLoggedIn(false);
  };

  if (isLoading) {
    // You could show a loading screen here, but for now just return null
    return null;
  }

  const appContainerStyle = {
    flex: 1,
    backgroundColor: '#3498db',
    width: '100%',
    alignSelf: 'stretch' as const,
    ...(Platform.OS === 'web' && {
      // Web-specific styles
      maxWidth: '100%',
    }),
  };

  const AppContent = () => (
    <SafeAreaView style={appContainerStyle}>
      <StatusBar 
        style="light" 
        backgroundColor="#3498db"
        translucent={Platform.OS === 'android'}
      />
      {isLoggedIn ? (
        <HomeScreen 
          onLogout={handleLogout} 
          mobileNumber={mobileNumber} 
        />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </SafeAreaView>
  );

  return (
    <AlertProvider>
      <SafeAreaProvider style={{ flex: 1, width: '100%' }}>
        <AppContent />
      </SafeAreaProvider>
    </AlertProvider>
  );
}
