import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  LinearGradient,
} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {LinearGradient as ExpoLinearGradient} from 'expo-linear-gradient';

const {width} = Dimensions.get('window');

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [brightness, setBrightness] = useState(75);
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [speed, setSpeed] = useState(50);
  const [intensity, setIntensity] = useState(50);
  const [favorites, setFavorites] = useState([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [musicSync, setMusicSync] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(0);

  const colors = [
    {name: 'Indigo', value: '#6366f1', gradient: ['#6366f1', '#8b5cf6']},
    {name: 'Red', value: '#ef4444', gradient: ['#ef4444', '#dc2626']},
    {name: 'Green', value: '#10b981', gradient: ['#10b981', '#059669']},
    {name: 'Yellow', value: '#f59e0b', gradient: ['#f59e0b', '#d97706']},
    {name: 'Purple', value: '#8b5cf6', gradient: ['#8b5cf6', '#7c3aed']},
    {name: 'Cyan', value: '#06b6d4', gradient: ['#06b6d4', '#0891b2']},
    {name: 'Pink', value: '#ec4899', gradient: ['#ec4899', '#db2777']},
    {name: 'Orange', value: '#f97316', gradient: ['#f97316', '#ea580c']},
  ];

  const effects = [
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: '🌈',
      gradient: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'],
    },
    {id: 'fade', name: 'Fade', icon: '✨', gradient: ['#6366f1', '#1e293b']},
    {id: 'strobe', name: 'Strobe', icon: '⚡', gradient: ['#ffffff', '#000000']},
    {id: 'pulse', name: 'Pulse', icon: '💓', gradient: ['#ec4899', '#be185d']},
  ];

  const presets = [
    {id: 1, name: 'Movie Night', color: '#1e3a8a', brightness: 30, icon: '🎬'},
    {id: 2, name: 'Party Mode', color: '#ec4899', brightness: 100, icon: '🎉'},
    {id: 3, name: 'Relax', color: '#8b5cf6', brightness: 50, icon: '🧘'},
    {id: 4, name: 'Gaming', color: '#10b981', brightness: 80, icon: '🎮'},
    {id: 5, name: 'Sleep', color: '#fbbf24', brightness: 10, icon: '😴'},
    {id: 6, name: 'Work Focus', color: '#60a5fa', brightness: 60, icon: '💼'},
  ];

  const saveFavorite = () => {
    const newFavorite = {
      id: Date.now(),
      color: selectedColor,
      brightness,
      effect: selectedEffect,
    };
    setFavorites([...favorites, newFavorite]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ExpoLinearGradient
          colors={['#6366f1', '#8b5cf6', '#ec4899']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.header}>
          <Text style={styles.title}>SmartLED</Text>
          <Text style={styles.subtitle}>Professional Lighting Control</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>PRO v2.0</Text>
          </View>
        </ExpoLinearGradient>

        {/* Connection Status */}
        <View style={styles.statusCard}>
          <View
            style={[styles.statusDot, {backgroundColor: isConnected ? '#10b981' : '#ef4444'}]}
          />
          <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Disconnected'}</Text>
        </View>

        {/* Power Control */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Power Control</Text>
          <TouchableOpacity
            onPress={() => {
              setIsPowerOn(!isPowerOn);
              setIsConnected(!isConnected);
            }}>
            <ExpoLinearGradient
              colors={isPowerOn ? ['#10b981', '#059669'] : ['#ef4444', '#dc2626']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.powerButton}>
              <View style={styles.powerIconContainer}>
                <View style={[styles.powerRing, isPowerOn && styles.powerRingActive]}>
                  <View style={[styles.powerCore, isPowerOn && styles.powerCoreActive]} />
                </View>
              </View>
              <Text style={styles.powerButtonText}>{isPowerOn ? 'POWER ON' : 'POWER OFF'}</Text>
              <Text style={styles.powerButtonSubtext}>
                {isPowerOn ? 'LED strips active' : 'Tap to activate'}
              </Text>
            </ExpoLinearGradient>
          </TouchableOpacity>
        </View>

        {/* Brightness Control */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Brightness</Text>
            <View style={styles.brightnessValueBadge}>
              <Text style={styles.brightnessValue}>{brightness}%</Text>
            </View>
          </View>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <ExpoLinearGradient
                colors={[selectedColor, selectedColor + '99', selectedColor + '33']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[styles.sliderFill, {width: `${brightness}%`}]}
              />
            </View>
          </View>
          <View style={styles.brightnessButtons}>
            {[0, 25, 50, 75, 100].map(value => (
              <TouchableOpacity key={value} onPress={() => setBrightness(value)}>
                <ExpoLinearGradient
                  colors={
                    brightness === value
                      ? [selectedColor, selectedColor + 'cc']
                      : ['#374151', '#1f2937']
                  }
                  style={styles.brightnessButton}>
                  <Text style={styles.brightnessButtonText}>{value}</Text>
                </ExpoLinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Picker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Color Palette</Text>
          <View style={styles.colorGrid}>
            {colors.map(color => (
              <TouchableOpacity
                key={color.value}
                onPress={() => setSelectedColor(color.value)}
                style={[
                  styles.colorButtonWrapper,
                  selectedColor === color.value && styles.selectedColorWrapper,
                ]}>
                <ExpoLinearGradient
                  colors={color.gradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.colorButton}>
                  {selectedColor === color.value && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </ExpoLinearGradient>
                <Text
                  style={[
                    styles.colorName,
                    selectedColor === color.value && styles.colorNameSelected,
                  ]}>
                  {color.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* LED Effects */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>LED Effects</Text>
          <View style={styles.effectsGrid}>
            {effects.map(effect => (
              <TouchableOpacity
                key={effect.id}
                onPress={() => setSelectedEffect(effect.id)}
                style={styles.effectButtonWrapper}>
                <ExpoLinearGradient
                  colors={effect.gradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[
                    styles.effectButton,
                    selectedEffect === effect.id && styles.effectButtonActive,
                  ]}>
                  <Text style={styles.effectIcon}>{effect.icon}</Text>
                  <Text style={styles.effectName}>{effect.name}</Text>
                  {selectedEffect === effect.id && <View style={styles.effectActiveDot} />}
                </ExpoLinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Effect Controls */}
          {selectedEffect && (
            <View style={styles.effectControls}>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Speed: {speed}%</Text>
                <View style={styles.controlButtons}>
                  {[25, 50, 75, 100].map(val => (
                    <TouchableOpacity
                      key={val}
                      onPress={() => setSpeed(val)}
                      style={[styles.controlButton, speed === val && styles.controlButtonActive]}>
                      <Text style={styles.controlButtonText}>{val}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Intensity: {intensity}%</Text>
                <View style={styles.controlButtons}>
                  {[25, 50, 75, 100].map(val => (
                    <TouchableOpacity
                      key={val}
                      onPress={() => setIntensity(val)}
                      style={[
                        styles.controlButton,
                        intensity === val && styles.controlButtonActive,
                      ]}>
                      <Text style={styles.controlButtonText}>{val}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Scene Presets */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Scene Presets</Text>
          <View style={styles.presetsGrid}>
            {presets.map(preset => (
              <TouchableOpacity
                key={preset.id}
                onPress={() => {
                  setSelectedColor(preset.color);
                  setBrightness(preset.brightness);
                  setIsPowerOn(true);
                  setIsConnected(true);
                }}
                style={styles.presetButton}>
                <View style={[styles.presetIcon, {backgroundColor: preset.color}]}>
                  <Text style={styles.presetEmoji}>{preset.icon}</Text>
                </View>
                <Text style={styles.presetName}>{preset.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Advanced Features */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Advanced Features</Text>

          {/* Music Sync */}
          <TouchableOpacity onPress={() => setMusicSync(!musicSync)} style={styles.featureRow}>
            <View style={styles.featureLeft}>
              <Text style={styles.featureIcon}>🎵</Text>
              <View>
                <Text style={styles.featureName}>Music Sync</Text>
                <Text style={styles.featureDesc}>Sync LEDs to music beats</Text>
              </View>
            </View>
            <View style={[styles.toggle, musicSync && styles.toggleActive]}>
              <View style={[styles.toggleCircle, musicSync && styles.toggleCircleActive]} />
            </View>
          </TouchableOpacity>

          {/* Schedule */}
          <TouchableOpacity
            onPress={() => setScheduleEnabled(!scheduleEnabled)}
            style={styles.featureRow}>
            <View style={styles.featureLeft}>
              <Text style={styles.featureIcon}>⏰</Text>
              <View>
                <Text style={styles.featureName}>Auto Schedule</Text>
                <Text style={styles.featureDesc}>Turn on/off automatically</Text>
              </View>
            </View>
            <View style={[styles.toggle, scheduleEnabled && styles.toggleActive]}>
              <View style={[styles.toggleCircle, scheduleEnabled && styles.toggleCircleActive]} />
            </View>
          </TouchableOpacity>

          {/* Sleep Timer */}
          <View style={styles.featureRow}>
            <View style={styles.featureLeft}>
              <Text style={styles.featureIcon}>⏱️</Text>
              <View>
                <Text style={styles.featureName}>Sleep Timer</Text>
                <Text style={styles.featureDesc}>Auto-off after {timerMinutes || '—'} min</Text>
              </View>
            </View>
            <View style={styles.timerButtons}>
              {[15, 30, 60].map(min => (
                <TouchableOpacity
                  key={min}
                  onPress={() => setTimerMinutes(timerMinutes === min ? 0 : min)}
                  style={[styles.timerButton, timerMinutes === min && styles.timerButtonActive]}>
                  <Text style={styles.timerButtonText}>{min}m</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Current Settings */}
          <TouchableOpacity onPress={saveFavorite} style={styles.saveButton}>
            <ExpoLinearGradient
              colors={['#8b5cf6', '#6366f1']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.saveButtonGradient}>
              <Text style={styles.saveButtonIcon}>⭐</Text>
              <Text style={styles.saveButtonText}>Save Current Setup</Text>
            </ExpoLinearGradient>
          </TouchableOpacity>
        </View>

        {/* Device Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Device Information</Text>
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
          <Text style={styles.footerText}>SmartLED Controller v2.0.0</Text>
          <Text style={styles.footerSubtext}>Ready to control your LED strips</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
    opacity: 0.9,
  },
  versionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  versionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141b2d',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  statusText: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#141b2d',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: 0.5,
  },
  powerButton: {
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  powerIconContainer: {
    marginBottom: 16,
  },
  powerRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerRingActive: {
    borderColor: '#ffffff',
  },
  powerCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  powerCoreActive: {
    backgroundColor: '#ffffff',
  },
  powerButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  powerButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  brightnessValueBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  brightnessValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderTrack: {
    height: 16,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 8,
  },
  brightnessButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  brightnessButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    flex: 1,
    alignItems: 'center',
  },
  brightnessButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  colorButtonWrapper: {
    width: (width - 100) / 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedColorWrapper: {
    transform: [{scale: 1.05}],
  },
  colorButton: {
    width: (width - 100) / 4,
    height: (width - 100) / 4,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  selectedIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 8,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  colorName: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  colorNameSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  effectButtonWrapper: {
    width: (width - 100) / 2,
    marginBottom: 12,
  },
  effectButton: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
  },
  effectButtonActive: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  effectIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  effectName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  effectActiveDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 15,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 5,
  },
  infoValue: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 30,
    marginBottom: 30,
  },
  footerText: {
    color: '#6366f1',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  footerSubtext: {
    color: '#64748b',
    fontSize: 14,
  },
  effectControls: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  controlRow: {
    marginBottom: 16,
  },
  controlLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  controlButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#8b5cf6',
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetButton: {
    width: (width - 100) / 3,
    alignItems: 'center',
    marginBottom: 12,
  },
  presetIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  presetEmoji: {
    fontSize: 32,
  },
  presetName: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  featureName: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    color: '#94a3b8',
    fontSize: 13,
  },
  toggle: {
    width: 56,
    height: 32,
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#10b981',
  },
  toggleCircle: {
    width: 28,
    height: 28,
    backgroundColor: '#ffffff',
    borderRadius: 14,
  },
  toggleCircleActive: {
    transform: [{translateX: 24}],
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  timerButtonActive: {
    backgroundColor: '#fbbf24',
    borderColor: '#f59e0b',
  },
  timerButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 20,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
