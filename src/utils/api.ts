// API configuration
//const API_BASE_URL = 'https://atomlift.technuob.com' ; // Change this to your backend URL
const API_BASE_URL = 'https://atomlift.technuob.com';

// API endpoints
export const API_ENDPOINTS = {
  GENERATE_OTP: `${API_BASE_URL}/auth/api/mobile/generate-otp/`,
  VERIFY_OTP: `${API_BASE_URL}/auth/api/mobile/verify-otp/`,
  RESEND_OTP: `${API_BASE_URL}/auth/api/mobile/resend-otp/`,
  USER_DETAILS: `${API_BASE_URL}/auth/api/mobile/user-details/`,
  ASSIGNED_COMPLAINTS: `${API_BASE_URL}/complaints/api/complaints/assigned/`,
  UPDATE_COMPLAINT_STATUS: `${API_BASE_URL}/complaints/api/complaints/update-status/`,
  LOGOUT: `${API_BASE_URL}/auth/api/mobile/logout/`,
  // Complaint creation endpoints
  COMPLAINT_CUSTOMERS: `${API_BASE_URL}/complaints/api/complaints/customers/`,
  COMPLAINT_TYPES: `${API_BASE_URL}/complaints/api/complaints/types/`,
  COMPLAINT_PRIORITIES: `${API_BASE_URL}/complaints/api/complaints/priorities/`,
  COMPLAINT_EXECUTIVES: `${API_BASE_URL}/complaints/api/complaints/executives/`,
  CREATE_COMPLAINT: `${API_BASE_URL}/complaints/create/`,
  // AMC endpoints
  AMC_LIST: `${API_BASE_URL}/amc/api/amc/list/`,
  AMC_CREATE: `${API_BASE_URL}/amc/api/amc/create/`,
  AMC_TYPES: `${API_BASE_URL}/amc/api/amc/types/list/`,
  AMC_TYPE_CREATE: `${API_BASE_URL}/amc/api/amc/types/create/`,
  // Customer endpoints
  CUSTOMER_LIST: `${API_BASE_URL}/customer/api/customer/list/`,
  CUSTOMER_CREATE: `${API_BASE_URL}/customer/api/customer/create/`,
  // Leave endpoints
  LEAVE_CREATE: `${API_BASE_URL}/employeeleave/api/leave/create/`,
  LEAVE_LIST: `${API_BASE_URL}/employeeleave/api/leave/list/`,
  LEAVE_DETAIL: `${API_BASE_URL}/employeeleave/api/leave/`,
  LEAVE_UPDATE: `${API_BASE_URL}/employeeleave/api/leave/`,
  LEAVE_DELETE: `${API_BASE_URL}/employeeleave/api/leave/`,
  LEAVE_TYPES: `${API_BASE_URL}/employeeleave/api/leave/types/`,
  LEAVE_COUNTS: `${API_BASE_URL}/employeeleave/api/leave/counts/`,
  // Material Request endpoints
  MATERIAL_REQUEST_LIST: `${API_BASE_URL}/material_request/api/list/`,
  MATERIAL_REQUEST_CREATE: `${API_BASE_URL}/material_request/api/create/`,
  // Items endpoints
  ITEMS_LIST: `${API_BASE_URL}/items/api/items/`,
  // Travelling endpoints
  TRAVELLING_LIST: `${API_BASE_URL}/travelling/api/list/`,
  TRAVELLING_CREATE: `${API_BASE_URL}/travelling/api/create/`,
  // Attendance endpoints
  ATTENDANCE_CHECK_IN: `${API_BASE_URL}/attendance/api/attendance/check-in/`,
  ATTENDANCE_WORK_CHECK_IN: `${API_BASE_URL}/attendance/api/attendance/work-check-in/`,
  ATTENDANCE_CHECK_OUT: `${API_BASE_URL}/attendance/api/attendance/check-out/`,
  ATTENDANCE_LIST: `${API_BASE_URL}/attendance/api/attendance/list/`,
  ATTENDANCE_TODAY: `${API_BASE_URL}/attendance/api/attendance/today/`,
  ATTENDANCE_DETAIL: `${API_BASE_URL}/attendance/api/attendance/`,
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

export interface UserDetails {
  id: number;
  email?: string;
  phone_number?: string;
  mobile?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  username?: string;
  is_active?: boolean;
  is_staff?: boolean;
  date_joined?: string;
  last_login?: string;
  [key: string]: any; // Allow for additional fields
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

// Get logged-in user details from API
export const fetchUserDetails = async (): Promise<UserDetails> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.USER_DETAILS, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch user details');
  }

  const result = await response.json();
  
  // Handle different response structures
  if (result.user_detail) {
    // If response has user_detail property
    const userData = result.user_detail;
    // Store updated user data
    await setUserData(userData);
    return userData;
  } else if (result.user) {
    // If response has user property
    const userData = result.user;
    await setUserData(userData);
    return userData;
  } else if (result.id) {
    // If response is the user object directly
    await setUserData(result);
    return result;
  } else {
    throw new Error('Unexpected user details response format');
  }
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
  mobile?: string;
  contact_person_name?: string;
  designation?: string;
  city?: string;
  province_state_name?: string;
  sector?: string;
  site_address?: string;
  branch_name?: string;
  route_name?: string;
  [key: string]: any; // Allow for additional fields
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

// AMC interfaces and API functions
export interface AMCItem {
  id: number;
  reference_id?: string;
  amc_id?: string;
  amcId?: string;
  amcname?: string;
  number?: string;
  site_name?: string;
  siteName?: string;
  duration?: string;
  status?: string;
  status_display?: string;
  is_overdue?: boolean;
  isOverdue?: boolean;
  customer?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_site_address?: string;
  customer_job_no?: string;
  start_date?: string;
  end_date?: string;
  amc_type?: string;
  amc_type_name?: string;
  number_of_services?: number;
  no_of_services?: number;
  no_of_lifts?: number;
  payment_amount?: number;
  contract_amount?: string;
  total?: string;
  total_amount_paid?: string;
  amount_due?: string;
  price?: string;
  gst_percentage?: string;
  payment_terms?: string;
  payment_terms_name?: string;
  invoice_frequency?: string;
  invoice_frequency_display?: string;
  is_generate_contract?: boolean;
  notes?: string;
  latitude?: string;
  longitude?: string;
  equipment_no?: string;
  created?: string;
  [key: string]: any; // Allow for additional fields
}

export const getAMCList = async (): Promise<AMCItem[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  console.log('Fetching AMC list from:', API_ENDPOINTS.AMC_LIST);
  
  const response = await fetch(API_ENDPOINTS.AMC_LIST, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  console.log('AMC list response status:', response.status);

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch AMC list');
  }

  const data = await response.json();
  console.log('AMC list API returned data:', data);

  // Handle paginated response structure
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }

  // Fallback for non-paginated response
  return data;
};

