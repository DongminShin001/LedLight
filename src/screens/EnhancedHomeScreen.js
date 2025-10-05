/**
 * Enhanced HomeScreen with beautiful UI components
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
  Alert,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {
  AnimatedButton,
  AnimatedLEDPreview,
  GlassCard,
  StatusIndicator,
  SlideInView,
  FloatingActionButton,
  ProgressBar,
} from '../components/UIComponents';
import AppStateManager from '../classes/AppStateManager';
import PerformanceOptimizer from '../classes/PerformanceOptimizer';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

const {width, height} = Dimensions.get('window');

const EnhancedHomeScreen = () => {
  const navigation = useNavigation();
  const [localState, setLocalState] = useState({
    brightness: 50,
    isOn: false,
    currentColor: '#00ff88',
    isConnected: false,
    connectionState: 'disconnected',
    isLoading: false,
  });

  // Quick action buttons with gradients
  const quickActions = useMemo(() => [
    {
      id: 'daylight',
      title: 'Daylight',
      icon: 'wb-sunny',
      gradient: ['#ffa726', '#ff9800'],
      onPress: () => handleQuickAction('daylight'),
    },
    {
      id: 'night',
      title: 'Night',
      icon: 'nightlight-round',
      gradient: ['#2196f3', '#1976d2'],
      onPress: () => handleQuickAction('night'),
    },
    {
      id: 'warm',
      title: 'Warm',
      icon: 'favorite',
      gradient: ['#f44336', '#d32f2f'],
      onPress: () => handleQuickAction('warm'),
    },
    {
      id: 'text',
      title: 'Custom Text',
      icon: 'text-fields',
      gradient: ['#9c27b0', '#7b1fa2'],
      onPress: () => navigation.navigate('TextDisplay'),
    },
  ], [navigation]);

  // Optimized event handlers
  const handlePowerToggle = useCallback(
    PerformanceOptimizer.debounce.bind(
      PerformanceOptimizer,
      'powerToggle',
      async () => {
        try {
          AppStateManager.setLoading(true);
          const newPowerState = !localState.isOn;
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
          setLocalState(prev => ({...prev, brightness: value}));
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

          const devices = await PerformanceOptimizer.lazyLoad(
            'availableDevices',
            () => AppStateManager.getState().availableDevices || []
          );

          if (devices.length === 0) {
            Alert.alert('No Devices', 'No LED devices found. Please pair a device first.');
            return;
          }

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

  const handleQuickAction = useCallback((action) => {
    logger.info('Quick action triggered', {action});
    // Implement quick action logic here
  }, []);

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
            <View style={styles.titleContainer}>
              <Text style={styles.title}>LED Controller</Text>
              <Text style={styles.subtitle}>Smart Lighting Control</Text>
            </View>
            
            <GlassCard style={styles.connectionCard}>
              <View style={styles.connectionInfo}>
                <StatusIndicator status={localState.connectionState} size={16} />
                <Text style={styles.connectionText}>
                  {localState.isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
              <AnimatedButton
                title={localState.isConnected ? 'Disconnect' : 'Connect'}
                icon={localState.isConnected ? 'bluetooth-connected' : 'bluetooth'}
                onPress={handleConnect}
                gradient={localState.isConnected ? ['#ff4444', '#cc0000'] : ['#00ff88', '#00cc6a']}
                style={styles.connectButton}
                loading={localState.isLoading}
              />
            </GlassCard>
          </View>
        </SlideInView>

        {/* LED Preview */}
        <SlideInView direction="up" delay={200}>
          <View style={styles.ledPreviewContainer}>
            <AnimatedLEDPreview
              color={localState.currentColor}
              brightness={localState.brightness}
              isOn={localState.isOn}
              size={140}
            />
            <Text style={styles.statusText}>{localState.isOn ? 'ON' : 'OFF'}</Text>
            <Text style={styles.brightnessText}>{localState.brightness}%</Text>
          </View>
        </SlideInView>

        {/* Power Control */}
        <SlideInView direction="up" delay={400}>
          <GlassCard style={styles.controlCard}>
            <Text style={styles.controlTitle}>Power Control</Text>
            <View style={styles.powerContainer}>
              <AnimatedButton
                title={localState.isOn ? 'Turn Off' : 'Turn On'}
                icon={localState.isOn ? 'power-off' : 'power'}
                onPress={handlePowerToggle}
                gradient={localState.isOn ? ['#ff4444', '#cc0000'] : ['#00ff88', '#00cc6a']}
                style={styles.powerButton}
                loading={localState.isLoading}
              />
            </View>
          </GlassCard>
        </SlideInView>

        {/* Brightness Control */}
        <SlideInView direction="up" delay={600}>
          <GlassCard style={styles.controlCard}>
            <Text style={styles.controlTitle}>Brightness Control</Text>
            <View style={styles.brightnessContainer}>
              <View style={styles.brightnessHeader}>
                <Icon name="brightness-low" size={20} color="#666" />
                <Text style={styles.brightnessLabel}>Brightness</Text>
                <Icon name="brightness-high" size={20} color="#666" />
              </View>
              
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={localState.brightness}
                onValueChange={handleBrightnessChange}
                minimumTrackTintColor={localState.currentColor}
                maximumTrackTintColor="rgba(255,255,255,0.2)"
                thumbStyle={styles.sliderThumb}
                disabled={!localState.isOn}
              />
              
              <ProgressBar
                progress={localState.brightness}
                color={localState.currentColor}
                height={6}
                animated={true}
              />
            </View>
          </GlassCard>
        </SlideInView>

        {/* Color Control */}
        <SlideInView direction="up" delay={800}>
          <GlassCard style={styles.controlCard}>
            <Text style={styles.controlTitle}>Color Control</Text>
            <AnimatedButton
              title="Choose Color"
              icon="palette"
              onPress={() => navigation.navigate('ColorPicker')}
              gradient={[localState.currentColor, localState.currentColor]}
              style={styles.colorButton}
            />
          </GlassCard>
        </SlideInView>

        {/* Quick Actions */}
        <SlideInView direction="up" delay={1000}>
          <GlassCard style={styles.quickActionsCard}>
            <Text style={styles.controlTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <AnimatedButton
                  key={action.id}
                  title={action.title}
                  icon={action.icon}
                  onPress={action.onPress}
                  gradient={action.gradient}
                  style={styles.quickActionButton}
                />
              ))}
            </View>
          </GlassCard>
        </SlideInView>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="settings"
        color="#00ff88"
        onPress={() => navigation.navigate('Settings')}
      />
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  connectionCard: {
    padding: 15,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  connectionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  connectButton: {
    marginTop: 10,
  },
  ledPreviewContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  brightnessText: {
    fontSize: 18,
    color: '#00ff88',
    marginTop: 5,
    fontWeight: '600',
  },
  controlCard: {
    marginBottom: 20,
    padding: 20,
  },
  controlTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  powerContainer: {
    alignItems: 'center',
  },
  powerButton: {
    minWidth: 200,
  },
  brightnessContainer: {
    marginTop: 10,
  },
  brightnessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  brightnessLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  slider: {
    height: 40,
    marginBottom: 10,
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
  colorButton: {
    marginTop: 10,
  },
  quickActionsCard: {
    marginBottom: 20,
    padding: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 80) / 2,
    marginBottom: 15,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default EnhancedHomeScreen;
