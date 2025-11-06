import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import LEDController from '../classes/LEDController';
import DeviceManager from '../classes/DeviceManager';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';
import {useTheme} from '../hooks/useTheme';
import SafetyDisclaimer, {shouldShowDisclaimer} from '../components/SafetyDisclaimer';
import haptic from '../utils/HapticFeedback';
import {ToastManager} from '../components/Toast';

const {width, height} = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const {theme, isLoading: themeLoading} = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [brightness, setBrightness] = useState(50);
  const [isOn, setIsOn] = useState(false);
  const [currentColor, setCurrentColor] = useState('#00ff88');
  const [connectionState, setConnectionState] = useState('disconnected');
  const [showSafetyDisclaimer, setShowSafetyDisclaimer] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

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
    // Check if we should show safety disclaimer
    const shouldShow = await shouldShowDisclaimer();
    if (shouldShow) {
      setPendingAction(() => () => executePowerToggle());
      setShowSafetyDisclaimer(true);
      return;
    }

    executePowerToggle();
  };

  const executePowerToggle = async () => {
    try {
      const newPowerState = !isOn;
      haptic.medium(); // Haptic feedback

      // Additional safety confirmation for turning ON
      if (newPowerState) {
        Alert.alert(
          '⚠️ Safety Confirmation',
          'Before turning on LED devices:\n\n' +
            '• Ensure all installations are by licensed electricians\n' +
            '• Verify all connections are secure\n' +
            '• Confirm proper circuit protection is in place\n\n' +
            'Continue?',
          [
            {text: 'Cancel', style: 'cancel', onPress: () => haptic.light()},
            {
              text: 'Turn ON',
              style: 'default',
              onPress: async () => {
                try {
                  haptic.heavy();
                  await LEDController.setPower(newPowerState);
                  setIsOn(newPowerState);
                  logger.info('Power toggled', {isOn: newPowerState});
                  ToastManager.success('LED lights turned ON');
                } catch (error) {
                  logger.error('Failed to toggle power', error);
                  haptic.error();
                  const userMessage = ErrorHandler.getUserFriendlyMessage(error);
                  ToastManager.error(userMessage);
                  Alert.alert('Power Control Error', userMessage);
                }
              },
            },
          ],
        );
      } else {
        // Turning OFF doesn't need extra confirmation
        haptic.heavy();
        await LEDController.setPower(newPowerState);
        setIsOn(newPowerState);
        logger.info('Power toggled', {isOn: newPowerState});
        ToastManager.info('LED lights turned OFF');
      }
    } catch (error) {
      logger.error('Failed to toggle power', error);
      haptic.error();
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      ToastManager.error(userMessage);
      Alert.alert('Power Control Error', userMessage);
    }
  };

  const handleBrightnessChange = async value => {
    try {
      await LEDController.setBrightness(value);
      setBrightness(value);
      logger.info('Brightness changed', {brightness: value});
      // Light haptic at 0%, 25%, 50%, 75%, 100%
      if (value % 25 === 0) {
        haptic.soft();
      }
    } catch (error) {
      logger.error('Failed to change brightness', error);
      haptic.error();
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      ToastManager.error(userMessage);
      Alert.alert('Brightness Control Error', userMessage);
    }
  };

  const handleColorPress = () => {
    haptic.light();
    navigation.navigate('ColorPicker');
  };

  const handleConnect = async () => {
    try {
      haptic.light(); // Haptic feedback on button press
      
      if (isConnected) {
        await DeviceManager.disconnect();
        setIsConnected(false);
        setConnectionState('disconnected');
        logger.info('Device disconnected');
        haptic.medium();
        ToastManager.info('Device disconnected');
      } else {
        ToastManager.info('Connecting to device...');
        await DeviceManager.connect();
        // Connection state will be updated via event listener
        logger.info('Attempting to connect to device');
        haptic.success();
        ToastManager.success('Device connected successfully!');
      }
    } catch (error) {
      logger.error('Connection error', error);
      haptic.error();
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      ToastManager.error(userMessage);
      Alert.alert('Connection Error', userMessage);
    }
  };

  if (themeLoading) {
    return (
      <View
        style={[styles.loadingContainer, {backgroundColor: theme?.colors?.background || '#000'}]}>
        <Text style={[styles.loadingText, {color: theme?.colors?.text || '#fff'}]}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, {backgroundColor: theme.colors.background}]}
        showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

        {/* Header Section */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.headerGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <View style={styles.headerContent}>
              <Icon name="lightbulb" size={32} color="#fff" />
              <Text style={styles.headerTitle}>SmartLED Controller</Text>
              <Text style={styles.headerSubtitle}>Control your LED lights with style</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Connection Status Card */}
        <Animated.View
          style={[
            styles.card,
            styles.statusCard,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}, {scale: scaleAnim}],
            },
          ]}>
          <View style={styles.cardHeader}>
            <Icon
              name={isConnected ? 'bluetooth-connected' : 'bluetooth-disabled'}
              size={24}
              color={isConnected ? theme.colors.success : theme.colors.error}
            />
            <Text style={[styles.cardTitle, {color: theme.colors.text}]}>Device Status</Text>
          </View>
          <Text style={[styles.statusText, {color: theme.colors.textSecondary}]}>
            {isConnected ? 'Connected to LED Device' : 'No device connected'}
          </Text>
          <TouchableOpacity
            style={[
              styles.connectButton,
              {backgroundColor: isConnected ? theme.colors.success : theme.colors.primary},
            ]}
            onPress={handleConnect}>
            <Text style={styles.buttonText}>{isConnected ? 'Disconnect' : 'Connect Device'}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Power Control Card */}
        <Animated.View
          style={[
            styles.card,
            styles.controlCard,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}, {scale: scaleAnim}],
            },
          ]}>
          <View style={styles.cardHeader}>
            <Icon name="power-settings-new" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, {color: theme.colors.text}]}>Power Control</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.powerButton,
              {
                backgroundColor: isOn ? theme.colors.success : theme.colors.error,
                shadowColor: isOn ? theme.colors.success : theme.colors.error,
              },
            ]}
            onPress={handlePowerToggle}
            disabled={!isConnected}>
            <Icon name={isOn ? 'power' : 'power-off'} size={32} color="#fff" />
            <Text style={styles.powerButtonText}>{isOn ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Brightness Control Card */}
        <Animated.View
          style={[
            styles.card,
            styles.controlCard,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}, {scale: scaleAnim}],
            },
          ]}>
          <View style={styles.cardHeader}>
            <Icon name="brightness-6" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, {color: theme.colors.text}]}>
              Brightness: {brightness}%
            </Text>
          </View>

          <View style={styles.sliderContainer}>
            <Icon name="brightness-1" size={20} color={theme.colors.textSecondary} />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={brightness}
              onValueChange={setBrightness}
              onSlidingComplete={handleBrightnessChange}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.textMuted}
              thumbStyle={{backgroundColor: theme.colors.primary}}
              disabled={!isConnected || !isOn}
            />
            <Icon name="brightness-7" size={20} color={theme.colors.textSecondary} />
          </View>
        </Animated.View>

        {/* Color Control Card */}
        <Animated.View
          style={[
            styles.card,
            styles.colorCard,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}, {scale: scaleAnim}],
            },
          ]}>
          <View style={styles.cardHeader}>
            <Icon name="palette" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, {color: theme.colors.text}]}>Color Control</Text>
          </View>

          <View style={styles.colorPreviewContainer}>
            <View style={[styles.colorPreview, {backgroundColor: currentColor}]} />
            <Text style={[styles.colorText, {color: theme.colors.text}]}>
              {currentColor.toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.colorButton, {backgroundColor: theme.colors.primary}]}
            onPress={() => navigation.navigate('ColorPicker')}
            disabled={!isConnected || !isOn}>
            <Icon name="color-lens" size={20} color="#fff" />
            <Text style={styles.buttonText}>Choose Color</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions Card */}
        <Animated.View
          style={[
            styles.card,
            styles.actionsCard,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}, {scale: scaleAnim}],
            },
          ]}>
          <View style={styles.cardHeader}>
            <Icon name="flash-on" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, {color: theme.colors.text}]}>Quick Actions</Text>
          </View>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionButton, {backgroundColor: theme.colors.surface}]}
              onPress={() => navigation.navigate('DirectionalEffects')}>
              <Icon name="arrow-forward" size={24} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, {color: theme.colors.text}]}>Running</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, {backgroundColor: theme.colors.surface}]}
              onPress={() => navigation.navigate('Effects')}>
              <Icon name="auto-fix-high" size={24} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, {color: theme.colors.text}]}>Effects</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, {backgroundColor: theme.colors.surface}]}
              onPress={() => navigation.navigate('Presets')}>
              <Icon name="bookmark" size={24} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, {color: theme.colors.text}]}>Presets</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, {backgroundColor: theme.colors.surface}]}
              onPress={() => navigation.navigate('TextDisplay')}>
              <Icon name="text-fields" size={24} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, {color: theme.colors.text}]}>Text</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, {backgroundColor: theme.colors.surface}]}
              onPress={() => navigation.navigate('ThemeSelection')}>
              <Icon name="palette" size={24} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, {color: theme.colors.text}]}>Themes</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Advanced Features Card */}
        <Animated.View
          style={[
            styles.card,
            styles.advancedCard,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}, {scale: scaleAnim}],
            },
          ]}>
          <View style={styles.cardHeader}>
            <Icon name="settings" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, {color: theme.colors.text}]}>Advanced Features</Text>
          </View>

          <View style={styles.advancedActions}>
            <TouchableOpacity
              style={[styles.advancedButton, {backgroundColor: theme.colors.surface}]}
              onPress={() => navigation.navigate('AdvancedEffects')}>
              <Icon name="auto-awesome" size={20} color={theme.colors.primary} />
              <Text style={[styles.advancedButtonText, {color: theme.colors.text}]}>
                Advanced Effects
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.advancedButton, {backgroundColor: theme.colors.surface}]}
              onPress={() => navigation.navigate('MusicReactive')}>
              <Icon name="music-note" size={20} color={theme.colors.primary} />
              <Text style={[styles.advancedButtonText, {color: theme.colors.text}]}>
                Music Reactive
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.advancedButton, {backgroundColor: theme.colors.surface}]}
              onPress={() => navigation.navigate('Scheduling')}>
              <Icon name="schedule" size={20} color={theme.colors.primary} />
              <Text style={[styles.advancedButtonText, {color: theme.colors.text}]}>
                Scheduling
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.advancedButton, {backgroundColor: theme.colors.surface}]}
              onPress={() => navigation.navigate('DeviceManagement')}>
              <Icon name="devices" size={20} color={theme.colors.primary} />
              <Text style={[styles.advancedButtonText, {color: theme.colors.text}]}>
                Device Management
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Safety Disclaimer Modal */}
      <SafetyDisclaimer
        visible={showSafetyDisclaimer}
        onAccept={() => {
          setShowSafetyDisclaimer(false);
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
        onDecline={() => {
          setShowSafetyDisclaimer(false);
          setPendingAction(null);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  headerSection: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  statusCard: {
    backgroundColor: '#fff',
  },
  controlCard: {
    backgroundColor: '#fff',
  },
  colorCard: {
    backgroundColor: '#fff',
  },
  actionsCard: {
    backgroundColor: '#fff',
  },
  advancedCard: {
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  connectButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  powerButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  powerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
  },
  colorPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  colorText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 80) / 2,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  advancedActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  advancedButton: {
    width: (width - 80) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  advancedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;
