/**
 * Validation utility functions for mobile numbers and emails
 */

/**
 * Validates mobile number (10 digits, Indian format)
 * @param mobileNumber - The mobile number to validate
 * @returns true if valid, false otherwise
 */
export const validateMobileNumber = (mobileNumber: string): boolean => {
  if (!mobileNumber || !mobileNumber.trim()) {
    return false;
  }
  
  // Remove all non-digit characters
  const cleaned = mobileNumber.replace(/\D/g, '');
  
  // Check for 10 digits and starts with 6-9 (Indian mobile number format)
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(cleaned);
};

/**
 * Validates email address
 * @param email - The email to validate
 * @returns true if valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  if (!email || !email.trim()) {
    return false;
  }
  
  // Standard email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Formats mobile number input (only allows digits, max 10)
 * @param value - The input value
 * @returns Formatted mobile number (digits only, max 10)
 */
export const formatMobileNumber = (value: string): string => {
  // Remove all non-digit characters and limit to 10 digits
  return value.replace(/\D/g, '').slice(0, 10);
};

/**
 * Gets validation error message for mobile number
 * @param mobileNumber - The mobile number to validate
 * @returns Error message or empty string if valid
 */
export const getMobileNumberError = (mobileNumber: string): string => {
  if (!mobileNumber || !mobileNumber.trim()) {
    return 'Please enter mobile number';
  }
  
  const cleaned = mobileNumber.replace(/\D/g, '');
  
  if (cleaned.length < 10) {
    return 'Mobile number must be 10 digits';
  }
  
  if (!/^[6-9]/.test(cleaned)) {
    return 'Mobile number must start with 6, 7, 8, or 9';
  }
  
  return '';
};

/**
 * Gets validation error message for email
 * @param email - The email to validate
 * @returns Error message or empty string if valid
 */
export const getEmailError = (email: string): string => {
  if (!email || !email.trim()) {
    return 'Please enter email address';
  }
  
  if (!validateEmail(email)) {
    return 'Please enter a valid email address';
  }
  
  return '';
};

/**
 * Formats time string to 24-hour format (HH:mm) matching the hamburger menu format
 * @param timeString - The time string from API (can be time only, datetime, or ISO string)
 * @returns Formatted time in HH:mm format or 'N/A' if invalid
 */
export const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString || !timeString.trim()) {
    return 'N/A';
  }

  try {
    let date: Date;
    
    // If it's just a time string (HH:mm:ss or HH:mm), try to parse it
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString.trim())) {
      // It's a time-only string, create a date with today's date
      const [hours, minutes] = timeString.trim().split(':');
      date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    } else {
      // Try to parse as a full date/time string
      date = new Date(timeString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return timeString; // Return original if can't parse
      }
    }
    
    // Format to 24-hour format (HH:mm) matching hamburger menu
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString; // Return original string on error
  }
};

