import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Alert} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import LEDController from '../classes/LEDController';
import DeviceManager from '../classes/DeviceManager';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

const {width, height} = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [isConnected, setIsConnected] = useState(false);
  const [brightness, setBrightness] = useState(50);
  const [isOn, setIsOn] = useState(false);
  const [currentColor, setCurrentColor] = useState('#00ff88');
  const [connectionState, setConnectionState] = useState('disconnected');

  useEffect(() => {
    // Initialize device manager and LED controller
    const initializeControllers = async () => {
      try {
        await DeviceManager.initialize();
        updateConnectionState();
      } catch (error) {
        logger.error('Failed to initialize controllers', error);
        const userMessage = ErrorHandler.getUserFriendlyMessage(error);
        Alert.alert('Initialization Error', userMessage);
      }
    };

    initializeControllers();

    // Set up event listeners
    const handleDeviceConnected = device => {
      setIsConnected(true);
      setConnectionState('connected');
      logger.info('Device connected in HomeScreen', {device: device.name});
    };

    const handleDeviceDisconnected = () => {
      setIsConnected(false);
      setConnectionState('disconnected');
      logger.info('Device disconnected in HomeScreen');
    };

    const handleConnectionError = error => {
      setConnectionState('error');
      logger.error('Connection error in HomeScreen', error);
    };

    const handlePowerChanged = isPoweredOn => {
      setIsOn(isPoweredOn);
      logger.info('Power state changed in HomeScreen', {isPoweredOn});
    };

    const handleColorChanged = color => {
      setCurrentColor(color);
      logger.info('Color changed in HomeScreen', {color});
    };

    const handleBrightnessChanged = brightnessValue => {
      setBrightness(brightnessValue);
      logger.info('Brightness changed in HomeScreen', {brightness: brightnessValue});
    };

    // Add listeners
    DeviceManager.addListener('deviceConnected', handleDeviceConnected);
    DeviceManager.addListener('deviceDisconnected', handleDeviceDisconnected);
    DeviceManager.addListener('connectionError', handleConnectionError);
    LEDController.addListener('powerChanged', handlePowerChanged);
    LEDController.addListener('colorChanged', handleColorChanged);
    LEDController.addListener('brightnessChanged', handleBrightnessChanged);

    // Cleanup
    return () => {
      DeviceManager.removeListener('deviceConnected', handleDeviceConnected);
      DeviceManager.removeListener('deviceDisconnected', handleDeviceDisconnected);
      DeviceManager.removeListener('connectionError', handleConnectionError);
      LEDController.removeListener('powerChanged', handlePowerChanged);
      LEDController.removeListener('colorChanged', handleColorChanged);
      LEDController.removeListener('brightnessChanged', handleBrightnessChanged);
    };
  }, []);

  const updateConnectionState = () => {
    const state = DeviceManager.getConnectionState();
    const connected = DeviceManager.isDeviceConnected();
    setConnectionState(state);
    setIsConnected(connected);
  };

  const handlePowerToggle = async () => {
    try {
      const newPowerState = !isOn;
      const success = await LEDController.setPower(newPowerState);

      if (success) {
        setIsOn(newPowerState);
        logger.info('Power toggle successful', {isOn: newPowerState});
      } else {
        throw new Error('Failed to toggle power');
      }
    } catch (error) {
      logger.error('Power toggle failed', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    }
  };

  const handleBrightnessChange = async value => {
    try {
      const success = await LEDController.setBrightness(value);

      if (success) {
        setBrightness(value);
        logger.info('Brightness change successful!!', {brightness: value});
      } else {
        throw new Error('Failed to change brightness');
      }
    } catch (error) {
      logger.error('Brightness change failed', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    }
  };

  const handleColorPress = () => {
    navigation.navigate('ColorPicker');
  };

  const handleConnect = async () => {
    try {
      if (isConnected) {
        await DeviceManager.disconnect();
        return;
      }

      // Show device selection
      const devices = await DeviceManager.scanForDevices();

      if (devices.length === 0) {
        Alert.alert('No Devices', 'No LED devices found. Please pair a device first.');
        return;
      }

      // For simplicity, connect to the first available device
      // In a real app, you'd show a device selection dialog
      const device = devices[0];
      await DeviceManager.connectToDevice(device);
    } catch (error) {
      logger.error('Connection failed', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Connection Error', userMessage);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SmartLED Controller</Text>
        <TouchableOpacity
          style={[styles.connectButton, isConnected && styles.connectedButton]}
          onPress={handleConnect}>
          <Icon
            name={isConnected ? 'bluetooth-connected' : 'bluetooth'}
            size={24}
            color={isConnected ? '#00ff88' : '#fff'}
          />
          <Text style={[styles.connectText, isConnected && styles.connectedText]}>
            {isConnected ? 'Connected' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LED Preview */}
      <View style={styles.ledPreview}>
        <View
          style={[
            styles.ledCircle,
            {
              backgroundColor: isOn ? currentColor : '#333',
              opacity: isOn ? brightness / 100 : 0.3,
            },
          ]}
        />
        <Text style={styles.statusText}>{isOn ? 'ON' : 'OFF'}</Text>
      </View>

      {/* Power Button */}
      <TouchableOpacity
        style={[styles.powerButton, isOn && styles.powerButtonOn]}
        onPress={handlePowerToggle}>
        <Icon name={isOn ? 'power-off' : 'power'} size={40} color={isOn ? '#000' : '#fff'} />
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
            value={brightness}
            onValueChange={handleBrightnessChange}
            minimumTrackTintColor="#00ff88"
            maximumTrackTintColor="#333"
            thumbStyle={styles.sliderThumb}
            disabled={!isOn}
          />
          <Icon name="brightness-high" size={20} color="#666" />
        </View>
        <Text style={styles.brightnessValue}>{brightness}%</Text>
      </View>

      {/* Color Control */}
      <TouchableOpacity style={styles.colorButton} onPress={handleColorPress}>
        <LinearGradient colors={[currentColor, currentColor]} style={styles.colorGradient}>
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

      {/* Advanced Features */}
      <View style={styles.advancedFeatures}>
        <Text style={styles.advancedTitle}>Advanced Features</Text>
        <View style={styles.featureGrid}>
          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => navigation.navigate('AdvancedEffects')}>
            <LinearGradient colors={['#ff6b6b', '#ff8e8e']} style={styles.featureGradient}>
              <Icon name="auto-awesome" size={32} color="#fff" />
              <Text style={styles.featureText}>Advanced Effects</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => navigation.navigate('MusicReactive')}>
            <LinearGradient colors={['#4ecdc4', '#44a08d']} style={styles.featureGradient}>
              <Icon name="music-note" size={32} color="#fff" />
              <Text style={styles.featureText}>Music Reactive</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => navigation.navigate('Scheduling')}>
            <LinearGradient colors={['#45b7d1', '#96c93d']} style={styles.featureGradient}>
              <Icon name="schedule" size={32} color="#fff" />
              <Text style={styles.featureText}>Scheduling</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => navigation.navigate('DeviceManagement')}>
            <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.featureGradient}>
              <Icon name="devices" size={32} color="#fff" />
              <Text style={styles.featureText}>Device Management</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => navigation.navigate('Analytics')}>
            <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.featureGradient}>
              <Icon name="analytics" size={32} color="#fff" />
              <Text style={styles.featureText}>Analytics</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => navigation.navigate('ColorPicker')}>
            <LinearGradient colors={['#fa709a', '#fee140']} style={styles.featureGradient}>
              <Icon name="palette" size={32} color="#fff" />
              <Text style={styles.featureText}>Color Picker</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  connectedButton: {
    backgroundColor: '#00ff8815',
    borderWidth: 2,
    borderColor: '#00ff88',
    shadowColor: '#00ff88',
    shadowOpacity: 0.4,
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
    marginVertical: 40,
  },
  ledCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 20,
    shadowColor: '#00ff88',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  powerButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  powerButtonOn: {
    backgroundColor: '#00ff88',
    shadowColor: '#00ff88',
    shadowOpacity: 0.6,
  },
  brightnessContainer: {
    marginVertical: 30,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  brightnessLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  slider: {
    flex: 1,
    marginHorizontal: 20,
  },
  sliderThumb: {
    backgroundColor: '#00ff88',
    width: 24,
    height: 24,
    shadowColor: '#00ff88',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  brightnessValue: {
    fontSize: 20,
    color: '#00ff88',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  colorButton: {
    marginVertical: 30,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  colorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 25,
  },
  colorButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 18,
    minWidth: 85,
    marginBottom: 12,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  advancedFeatures: {
    marginTop: 40,
    marginBottom: 30,
  },
  advancedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureButton: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  featureGradient: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  featureText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default HomeScreen;
