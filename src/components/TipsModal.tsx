import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../styles/globalStyles';
import { Tip } from '../../types';

interface TipsModalProps {
  visible: boolean;
  onClose: () => void;
}

const TipsModal: React.FC<TipsModalProps> = ({ visible, onClose }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');

  const tips: Tip[] = [
    {
      id: 1,
      title: 'Work Check',
      content: 'Work Check" in option is only for employees who are working in the field.',
    },
    {
      id: 2,
      title: 'Work Check In',
      content: 'Tap in "work check" in when at a time you visit at site to work.',
    },
    {
      id: 3,
      title: 'Office Attendance',
      content: 'Office employee needs to regular mark attendance in and out. office employees does not require to work check in.',
    },
    {
      id: 4,
      title: 'Location Detection',
      content: 'When you work check in and type a relevant note, location detects automatically.',
    },
    {
      id: 5,
      title: 'Leave Option',
      content: 'Office and fields employees both can use leave option to take necessary leaves available from his account.',
    },
    {
      id: 6,
      title: 'Leave Request',
      content: 'Employees can request a leave to their company management, if leave balance not available in his account.',
    },
  ];

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu'];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={globalStyles.tipsModalOverlay}>
        <View style={globalStyles.tipsModalContainer}>
          {/* Header */}
          <View style={globalStyles.tipsModalHeader}>
            <Text style={globalStyles.tipsModalTitle}>Tips</Text>
            <View style={globalStyles.tipsLanguageSelector}>
              <Text style={globalStyles.tipsLanguageText}>{selectedLanguage}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </View>
          </View>

          {/* Content */}
          <ScrollView style={globalStyles.tipsModalContent} showsVerticalScrollIndicator={false}>
            {tips.map((tip) => (
              <View key={tip.id} style={globalStyles.tipsModalTipItem}>
                <Text style={globalStyles.tipsModalTipNumber}>Tip {tip.id}:</Text>
                <Text style={globalStyles.tipsModalTipContent}>{tip.content}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Close Button */}
          <View style={globalStyles.tipsModalFooter}>
            <TouchableOpacity style={globalStyles.tipsModalCloseButton} onPress={onClose}>
              <Text style={globalStyles.tipsModalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TipsModal;
