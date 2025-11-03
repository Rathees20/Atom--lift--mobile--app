// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  AddComplaint: undefined;
};

// Menu item types
export interface MenuItem {
  id: number;
  title: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  color: string;
}

// Login form types
export interface LoginFormData {
  email: string;
  password: string;
}

// Mobile OTP form types
export interface MobileOTPFormData {
  mobileNumber: string;
  otp: string;
}

// Home screen props
export interface HomeScreenProps {
  onLogout: () => void;
  mobileNumber?: string;
}

// Login screen props
export interface LoginScreenProps {
  onLogin: (user: any, token: string) => void;
}

// Login method types
export type LoginMethod = 'phone' | 'email';

// Status types
export interface StatusInfo {
  time: string;
  batteryLevel: string;
  lastCheckIn: string;
}

// Add Customer form types
export interface AddCustomerFormData {
  customerSiteName: string;
  mobileNumber: string;
  email: string;
  customerSiteAddress: string;
  siteId: string;
  siteAddress: string;
  contactPersonName: string;
  city: string;
  jobNo?: string;
}

// Create AMC form types
export interface CreateAMCFormData {
  selectedCustomer: string;
  startDate: string;
  endDate: string;
  amcType: string;
  numberOfServices: string;
  paymentAmount: string;
  paymentTerms: string;
  notes: string;
}

// Attendance types
export interface AttendanceData {
  present: number;
  absent: number;
  weekOff: number;
  publicHoliday: number;
  halfDay: number;
  onLeave: number;
  presentOvertime: number;
}

export interface AttendanceStatus {
  label: string;
  count: number;
  color: string;
}

// Tips types
export interface Tip {
  id: number;
  title: string;
  content: string;
}

// Custom Drawer props
export interface CustomDrawerProps {
  onClose: () => void;
  onLogout: () => void;
  onNavigateToComplaint: () => void;
  onNavigateToMaterialRequisition: () => void;
  onNavigateToLeave: () => void;
  onNavigateToTravelling: () => void;
  onNavigateToAddCustomer: () => void;
  onNavigateToCreateAMC: () => void;
  onNavigateToViewAttendance: () => void;
  onShowTips: () => void;
  mobileNumber?: string;
}
