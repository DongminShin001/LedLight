import React, {useState, useRef, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import haptic from '../utils/HapticFeedback';

/**
 * Help Tooltip Component
 * Provides contextual help and hints
 */
const HelpTooltip = ({
  title,
  message,
  iconSize = 20,
  iconColor = '#00ff88',
  position = 'below', // above, below, left, right
  theme,
}) => {
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const toggleTooltip = () => {
    haptic.light();
    setVisible(!visible);
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'above':
        return {bottom: 30, left: -100};
      case 'below':
        return {top: 30, left: -100};
      case 'left':
        return {right: 30, top: -40};
      case 'right':
        return {left: 30, top: -40};
      default:
        return {top: 30, left: -100};
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleTooltip} style={styles.iconButton}>
        <Icon name="help-outline" size={iconSize} color={iconColor} />
      </TouchableOpacity>

      {visible && (
        <Animated.View
          style={[
            styles.tooltip,
            getPositionStyle(),
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
              backgroundColor: theme?.colors?.surface || '#1a1a1a',
            },
          ]}>
          {title && (
            <Text style={[styles.title, {color: theme?.colors?.primary || '#00ff88'}]}>
              {title}
            </Text>
          )}
          <Text style={[styles.message, {color: theme?.colors?.text || '#fff'}]}>
            {message}
          </Text>
          
          <TouchableOpacity style={styles.closeButton} onPress={toggleTooltip}>
            <Icon name="close" size={16} color={theme?.colors?.textSecondary || '#999'} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

/**
 * Info Banner Component
 * Shows persistent help information
 */
export const InfoBanner = ({message, icon = 'info', type = 'info', onDismiss, theme}) => {
  const getTypeStyle = () => {
    switch (type) {
      case 'info':
        return {backgroundColor: '#2196F320', iconColor: '#2196F3'};
      case 'warning':
        return {backgroundColor: '#ff980020', iconColor: '#ff9800'};
      case 'tip':
        return {backgroundColor: '#4CAF5020', iconColor: '#4CAF50'};
      case 'danger':
        return {backgroundColor: '#f4433620', iconColor: '#f44336'};
      default:
        return {backgroundColor: '#2196F320', iconColor: '#2196F3'};
    }
  };

  const typeStyle = getTypeStyle();

  return (
    <View
      style={[
        styles.banner,
        {backgroundColor: typeStyle.backgroundColor},
      ]}>
      <Icon name={icon} size={20} color={typeStyle.iconColor} style={styles.bannerIcon} />
      <Text style={[styles.bannerText, {color: theme?.colors?.text || '#fff'}]}>
        {message}
      </Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Icon name="close" size={18} color={theme?.colors?.textSecondary || '#999'} />
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Quick Help Modal
 * Full-screen help overlay
 */
export const QuickHelpModal = ({visible, onClose, helpItems, theme}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {backgroundColor: theme?.colors?.surface || '#1a1a1a'},
          ]}>
          <View style={styles.modalHeader}>
            <Icon name="help" size={32} color={theme?.colors?.primary || '#00ff88'} />
            <Text style={[styles.modalTitle, {color: theme?.colors?.text || '#fff'}]}>
              Quick Help
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Icon name="close" size={28} color={theme?.colors?.textSecondary || '#999'} />
            </TouchableOpacity>
          </View>

          <View style={styles.helpList}>
            {helpItems?.map((item, index) => (
              <View key={index} style={styles.helpItem}>
                <Icon
                  name={item.icon || 'check-circle'}
                  size={24}
                  color={theme?.colors?.primary || '#00ff88'}
                  style={styles.helpItemIcon}
                />
                <View style={styles.helpItemContent}>
                  <Text style={[styles.helpItemTitle, {color: theme?.colors?.text || '#fff'}]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.helpItemDescription,
                      {color: theme?.colors?.textSecondary || '#999'},
                    ]}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.modalButton,
              {backgroundColor: theme?.colors?.primary || '#00ff88'},
            ]}
            onPress={onClose}>
            <Text style={styles.modalButtonText}>Got It!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  iconButton: {
    padding: 4,
  },
  tooltip: {
    position: 'absolute',
    width: 220,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    fontSize: 12,
    lineHeight: 18,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  bannerIcon: {
    marginRight: 12,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
  },
  modalCloseButton: {
    padding: 4,
  },
  helpList: {
    marginBottom: 24,
  },
  helpItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  helpItemIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  helpItemContent: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpItemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HelpTooltip;

