import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Switch,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import haptic from '../utils/HapticFeedback';
import {ToastManager} from './Toast';

const {height, width} = Dimensions.get('window');

/**
 * Quick Settings Panel Component
 * Fast access to common settings and controls
 */
const QuickSettingsPanel = ({visible, onClose, theme, settings = {}, onSettingChange}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    haptic.light();
    onClose();
  };

  const handleToggle = (key, value) => {
    haptic.medium();
    if (onSettingChange) {
      onSettingChange(key, value);
    }
    ToastManager.info(`${key} ${value ? 'enabled' : 'disabled'}`);
  };

  const handleSliderChange = (key, value) => {
    if (onSettingChange) {
      onSettingChange(key, value);
    }
    // Haptic at 25% intervals
    if (value % 25 === 0) {
      haptic.soft();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {opacity: backdropOpacity},
          ]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        {/* Panel */}
        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: theme?.colors?.surface || '#1a1a1a',
              transform: [{translateY: slideAnim}],
            },
          ]}>
          {/* Handle Bar */}
          <View style={styles.handleBar}>
            <View style={[styles.handle, {backgroundColor: theme?.colors?.textSecondary || '#666'}]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Icon name="settings" size={28} color={theme?.colors?.primary || '#00ff88'} />
            <Text style={[styles.title, {color: theme?.colors?.text || '#fff'}]}>
              Quick Settings
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={28} color={theme?.colors?.textSecondary || '#999'} />
            </TouchableOpacity>
          </View>

          {/* Settings Grid */}
          <View style={styles.settingsGrid}>
            {/* Auto Connect */}
            <View style={[styles.settingCard, {backgroundColor: theme?.colors?.background || '#000'}]}>
              <Icon name="bluetooth-connected" size={24} color={theme?.colors?.primary || '#00ff88'} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, {color: theme?.colors?.text || '#fff'}]}>
                  Auto Connect
                </Text>
                <Text style={[styles.settingDescription, {color: theme?.colors?.textSecondary || '#999'}]}>
                  Connect on app start
                </Text>
              </View>
              <Switch
                value={settings.autoConnect || false}
                onValueChange={value => handleToggle('Auto Connect', value)}
                trackColor={{false: '#767577', true: theme?.colors?.primary || '#00ff88'}}
                thumbColor="#fff"
              />
            </View>

            {/* Haptic Feedback */}
            <View style={[styles.settingCard, {backgroundColor: theme?.colors?.background || '#000'}]}>
              <Icon name="vibration" size={24} color={theme?.colors?.primary || '#00ff88'} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, {color: theme?.colors?.text || '#fff'}]}>
                  Haptic Feedback
                </Text>
                <Text style={[styles.settingDescription, {color: theme?.colors?.textSecondary || '#999'}]}>
                  Vibration on touch
                </Text>
              </View>
              <Switch
                value={settings.hapticEnabled !== false}
                onValueChange={value => handleToggle('Haptic Feedback', value)}
                trackColor={{false: '#767577', true: theme?.colors?.primary || '#00ff88'}}
                thumbColor="#fff"
              />
            </View>

            {/* Notifications */}
            <View style={[styles.settingCard, {backgroundColor: theme?.colors?.background || '#000'}]}>
              <Icon name="notifications" size={24} color={theme?.colors?.primary || '#00ff88'} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, {color: theme?.colors?.text || '#fff'}]}>
                  Notifications
                </Text>
                <Text style={[styles.settingDescription, {color: theme?.colors?.textSecondary || '#999'}]}>
                  Show toast messages
                </Text>
              </View>
              <Switch
                value={settings.notificationsEnabled !== false}
                onValueChange={value => handleToggle('Notifications', value)}
                trackColor={{false: '#767577', true: theme?.colors?.primary || '#00ff88'}}
                thumbColor="#fff"
              />
            </View>

            {/* Keep Screen Awake */}
            <View style={[styles.settingCard, {backgroundColor: theme?.colors?.background || '#000'}]}>
              <Icon name="screen-lock-rotation" size={24} color={theme?.colors?.primary || '#00ff88'} />
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, {color: theme?.colors?.text || '#fff'}]}>
                  Keep Awake
                </Text>
                <Text style={[styles.settingDescription, {color: theme?.colors?.textSecondary || '#999'}]}>
                  Prevent screen sleep
                </Text>
              </View>
              <Switch
                value={settings.keepScreenAwake || false}
                onValueChange={value => handleToggle('Keep Awake', value)}
                trackColor={{false: '#767577', true: theme?.colors?.primary || '#00ff88'}}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Animation Speed */}
          <View style={[styles.sliderSection, {backgroundColor: theme?.colors?.background || '#000'}]}>
            <View style={styles.sliderHeader}>
              <Icon name="speed" size={24} color={theme?.colors?.primary || '#00ff88'} />
              <Text style={[styles.sliderLabel, {color: theme?.colors?.text || '#fff'}]}>
                Animation Speed
              </Text>
              <Text style={[styles.sliderValue, {color: theme?.colors?.primary || '#00ff88'}]}>
                {settings.animationSpeed || 50}%
              </Text>
            </View>
            <Slider
              style={styles.slider}
              value={settings.animationSpeed || 50}
              onValueChange={value => handleSliderChange('animationSpeed', Math.round(value))}
              minimumValue={10}
              maximumValue={100}
              step={5}
              minimumTrackTintColor={theme?.colors?.primary || '#00ff88'}
              maximumTrackTintColor="#666"
              thumbTintColor={theme?.colors?.primary || '#00ff88'}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={[styles.sectionTitle, {color: theme?.colors?.text || '#fff'}]}>
              Quick Actions
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, {backgroundColor: theme?.colors?.background || '#000'}]}
                onPress={() => {
                  haptic.medium();
                  ToastManager.info('Tutorial reset - will show on next app start');
                  handleClose();
                }}>
                <Icon name="school" size={24} color={theme?.colors?.primary || '#00ff88'} />
                <Text style={[styles.actionButtonText, {color: theme?.colors?.text || '#fff'}]}>
                  Reset Tutorial
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, {backgroundColor: theme?.colors?.background || '#000'}]}
                onPress={() => {
                  haptic.medium();
                  ToastManager.success('Safety disclaimers reset');
                  handleClose();
                }}>
                <Icon name="warning" size={24} color="#ff9800" />
                <Text style={[styles.actionButtonText, {color: theme?.colors?.text || '#fff'}]}>
                  Reset Warnings
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  handleBar: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  settingsGrid: {
    paddingHorizontal: 20,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  sliderSection: {
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default QuickSettingsPanel;

