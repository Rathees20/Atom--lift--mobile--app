import React, { useState, useEffect } from 'react';
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
import { LoginScreenProps, LoginMethod } from '../../types';
import { globalStyles } from '../styles/globalStyles';
import { generateOTP, verifyOTP as verifyOTPApi, resendOTP as resendOTPApi } from '../utils/api';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [contact, setContact] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [canResendOtp, setCanResendOtp] = useState<boolean>(true);

  // OTP Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const validateContact = (input: string, method: LoginMethod): boolean => {
    if (method === 'phone') {
      const mobileRegex = /^[6-9]\d{9}$/;
      return mobileRegex.test(input);
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input);
    }
  };

  const sendOTP = async (): Promise<void> => {
    if (!contact) {
      Alert.alert('Error', `Please enter your ${loginMethod === 'phone' ? 'mobile number' : 'email'}`);
      return;
    }

    if (!validateContact(contact, loginMethod)) {
      Alert.alert('Error', `Please enter a valid ${loginMethod === 'phone' ? '10-digit mobile number' : 'email address'}`);
      return;
    }

    setIsLoading(true);

    try {
      await generateOTP(contact, loginMethod);
      setIsOtpSent(true);
      setOtpTimer(60);
      setCanResendOtp(false);
      const contactDisplay = loginMethod === 'phone' ? `+91${contact}` : contact;
      Alert.alert('Success', `OTP sent to ${contactDisplay}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (): Promise<void> => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOTPApi(otp, contact, loginMethod);
      Alert.alert('Success', 'Login successful!');
      onLogin(response.user, response.token);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async (): Promise<void> => {
    if (!canResendOtp) {
      Alert.alert('Info', `Please wait ${otpTimer} seconds before resending OTP`);
      return;
    }

    setIsLoading(true);

    try {
      await resendOTPApi(contact, loginMethod);
      setOtpTimer(60);
      setCanResendOtp(false);
      const contactDisplay = loginMethod === 'phone' ? `+91${contact}` : contact;
      Alert.alert('Success', `OTP resent to ${contactDisplay}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
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
            {!isOtpSent ? (
              <>
                <View style={{flexDirection: 'row', marginBottom: 20, justifyContent: 'center'}}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 10,
                      marginRight: 10,
                      backgroundColor: loginMethod === 'phone' ? '#007bff' : '#f8f9fa',
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: loginMethod === 'phone' ? '#007bff' : '#ddd',
                    }}
                    onPress={() => {
                      setLoginMethod('phone');
                      setContact('');
                      setIsOtpSent(false);
                      setOtp('');
                    }}
                  >
                    <Text style={{
                      textAlign: 'center',
                      color: loginMethod === 'phone' ? 'white' : '#333',
                      fontWeight: loginMethod === 'phone' ? 'bold' : 'normal',
                    }}>
                      Phone
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      padding: 10,
                      marginLeft: 10,
                      backgroundColor: loginMethod === 'email' ? '#007bff' : '#f8f9fa',
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: loginMethod === 'email' ? '#007bff' : '#ddd',
                    }}
                    onPress={() => {
                      setLoginMethod('email');
                      setContact('');
                      setIsOtpSent(false);
                      setOtp('');
                    }}
                  >
                    <Text style={{
                      textAlign: 'center',
                      color: loginMethod === 'email' ? 'white' : '#333',
                      fontWeight: loginMethod === 'email' ? 'bold' : 'normal',
                    }}>
                      Email
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={globalStyles.loginInputContainer}>
                  <Ionicons name={loginMethod === 'phone' ? "call-outline" : "mail-outline"} size={20} color="#666" style={globalStyles.loginInputIcon} />
                  <TextInput
                    style={globalStyles.loginInput}
                    placeholder={loginMethod === 'phone' ? "Mobile Number" : "Email Address"}
                    placeholderTextColor="#999"
                    value={contact}
                    onChangeText={(text: string) => setContact(loginMethod === 'phone' ? text.replace(/\D/g, '').slice(0, 10) : text.slice(0, 100))}
                    keyboardType={loginMethod === 'phone' ? "phone-pad" : "email-address"}
                    maxLength={loginMethod === 'phone' ? 10 : 100}
                    autoCapitalize={loginMethod === 'email' ? "none" : "none"}
                  />
                </View>

                <TouchableOpacity style={globalStyles.loginButton} onPress={sendOTP} disabled={isLoading}>
                  <Text style={globalStyles.loginButtonText}>
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={globalStyles.loginMobileNumberDisplay}>
                  <Text style={globalStyles.loginMobileNumberText}>
                    {loginMethod === 'phone' ? `+91 ${contact}` : contact}
                  </Text>
                  <TouchableOpacity onPress={() => setIsOtpSent(false)}>
                    <Text style={globalStyles.loginChangeNumberText}>Change</Text>
                  </TouchableOpacity>
                </View>

                <View style={globalStyles.loginInputContainer}>
                  <Ionicons name="keypad-outline" size={20} color="#666" style={globalStyles.loginInputIcon} />
                  <TextInput
                    style={globalStyles.loginInput}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#999"
                    value={otp}
                    onChangeText={(text: string) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                    textAlign="center"
                  />
                </View>

                <TouchableOpacity style={globalStyles.loginButton} onPress={handleVerifyOTP} disabled={isLoading}>
                  <Text style={globalStyles.loginButtonText}>
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </TouchableOpacity>

                <View style={globalStyles.loginResendContainer}>
                  {otpTimer > 0 ? (
                    <Text style={globalStyles.loginTimerText}>
                      Resend OTP in {otpTimer}s
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOTP} disabled={isLoading}>
                      <Text style={globalStyles.loginResendText}>Resend OTP</Text>
            </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
