import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoginScreenProps } from '../../types';
import { globalStyles } from '../styles/globalStyles';
import { login } from '../utils/api';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    if (!username) {
      Alert.alert('Error', 'Please enter your username or email');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(username, password);
      Alert.alert('Success', 'Login successful!');
      onLogin(response.user, response.token);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.loginContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={globalStyles.loginKeyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={globalStyles.loginContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View style={globalStyles.loginHeader}>
            <Text style={globalStyles.loginTitle}>Welcome Back</Text>
            <Text style={globalStyles.loginSubtitle}>Sign in to your account</Text>
          </View>

          <View style={globalStyles.loginForm}>
            <View style={globalStyles.loginInputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={globalStyles.loginInputIcon} />
              <TextInput
                style={globalStyles.loginInput}
                placeholder="Username or Email"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={globalStyles.loginInputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={globalStyles.loginInputIcon} />
              <TextInput
                style={[globalStyles.loginInput, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 10 }}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={globalStyles.loginButton} 
              onPress={handleLogin} 
              disabled={isLoading}
            >
              <Text style={globalStyles.loginButtonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
