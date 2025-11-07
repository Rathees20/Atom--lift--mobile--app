import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  PanResponder,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { globalStyles } from '../styles/globalStyles';
import { getAssignedComplaints, ComplaintItem, updateComplaintStatus } from '../utils/api';

interface TicketsScreenProps {
  onBack: () => void;
  onShowDetails?: (complaint: ComplaintItem) => void;
}

interface TicketItem {
  id: number;
  title: string;
  dateTime: string;
  status: string;
  ticketId: string;
  amcType: string;
  siteAddress: string;
  mobileNumber: string;
  coordinates?: string;
}

// Signature Component
interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
  signature?: string;
  placeholder?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange, signature, placeholder = "Sign here" }) => {
  const [paths, setPaths] = useState<Array<{ path: string; color: string; width: number }>>([]);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const signatureRef = useRef<View>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 300, height: 100 });

  const getCoordinates = (evt: any, gestureState: any) => {
    // PanResponder provides coordinates relative to the responder view
    // Use locationX/locationY from nativeEvent which are relative to the view
    if (evt && evt.nativeEvent) {
      const locationX = evt.nativeEvent.locationX ?? 0;
      const locationY = evt.nativeEvent.locationY ?? 0;
      const x = Math.max(0, Math.min(locationX, containerDimensions.width));
      const y = Math.max(0, Math.min(locationY, containerDimensions.height));
      return { x, y };
    }
    // Fallback to gestureState
    if (gestureState) {
      const x = Math.max(0, Math.min((gestureState.x || gestureState.moveX || 0), containerDimensions.width));
      const y = Math.max(0, Math.min((gestureState.y || gestureState.moveY || 0), containerDimensions.height));
      return { x, y };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (evt: any, gestureState: any) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(evt, gestureState);
    console.log('Start drawing at:', x, y, 'Container:', containerDimensions);
    setCurrentPath([{ x, y }]);
  };

  const continueDrawing = (evt: any, gestureState: any) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(evt, gestureState);
    setCurrentPath(prev => {
      // Only add point if it's different from the last one (avoid duplicates)
      const lastPoint = prev[prev.length - 1];
      if (!lastPoint || Math.abs(lastPoint.x - x) > 0.5 || Math.abs(lastPoint.y - y) > 0.5) {
        return [...prev, { x, y }];
      }
      return prev;
    });
  };

  const finishDrawing = () => {
    if (isDrawing && currentPath.length > 0) {
      // Convert points to SVG path
      let pathString = `M${currentPath[0].x},${currentPath[0].y}`;
      for (let i = 1; i < currentPath.length; i++) {
        pathString += ` L${currentPath[i].x},${currentPath[i].y}`;
      }
      
      const newPaths = [...paths, { path: pathString, color: '#000', width: 2 }];
      setPaths(newPaths);
      setCurrentPath([]);

      // Convert paths to SVG string
      const svgPaths = newPaths.map(p => `<path d="${p.path}" stroke="${p.color}" stroke-width="${p.width}" fill="none"/>`).join('');
      const svg = `<svg width="${containerDimensions.width}" height="${containerDimensions.height}" xmlns="http://www.w3.org/2000/svg">${svgPaths}</svg>`;
      console.log('Signature captured:', svg);
      onSignatureChange(svg);
    }
    setIsDrawing(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: startDrawing,
      onPanResponderMove: continueDrawing,
      onPanResponderRelease: finishDrawing,
      onPanResponderTerminate: finishDrawing,
    })
  ).current;

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setContainerDimensions({ width, height });
      console.log('Container dimensions:', width, height);
    }
  };

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath([]);
    setIsDrawing(false);
    onSignatureChange('');
  };

  // Parse existing signature if provided
  useEffect(() => {
    if (signature && signature.trim() && paths.length === 0) {
      try {
        // Try to parse SVG string and extract paths
        const pathMatches = signature.match(/<path d="([^"]+)"[^>]*>/g);
        if (pathMatches) {
          const parsedPaths = pathMatches.map(match => {
            const pathMatch = match.match(/d="([^"]+)"/);
            return {
              path: pathMatch ? pathMatch[1] : '',
              color: '#000',
              width: 2
            };
          }).filter(p => p.path);
          if (parsedPaths.length > 0) {
            setPaths(parsedPaths);
          }
        }
      } catch (e) {
        console.log('Could not parse signature:', e);
      }
    }
  }, [signature]);

  const currentPathString = currentPath.length > 0
    ? `M${currentPath[0].x},${currentPath[0].y}${currentPath.slice(1).map(p => ` L${p.x},${p.y}`).join('')}`
    : '';

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>
        {placeholder}
      </Text>
      <View
        ref={signatureRef}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 5,
          height: containerDimensions.height,
          width: '100%',
          backgroundColor: '#fff',
          overflow: 'hidden',
          position: 'relative',
        }}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        <Svg height={containerDimensions.height} width="100%" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          {/* Render completed paths */}
          {paths.map((pathData, index) => (
            <Path
              key={`path-${index}`}
              d={pathData.path}
              stroke={pathData.color}
              strokeWidth={pathData.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* Render current path being drawn */}
          {isDrawing && currentPathString && (
            <Path
              d={currentPathString}
              stroke="#000"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
        {paths.length === 0 && !isDrawing && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ color: '#999', fontSize: 14 }}>{placeholder}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={{
          marginTop: 5,
          alignSelf: 'flex-end',
          padding: 5,
        }}
        onPress={clearSignature}
      >
        <Text style={{ color: '#e74c3c', fontSize: 12 }}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
};

const TicketsScreen: React.FC<TicketsScreenProps> = ({ onBack, onShowDetails }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [expandedTickets, setExpandedTickets] = useState<Set<number>>(new Set());
  const [imageError, setImageError] = useState<boolean>(false);
  const [ticketItems, setTicketItems] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<ComplaintItem | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [technicianRemark, setTechnicianRemark] = useState<string>('');
  const [solution, setSolution] = useState<string>('');
  const [technicianSignature, setTechnicianSignature] = useState<string>('');
  const [customerSignature, setCustomerSignature] = useState<string>('');
  
  // Filter states
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedFor, setSelectedFor] = useState<string>('');
  const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);
  const [showForDropdown, setShowForDropdown] = useState<boolean>(false);

  // Filter options
  const statusOptions = ['Open', 'On Hold', 'In Progress', 'Reopened', 'Closed', 'Shutdown'];
  const forOptions = ['All', 'Today', 'Last 3 days', 'Last 7 days', 'Last 15 days', 'Last 30 days', 'Last 45 days'];

  // Try to load the filter image
  const filterImageSource = (() => {
    try {
      return require('../assets/filter 1.png');
    } catch (error) {
      console.log('Could not load filter image:', error);
      return null;
    }
  })();

  // Fetch assigned complaints on component mount
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError(null);
        const complaints = await getAssignedComplaints();
        setTicketItems(complaints);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError(err instanceof Error ? err.message : 'Failed to load complaints');
        Alert.alert('Error', 'Failed to load assigned complaints. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleItemPress = (item: TicketItem): void => {
    console.log(`Pressed Ticket: ${item.title}`);
    // Add navigation logic here for ticket details
  };

  const handleExpandPress = (ticketId: number): void => {
    const newExpanded = new Set(expandedTickets);
    if (newExpanded.has(ticketId)) {
      newExpanded.delete(ticketId);
    } else {
      newExpanded.add(ticketId);
    }
    setExpandedTickets(newExpanded);
  };

  const handleSearchPress = (): void => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchQuery('');
    }
  };

  const handleGoToDetails = (item: ComplaintItem): void => {
    if (onShowDetails) {
      onShowDetails(item);
    } else {
      console.log(`Go to details for ticket: ${item.reference}`);
    }
  };

  const handleUpdateStatus = (item: ComplaintItem): void => {
    setSelectedTicket(item);
    setSelectedStatus(item.status);
    setTechnicianRemark(item.technician_remark || '');
    setSolution(item.solution || '');
    setTechnicianSignature(item.technician_signature || '');
    setCustomerSignature(item.customer_signature || '');
    setShowStatusModal(true);
  };

  const handleSaveStatusUpdate = async (): Promise<void> => {
    if (!selectedTicket) return;

    try {
      setUpdatingStatus(true);
      const updateData: { status?: string; technician_remark?: string; solution?: string; technician_signature?: string; customer_signature?: string } = {};

      if (selectedStatus !== selectedTicket.status) {
        updateData.status = selectedStatus;
      }
      if (technicianRemark !== (selectedTicket.technician_remark || '')) {
        updateData.technician_remark = technicianRemark;
      }
      if (solution !== (selectedTicket.solution || '')) {
        updateData.solution = solution;
      }
      if (technicianSignature !== (selectedTicket.technician_signature || '')) {
        updateData.technician_signature = technicianSignature;
      }
      if (customerSignature !== (selectedTicket.customer_signature || '')) {
        updateData.customer_signature = customerSignature;
      }

      if (Object.keys(updateData).length === 0) {
        Alert.alert('Info', 'No changes to save');
        return;
      }

      await updateComplaintStatus(selectedTicket.reference, updateData);

      // Update local state
      setTicketItems(prevItems =>
        prevItems.map(item =>
          item.id === selectedTicket.id
            ? {
                ...item,
                status: selectedStatus,
                technician_remark: technicianRemark,
                solution: solution,
                technician_signature: technicianSignature,
                customer_signature: customerSignature
              }
            : item
        )
      );

      setShowStatusModal(false);
      setSelectedTicket(null);
      setSelectedStatus('');
      setTechnicianRemark('');
      setSolution('');
      setTechnicianSignature('');
      setCustomerSignature('');
      Alert.alert('Success', 'Status updated successfully');
    } catch (err) {
      console.error('Error updating status:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Calculate date range for filtering
  const getDateRangeFilter = (dateRange: string): ((date: string) => boolean) => {
    if (!dateRange || dateRange === 'All') {
      return () => true;
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let daysAgo = 0;
    switch (dateRange) {
      case 'Today':
        daysAgo = 0;
        break;
      case 'Last 3 days':
        daysAgo = 3;
        break;
      case 'Last 7 days':
        daysAgo = 7;
        break;
      case 'Last 15 days':
        daysAgo = 15;
        break;
      case 'Last 30 days':
        daysAgo = 30;
        break;
      case 'Last 45 days':
        daysAgo = 45;
        break;
      default:
        return () => true;
    }
    
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    
    return (dateString: string) => {
      try {
        const itemDate = new Date(dateString);
        return itemDate >= cutoffDate;
      } catch {
        return true;
      }
    };
  };

  const filteredTickets = ticketItems.filter((item) => {
    // Search query filter
    const searchText = `${item.title} ${item.ticketId} ${item.status} ${item.amcType}`.toLowerCase();
    const matchesSearch = searchText.includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = !filterStatus || item.status.toLowerCase() === filterStatus.toLowerCase();
    
    // For filter (date range)
    const dateRangeFilter = getDateRangeFilter(selectedFor);
    const matchesFor = dateRangeFilter(item.dateTime);
    
    return matchesSearch && matchesStatus && matchesFor;
  });

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open': return '#e67e22'; // Orange
      case 'in progress': return '#3498db'; // Blue
      case 'closed': return '#27ae60'; // Green
      default: return '#7f8c8d'; // Gray
    }
  };

  const handlePhonePress = (phoneNumber: string): void => {
    // Remove any non-numeric characters except +
    const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
    if (cleanedNumber) {
      const phoneUrl = `tel:${cleanedNumber}`;
      Linking.openURL(phoneUrl).catch((err) => {
        console.error('Error opening phone dialer:', err);
        Alert.alert('Error', 'Unable to open phone dialer. Please check if your device supports phone calls.');
      });
    } else {
      Alert.alert('Error', 'Invalid phone number');
    }
  };

  return (
    <SafeAreaView style={globalStyles.ticketsContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />
      
      {/* Header */}
      <View style={globalStyles.ticketsHeader}>
        <TouchableOpacity onPress={onBack} style={globalStyles.ticketsBackButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={globalStyles.ticketsTitle}>Tickets</Text>
        <View style={globalStyles.ticketsHeaderActions}>
          <TouchableOpacity style={globalStyles.ticketsSearchButton} onPress={handleSearchPress}>
            <Ionicons name={showSearchInput ? "close" : "search"} size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={globalStyles.ticketsFilterButton}
            onPress={() => setShowFilterModal(true)}
          >
            {filterImageSource && !imageError ? (
              <Image 
                source={filterImageSource} 
                style={{ 
                  width: 24, 
                  height: 24, 
                  tintColor: '#fff',
                  opacity: 1
                }}
                resizeMode="contain"
                onError={() => {
                  console.log('Failed to load filter image');
                  setImageError(true);
                }}
                onLoad={() => console.log('Filter image loaded successfully')}
              />
            ) : (
              <Ionicons name="filter" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      {showSearchInput && (
        <View style={globalStyles.ticketsSearchContainer}>
          <TextInput
            style={globalStyles.ticketsSearchInput}
            placeholder="Search tickets..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={{ marginTop: 10, color: '#666' }}>Loading complaints...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
          <Text style={{ marginTop: 10, color: '#e74c3c', textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 20,
              backgroundColor: '#3498db',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 5,
            }}
            onPress={() => {
              setLoading(true);
              setError(null);
              getAssignedComplaints()
                .then(complaints => setTicketItems(complaints))
                .catch(err => {
                  setError(err instanceof Error ? err.message : 'Failed to load complaints');
                })
                .finally(() => setLoading(false));
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={globalStyles.ticketsContent} showsVerticalScrollIndicator={false}>
          {filteredTickets.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
              <Ionicons name="document-outline" size={48} color="#ccc" />
              <Text style={{ marginTop: 10, color: '#666', textAlign: 'center' }}>
                {searchQuery ? 'No complaints match your search.' : 'No assigned complaints found.'}
              </Text>
            </View>
          ) : (
            filteredTickets.map((item) => (
              <View key={item.id} style={globalStyles.ticketsItem}>
                {/* Main Ticket Row */}
                <TouchableOpacity
                  style={globalStyles.ticketsMainRow}
                  onPress={() => handleExpandPress(item.id)}
                >
                  <View style={globalStyles.ticketsMainRowLeft}>
                    <View style={globalStyles.ticketsNotificationIcon}>
                      <Image 
                        source={require('../assets/notification.png')} 
                        style={{ width: 20, height: 20 }}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={globalStyles.ticketsMainRowContent}>
                      <Text style={globalStyles.ticketsTitleText}>{item.title}</Text>
                      <Text style={[globalStyles.ticketsDateTimeText, { color: getStatusColor(item.status) }]}>
                        {item.dateTime} ({item.status})
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={expandedTickets.has(item.id) ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#2c3e50"
                  />
                </TouchableOpacity>

                                {/* Expanded Details */}
                {expandedTickets.has(item.id) && (
                  <View style={{
                    backgroundColor: '#ffffff',
                    marginHorizontal: 12,
                    marginBottom: 12,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#e8e8e8',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                    {/* Status & Priority Badge - Compact */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: getStatusColor(item.status),
                          marginRight: 8,
                        }} />
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#2c3e50' }}>{item.status}</Text>
                      </View>
                      {item.priority ? (
                        <View style={{
                          backgroundColor: item.priority.toLowerCase() === 'high' ? '#e74c3c' : item.priority.toLowerCase() === 'medium' ? '#f39c12' : '#3498db',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}>
                          <Text style={{ fontSize: 10, color: '#fff', fontWeight: '600' }}>
                            {item.priority.toUpperCase()}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Compact Info Grid */}
                    <View style={{ marginBottom: 16 }}>
                      {item.reference ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="pricetag" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>{item.reference}</Text>
                        </View>
                      ) : null}
                      {item.dateTime ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="time" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>{item.dateTime}</Text>
                        </View>
                      ) : null}
                      {item.contact_person ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="person" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>{item.contact_person}</Text>
                        </View>
                      ) : null}
                      {item.mobileNumber ? (
                        <TouchableOpacity 
                          style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}
                          onPress={() => handlePhonePress(item.mobileNumber)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="call" size={14} color="#3498db" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#3498db', flex: 1, fontWeight: '500', textDecorationLine: 'underline' }}>
                            {item.mobileNumber}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      {item.amcType ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                          <Ionicons name="layers" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1 }}>{item.amcType}</Text>
                        </View>
                      ) : null}
                      {item.siteAddress ? (
                        <View style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
                          <Ionicons name="location" size={14} color="#7f8c8d" style={{ marginRight: 8, width: 18, marginTop: 2 }} />
                          <Text style={{ fontSize: 13, color: '#34495e', flex: 1, lineHeight: 18 }}>{item.siteAddress}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Subject & Message - Compact */}
                    {(item.subject || item.message) ? (
                      <View style={{ marginBottom: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                        {item.subject ? (
                          <View style={{ marginBottom: 8 }}>
                            <Text style={{ fontSize: 11, color: '#7f8c8d', marginBottom: 4 }}>Subject</Text>
                            <Text style={{ fontSize: 14, color: '#2c3e50', fontWeight: '600' }}>{item.subject}</Text>
                          </View>
                        ) : null}
                        {item.message ? (
                          <View>
                            <Text style={{ fontSize: 11, color: '#7f8c8d', marginBottom: 4 }}>Message</Text>
                            <Text style={{ fontSize: 13, color: '#34495e', lineHeight: 18 }} numberOfLines={3}>
                              {item.message}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}

                    {/* Resolution - Compact (only if exists) */}
                    {(item.technician_remark || item.solution) ? (
                      <View style={{ marginBottom: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                        {item.solution ? (
                          <View style={{ marginBottom: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                              <Ionicons name="checkmark-circle" size={14} color="#27ae60" style={{ marginRight: 6 }} />
                              <Text style={{ fontSize: 11, color: '#7f8c8d' }}>Solution</Text>
                            </View>
                            <Text style={{ fontSize: 13, color: '#27ae60', fontWeight: '500', lineHeight: 18 }} numberOfLines={2}>
                              {item.solution}
                            </Text>
                          </View>
                        ) : null}
                        {item.technician_remark ? (
                          <View>
                            <Text style={{ fontSize: 11, color: '#7f8c8d', marginBottom: 4 }}>Remark</Text>
                            <Text style={{ fontSize: 13, color: '#34495e', lineHeight: 18 }} numberOfLines={2}>
                              {item.technician_remark}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}

                    {/* Action Buttons - Compact */}
                    <View style={{ flexDirection: 'row', gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: '#3498db',
                          borderRadius: 8,
                          paddingVertical: 10,
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}
                        onPress={() => handleGoToDetails(item)}
                      >
                        <Ionicons name="eye" size={16} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Details</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: '#e74c3c',
                          borderRadius: 8,
                          paddingVertical: 10,
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}
                        onPress={() => handleUpdateStatus(item)}
                      >
                        <Ionicons name="create" size={16} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Update</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 20,
            width: '90%',
            maxWidth: 400,
            maxHeight: '80%',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 20,
              textAlign: 'center',
              color: '#2c3e50',
            }}>
              Update Status
            </Text>

            {selectedTicket && (
              <Text style={{
                fontSize: 14,
                marginBottom: 20,
                textAlign: 'center',
                color: '#666',
              }}>
                {selectedTicket.title}
              </Text>
            )}

            {updatingStatus ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={{ marginTop: 10, color: '#666' }}>Updating...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Status Selection */}
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  color: '#2c3e50',
                }}>
                  Status
                </Text>
                {['Open', 'In Progress', 'Closed'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={{
                      backgroundColor: selectedStatus.toLowerCase() === status.toLowerCase() ? '#3498db' : '#f8f9fa',
                      padding: 15,
                      borderRadius: 5,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: selectedStatus.toLowerCase() === status.toLowerCase() ? '#3498db' : '#ddd',
                    }}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <Text style={{
                      textAlign: 'center',
                      fontSize: 16,
                      color: selectedStatus.toLowerCase() === status.toLowerCase() ? '#fff' : '#2c3e50',
                      fontWeight: selectedStatus.toLowerCase() === status.toLowerCase() ? 'bold' : 'normal',
                    }}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Technician Remark */}
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  marginTop: 15,
                  color: '#2c3e50',
                }}>
                  Technician Remark
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 5,
                    padding: 10,
                    minHeight: 80,
                    textAlignVertical: 'top',
                    backgroundColor: '#f8f9fa',
                  }}
                  placeholder="Enter technician remark..."
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={3}
                  value={technicianRemark}
                  onChangeText={setTechnicianRemark}
                />

                {/* Solution */}
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  marginTop: 15,
                  color: '#2c3e50',
                }}>
                  Solution
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 5,
                    padding: 10,
                    minHeight: 80,
                    textAlignVertical: 'top',
                    backgroundColor: '#f8f9fa',
                  }}
                  placeholder="Enter solution..."
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={3}
                  value={solution}
                  onChangeText={setSolution}
                />

                {/* Technician Signature */}
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  marginTop: 15,
                  color: '#2c3e50',
                }}>
                  Technician Signature
                </Text>
                <SignaturePad
                  onSignatureChange={setTechnicianSignature}
                  signature={technicianSignature}
                  placeholder="Technician signature"
                />

                {/* Customer Signature */}
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  marginTop: 15,
                  color: '#2c3e50',
                }}>
                  Customer Signature
                </Text>
                <SignaturePad
                  onSignatureChange={setCustomerSignature}
                  signature={customerSignature}
                  placeholder="Customer signature"
                />

                {/* Action Buttons */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#95a5a6',
                      padding: 15,
                      borderRadius: 5,
                      flex: 1,
                      marginRight: 10,
                    }}
                    onPress={() => setShowStatusModal(false)}
                  >
                    <Text style={{
                      textAlign: 'center',
                      fontSize: 16,
                      color: '#fff',
                      fontWeight: 'bold',
                    }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: '#3498db',
                      padding: 15,
                      borderRadius: 5,
                      flex: 1,
                      marginLeft: 10,
                    }}
                    onPress={handleSaveStatusUpdate}
                  >
                    <Text style={{
                      textAlign: 'center',
                      fontSize: 16,
                      color: '#fff',
                      fontWeight: 'bold',
                    }}>
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              maxHeight: '80%',
            }}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 20,
              color: '#2c3e50',
              textAlign: 'center',
            }}>
              Tickets Filters
            </Text>

            {/* Status Filter */}
            <View style={{ marginBottom: 15 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 5,
                  padding: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowForDropdown(false);
                }}
              >
                <Text style={{
                  fontSize: 14,
                  color: filterStatus ? '#2c3e50' : '#999',
                }}>
                  {filterStatus || 'Status'}
                </Text>
                <Ionicons
                  name={showStatusDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
              {showStatusDropdown && (
                <View style={{
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 5,
                  marginTop: 5,
                  maxHeight: 200,
                }}>
                  <ScrollView nestedScrollEnabled={true}>
                    <TouchableOpacity
                      style={{
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f0f0f0',
                      }}
                      onPress={() => {
                        setFilterStatus('');
                        setShowStatusDropdown(false);
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        color: !filterStatus ? '#3498db' : '#2c3e50',
                        fontWeight: !filterStatus ? 'bold' : 'normal',
                      }}>
                        All
                      </Text>
                    </TouchableOpacity>
                    {statusOptions.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={{
                          padding: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: '#f0f0f0',
                        }}
                        onPress={() => {
                          setFilterStatus(status === filterStatus ? '' : status);
                          setShowStatusDropdown(false);
                        }}
                      >
                        <Text style={{
                          fontSize: 14,
                          color: filterStatus === status ? '#3498db' : '#2c3e50',
                          fontWeight: filterStatus === status ? 'bold' : 'normal',
                        }}>
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* For Filter */}
            <View style={{ marginBottom: 20 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 5,
                  padding: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowForDropdown(!showForDropdown);
                  setShowStatusDropdown(false);
                }}
              >
                <Text style={{
                  fontSize: 14,
                  color: selectedFor ? '#2c3e50' : '#999',
                }}>
                  {selectedFor || 'For'}
                </Text>
                <Ionicons
                  name={showForDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
              {showForDropdown && (
                <View style={{
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 5,
                  marginTop: 5,
                  maxHeight: 200,
                }}>
                  <ScrollView nestedScrollEnabled={true}>
                    {forOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={{
                          padding: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: '#f0f0f0',
                        }}
                        onPress={() => {
                          setSelectedFor(option === 'All' ? '' : (option === selectedFor ? '' : option));
                          setShowForDropdown(false);
                        }}
                      >
                        <Text style={{
                          fontSize: 14,
                          color: (selectedFor === option || (!selectedFor && option === 'All')) ? '#3498db' : '#2c3e50',
                          fontWeight: (selectedFor === option || (!selectedFor && option === 'All')) ? 'bold' : 'normal',
                        }}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Search Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#3498db',
                padding: 15,
                borderRadius: 5,
                alignItems: 'center',
                marginTop: 10,
              }}
              onPress={() => {
                setShowFilterModal(false);
                setShowStatusDropdown(false);
                setShowForDropdown(false);
              }}
            >
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold',
              }}>
                SEARCH
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default TicketsScreen;
