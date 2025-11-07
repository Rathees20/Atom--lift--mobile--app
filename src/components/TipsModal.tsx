import React, { useState, useEffect } from 'react';
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
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);

  // Close dropdown when modal closes
  useEffect(() => {
    if (!visible) {
      setShowLanguageDropdown(false);
    }
  }, [visible]);

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

  const languages = ['English', 'Tamil'];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setShowLanguageDropdown(false);
        onClose();
      }}
    >
      <TouchableOpacity 
        style={globalStyles.tipsModalOverlay}
        activeOpacity={1}
        onPress={() => setShowLanguageDropdown(false)}
      >
        <TouchableOpacity 
          style={[globalStyles.tipsModalContainer, { overflow: 'visible' }]}
          activeOpacity={1}
          onPress={() => {}}
        >
          {/* Header */}
          <View style={[globalStyles.tipsModalHeader, { overflow: 'visible', zIndex: 1000 }]}>
            <Text style={globalStyles.tipsModalTitle}>Tips</Text>
            <View style={{ position: 'relative', zIndex: 1001 }}>
              <TouchableOpacity 
                style={globalStyles.tipsLanguageSelector}
                onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <Text style={globalStyles.tipsLanguageText}>{selectedLanguage}</Text>
                <Ionicons 
                  name={showLanguageDropdown ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#666" 
                />
              </TouchableOpacity>
              
              {/* Language Dropdown */}
              {showLanguageDropdown && (
                <View style={{
                  position: 'absolute',
                  top: 40,
                  right: 0,
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e1e8ed',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 8,
                  minWidth: 140,
                  maxWidth: 180,
                  zIndex: 1002,
                  overflow: 'hidden',
                }}>
                  {languages.map((language) => (
                    <TouchableOpacity
                      key={language}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderBottomWidth: language !== languages[languages.length - 1] ? 1 : 0,
                        borderBottomColor: '#f0f0f0',
                        backgroundColor: selectedLanguage === language ? '#e3f2fd' : '#fff',
                      }}
                      onPress={() => {
                        setSelectedLanguage(language);
                        setShowLanguageDropdown(false);
                      }}
                    >
                      <Text style={{
                        fontSize: 15,
                        color: selectedLanguage === language ? '#3498db' : '#2c3e50',
                        fontWeight: selectedLanguage === language ? '600' : '500',
                      }}>
                        {language}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Content */}
          <ScrollView 
            style={[globalStyles.tipsModalContent, { zIndex: 1 }]} 
            showsVerticalScrollIndicator={false}
          >
            {tips.map((tip) => (
              <View key={tip.id} style={globalStyles.tipsModalTipItem}>
                <Text style={globalStyles.tipsModalTipNumber}>Tip {tip.id}:</Text>
                <Text style={globalStyles.tipsModalTipContent}>{tip.content}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Close Button */}
          <View style={globalStyles.tipsModalFooter}>
            <TouchableOpacity 
              style={globalStyles.tipsModalCloseButton} 
              onPress={() => {
                setShowLanguageDropdown(false);
                onClose();
              }}
            >
              <Text style={globalStyles.tipsModalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default TipsModal;