export const createAMC = async (amcData: any): Promise<{ success: boolean; message: string; amc?: any }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.AMC_CREATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(amcData),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to create AMC');
  }

  return response.json();
};

// Customer API functions
export const getCustomerList = async (): Promise<Customer[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.CUSTOMER_LIST, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch customer list');
  }

  const data = await response.json();
  console.log('Customer list API returned data:', data);

  // Handle paginated response structure
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }

  // Fallback for non-paginated response
  return data;
};

export const createCustomer = async (customerData: any): Promise<{ success: boolean; message: string; customer?: any }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.CUSTOMER_CREATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(customerData),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to create customer');
  }

  return response.json();
};

// AMC Type interface and API functions
export interface AMCType {
  id: number;
  name: string;
}

export const getAMCTypes = async (): Promise<AMCType[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.AMC_TYPES, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch AMC types');
  }

  const data = await response.json();
  console.log('AMC types API returned data:', data);

  // Handle different response structures
  if (data.amc_types && Array.isArray(data.amc_types)) {
    return data.amc_types;
  }

  // Handle paginated response structure
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }

  // Fallback for direct array response
  if (Array.isArray(data)) {
    return data;
  }

  // If none of the above, return empty array
  console.warn('Unexpected AMC types response structure:', data);
  return [];
};

