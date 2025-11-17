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

  // App runs 24/7 - session persists indefinitely until explicit logout
  // Check for existing authentication on app startup
  // This ensures the app maintains login state even after app restarts
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = await getAuthToken();
        const userData = await getUserData();

        // If token and user data exist, restore the session
        // This allows the app to work 24/7 without requiring re-login
        if (token && userData) {
          // Extract mobile number from user data (assuming it has phone_number or mobile field)
          const mobile = userData.phone_number || userData.mobile || userData.phone || '';
          setMobileNumber(mobile);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking existing auth:', error);
        // Don't clear session on error - app should continue working
        // Only explicit logout should clear the session
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

  // Only explicit logout clears the session
  // App works 24/7 and maintains session until user explicitly logs out
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
    // Clear all session data only on explicit logout
    setMobileNumber('');
    setIsLoggedIn(false);
    // Session is now cleared - user will need to login again
  };

  if (isLoading) {
    // You could show a loading screen here, but for now just return null
    return null;
  }

  const AppContent = () => (
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: '#3498db',
      width: '100%',
      alignSelf: 'stretch'
    }}>
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
