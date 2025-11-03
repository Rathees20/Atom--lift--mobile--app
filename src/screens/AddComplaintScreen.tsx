import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import {
  getComplaintCustomers,
  getComplaintTypes,
  getComplaintPriorities,
  getComplaintExecutives,
  createComplaint,
  Customer,
  ComplaintType,
  Priority,
  Executive,
} from '../utils/api';
import { formatMobileNumber, getMobileNumberError } from '../utils/validation';
import { useAlert } from '../contexts/AlertContext';

interface AddComplaintScreenProps {
  onBack: () => void;
  onSave: () => void;
}

const AddComplaintScreen: React.FC<AddComplaintScreenProps> = ({ onBack, onSave }) => {
  const { showSuccessAlert, showErrorAlert } = useAlert();
  const [formData, setFormData] = useState({
    complaint_type: '',
    customer: '',
    assign_to: '',
    priority: '',
    contact_person_name: '',
    contact_person_mobile: '',
    block_wing: '',
    subject: '',
    message: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [complaintTypes, setComplaintTypes] = useState<ComplaintType[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dropdown states
  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);
  const [dropdownData, setDropdownData] = useState<any[]>([]);
  const [dropdownField, setDropdownField] = useState<string>('');

  // API service functions
  const fetchCustomers = async (): Promise<void> => {
    try {
      const data = await getComplaintCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showErrorAlert('Failed to load customers');
    }
  };

  const fetchComplaintTypes = async (): Promise<void> => {
    try {
      const data = await getComplaintTypes();
      setComplaintTypes(data);
    } catch (error) {
      console.error('Error fetching complaint types:', error);
      showErrorAlert('Failed to load complaint types');
    }
  };

  const fetchPriorities = async (): Promise<void> => {
    try {
      const data = await getComplaintPriorities();
      setPriorities(data);
    } catch (error) {
      console.error('Error fetching priorities:', error);
      showErrorAlert('Failed to load priorities');
    }
  };

  const fetchExecutives = async (): Promise<void> => {
    try {
      const data = await getComplaintExecutives();
      setExecutives(data);
    } catch (error) {
      console.error('Error fetching executives:', error);
      showErrorAlert('Failed to load executives');
    }
  };

  const submitComplaint = async (complaintData: any): Promise<boolean> => {
    try {
      const result = await createComplaint(complaintData);
      return result.success;
    } catch (error) {
      console.error('Error creating complaint:', error);
      showErrorAlert('Failed to create complaint');
      return false;
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCustomers(),
        fetchComplaintTypes(),
        fetchPriorities(),
        fetchExecutives(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleInputChange = (field: string, value: string): void => {
    // Format mobile number input
    if (field === 'contact_person_mobile') {
      value = formatMobileNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Dropdown functions
  const openDropdown = (field: string, data: any[], displayField: string): void => {
    setDropdownField(field);
    setDropdownData(data);
    setDropdownVisible(field);
  };

  const closeDropdown = (): void => {
    setDropdownVisible(null);
    setDropdownData([]);
    setDropdownField('');
  };

  const selectDropdownItem = (item: any): void => {
    const value = item.id.toString();
    const displayValue = item.name || item.site_name || item.full_name || item.site_id || item.reference_id;

    setFormData(prev => ({
      ...prev,
      [dropdownField]: value
    }));

    // Auto-populate contact person and mobile for customer selection
    if (dropdownField === 'customer' && item.contact_person_name) {
      setFormData(prev => ({
        ...prev,
        contact_person_name: item.contact_person_name,
        contact_person_mobile: item.phone || ''
      }));
    }

    closeDropdown();
  };

  const getDisplayValue = (field: string, value: string): string => {
    if (!value) return '';

    switch (field) {
      case 'complaint_type':
        const type = complaintTypes.find(t => t.id.toString() === value);
        return type ? type.name : '';
      case 'customer':
        const customer = customers.find(c => c.id.toString() === value);
        return customer ? customer.site_name : '';
      case 'assign_to':
        const executive = executives.find(e => e.id.toString() === value);
        return executive ? executive.full_name : '';
      case 'priority':
        const priority = priorities.find(p => p.id.toString() === value);
        return priority ? priority.name : '';
      default:
        return value;
    }
  };

  const handleSave = async (): Promise<void> => {
    // Validation
    if (!formData.complaint_type || !formData.customer || !formData.subject) {
      showErrorAlert('Please fill in all required fields');
      return;
    }

    // Validate contact person mobile if provided
    if (formData.contact_person_mobile && formData.contact_person_mobile.trim()) {
      const mobileError = getMobileNumberError(formData.contact_person_mobile);
      if (mobileError) {
        showErrorAlert(mobileError);
        return;
      }
    }

    setSubmitting(true);
    try {
      const success = await submitComplaint(formData);
      if (success) {
        showSuccessAlert(
          'Complaint created successfully',
          () => {
            onSave(); // Close the form after success
          }
        );
      } else {
        showErrorAlert('Failed to create complaint. Please try again.');
      }
    } catch (error: any) {
      showErrorAlert(error.message || 'Failed to create complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.complaintContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#3498db" />
        <View style={globalStyles.complaintHeader}>
          <TouchableOpacity onPress={onBack} style={globalStyles.complaintBackButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.complaintContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />

      {/* Header */}
      <View style={globalStyles.complaintHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.complaintBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          style={globalStyles.complaintSaveButton}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark" size={20} color="#fff" />
          )}
          <Text style={globalStyles.complaintSaveText}>
            {submitting ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form Content */}
      <ScrollView style={globalStyles.complaintContent} showsVerticalScrollIndicator={false}>
        {/* Type Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Type:</Text>
          <TouchableOpacity
            style={globalStyles.complaintDropdownContainer}
            onPress={() => openDropdown('complaint_type', complaintTypes, 'name')}
          >
            <Text style={[
              globalStyles.complaintDropdownInput,
              { color: getDisplayValue('complaint_type', formData.complaint_type) ? '#000' : '#999' }
            ]}>
              {getDisplayValue('complaint_type', formData.complaint_type) || 'Select Type'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Customer Site Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Customer Site:</Text>
          <TouchableOpacity
            style={globalStyles.complaintDropdownContainer}
            onPress={() => openDropdown('customer', customers, 'site_name')}
          >
            <Text style={[
              globalStyles.complaintDropdownInput,
              { color: getDisplayValue('customer', formData.customer) ? '#000' : '#999' }
            ]}>
              {getDisplayValue('customer', formData.customer) || 'Select Customer Site'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Contact Person Name Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Contact Person Name</Text>
          <TextInput
            style={globalStyles.complaintTextInput}
            placeholder="Enter Contact Person Name"
            value={formData.contact_person_name}
            onChangeText={(value) => handleInputChange('contact_person_name', value)}
          />
        </View>

        {/* Contact Person Mobile Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Contact Person Mobile No.</Text>
          <TextInput
            style={globalStyles.complaintTextInput}
            placeholder="Enter Mobile Number"
            value={formData.contact_person_mobile}
            onChangeText={(value) => handleInputChange('contact_person_mobile', value)}
            keyboardType="phone-pad"
          />
        </View>

        {/* Block/Wing Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Block/Wing</Text>
          <TextInput
            style={globalStyles.complaintTextInput}
            placeholder="Enter Block/Wing"
            value={formData.block_wing}
            onChangeText={(value) => handleInputChange('block_wing', value)}
          />
        </View>

        {/* Assign Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Assign:</Text>
          <TouchableOpacity
            style={globalStyles.complaintDropdownContainer}
            onPress={() => openDropdown('assign_to', executives, 'full_name')}
          >
            <Text style={[
              globalStyles.complaintDropdownInput,
              { color: getDisplayValue('assign_to', formData.assign_to) ? '#000' : '#999' }
            ]}>
              {getDisplayValue('assign_to', formData.assign_to) || 'Select Assignee'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Priority Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Priority:</Text>
          <TouchableOpacity
            style={globalStyles.complaintDropdownContainer}
            onPress={() => openDropdown('priority', priorities, 'name')}
          >
            <Text style={[
              globalStyles.complaintDropdownInput,
              { color: getDisplayValue('priority', formData.priority) ? '#000' : '#999' }
            ]}>
              {getDisplayValue('priority', formData.priority) || 'Select Priority'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Subject Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Subject</Text>
          <TextInput
            style={globalStyles.complaintTextInput}
            placeholder="Enter Subject"
            value={formData.subject}
            onChangeText={(value) => handleInputChange('subject', value)}
          />
        </View>

        {/* Message Field */}
        <View style={globalStyles.complaintFieldContainer}>
          <Text style={globalStyles.complaintFieldLabel}>Message</Text>
          <TextInput
            style={globalStyles.complaintMessageInput}
            placeholder="Enter your message here..."
            value={formData.message}
            onChangeText={(value) => handleInputChange('message', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownVisible !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={closeDropdown}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              width: '80%',
              maxHeight: '60%',
              padding: 10,
            }}
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when tapping inside modal
          >
            <FlatList
              data={dropdownData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                  }}
                  onPress={() => selectDropdownItem(item)}
                >
                  <Text style={{ fontSize: 16, color: '#333' }}>
                    {item.name || item.site_name || item.full_name || item.site_id || item.reference_id}
                  </Text>
                  {item.contact_person_name && (
                    <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                      Contact: {item.contact_person_name}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#666' }}>No items available</Text>
                </View>
              }
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default AddComplaintScreen;