export const createAMCType = async (amcTypeData: { name: string }): Promise<{ success: boolean; message: string; amcType?: any }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.AMC_TYPE_CREATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(amcTypeData),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to create AMC type');
  }

  return response.json();
};

// Material Request interface and API functions
export interface MaterialRequestItem {
  id: number;
  date: string;
  name: string;
  description: string;
  item: {
    id: number;
    item_number: string;
    name: string;
    make?: string;
    model: string;
    type?: string;
    capacity: string;
    unit?: string;
  };
  brand?: string;
  file?: string;
  added_by: string;
  requested_by: string;
}

export interface CreateMaterialRequestData {
  name: string;
  description: string;
  item: number; // Changed to number (ID) instead of string
  brand?: string;
  file?: string;
  added_by: string;
  requested_by: string;
}

// Item interface and API functions
export interface Item {
  id: number;
  item_number: string;
  name: string;
  make?: string;
  model: string;
  type?: string;
  capacity: string;
  unit?: string;
  sale_price: string;
  purchase_price: string;
}

export const getItemsList = async (): Promise<Item[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.ITEMS_LIST, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch items');
  }

  const data = await response.json();
  console.log('Items list API returned data:', data);

  // Handle paginated response structure
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }

  // Fallback for direct array response
  return data;
};

// Travelling interfaces and API functions
export interface TravelRequestItem {
  id: number;
  travel_by: string;
  travel_date: string;
  from_place: string;
  to_place: string;
  amount: string;
  attachment?: string;
  created_by: string;
  created_at: string;
}

export interface CreateTravelRequestData {
  travel_by: string;
  travel_date: string;
  from_place: string;
  to_place: string;
  amount: string;
  attachment?: string;
}

export const getTravelRequestList = async (): Promise<TravelRequestItem[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.TRAVELLING_LIST, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch travel requests');
  }

  const data = await response.json();
  console.log('Travel request list API returned data:', data);

  // Handle paginated response structure
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }

  // Fallback for direct array response
  return data;
};

export const createTravelRequest = async (travelRequestData: CreateTravelRequestData): Promise<{ success: boolean; message: string; travelRequest?: TravelRequestItem }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.TRAVELLING_CREATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(travelRequestData),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to create travel request');
  }

  const result = await response.json();
  console.log('Create travel request response:', result);

  if (response.status === 201) {
    return {
      success: true,
      message: 'Travel request created successfully',
      travelRequest: result
    };
  } else {
    return {
      success: false,
      message: result.error || 'Failed to create travel request'
    };
  }
};

export const getMaterialRequestList = async (): Promise<MaterialRequestItem[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.MATERIAL_REQUEST_LIST, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch material requests');
  }

  const data = await response.json();
  console.log('Material request list API returned data:', data);

  // Handle paginated response structure
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }

  // Fallback for direct array response
  return data;
};

export const createMaterialRequest = async (materialRequestData: CreateMaterialRequestData): Promise<{ success: boolean; message: string; materialRequest?: MaterialRequestItem }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.MATERIAL_REQUEST_CREATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(materialRequestData),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to create material request');
  }

  const result = await response.json();
  console.log('Create material request response:', result);

  if (response.status === 201) {
    return {
      success: true,
      message: 'Material request created successfully',
      materialRequest: result
    };
  } else {
    return {
      success: false,
      message: result.error || 'Failed to create material request'
    };
  }
};

// Leave interfaces and API functions
export interface LeaveType {
  id: number;
  key: string;
  name: string;
}

export interface LeaveItem {
  id: number;
  half_day: boolean;
  leave_type: string;
  leave_type_display?: string;
  from_date: string;
  to_date: string;
  reason?: string;
  email: string;
  status: string;
  status_display?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLeaveData {
  half_day: boolean;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  email: string;
}

export interface LeaveCount {
  leave_type: string;
  leave_type_display?: string;
  total_allotted: number;
  total_used: number;
  total_remaining: number;
}

export interface LeaveCountsResponse {
  counts: LeaveCount[];
  total_all_leaves_allotted?: number;
  total_all_leaves_used?: number;
  total_all_leaves_remaining?: number;
}

export const createLeave = async (leaveData: CreateLeaveData): Promise<{ success: boolean; message?: string }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  try {
    const response = await fetch(API_ENDPOINTS.LEAVE_CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(leaveData),
    });

