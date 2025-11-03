import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { getMaterialRequestList, createMaterialRequest, MaterialRequestItem, CreateMaterialRequestData, getUserData, getItemsList, Item } from '../utils/api';
import { useAlert } from '../contexts/AlertContext';

interface MaterialRequisitionScreenProps {
  onBack: () => void;
  onSave: () => void;
}

const MaterialRequisitionScreen: React.FC<MaterialRequisitionScreenProps> = ({ onBack, onSave }) => {
  const { showSuccessAlert, showErrorAlert } = useAlert();
  const [formData, setFormData] = useState({
    name: '',
    item: '',
    description: '',
    brand: '',
  });

  const [materialRequests, setMaterialRequests] = useState<MaterialRequestItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [showItemDropdown, setShowItemDropdown] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(true);
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  useEffect(() => {
    fetchMaterialRequests();
    fetchItems();
  }, []);

  const fetchMaterialRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const data = await getMaterialRequestList();
      setMaterialRequests(data);
    } catch (error: any) {
      console.error('Error fetching material requests:', error);
      showErrorAlert('Failed to load material requests. Please try again.');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchItems = async () => {
    setIsLoadingItems(true);
    try {
      const data = await getItemsList();
      setItems(data);
    } catch (error: any) {
      console.error('Error fetching items:', error);
      showErrorAlert('Failed to load items. Please try again.');
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (): Promise<void> => {
    // Basic validation
    if (!formData.name.trim()) {
      showErrorAlert('Please enter a name for the material request');
      return;
    }
    if (!formData.item.trim()) {
      showErrorAlert('Please enter the item name');
      return;
    }
    if (!formData.description.trim()) {
      showErrorAlert('Please enter a description');
      return;
    }

    setIsLoading(true);
    try {
      // Get current user data for added_by and requested_by fields
      const userData = await getUserData();
      const userName = userData?.username || userData?.email || 'Unknown User';

      const materialRequestData: CreateMaterialRequestData = {
        name: formData.name.trim(),
        item: selectedItemId!, // Use the selected item ID
        description: formData.description.trim(),
        brand: formData.brand.trim() || undefined,
        added_by: userName,
        requested_by: userName,
      };

      const result = await createMaterialRequest(materialRequestData);

      if (result.success) {
        showSuccessAlert(
          result.message || 'Material request created successfully',
          async () => {
            // Reset form
            setFormData({
              name: '',
              item: '',
              description: '',
              brand: '',
            });
            setSelectedItemId(null);
            setShowForm(false);
            // Refresh the list
            await fetchMaterialRequests();
            onSave(); // Close or update parent
          }
        );
      } else {
        showErrorAlert(result.message || 'Failed to create material request');
      }
    } catch (error: any) {
      console.error('Error creating material request:', error);
      showErrorAlert(error.message || 'Failed to create material request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.complaintContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />

      {/* Header */}
      <View style={globalStyles.complaintHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.complaintBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Material Requisitions</Text>
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          style={globalStyles.complaintSaveButton}
        >
          <Ionicons name={showForm ? "list" : "add"} size={20} color="#fff" />
          <Text style={globalStyles.complaintSaveText}>
            {showForm ? "List" : "Add"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={globalStyles.complaintContent} showsVerticalScrollIndicator={false}>
        {showForm ? (
          /* Form View */
          <View>
            {/* Name Field */}
            <View style={globalStyles.complaintFieldContainer}>
              <Text style={globalStyles.complaintFieldLabel}>Request Name:</Text>
              <TextInput
                style={globalStyles.complaintTextInput}
                placeholder="Enter request name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
            </View>

            {/* Item Field */}
            <View style={globalStyles.complaintFieldContainer}>
              <Text style={globalStyles.complaintFieldLabel}>Item:</Text>
              <TouchableOpacity
                style={globalStyles.complaintDropdownContainer}
                onPress={() => setShowItemDropdown(!showItemDropdown)}
              >
                <Text style={[globalStyles.complaintDropdownInput, !formData.item && { color: '#999' }]}>
                  {formData.item || 'Select Item'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {showItemDropdown && (
                <View style={{
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  maxHeight: 200,
                  marginTop: 5,
                }}>
                  {isLoadingItems ? (
                    <View style={{ padding: 10, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#3498db" />
                    </View>
                  ) : items.length > 0 ? (
                    items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={{
                          padding: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: '#f0f0f0',
                        }}
                        onPress={() => {
                          setFormData(prev => ({
                            ...prev,
                            item: item.name,
                          }));
                          setSelectedItemId(item.id);
                          setShowItemDropdown(false);
                        }}
                      >
                        <Text style={{ color: '#2c3e50', fontSize: 14 }}>
                          {item.item_number} - {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={{ padding: 10 }}>
                      <Text style={{ color: '#666', textAlign: 'center' }}>No items found</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Brand Field */}
            <View style={globalStyles.complaintFieldContainer}>
              <Text style={globalStyles.complaintFieldLabel}>Brand (Optional):</Text>
              <TextInput
                style={globalStyles.complaintTextInput}
                placeholder="Enter brand name"
                value={formData.brand}
                onChangeText={(value) => handleInputChange('brand', value)}
              />
            </View>

            {/* Description Field */}
            <View style={globalStyles.complaintFieldContainer}>
              <Text style={globalStyles.complaintFieldLabel}>Description:</Text>
              <TextInput
                style={globalStyles.complaintMessageInput}
                placeholder="Enter description here..."
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[{
                backgroundColor: '#3498db',
                paddingVertical: 15,
                paddingHorizontal: 30,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 20,
              }, isLoading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold'
                }}>Submit Request</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* List View */
          <View>
            {isLoadingRequests ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={{ marginTop: 10, color: '#666' }}>Loading material requests...</Text>
              </View>
            ) : materialRequests.length > 0 ? (
              materialRequests.map((request) => (
                <View key={request.id} style={{
                  backgroundColor: '#fff',
                  marginHorizontal: 10,
                  marginBottom: 10,
                  borderRadius: 8,
                  padding: 15,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 }}>
                        {request.name}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 2 }}>
                        <Text style={{ fontWeight: '600' }}>Item:</Text> {request.item.item_number} - {request.item.name}
                      </Text>
                      {request.brand && (
                        <Text style={{ fontSize: 14, color: '#34495e', marginBottom: 2 }}>
                          <Text style={{ fontWeight: '600' }}>Brand:</Text> {request.brand}
                        </Text>
                      )}
                      <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 4 }}>
                        Requested by: {request.requested_by} on {new Date(request.date).toLocaleDateString()}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#34495e', lineHeight: 20 }}>
                        {request.description}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#666', fontSize: 16 }}>No material requests found</Text>
                <Text style={{ color: '#999', fontSize: 14, marginTop: 5 }}>
                  Tap "Add" to create your first material request
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MaterialRequisitionScreen;
