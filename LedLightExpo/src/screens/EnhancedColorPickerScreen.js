/**
 * Enhanced ColorPickerScreen with beautiful UI
 * Modern design with animations and better visual appeal
 */

import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {
  AnimatedButton,
  GlassCard,
  StatusIndicator,
  SlideInView,
  ProgressBar,
} from '../components/UIComponents';
import ColorManager from '../classes/ColorManager';
import DeviceManager from '../classes/DeviceManager';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

const {width} = Dimensions.get('window');

const EnhancedColorPickerScreen = () => {
  const navigation = useNavigation();
  const [localState, setLocalState] = useState({
    selectedColor: '#00ff88',
    brightness: 50,
    isConnected: false,
    connectionState: 'disconnected',
    isLoading: false,
    colorPalettes: [],
    presets: [],
  });

  // Color palettes with beautiful gradients
  const colorPalettes = useMemo(() => [
    {
      id: 'rainbow',
      name: 'Rainbow',
      colors: ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#8000ff'],
      gradient: ['#ff0000', '#8000ff'],
    },
    {
      id: 'warm',
      name: 'Warm',
      colors: ['#ff6b6b', '#ffa726', '#ffeb3b', '#ff9800'],
      gradient: ['#ff6b6b', '#ff9800'],
    },
    {
      id: 'cool',
      name: 'Cool',
      colors: ['#2196f3', '#00bcd4', '#4caf50', '#8bc34a'],
      gradient: ['#2196f3', '#4caf50'],
    },
    {
      id: 'pastel',
      name: 'Pastel',
      colors: ['#ffcdd2', '#f8bbd9', '#e1bee7', '#c5cae9'],
      gradient: ['#ffcdd2', '#c5cae9'],
    },
    {
      id: 'neon',
      name: 'Neon',
      colors: ['#00ff88', '#ff0080', '#00ffff', '#ffff00'],
      gradient: ['#00ff88', '#ff0080'],
    },
    {
      id: 'sunset',
      name: 'Sunset',
      colors: ['#ff5722', '#ff9800', '#ffc107', '#ffeb3b'],
      gradient: ['#ff5722', '#ffeb3b'],
    },
  ], []);

  // Preset configurations
  const presets = useMemo(() => [
    {
      id: 'daylight',
      name: 'Daylight',
      color: '#ffffff',
      brightness: 80,
      icon: 'wb-sunny',
      gradient: ['#ffffff', '#f5f5f5'],
    },
    {
      id: 'night',
      name: 'Night',
      color: '#2196f3',
      brightness: 30,
      icon: 'nightlight-round',
      gradient: ['#2196f3', '#1976d2'],
    },
    {
      id: 'warm',
      name: 'Warm',
      color: '#ff9800',
      brightness: 60,
      icon: 'favorite',
      gradient: ['#ff9800', '#f57c00'],
    },
    {
      id: 'cool',
      name: 'Cool',
      color: '#00bcd4',
      brightness: 70,
      icon: 'ac-unit',
      gradient: ['#00bcd4', '#0097a7'],
    },
    {
      id: 'party',
      name: 'Party',
      color: '#e91e63',
      brightness: 90,
      icon: 'celebration',
      gradient: ['#e91e63', '#c2185b'],
    },
    {
      id: 'focus',
      name: 'Focus',
      color: '#4caf50',
      brightness: 75,
      icon: 'school',
      gradient: ['#4caf50', '#388e3c'],
    },
  ], []);

  // Custom color picker colors
  const customColors = useMemo(() => [
    '#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80',
    '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080',
    '#ffffff', '#cccccc', '#999999', '#666666', '#333333', '#000000',
  ], []);

  const handleColorSelect = useCallback(async (color) => {
    try {
      setLocalState(prev => ({...prev, selectedColor: color, isLoading: true}));
      
      const success = await ColorManager.setColor(color);
      if (success) {
        logger.info('Color set successfully', {color});
      } else {
        throw new Error('Failed to set color');
      }
    } catch (error) {
      logger.error('Color selection failed', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    } finally {
      setLocalState(prev => ({...prev, isLoading: false}));
    }
  }, []);

  const handleBrightnessChange = useCallback(async (value) => {
    try {
      setLocalState(prev => ({...prev, brightness: value}));
      
      const success = await ColorManager.setBrightness(value);
      if (success) {
        logger.info('Brightness changed successfully', {brightness: value});
      } else {
        throw new Error('Failed to change brightness');
      }
    } catch (error) {
      logger.error('Brightness change failed', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    }
  }, []);

  const handlePresetSelect = useCallback(async (preset) => {
    try {
      setLocalState(prev => ({...prev, isLoading: true}));
      
      const success = await ColorManager.applyPreset(preset);
      if (success) {
        setLocalState(prev => ({
          ...prev,
          selectedColor: preset.color,
          brightness: preset.brightness,
        }));
        logger.info('Preset applied successfully', {preset: preset.name});
      } else {
        throw new Error('Failed to apply preset');
      }
    } catch (error) {
      logger.error('Preset application failed', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    } finally {
      setLocalState(prev => ({...prev, isLoading: false}));
    }
  }, []);

  const handlePaletteSelect = useCallback(async (palette) => {
    try {
      setLocalState(prev => ({...prev, isLoading: true}));
      
      const success = await ColorManager.applyPalette(palette);
      if (success) {
        logger.info('Palette applied successfully', {palette: palette.name});
      } else {
        throw new Error('Failed to apply palette');
      }
    } catch (error) {
      logger.error('Palette application failed', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    } finally {
      setLocalState(prev => ({...prev, isLoading: false}));
    }
  }, []);

  // State synchronization effect
  useEffect(() => {
    const handleDeviceConnected = (device) => {
      setLocalState(prev => ({
        ...prev,
        isConnected: true,
        connectionState: 'connected',
      }));
    };

    const handleDeviceDisconnected = () => {
      setLocalState(prev => ({
        ...prev,
        isConnected: false,
        connectionState: 'disconnected',
      }));
    };

    const handleConnectionError = (error) => {
      setLocalState(prev => ({
        ...prev,
        connectionState: 'error',
      }));
    };

    DeviceManager.addListener('deviceConnected', handleDeviceConnected);
    DeviceManager.addListener('deviceDisconnected', handleDeviceDisconnected);
    DeviceManager.addListener('connectionError', handleConnectionError);

    // Initial state
    const connectionInfo = DeviceManager.getConnectionInfo();
    setLocalState(prev => ({
      ...prev,
      isConnected: connectionInfo.isConnected,
      connectionState: connectionInfo.state,
    }));

    return () => {
      DeviceManager.removeListener('deviceConnected', handleDeviceConnected);
      DeviceManager.removeListener('deviceDisconnected', handleDeviceDisconnected);
      DeviceManager.removeListener('connectionError', handleConnectionError);
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.backgroundGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <SlideInView direction="down" delay={0}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Color Picker</Text>
              <View style={styles.connectionInfo}>
                <StatusIndicator status={localState.connectionState} size={12} />
                <Text style={styles.connectionText}>
                  {localState.isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
            </View>
            <View style={styles.headerSpacer} />
          </View>
        </SlideInView>

        {/* Current Color Display */}
        <SlideInView direction="up" delay={200}>
          <GlassCard style={styles.currentColorCard}>
            <Text style={styles.sectionTitle}>Current Color</Text>
            <View style={styles.currentColorContainer}>
              <LinearGradient
                colors={[localState.selectedColor, localState.selectedColor]}
                style={styles.currentColorPreview}
              />
              <View style={styles.colorInfo}>
                <Text style={styles.colorHex}>{localState.selectedColor}</Text>
                <Text style={styles.brightnessText}>Brightness: {localState.brightness}%</Text>
              </View>
            </View>
          </GlassCard>
        </SlideInView>

        {/* Brightness Control */}
        <SlideInView direction="up" delay={400}>
          <GlassCard style={styles.controlCard}>
            <Text style={styles.sectionTitle}>Brightness</Text>
            <View style={styles.brightnessContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={localState.brightness}
                onValueChange={handleBrightnessChange}
                minimumTrackTintColor={localState.selectedColor}
                maximumTrackTintColor="rgba(255,255,255,0.2)"
                thumbStyle={styles.sliderThumb}
              />
              <ProgressBar
                progress={localState.brightness}
                color={localState.selectedColor}
                height={8}
                animated={true}
              />
            </View>
          </GlassCard>
        </SlideInView>

        {/* Custom Colors */}
        <SlideInView direction="up" delay={600}>
          <GlassCard style={styles.controlCard}>
            <Text style={styles.sectionTitle}>Custom Colors</Text>
            <View style={styles.customColorsGrid}>
              {customColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorButton,
                    {backgroundColor: color},
                    localState.selectedColor === color && styles.selectedColorButton,
                  ]}
                  onPress={() => handleColorSelect(color)}
                />
              ))}
            </View>
          </GlassCard>
        </SlideInView>

        {/* Color Palettes */}
        <SlideInView direction="up" delay={800}>
          <GlassCard style={styles.controlCard}>
            <Text style={styles.sectionTitle}>Color Palettes</Text>
            <View style={styles.palettesContainer}>
              {colorPalettes.map((palette) => (
                <TouchableOpacity
                  key={palette.id}
                  style={styles.paletteButton}
                  onPress={() => handlePaletteSelect(palette)}>
                  <LinearGradient
                    colors={palette.gradient}
                    style={styles.paletteGradient}>
                    <Text style={styles.paletteName}>{palette.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </SlideInView>

        {/* Presets */}
        <SlideInView direction="up" delay={1000}>
          <GlassCard style={styles.controlCard}>
            <Text style={styles.sectionTitle}>Presets</Text>
            <View style={styles.presetsGrid}>
              {presets.map((preset) => (
                <AnimatedButton
                  key={preset.id}
                  title={preset.name}
                  icon={preset.icon}
                  onPress={() => handlePresetSelect(preset)}
                  gradient={preset.gradient}
                  style={styles.presetButton}
                />
              ))}
            </View>
          </GlassCard>
        </SlideInView>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  connectionText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 5,
  },
  headerSpacer: {
    width: 44,
  },
  currentColorCard: {
    marginBottom: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  currentColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentColorPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  colorInfo: {
    alignItems: 'center',
  },
  colorHex: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  brightnessText: {
    fontSize: 14,
    color: '#999',
  },
  controlCard: {
    marginBottom: 20,
    padding: 20,
  },
  brightnessContainer: {
    marginTop: 10,
  },
  slider: {
    height: 40,
    marginBottom: 15,
  },
  sliderThumb: {
    backgroundColor: '#fff',
    width: 24,
    height: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  customColorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: (width - 80) / 6,
    height: (width - 80) / 6,
    borderRadius: (width - 80) / 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedColorButton: {
    borderColor: '#fff',
    transform: [{scale: 1.1}],
  },
  palettesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paletteButton: {
    width: (width - 80) / 2,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  paletteGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  paletteName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetButton: {
    width: (width - 80) / 2,
    marginBottom: 15,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default EnhancedColorPickerScreen;