    const result = await response.json();
    console.log('Create Leave Response:', result);

    if (response.ok) {
      return { success: true, message: result.message || 'Leave created successfully' };
    } else {
      return { success: false, message: result.error || 'Failed to create leave' };
    }
  } catch (error: any) {
    console.error('Create Leave Error:', error);
    return { success: false, message: error.message || 'Network error' };
  }
};

export const getLeaveList = async (): Promise<LeaveItem[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.LEAVE_LIST, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leave list');
  }

  const result = await response.json();
  console.log('Leave list raw response:', result);

  // Handle different response structures
  if (Array.isArray(result)) {
    return result;
  } else if (Array.isArray(result.leave_requests)) {
    return result.leave_requests;
  } else if (result.results && Array.isArray(result.results.leave_requests)) {
    // Handle nested leave_requests in results object
    return result.results.leave_requests;
  } else if (Array.isArray(result.results)) {
    // Handle DRF pagination
    return result.results;
  } else if (result.data && Array.isArray(result.data.leave_requests)) {
    return result.data.leave_requests;
  } else {
    console.warn('Unexpected leave list format:', result);
    return [];
  }
};

export const getLeaveById = async (id: number): Promise<LeaveItem> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(`${API_ENDPOINTS.LEAVE_DETAIL}${id}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch leave details');
  }

  return response.json();
};

export const updateLeave = async (id: number, leaveData: Partial<CreateLeaveData>): Promise<{ success: boolean; message: string; leave?: LeaveItem }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(`${API_ENDPOINTS.LEAVE_UPDATE}${id}/update/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(leaveData),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to update leave request');
  }

  return response.json();
};

