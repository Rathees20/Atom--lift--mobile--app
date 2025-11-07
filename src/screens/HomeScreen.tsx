import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeScreenProps, MenuItem } from '../../types';
import CustomDrawer from '../components/CustomDrawer';
import AddComplaintScreen from './AddComplaintScreen';
import MaterialRequisitionScreen from './MaterialRequisitionScreen';
import LeaveListScreen from './LeaveListScreen';
import LeaveScreen from './LeaveScreen';
import LeaveDetailsScreen from './LeaveDetailsScreen';
import TravellingListScreen from './TravellingListScreen';
import TravellingScreen from './TravellingScreen';
import AddCustomerScreen from './AddCustomerScreen';
import CreateAMCScreen from './CreateAMCScreen';
import ViewAttendanceScreen from './ViewAttendanceScreen';
import RoutineMaintenanceScreen from './RoutineMaintenanceScreen';
import TodayServicesScreen from './TodayServicesScreen';
import ThisMonthDueScreen from './ThisMonthDueScreen';
import ThisMonthOverdueScreen from './ThisMonthOverdueScreen';
import LastMonthOverdueScreen from './LastMonthOverdueScreen';
import AMCListScreen from './AMCListScreen';
import CustomersScreen from './CustomersScreen';
import TicketsScreen from './TicketsScreen';
import ComplaintDetailsScreen from './ComplaintDetailsScreen';
import MarkAttendanceScreen from './MarkAttendanceScreen';
import TipsModal from '../components/TipsModal';
import { globalStyles } from '../styles/globalStyles';

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout, mobileNumber }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [showComplaintScreen, setShowComplaintScreen] = useState<boolean>(false);
  const [showMaterialRequisitionScreen, setShowMaterialRequisitionScreen] = useState<boolean>(false);
  const [showLeaveListScreen, setShowLeaveListScreen] = useState<boolean>(false);
  const [showLeaveScreen, setShowLeaveScreen] = useState<boolean>(false);
  const [showLeaveDetailsScreen, setShowLeaveDetailsScreen] = useState<boolean>(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [editingLeave, setEditingLeave] = useState<any>(null);
  const [showTravellingListScreen, setShowTravellingListScreen] = useState<boolean>(false);
  const [showTravellingScreen, setShowTravellingScreen] = useState<boolean>(false);
  const [showAddCustomerScreen, setShowAddCustomerScreen] = useState<boolean>(false);
  const [showCreateAMCScreen, setShowCreateAMCScreen] = useState<boolean>(false);
  const [showViewAttendanceScreen, setShowViewAttendanceScreen] = useState<boolean>(false);
  const [showRoutineMaintenanceScreen, setShowRoutineMaintenanceScreen] = useState<boolean>(false);
  const [showTodayServicesScreen, setShowTodayServicesScreen] = useState<boolean>(false);
  const [showThisMonthDueScreen, setShowThisMonthDueScreen] = useState<boolean>(false);
  const [showThisMonthOverdueScreen, setShowThisMonthOverdueScreen] = useState<boolean>(false);
  const [showLastMonthOverdueScreen, setShowLastMonthOverdueScreen] = useState<boolean>(false);
  const [showAMCListScreen, setShowAMCListScreen] = useState<boolean>(false);
  const [showCustomersScreen, setShowCustomersScreen] = useState<boolean>(false);
  const [showTicketsScreen, setShowTicketsScreen] = useState<boolean>(false);
  const [showComplaintDetailsScreen, setShowComplaintDetailsScreen] = useState<boolean>(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [showMarkAttendanceScreen, setShowMarkAttendanceScreen] = useState<boolean>(false);
  const [showTipsModal, setShowTipsModal] = useState<boolean>(false);
  const [showWorkCheckModal, setShowWorkCheckModal] = useState<boolean>(false);
  const [workCheckNote, setWorkCheckNote] = useState<string>('');

  // Storage key for navigation state
  const NAVIGATION_STATE_KEY = 'home_screen_navigation_state';

  // Save navigation state to storage
  const saveNavigationState = async () => {
    try {
      const navigationState = {
        showComplaintScreen,
        showMaterialRequisitionScreen,
        showLeaveListScreen,
        showLeaveScreen,
        showLeaveDetailsScreen,
        showTravellingListScreen,
        showTravellingScreen,
        showAddCustomerScreen,
        showCreateAMCScreen,
        showViewAttendanceScreen,
        showRoutineMaintenanceScreen,
        showTodayServicesScreen,
        showThisMonthDueScreen,
        showThisMonthOverdueScreen,
        showLastMonthOverdueScreen,
        showAMCListScreen,
        showCustomersScreen,
        showTicketsScreen,
        showComplaintDetailsScreen,
        showMarkAttendanceScreen,
      };
      await AsyncStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(navigationState));
    } catch (error) {
      console.error('Error saving navigation state:', error);
    }
  };

  // Restore navigation state from storage
  const restoreNavigationState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
      if (savedState) {
        const navigationState = JSON.parse(savedState);
        setShowComplaintScreen(navigationState.showComplaintScreen || false);
        setShowMaterialRequisitionScreen(navigationState.showMaterialRequisitionScreen || false);
        setShowLeaveListScreen(navigationState.showLeaveListScreen || false);
        setShowLeaveScreen(navigationState.showLeaveScreen || false);
        setShowLeaveDetailsScreen(navigationState.showLeaveDetailsScreen || false);
        setShowTravellingListScreen(navigationState.showTravellingListScreen || false);
        setShowTravellingScreen(navigationState.showTravellingScreen || false);
        setShowAddCustomerScreen(navigationState.showAddCustomerScreen || false);
        setShowCreateAMCScreen(navigationState.showCreateAMCScreen || false);
        setShowViewAttendanceScreen(navigationState.showViewAttendanceScreen || false);
        setShowRoutineMaintenanceScreen(navigationState.showRoutineMaintenanceScreen || false);
        setShowTodayServicesScreen(navigationState.showTodayServicesScreen || false);
        setShowThisMonthDueScreen(navigationState.showThisMonthDueScreen || false);
        setShowThisMonthOverdueScreen(navigationState.showThisMonthOverdueScreen || false);
        setShowLastMonthOverdueScreen(navigationState.showLastMonthOverdueScreen || false);
        setShowAMCListScreen(navigationState.showAMCListScreen || false);
        setShowCustomersScreen(navigationState.showCustomersScreen || false);
        setShowTicketsScreen(navigationState.showTicketsScreen || false);
        setShowComplaintDetailsScreen(navigationState.showComplaintDetailsScreen || false);
        setShowMarkAttendanceScreen(navigationState.showMarkAttendanceScreen || false);
      }
    } catch (error) {
      console.error('Error restoring navigation state:', error);
    }
  };

  // Restore state on mount
  useEffect(() => {
    restoreNavigationState();
  }, []);

  // Save state whenever navigation state changes
  useEffect(() => {
    saveNavigationState();
  }, [
    showComplaintScreen,
    showMaterialRequisitionScreen,
    showLeaveListScreen,
    showLeaveScreen,
    showLeaveDetailsScreen,
    showTravellingListScreen,
    showTravellingScreen,
    showAddCustomerScreen,
    showCreateAMCScreen,
    showViewAttendanceScreen,
    showRoutineMaintenanceScreen,
    showTodayServicesScreen,
    showThisMonthDueScreen,
    showThisMonthOverdueScreen,
    showLastMonthOverdueScreen,
    showAMCListScreen,
    showCustomersScreen,
    showTicketsScreen,
    showComplaintDetailsScreen,
    showMarkAttendanceScreen,
  ]);

  const menuItems: MenuItem[] = [
    {
      id: 1,
      title: 'Tickets',
      imageSource: require('../assets/ticket.png'),
      color: '#3498db',
    },
    {
      id: 2,
      title: 'Routine Services',
      imageSource: require('../assets/Routine service.png'),
      color: '#3498db',
    },
    {
      id: 3,
      title: 'Customers',
      imageSource: require('../assets/customer.png'),
      color: '#3498db',
    },
    {
      id: 4,
      title: 'AMC',
      imageSource: require('../assets/Amc list.png'),
      color: '#9b59b6',
    },
  ];

  const handleMenuPress = (item: MenuItem): void => {
    console.log(`Pressed: ${item.title}`);
    if (item.title === 'Tickets') {
      setShowTicketsScreen(true);
    } else if (item.title === 'Routine Services') {
      setShowRoutineMaintenanceScreen(true);
    } else if (item.title === 'AMC') {
      setShowAMCListScreen(true);
    } else if (item.title === 'Customers') {
      setShowCustomersScreen(true);
    }
    // Add navigation logic for other menu items here
  };

  const handleMarkAttendance = (): void => {
    console.log('Mark Attendance In pressed');
    setShowMarkAttendanceScreen(true);
  };

  const handleWorkCheckIn = (): void => {
    console.log('Work Check In pressed');
    setShowWorkCheckModal(true);
  };

  const toggleDrawer = (): void => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = (): void => {
    setIsDrawerOpen(false);
  };

  const handleNavigateToComplaint = (): void => {
    setShowComplaintScreen(true);
  };

  const handleBackFromComplaint = (): void => {
    setShowComplaintScreen(false);
  };

  const handleSaveComplaint = (): void => {
    console.log('Complaint saved successfully');
    setShowComplaintScreen(false);
  };

  const handleNavigateToMaterialRequisition = (): void => {
    setShowMaterialRequisitionScreen(true);
  };

  const handleBackFromMaterialRequisition = (): void => {
    setShowMaterialRequisitionScreen(false);
  };

  const handleSaveMaterialRequisition = (): void => {
    console.log('Material requisition saved successfully');
    setShowMaterialRequisitionScreen(false);
  };

  const handleNavigateToLeave = (): void => {
    setShowLeaveListScreen(true);
  };

  const handleBackFromLeaveList = (): void => {
    setShowLeaveListScreen(false);
  };

  const handleAddNewLeave = (): void => {
    console.log('handleAddNewLeave called - setting showLeaveScreen to true');
    setShowLeaveScreen(true);
  };

  const handleBackFromLeave = (): void => {
    console.log('handleBackFromLeave called - going back to leave list');
    setShowLeaveScreen(false);
    setEditingLeave(null);
    // Don't set showLeaveListScreen to false, keep it true to show the list
  };

  const handleApplyLeave = (): void => {
    console.log('Leave applied/updated successfully');
    setShowLeaveScreen(false);
    const wasEditing = !!editingLeave;
    setEditingLeave(null);
    
    // If editing, go back to details screen; otherwise, stay on list
    if (wasEditing && selectedLeave) {
      // Refresh the leave details by going back to list first, then to details
      setShowLeaveDetailsScreen(false);
      setSelectedLeave(null);
      // The list will show and user can navigate back to details
    }
    // Keep showing leave list screen so user can see their newly created/updated request
  };

  const handleShowLeaveDetails = (leave: any): void => {
    setSelectedLeave(leave);
    setShowLeaveDetailsScreen(true);
  };

  const handleBackFromLeaveDetails = (): void => {
    setShowLeaveDetailsScreen(false);
    setSelectedLeave(null);
  };

  const handleEditLeave = (leave: any): void => {
    setEditingLeave(leave);
    setShowLeaveDetailsScreen(false);
    setShowLeaveScreen(true);
  };

  const handleBackFromLeaveWhenEditing = (): void => {
    setShowLeaveScreen(false);
    // If editing, go back to details screen; otherwise, stay on list
    if (editingLeave) {
      // If we were editing from details, go back to details
      if (selectedLeave) {
        setShowLeaveDetailsScreen(true);
      }
    }
    setEditingLeave(null);
  };

  const handleDeleteLeave = (): void => {
    // Leave was deleted in details screen, just go back to list
    setShowLeaveDetailsScreen(false);
    setSelectedLeave(null);
  };

  const handleNavigateToTravelling = (): void => {
    setShowTravellingListScreen(true);
  };

  const handleBackFromTravellingList = (): void => {
    setShowTravellingListScreen(false);
  };

  const handleAddNewTravelling = (): void => {
    console.log('handleAddNewTravelling called - setting showTravellingScreen to true');
    setShowTravellingScreen(true);
  };

  const handleBackFromTravelling = (): void => {
    console.log('handleBackFromTravelling called - going back to travelling list');
    setShowTravellingScreen(false);
  };

  const handleApplyTravelling = (): void => {
    console.log('Travelling applied successfully');
    setShowTravellingScreen(false);
    setShowTravellingListScreen(false); // Go back to home after applying
  };

  const handleNavigateToAddCustomer = (): void => {
    setShowAddCustomerScreen(true);
  };

  const handleBackFromAddCustomer = (): void => {
    setShowAddCustomerScreen(false);
  };

  const handleSaveCustomer = (): void => {
    console.log('Customer saved successfully');
    setShowAddCustomerScreen(false);
  };

  const handleNavigateToCreateAMC = (): void => {
    setShowCreateAMCScreen(true);
  };

  const handleBackFromCreateAMC = (): void => {
    setShowCreateAMCScreen(false);
  };

  const handleSaveAMC = (): void => {
    console.log('AMC created successfully');
    setShowCreateAMCScreen(false);
  };

  const handleNavigateToViewAttendance = (): void => {
    setShowViewAttendanceScreen(true);
  };

  const handleBackFromViewAttendance = (): void => {
    setShowViewAttendanceScreen(false);
  };

  const handleBackFromRoutineMaintenance = (): void => {
    setShowRoutineMaintenanceScreen(false);
  };

  const handleNavigateToTodayServices = (): void => {
    setShowRoutineMaintenanceScreen(false);
    setShowTodayServicesScreen(true);
  };

  const handleNavigateToThisMonthDue = (): void => {
    setShowRoutineMaintenanceScreen(false);
    setShowThisMonthDueScreen(true);
  };

  const handleNavigateToThisMonthOverdue = (): void => {
    setShowRoutineMaintenanceScreen(false);
    setShowThisMonthOverdueScreen(true);
  };

  const handleNavigateToLastMonthOverdue = (): void => {
    setShowRoutineMaintenanceScreen(false);
    setShowLastMonthOverdueScreen(true);
  };

  const handleBackFromTodayServices = (): void => {
    setShowTodayServicesScreen(false);
    setShowRoutineMaintenanceScreen(true);
  };

  const handleBackFromThisMonthDue = (): void => {
    setShowThisMonthDueScreen(false);
    setShowRoutineMaintenanceScreen(true);
  };

  const handleBackFromThisMonthOverdue = (): void => {
    setShowThisMonthOverdueScreen(false);
    setShowRoutineMaintenanceScreen(true);
  };

  const handleBackFromLastMonthOverdue = (): void => {
    setShowLastMonthOverdueScreen(false);
    setShowRoutineMaintenanceScreen(true);
  };

  const handleBackFromAMCList = (): void => {
    setShowAMCListScreen(false);
  };



  const handleBackFromCustomers = (): void => {
    setShowCustomersScreen(false);
  };

  const handleBackFromTickets = (): void => {
    setShowTicketsScreen(false);
  };

  const handleShowComplaintDetails = (complaint: any): void => {
    setSelectedComplaint(complaint);
    setShowComplaintDetailsScreen(true);
  };

  const handleBackFromComplaintDetails = (): void => {
    setShowComplaintDetailsScreen(false);
    setSelectedComplaint(null);
  };

  const handleBackFromMarkAttendance = (): void => {
    setShowMarkAttendanceScreen(false);
  };

  const handleShowTips = (): void => {
    setShowTipsModal(true);
  };

  const handleCloseTips = (): void => {
    setShowTipsModal(false);
  };

  const handleCloseWorkCheckModal = (): void => {
    setShowWorkCheckModal(false);
    setWorkCheckNote('');
  };

  const handleSubmitWorkCheck = (): void => {
    console.log('Work Check submitted with note:', workCheckNote);
    // Add work check submission logic here
    setShowWorkCheckModal(false);
    setWorkCheckNote('');
  };

  // Show complaint screen if needed
  if (showComplaintScreen) {
    return (
      <AddComplaintScreen
        onBack={handleBackFromComplaint}
        onSave={handleSaveComplaint}
      />
    );
  }

  // Show material requisition screen if needed
  if (showMaterialRequisitionScreen) {
    return (
      <MaterialRequisitionScreen
        onBack={handleBackFromMaterialRequisition}
        onSave={handleSaveMaterialRequisition}
      />
    );
  }

  // Show leave details screen if needed (check this first)
  if (showLeaveDetailsScreen && selectedLeave) {
    return (
      <LeaveDetailsScreen
        leave={selectedLeave}
        onBack={handleBackFromLeaveDetails}
        onEdit={handleEditLeave}
        onDelete={handleDeleteLeave}
      />
    );
  }

  // Show leave form screen if needed (check this second)
  if (showLeaveScreen) {
    console.log('Rendering LeaveScreen');
    return (
      <LeaveScreen
        onBack={handleBackFromLeaveWhenEditing}
        onApplyLeave={handleApplyLeave}
        editingLeave={editingLeave}
      />
    );
  }

  // Show leave list screen if needed
  if (showLeaveListScreen) {
    return (
      <LeaveListScreen
        onBack={handleBackFromLeaveList}
        onAddNew={handleAddNewLeave}
        onShowDetails={handleShowLeaveDetails}
      />
    );
  }

  // Show travelling form screen if needed (check this first)
  if (showTravellingScreen) {
    console.log('Rendering TravellingScreen');
    return (
      <TravellingScreen
        onBack={handleBackFromTravelling}
        onApplyTravelling={handleApplyTravelling}
      />
    );
  }

  // Show travelling list screen if needed
  if (showTravellingListScreen) {
    return (
      <TravellingListScreen
        onBack={handleBackFromTravellingList}
        onAddNew={handleAddNewTravelling}
      />
    );
  }

  // Show add customer screen if needed
  if (showAddCustomerScreen) {
    return (
      <AddCustomerScreen
        onBack={handleBackFromAddCustomer}
        onSave={handleSaveCustomer}
      />
    );
  }

  // Show create AMC screen if needed
  if (showCreateAMCScreen) {
    return (
      <CreateAMCScreen
        onBack={handleBackFromCreateAMC}
        onSave={handleSaveAMC}
      />
    );
  }

  // Show view attendance screen if needed
  if (showViewAttendanceScreen) {
    return (
      <ViewAttendanceScreen
        onBack={handleBackFromViewAttendance}
      />
    );
  }

  // Show routine maintenance screen if needed
  if (showRoutineMaintenanceScreen) {
    return (
      <RoutineMaintenanceScreen
        onBack={handleBackFromRoutineMaintenance}
        onNavigateToTodayServices={handleNavigateToTodayServices}
        onNavigateToThisMonthDue={handleNavigateToThisMonthDue}
        onNavigateToThisMonthOverdue={handleNavigateToThisMonthOverdue}
        onNavigateToLastMonthOverdue={handleNavigateToLastMonthOverdue}
      />
    );
  }

  // Show AMC list screen if needed
  if (showAMCListScreen) {
    return (
      <AMCListScreen
        onBack={handleBackFromAMCList}
      />
    );
  }

  // Show customers screen if needed
  if (showCustomersScreen) {
    return (
      <CustomersScreen
        onBack={handleBackFromCustomers}
      />
    );
  }

  // Show complaint details screen if needed
  if (showComplaintDetailsScreen && selectedComplaint) {
    return (
      <ComplaintDetailsScreen
        complaint={selectedComplaint}
        onBack={handleBackFromComplaintDetails}
      />
    );
  }

  // Show tickets screen if needed
  if (showTicketsScreen) {
    return (
      <TicketsScreen
        onBack={handleBackFromTickets}
        onShowDetails={handleShowComplaintDetails}
      />
    );
  }

  // Show mark attendance screen if needed
  if (showMarkAttendanceScreen) {
    return (
      <MarkAttendanceScreen
        onBack={handleBackFromMarkAttendance}
      />
    );
  }

  // Show today services screen if needed
  if (showTodayServicesScreen) {
    return (
      <TodayServicesScreen
        onBack={handleBackFromTodayServices}
      />
    );
  }

  // Show this month due screen if needed
  if (showThisMonthDueScreen) {
    return (
      <ThisMonthDueScreen
        onBack={handleBackFromThisMonthDue}
      />
    );
  }

  // Show this month overdue screen if needed
  if (showThisMonthOverdueScreen) {
    return (
      <ThisMonthOverdueScreen
        onBack={handleBackFromThisMonthOverdue}
      />
    );
  }

  // Show last month overdue screen if needed
  if (showLastMonthOverdueScreen) {
    return (
      <LastMonthOverdueScreen
        onBack={handleBackFromLastMonthOverdue}
      />
    );
  }

  return (
    <SafeAreaView style={globalStyles.homeContainer}>
      {/* Header */}
      <View style={globalStyles.homeHeader}>
        <View style={globalStyles.homeHeaderBottom}>
          <TouchableOpacity onPress={toggleDrawer}>
          <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={globalStyles.homeContent} 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu Cards Grid */}
        <View style={globalStyles.homeMenuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={globalStyles.homeMenuCard}
              onPress={() => handleMenuPress(item)}
            >
              <View style={globalStyles.homeIconContainer}>
                {item.imageSource ? (
                  <Image 
                    source={item.imageSource as ImageSourcePropType} 
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                  />
                ) : item.icon ? (
                  <Ionicons name={item.icon} size={44} color={item.color} />
                ) : null}
              </View>
              <Text style={globalStyles.homeMenuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={globalStyles.homeActionButtons}>
          <TouchableOpacity style={globalStyles.homeActionButton} onPress={handleMarkAttendance}>
            <Text style={globalStyles.homeActionButtonText}>Mark Attendance In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={globalStyles.homeActionButton} onPress={handleWorkCheckIn}>
            <Text style={globalStyles.homeActionButtonText}>Work Check In</Text>
          </TouchableOpacity>
        </View>

        {/* Status Text */}
        <View style={globalStyles.homeStatusContainer}>
          <Text style={globalStyles.homeStatusText}>Last Check In: null || null ||</Text>
          <Ionicons name="location-outline" size={16} color="#3498db" />
        </View>
      </ScrollView>

      {/* Drawer Modal */}
      <Modal
        visible={isDrawerOpen}
        animationType="none"
        transparent={true}
        onRequestClose={closeDrawer}
        statusBarTranslucent={true}
      >
        <View style={globalStyles.homeModalOverlay}>
          <TouchableOpacity
            style={globalStyles.homeModalBackdrop}
            activeOpacity={1}
            onPress={closeDrawer}
          />
          <View style={globalStyles.homeDrawerContainer}>
            <CustomDrawer
              onClose={closeDrawer}
              onLogout={onLogout}
              onNavigateToComplaint={handleNavigateToComplaint}
              onNavigateToMaterialRequisition={handleNavigateToMaterialRequisition}
              onNavigateToLeave={handleNavigateToLeave}
              onNavigateToTravelling={handleNavigateToTravelling}
              onNavigateToAddCustomer={handleNavigateToAddCustomer}
              onNavigateToCreateAMC={handleNavigateToCreateAMC}
              onNavigateToViewAttendance={handleNavigateToViewAttendance}
              onShowTips={handleShowTips}
              mobileNumber={mobileNumber}
            />
          </View>
        </View>
      </Modal>

      {/* Tips Modal */}
      <TipsModal
        visible={showTipsModal}
        onClose={handleCloseTips}
      />

      {/* Work Check Modal */}
      <Modal
        visible={showWorkCheckModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseWorkCheckModal}
      >
        <View style={globalStyles.workCheckModalOverlay}>
          <View style={globalStyles.workCheckModalContainer}>
            <Text style={globalStyles.workCheckModalTitle}>Note</Text>
            
            <TextInput
              style={globalStyles.workCheckModalInput}
              placeholder="type note here..."
              placeholderTextColor="#999"
              value={workCheckNote}
              onChangeText={setWorkCheckNote}
              multiline={true}
              textAlignVertical="top"
            />
            
            <View style={globalStyles.workCheckModalButtons}>
              <TouchableOpacity
                style={globalStyles.workCheckCloseButton}
                onPress={handleCloseWorkCheckModal}
              >
                <Text style={globalStyles.workCheckCloseButtonText}>CLOSE</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={globalStyles.workCheckSubmitButton}
                onPress={handleSubmitWorkCheck}
              >
                <Text style={globalStyles.workCheckSubmitButtonText}>WORK CHECK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;
