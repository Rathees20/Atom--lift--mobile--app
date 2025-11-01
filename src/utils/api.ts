// API configuration
//const API_BASE_URL = 'http://localhost:8000'; // Change this to your backend URL
const API_BASE_URL = 'https://atomlift.technuob.com';


// API endpoints
export const API_ENDPOINTS = {
  GENERATE_OTP: `${API_BASE_URL}/auth/api/mobile/generate-otp/`,
  VERIFY_OTP: `${API_BASE_URL}/auth/api/mobile/verify-otp/`,
  RESEND_OTP: `${API_BASE_URL}/auth/api/mobile/resend-otp/`,
  ASSIGNED_COMPLAINTS: `${API_BASE_URL}/complaints/api/complaints/assigned/`,
  UPDATE_COMPLAINT_STATUS: `${API_BASE_URL}/complaints/api/complaints/update-status/`,
  LOGOUT: `${API_BASE_URL}/auth/api/mobile/logout/`,
  // Complaint creation endpoints
  COMPLAINT_CUSTOMERS: `${API_BASE_URL}/complaints/api/complaints/customers/`,
  COMPLAINT_TYPES: `${API_BASE_URL}/complaints/api/complaints/types/`,
  COMPLAINT_PRIORITIES: `${API_BASE_URL}/complaints/api/complaints/priorities/`,
  COMPLAINT_EXECUTIVES: `${API_BASE_URL}/complaints/api/complaints/executives/`,
  CREATE_COMPLAINT: `${API_BASE_URL}/complaints/create/`,
};

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Token and user storage
let authToken: string | null = null;
let userData: any = null;

export const setAuthToken = async (token: string) => {
  authToken = token;
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  if (authToken) {
    return authToken;
  }

  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    authToken = token;
    return token;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

export const clearAuthToken = async () => {
  authToken = null;
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

export const setUserData = async (user: any) => {
  userData = user;
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const getUserData = async (): Promise<any> => {
  if (userData) {
    return userData;
  }

  try {
    const userJson = await AsyncStorage.getItem(USER_DATA_KEY);
    if (userJson) {
      userData = JSON.parse(userJson);
      return userData;
    }
  } catch (error) {
    console.error('Error retrieving user data:', error);
  }
  return null;
};

export const clearUserData = async () => {
  userData = null;
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

// API response types
export interface GenerateOTPResponse {
  message: string;
  otp_type: string;
  contact_info: string;
  expires_in_minutes: number;
}

export interface VerifyOTPResponse {
  user: any;
  token: string;
  message: string;
}

export interface ErrorResponse {
  error: string;
}

export interface ComplaintItem {
  id: number;
  reference: string;
  title: string;
  dateTime: string;
  status: string;
  ticketId: string;
  amcType: string;
  siteAddress: string;
  mobileNumber: string;
  subject: string;
  message: string;
  priority: string;
  assigned_to: string;
  customer_name: string;
  contact_person: string;
  block_wing: string;
  technician_remark: string;
  solution: string;
  technician_signature?: string;
  customer_signature?: string;
}

// API functions
export const generateOTP = async (
  contact: string,
  method: 'email' | 'phone'
): Promise<GenerateOTPResponse> => {
  const body = method === 'email'
    ? { email: contact }
    : { phone_number: contact };

  const response = await fetch(API_ENDPOINTS.GENERATE_OTP, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error);
  }

  return response.json();
};

export const verifyOTP = async (
  otp_code: string,
  contact: string,
  method: 'email' | 'phone'
): Promise<VerifyOTPResponse> => {
  const body = method === 'email'
    ? { otp_code, email: contact }
    : { otp_code, phone_number: contact };

  const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error);
  }

  const result = await response.json();

  // Store the token and user data for future authenticated requests
  if (result.token) {
    await setAuthToken(result.token);
  }
  if (result.user) {
    await setUserData(result.user);
  }

  return result;
};

export const resendOTP = async (
  contact: string,
  method: 'email' | 'phone'
): Promise<GenerateOTPResponse> => {
  const body = method === 'email'
    ? { email: contact }
    : { phone_number: contact };

  const response = await fetch(API_ENDPOINTS.RESEND_OTP, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error);
  }

  return response.json();
};

export const getAssignedComplaints = async (): Promise<ComplaintItem[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.ASSIGNED_COMPLAINTS, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch assigned complaints');
  }

  return response.json();
};

export const logout = async (): Promise<void> => {
  const token = await getAuthToken();
  if (token) {
    try {
      await fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });
    } catch (error) {
      console.warn('Logout API call failed, but clearing local token anyway:', error);
    }
  }
  await clearAuthToken();
  await clearUserData();
};

export const updateComplaintStatus = async (
  reference: string,
  data: { status?: string; technician_remark?: string; solution?: string; technician_signature?: string; customer_signature?: string }
): Promise<{ success: boolean; message: string; complaint?: any }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(`${API_ENDPOINTS.UPDATE_COMPLAINT_STATUS}${reference}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to update complaint');
  }

  return response.json();
};

// Complaint creation API functions
export const getComplaintCustomers = async (): Promise<Customer[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.COMPLAINT_CUSTOMERS, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch customers');
  }

  return response.json();
};

export const getComplaintTypes = async (): Promise<ComplaintType[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.COMPLAINT_TYPES, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch complaint types');
  }

  return response.json();
};

export const getComplaintPriorities = async (): Promise<Priority[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.COMPLAINT_PRIORITIES, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch priorities');
  }

  return response.json();
};

export const getComplaintExecutives = async (): Promise<Executive[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.COMPLAINT_EXECUTIVES, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch executives');
  }

  return response.json();
};

export const createComplaint = async (complaintData: any): Promise<{ success: boolean; message: string; complaint?: any }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.CREATE_COMPLAINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(complaintData),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to create complaint');
  }

  return response.json();
};

// Additional interfaces for complaint creation
export interface Customer {
  id: number;
  site_name: string;
  reference_id?: string;
  job_no?: string;
  site_id?: string;
  email?: string;
  phone?: string;
  contact_person_name?: string;
}

export interface ComplaintType {
  id: number;
  name: string;
}

export interface Priority {
  id: number;
  name: string;
}

export interface Executive {
  id: number;
  full_name: string;
}