export const deleteLeave = async (id: number): Promise<{ success: boolean; message?: string }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  try {
    const response = await fetch(`${API_ENDPOINTS.LEAVE_DELETE}${id}/delete/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    const result = await response.json();
    console.log('Delete Leave Response:', result);

    if (response.ok) {
      return { success: true, message: result.message || 'Leave deleted successfully' };
    } else {
      return { success: false, message: result.error || 'Failed to delete leave' };
    }
  } catch (error: any) {
    console.error('Delete Leave Error:', error);
    return { success: false, message: error.message || 'Network error' };
  }
};

// Leave Type API function
export const getLeaveTypes = async (): Promise<LeaveType[]> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  try {
    const response = await fetch(API_ENDPOINTS.LEAVE_TYPES, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leave types');
    }

    const result = await response.json();
    
    // Expected structure: [{ id, key, name }]
    if (Array.isArray(result)) {
      return result;
    } else {
      // Fallback if backend changes structure
      return getPredefinedLeaveTypes();
    }
  } catch (error) {
    // If API fails, return predefined types as fallback
    console.warn('Failed to fetch leave types from API, using predefined types');
    return getPredefinedLeaveTypes();
  }
};

// Predefined leave types as fallback
const getPredefinedLeaveTypes = (): LeaveType[] => {
  return [
    { id: 1, key: 'casual', name: 'Casual Leave' },
    { id: 2, key: 'sick', name: 'Sick Leave' },
    { id: 3, key: 'earned', name: 'Earned Leave' },
    { id: 4, key: 'unpaid', name: 'Unpaid Leave' },
    { id: 5, key: 'other', name: 'Other' },
  ];
};

// Get Leave Counts/Balance for the current user
export const getLeaveCounts = async (): Promise<LeaveCountsResponse> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  try {
    const response = await fetch(API_ENDPOINTS.LEAVE_COUNTS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leave counts');
    }

    const result = await response.json();
    console.log('Leave counts raw response:', result);

    // Handle different response structures
    if (result.counts && Array.isArray(result.counts)) {
      return result;
    } else if (Array.isArray(result)) {
      // If API returns array directly, wrap it
      return { counts: result };
    } else if (result.data && Array.isArray(result.data)) {
      return { counts: result.data };
    } else {
      console.warn('Unexpected leave counts format:', result);
      // Return empty counts as fallback
      return { counts: [] };
    }
  } catch (error: any) {
    console.error('Error fetching leave counts:', error);
    // Return empty counts on error, don't throw
    return { counts: [] };
  }
};

// Attendance interfaces and API functions
export interface AttendanceUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number?: string;
}

export interface AttendanceRecord {
  id: number;
  user: number;
  user_detail: AttendanceUser;
  check_in_time: string | null;
  check_in_date: string | null;
  check_in_selfie: string | null;
  check_in_location: string | null;
  check_in_note: string | null;
  check_out_time: string | null;
  check_out_date: string | null;
  check_out_location: string | null;
  check_out_note: string | null;
  is_checked_in: boolean;
  is_checked_out: boolean;
  work_duration: number | null;
  work_duration_display: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckInData {
  selfie?: File | null;
  location?: string;
  note?: string;
}

export interface WorkCheckInData {
  note?: string;
}

export interface CheckOutData {
  location?: string;
  note?: string;
}

export interface AttendanceListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AttendanceRecord[];
}

export interface TodayAttendanceResponse {
  attendance: AttendanceRecord | null;
  has_checked_in: boolean;
  has_checked_out: boolean;
  message?: string;
}

export interface AttendanceApiResponse {
  message: string;
  attendance: AttendanceRecord;
}

// Attendance API functions
export const checkInAttendance = async (checkInData: CheckInData): Promise<AttendanceApiResponse> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const formData = new FormData();

  // Add optional fields if provided
  if (checkInData.selfie) {
    formData.append('selfie', checkInData.selfie);
  }
  if (checkInData.location) {
    formData.append('location', checkInData.location);
  }
  if (checkInData.note) {
    formData.append('note', checkInData.note);
  }

  const response = await fetch(API_ENDPOINTS.ATTENDANCE_CHECK_IN, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      // Don't set Content-Type for FormData, let browser set it with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to check in');
  }

  return response.json();
};

export const workCheckInAttendance = async (workCheckInData: WorkCheckInData): Promise<AttendanceApiResponse> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.ATTENDANCE_WORK_CHECK_IN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(workCheckInData),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to complete work check-in');
  }

  return response.json();
};

export const checkOutAttendance = async (checkOutData: CheckOutData): Promise<AttendanceApiResponse> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.ATTENDANCE_CHECK_OUT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(checkOutData),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to check out');
  }

  return response.json();
};

export const getAttendanceList = async (params?: {
  date?: string;
  start_date?: string;
  end_date?: string;
  q?: string;
  page?: number;
  page_size?: number;
}): Promise<AttendanceListResponse> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const url = `${API_ENDPOINTS.ATTENDANCE_LIST}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch attendance list');
  }

  const data = await response.json();
  console.log('Attendance list API returned data:', data);

  // Handle paginated response structure
  if (data.results && Array.isArray(data.results)) {
    return data;
  }

  // Handle direct array response (non-paginated)
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data
    };
  }

  // Handle nested attendance_records structure
  if (data.attendance_records && Array.isArray(data.attendance_records)) {
    return {
      count: data.count || data.attendance_records.length,
      next: data.next || null,
      previous: data.previous || null,
      results: data.attendance_records
    };
  }

  // Fallback
  console.warn('Unexpected attendance list response structure:', data);
  return {
    count: 0,
    next: null,
    previous: null,
    results: []
  };
};

export const getTodayAttendance = async (): Promise<TodayAttendanceResponse> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(API_ENDPOINTS.ATTENDANCE_TODAY, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch today\'s attendance');
  }

  return response.json();
};

export const getAttendanceDetail = async (id: number): Promise<{ attendance: AttendanceRecord }> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(`${API_ENDPOINTS.ATTENDANCE_DETAIL}${id}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || 'Failed to fetch attendance detail');
  }

  return response.json();
};
