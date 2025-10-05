/**
 * Enhanced HomeScreen with OOP optimizations
 * Uses AppStateManager and PerformanceOptimizer for better performance
 */

import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Alert} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import AppStateManager from '../classes/AppStateManager';
import PerformanceOptimizer from '../classes/PerformanceOptimizer';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

const {width, height} = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [localState, setLocalState] = useState({
    brightness: 50,
    isOn: false,
    currentColor: '#00ff88',
    isConnected: false,
    connectionState: 'disconnected',
    isLoading: false,
  });

  // Memoized values for performance
  const ledPreviewStyle = useMemo(() => [
    styles.ledCircle,
    {
      backgroundColor: localState.isOn ? localState.currentColor : '#333',
      opacity: localState.isOn ? localState.brightness / 100 : 0.3,
    },
  ], [localState.isOn, localState.currentColor, localState.brightness]);

  const connectButtonStyle = useMemo(() => [
    styles.connectButton,
    localState.isConnected && styles.connectedButton,
  ], [localState.isConnected]);

  const powerButtonStyle = useMemo(() => [
    styles.powerButton,
    localState.isOn && styles.powerButtonOn,
  ], [localState.isOn]);

  // Optimized event handlers with debouncing
  const handlePowerToggle = useCallback(
    PerformanceOptimizer.debounce.bind(
      PerformanceOptimizer,
      'powerToggle',
      async () => {
        try {
          AppStateManager.setLoading(true);
          const newPowerState = !localState.isOn;
          
          // Use AppStateManager for state updates
          AppStateManager.setState({isPoweredOn: newPowerState});
          
          logger.info('Power toggle successful', {isOn: newPowerState});
        } catch (error) {
          logger.error('Power toggle failed', error);
          const userMessage = ErrorHandler.getUserFriendlyMessage(error);
          Alert.alert('Error', userMessage);
        } finally {
          AppStateManager.setLoading(false);
        }
      },
      200
    ),
    [localState.isOn]
  );

  const handleBrightnessChange = useCallback(
    PerformanceOptimizer.throttle.bind(
      PerformanceOptimizer,
      'brightnessChange',
      async (value) => {
        try {
          // Update local state immediately for UI responsiveness
          setLocalState(prev => ({...prev, brightness: value}));
          
          // Update AppStateManager
          AppStateManager.setState({currentBrightness: value});
          
          logger.info('Brightness change successful!!', {brightness: value});
        } catch (error) {
          logger.error('Brightness change failed', error);
          const userMessage = ErrorHandler.getUserFriendlyMessage(error);
          Alert.alert('Error', userMessage);
        }
      },
      100
    ),
    []
  );

  const handleColorPress = useCallback(() => {
    navigation.navigate('ColorPicker');
  }, [navigation]);

  const handleConnect = useCallback(
    PerformanceOptimizer.debounce.bind(
      PerformanceOptimizer,
      'connect',
      async () => {
        try {
          AppStateManager.setLoading(true);
          
          if (localState.isConnected) {
            AppStateManager.setState({connectionState: 'disconnected'});
            return;
          }

          // Use cached device list if available
          const devices = await PerformanceOptimizer.lazyLoad(
            'availableDevices',
            () => AppStateManager.getState().availableDevices || []
          );

          if (devices.length === 0) {
            Alert.alert('No Devices', 'No LED devices found. Please pair a device first.');
            return;
          }

          // Connect to first available device
          const device = devices[0];
          AppStateManager.setState({
            isConnected: true,
            connectedDevice: device,
            connectionState: 'connected',
          });
          
        } catch (error) {
          logger.error('Connection failed', error);
          const userMessage = ErrorHandler.getUserFriendlyMessage(error);
          Alert.alert('Connection Error', userMessage);
        } finally {
          AppStateManager.setLoading(false);
        }
      },
      300
    ),
    [localState.isConnected]
  );

  // State synchronization effect
  useEffect(() => {
    const handleStateChange = ({newState}) => {
      setLocalState(prev => ({
        ...prev,
        isConnected: newState.isConnected,
        connectionState: newState.connectionState,
        isOn: newState.isPoweredOn,
        currentColor: newState.currentColor,
        brightness: newState.currentBrightness,
        isLoading: newState.isLoading,
      }));
    };

    AppStateManager.addListener('stateChanged', handleStateChange);

    // Initial state sync
    const initialState = AppStateManager.getState();
    setLocalState(prev => ({
      ...prev,
      isConnected: initialState.isConnected,
      connectionState: initialState.connectionState,
      isOn: initialState.isPoweredOn,
      currentColor: initialState.currentColor,
      brightness: initialState.currentBrightness,
      isLoading: initialState.isLoading,
    }));

    return () => {
      AppStateManager.removeListener('stateChanged', handleStateChange);
    };
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      PerformanceOptimizer.clearDebounce('powerToggle');
      PerformanceOptimizer.clearDebounce('connect');
      PerformanceOptimizer.clearThrottle('brightnessChange');
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>LED Controller</Text>
        <TouchableOpacity style={connectButtonStyle} onPress={handleConnect}>
          <Icon
            name={localState.isConnected ? 'bluetooth-connected' : 'bluetooth'}
            size={24}
            color={localState.isConnected ? '#00ff88' : '#fff'}
          />
          <Text style={[styles.connectText, localState.isConnected && styles.connectedText]}>
            {localState.isConnected ? 'Connected' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LED Preview */}
      <View style={styles.ledPreview}>
        <View style={ledPreviewStyle} />
        <Text style={styles.statusText}>{localState.isOn ? 'ON' : 'OFF'}</Text>
      </View>

      {/* Power Button */}
      <TouchableOpacity style={powerButtonStyle} onPress={handlePowerToggle}>
        <Icon name={localState.isOn ? 'power-off' : 'power'} size={40} color={localState.isOn ? '#000' : '#fff'} />
      </TouchableOpacity>

      {/* Brightness Control */}
      <View style={styles.brightnessContainer}>
        <Text style={styles.brightnessLabel}>Brightness</Text>
        <View style={styles.sliderContainer}>
          <Icon name="brightness-low" size={20} color="#666" />
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={localState.brightness}
            onValueChange={handleBrightnessChange}
            minimumTrackTintColor="#00ff88"
            maximumTrackTintColor="#333"
            thumbStyle={styles.sliderThumb}
            disabled={!localState.isOn}
          />
          <Icon name="brightness-high" size={20} color="#666" />
        </View>
        <Text style={styles.brightnessValue}>{localState.brightness}%</Text>
      </View>

      {/* Color Control */}
      <TouchableOpacity style={styles.colorButton} onPress={handleColorPress}>
        <LinearGradient colors={[localState.currentColor, localState.currentColor]} style={styles.colorGradient}>
          <Icon name="palette" size={24} color="#fff" />
          <Text style={styles.colorButtonText}>Choose Color</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Icon name="wb-sunny" size={24} color="#fff" />
          <Text style={styles.quickActionText}>Daylight</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Icon name="nightlight-round" size={24} color="#fff" />
          <Text style={styles.quickActionText}>Night</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Icon name="favorite" size={24} color="#fff" />
          <Text style={styles.quickActionText}>Warm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('TextDisplay')}>
          <Icon name="text-fields" size={24} color="#fff" />
          <Text style={styles.quickActionText}>Custom Text</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {localState.isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectedButton: {
    backgroundColor: '#00ff8820',
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  connectText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  connectedText: {
    color: '#00ff88',
  },
  ledPreview: {
    alignItems: 'center',
    marginVertical: 30,
  },
  ledCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    shadowColor: '#00ff88',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  powerButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
  },
  powerButtonOn: {
    backgroundColor: '#00ff88',
  },
  brightnessContainer: {
    marginVertical: 20,
  },
  brightnessLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  slider: {
    flex: 1,
    marginHorizontal: 15,
  },
  sliderThumb: {
    backgroundColor: '#00ff88',
    width: 20,
    height: 20,
  },
  brightnessValue: {
    fontSize: 16,
    color: '#00ff88',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  colorButton: {
    marginVertical: 20,
  },
  colorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
  },
  colorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 15,
    minWidth: 80,
    marginBottom: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
