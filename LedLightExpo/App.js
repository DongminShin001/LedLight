import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [brightness, setBrightness] = useState(75);
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [currentEffect, setCurrentEffect] = useState('solid');
  const [showSettings, setShowSettings] = useState(false);
  const [musicMode, setMusicMode] = useState(false);
  const [scheduleMode, setScheduleMode] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const colors = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
  ];

  const effects = [
    { name: 'Solid', icon: '●', description: 'Solid color' },
    { name: 'Rainbow', icon: '🌈', description: 'Rainbow cycle' },
    { name: 'Breathing', icon: '💨', description: 'Breathing effect' },
    { name: 'Strobe', icon: '⚡', description: 'Strobe flash' },
    { name: 'Wave', icon: '🌊', description: 'Wave pattern' },
    { name: 'Music', icon: '🎵', description: 'Music reactive' },
  ];

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for power button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (isPowerOn) {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
      pulseAnim.setValue(1);
    }

    // Rotation animation for music mode
    if (musicMode) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isPowerOn, musicMode]);

  const handlePowerToggle = () => {
    setIsPowerOn(!isPowerOn);
    setIsConnected(!isConnected);
    
    // Haptic feedback simulation
    Alert.alert(
      isPowerOn ? 'LED Turned Off' : 'LED Turned On',
      `Your LED strip is now ${isPowerOn ? 'off' : 'on'}`,
      [{ text: 'OK' }]
    );
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    
    // Color change animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleEffectChange = (effect) => {
    setCurrentEffect(effect);
    
    if (effect === 'Music') {
      setMusicMode(true);
    } else {
      setMusicMode(false);
    }
  };

  const handleBrightnessChange = (value) => {
    setBrightness(value);
  };

  // Pan responder for brightness slider
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt) => {
      const newBrightness = Math.max(0, Math.min(100, 
        ((evt.nativeEvent.locationX / (width - 80)) * 100)
      ));
      handleBrightnessChange(Math.round(newBrightness));
    },
  });

  const renderColorPicker = () => (
    <View style={styles.colorPickerContainer}>
      <Text style={styles.sectionTitle}>🎨 Color Selection</Text>
      <View style={styles.colorGrid}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color.value}
            style={[
              styles.colorButton,
              { backgroundColor: color.value },
              selectedColor === color.value && styles.selectedColor,
            ]}
            onPress={() => handleColorChange(color.value)}
          >
            {selectedColor === color.value && (
              <Text style={styles.checkmark}>✓</Text>
            )}
            <Text style={styles.colorName}>{color.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEffectsPanel = () => (
    <View style={styles.effectsContainer}>
      <Text style={styles.sectionTitle}>🎭 LED Effects</Text>
      <View style={styles.effectsGrid}>
        {effects.map((effect) => (
          <TouchableOpacity
            key={effect.name}
            style={[
              styles.effectButton,
              currentEffect === effect.name.toLowerCase() && styles.activeEffect,
            ]}
            onPress={() => handleEffectChange(effect.name.toLowerCase())}
          >
            <Animated.View
              style={[
                styles.effectIcon,
                musicMode && effect.name === 'Music' && {
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                },
              ]}
            >
              <Text style={styles.effectIconText}>{effect.icon}</Text>
            </Animated.View>
            <Text style={styles.effectName}>{effect.name}</Text>
            <Text style={styles.effectDescription}>{effect.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBrightnessControl = () => (
    <View style={styles.brightnessContainer}>
      <Text style={styles.sectionTitle}>💡 Brightness Control</Text>
      <View style={styles.brightnessDisplay}>
        <Text style={styles.brightnessValue}>{brightness}%</Text>
        <View style={styles.brightnessBar}>
          <View
            style={[
              styles.brightnessFill,
              {
                width: `${brightness}%`,
                backgroundColor: selectedColor,
              },
            ]}
          />
        </View>
      </View>
      
      <View style={styles.brightnessButtons}>
        {[0, 25, 50, 75, 100].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.brightnessButton,
              {
                backgroundColor: brightness === value ? selectedColor : '#374151',
                opacity: brightness === value ? 1 : 0.7,
              },
            ]}
            onPress={() => handleBrightnessChange(value)}
          >
            <Text style={styles.brightnessButtonText}>{value}%</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPowerControl = () => (
    <View style={styles.powerContainer}>
      <Text style={styles.sectionTitle}>⚡ Power Control</Text>
      <Animated.View
        style={[
          styles.powerButtonContainer,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.powerButton,
            {
              backgroundColor: isPowerOn ? '#10b981' : '#ef4444',
              shadowColor: isPowerOn ? '#10b981' : '#ef4444',
            },
          ]}
          onPress={handlePowerToggle}
        >
          <Text style={styles.powerIcon}>{isPowerOn ? '🔆' : '🔅'}</Text>
          <Text style={styles.powerButtonText}>
            {isPowerOn ? 'Turn Off' : 'Turn On'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      <View style={styles.statusIndicator}>
        <View style={[
          styles.statusDot,
          { backgroundColor: isConnected ? '#10b981' : '#ef4444' }
        ]} />
        <Text style={styles.statusText}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setScheduleMode(!scheduleMode)}
        >
          <Text style={styles.quickActionIcon}>⏰</Text>
          <Text style={styles.quickActionText}>Schedule</Text>
          {scheduleMode && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setMusicMode(!musicMode)}
        >
          <Text style={styles.quickActionIcon}>🎵</Text>
          <Text style={styles.quickActionText}>Music Sync</Text>
          {musicMode && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setShowSettings(true)}
        >
          <Text style={styles.quickActionIcon}>⚙️</Text>
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Presets', 'Preset management coming soon!')}
        >
          <Text style={styles.quickActionIcon}>💾</Text>
          <Text style={styles.quickActionText}>Presets</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={showSettings}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto Connect</Text>
            <TouchableOpacity style={styles.toggleButton}>
              <Text style={styles.toggleText}>ON</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Night Mode</Text>
            <TouchableOpacity style={styles.toggleButton}>
              <Text style={styles.toggleText}>OFF</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
            <TouchableOpacity style={styles.toggleButton}>
              <Text style={styles.toggleText}>ON</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowSettings(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>SmartLED Controller</Text>
            <Text style={styles.subtitle}>Professional LED Control System</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>v2.0.0</Text>
            </View>
          </View>

          {/* Power Control */}
          {renderPowerControl()}

          {/* Brightness Control */}
          {renderBrightnessControl()}

          {/* Color Picker */}
          {renderColorPicker()}

          {/* Effects Panel */}
          {renderEffectsPanel()}

          {/* Quick Actions */}
          {renderQuickActions()}

          {/* Device Info */}
          <View style={styles.deviceInfoContainer}>
            <Text style={styles.sectionTitle}>📱 Device Information</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Device Name</Text>
                <Text style={styles.infoValue}>SmartLED Pro</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Firmware</Text>
                <Text style={styles.infoValue}>v2.1.0</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Battery</Text>
                <Text style={styles.infoValue}>85%</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Signal</Text>
                <Text style={styles.infoValue}>Strong</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>✨ SmartLED Controller v2.0.0</Text>
            <Text style={styles.footerSubtext}>Professional LED Control System</Text>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Settings Modal */}
      {renderSettingsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#6366f1',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 12,
    textAlign: 'center',
  },
  versionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 16,
  },
  powerContainer: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  powerButtonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  powerButton: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  powerIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  powerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  brightnessContainer: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  brightnessDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brightnessValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  brightnessBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#374151',
    borderRadius: 6,
    overflow: 'hidden',
  },
  brightnessFill: {
    height: '100%',
    borderRadius: 6,
  },
  brightnessButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brightnessButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  brightnessButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  colorPickerContainer: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: (width - 100) / 4,
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.05 }],
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  colorName: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  effectsContainer: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  effectButton: {
    width: (width - 100) / 3,
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeEffect: {
    borderColor: '#6366f1',
    backgroundColor: '#4c1d95',
  },
  effectIcon: {
    marginBottom: 8,
  },
  effectIconText: {
    fontSize: 24,
  },
  effectName: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  effectDescription: {
    color: '#94a3b8',
    fontSize: 10,
    textAlign: 'center',
  },
  quickActionsContainer: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 100) / 2,
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  deviceInfoContainer: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  footerText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    color: '#64748b',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    width: width - 40,
    maxHeight: height * 0.6,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    color: '#f1f5f9',
    fontSize: 16,
  },
  toggleButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});