/**
 * Enhanced TextDisplayScreen with beautiful UI
 * Modern design with animations and better visual appeal
 */

import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
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
import TextManager from '../classes/TextManager';
import DeviceManager from '../classes/DeviceManager';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

const {width} = Dimensions.get('window');

const EnhancedTextDisplayScreen = () => {
  const navigation = useNavigation();
  const [localState, setLocalState] = useState({
    text: '',
    color: '#00ff88',
    brightness: 50,
    speed: 50,
    animation: 'scroll',
    isConnected: false,
    connectionState: 'disconnected',
    isLoading: false,
    isPlaying: false,
  });

  // Animation options
  const animations = useMemo(() => [
    {
      id: 'scroll',
      name: 'Scroll',
      icon: 'arrow-forward',
      description: 'Text scrolls from right to left',
    },
    {
      id: 'bounce',
      name: 'Bounce',
      icon: 'sports-basketball',
      description: 'Text bounces up and down',
    },
    {
      id: 'fade',
      name: 'Fade',
      icon: 'visibility',
      description: 'Text fades in and out',
    },
    {
      id: 'rainbow',
      name: 'Rainbow',
      icon: 'palette',
      description: 'Text cycles through colors',
    },
    {
      id: 'flash',
      name: 'Flash',
      icon: 'flash-on',
      description: 'Text flashes on and off',
    },
    {
      id: 'wave',
      name: 'Wave',
      icon: 'waves',
      description: 'Text moves in wave pattern',
    },
  ], []);

  // Color options for text
  const textColors = useMemo(() => [
    {id: 'green', color: '#00ff88', name: 'Green'},
    {id: 'red', color: '#ff4444', name: 'Red'},
    {id: 'blue', color: '#2196f3', name: 'Blue'},
    {id: 'yellow', color: '#ffeb3b', name: 'Yellow'},
    {id: 'purple', color: '#9c27b0', name: 'Purple'},
    {id: 'orange', color: '#ff9800', name: 'Orange'},
    {id: 'pink', color: '#e91e63', name: 'Pink'},
    {id: 'cyan', color: '#00bcd4', name: 'Cyan'},
    {id: 'white', color: '#ffffff', name: 'White'},
    {id: 'rainbow', color: 'rainbow', name: 'Rainbow'},
  ], []);

  // Speed presets
  const speedPresets = useMemo(() => [
    {id: 'slow', name: 'Slow', value: 20, icon: 'slow-motion-video'},
    {id: 'normal', name: 'Normal', value: 50, icon: 'play-arrow'},
    {id: 'fast', name: 'Fast', value: 80, icon: 'fast-forward'},
  ], []);

  const handleTextChange = useCallback((text) => {
    setLocalState(prev => ({...prev, text}));
  }, []);

  const handleColorSelect = useCallback((color) => {
    setLocalState(prev => ({...prev, color}));
  }, []);

  const handleBrightnessChange = useCallback((value) => {
    setLocalState(prev => ({...prev, brightness: value}));
  }, []);

  const handleSpeedChange = useCallback((value) => {
    setLocalState(prev => ({...prev, speed: value}));
  }, []);

  const handleAnimationSelect = useCallback((animation) => {
    setLocalState(prev => ({...prev, animation}));
  }, []);

  const handleSendText = useCallback(async () => {
    try {
      if (!localState.text.trim()) {
        Alert.alert('Error', 'Please enter some text to display');
        return;
      }

      setLocalState(prev => ({...prev, isLoading: true}));

      const textConfig = {
        text: localState.text,
        color: localState.color,
        brightness: localState.brightness,
        speed: localState.speed,
        animation: localState.animation,
      };

      const success = await TextManager.sendText(textConfig);
      if (success) {
        setLocalState(prev => ({...prev, isPlaying: true}));
        logger.info('Text sent successfully', textConfig);
        Alert.alert('Success', 'Text is now displaying on your LED device!');
      } else {
        throw new Error('Failed to send text');
      }
    } catch (error) {
      logger.error('Text sending failed', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    } finally {
      setLocalState(prev => ({...prev, isLoading: false}));
    }
  }, [localState.text, localState.color, localState.brightness, localState.speed, localState.animation]);

  const handleStopText = useCallback(async () => {
    try {
      setLocalState(prev => ({...prev, isLoading: true}));

      const success = await TextManager.stopText();
      if (success) {
        setLocalState(prev => ({...prev, isPlaying: false}));
        logger.info('Text stopped successfully');
      } else {
        throw new Error('Failed to stop text');
      }
    } catch (error) {
      logger.error('Text stop failed', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    } finally {
      setLocalState(prev => ({...prev, isLoading: false}));
    }
  }, []);

  const handleSpeedPreset = useCallback((preset) => {
    setLocalState(prev => ({...prev, speed: preset.value}));
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
        isPlaying: false,
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
              <Text style={styles.title}>Custom Text</Text>
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

        {/* Text Input */}
        <SlideInView direction="up" delay={200}>
          <GlassCard style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Enter Your Text</Text>
            <TextInput
              style={styles.textInput}
              value={localState.text}
              onChangeText={handleTextChange}
              placeholder="Type your message here..."
              placeholderTextColor="#666"
              multiline
              maxLength={100}
            />
            <Text style={styles.characterCount}>
              {localState.text.length}/100 characters
            </Text>
          </GlassCard>
        </SlideInView>

        {/* Text Preview */}
        <SlideInView direction="up" delay={400}>
          <GlassCard style={styles.previewCard}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewContainer}>
              <Text
                style={[
                  styles.previewText,
                  {
                    color: localState.color === 'rainbow' ? '#00ff88' : localState.color,
                    opacity: localState.brightness / 100,
                  },
                ]}>
                {localState.text || 'Your text will appear here...'}
              </Text>
            </View>
          </GlassCard>
        </SlideInView>

        {/* Color Selection */}
        <SlideInView direction="up" delay={600}>
          <GlassCard style={styles.controlCard}>
            <Text style={styles.sectionTitle}>Text Color</Text>
            <View style={styles.colorsGrid}>
              {textColors.map((colorOption) => (
                <TouchableOpacity
                  key={colorOption.id}
                  style={[
                    styles.colorOption,
                    {backgroundColor: colorOption.color === 'rainbow' ? '#9c27b0' : colorOption.color},
                    localState.color === colorOption.color && styles.selectedColorOption,
                  ]}
                  onPress={() => handleColorSelect(colorOption.color)}>
                  <Text style={styles.colorOptionText}>{colorOption.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </SlideInView>

        {/* Brightness Control */}
        <SlideInView direction="up" delay={800}>
          <GlassCard style={styles.controlCard}>
            <Text style={styles.sectionTitle}>Brightness</Text>
            <View style={styles.brightnessContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={localState.brightness}
                onValueChange={handleBrightnessChange}
                minimumTrackTintColor={localState.color === 'rainbow' ? '#00ff88' : localState.color}
                maximumTrackTintColor="rgba(255,255,255,0.2)"
                thumbStyle={styles.sliderThumb}
              />
              <ProgressBar
                progress={localState.brightness}
                color={localState.color === 'rainbow' ? '#00ff88' : localState.color}
                height={8}
                animated={true}
              />
              <Text style={styles.brightnessValue}>{localState.brightness}%</Text>
            </View>
          </GlassCard>
        </SlideInView>

        {/* Speed Control */}
        <SlideInView direction="up" delay={1000}>
          <GlassCard style={styles.controlCard}>
            <Text style={styles.sectionTitle}>Animation Speed</Text>
            
            {/* Speed Presets */}
            <View style={styles.speedPresets}>
              {speedPresets.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.speedPreset,
                    localState.speed === preset.value && styles.selectedSpeedPreset,
                  ]}
                  onPress={() => handleSpeedPreset(preset)}>
                  <Icon name={preset.icon} size={20} color="#fff" />
                  <Text style={styles.speedPresetText}>{preset.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Speed Slider */}
            <View style={styles.speedContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={localState.speed}
                onValueChange={handleSpeedChange}
                minimumTrackTintColor="#00ff88"
                maximumTrackTintColor="rgba(255,255,255,0.2)"
                thumbStyle={styles.sliderThumb}
              />
              <Text style={styles.speedValue}>{localState.speed}%</Text>
            </View>
          </GlassCard>
        </SlideInView>

        {/* Animation Selection */}
        <SlideInView direction="up" delay={1200}>
          <GlassCard style={styles.controlCard}>
            <Text style={styles.sectionTitle}>Animation Style</Text>
            <View style={styles.animationsGrid}>
              {animations.map((animation) => (
                <TouchableOpacity
                  key={animation.id}
                  style={[
                    styles.animationOption,
                    localState.animation === animation.id && styles.selectedAnimationOption,
                  ]}
                  onPress={() => handleAnimationSelect(animation.id)}>
                  <Icon name={animation.icon} size={24} color="#fff" />
                  <Text style={styles.animationName}>{animation.name}</Text>
                  <Text style={styles.animationDescription}>{animation.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </SlideInView>

        {/* Control Buttons */}
        <SlideInView direction="up" delay={1400}>
          <View style={styles.controlButtons}>
            <AnimatedButton
              title={localState.isPlaying ? 'Stop Text' : 'Send Text'}
              icon={localState.isPlaying ? 'stop' : 'send'}
              onPress={localState.isPlaying ? handleStopText : handleSendText}
              gradient={localState.isPlaying ? ['#ff4444', '#cc0000'] : ['#00ff88', '#00cc6a']}
              style={styles.controlButton}
              loading={localState.isLoading}
              disabled={!localState.isConnected}
            />
          </View>
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
  inputCard: {
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
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  characterCount: {
    color: '#999',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  previewCard: {
    marginBottom: 20,
    padding: 20,
  },
  previewContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  previewText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  controlCard: {
    marginBottom: 20,
    padding: 20,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: (width - 80) / 3,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#fff',
    transform: [{scale: 1.05}],
  },
  colorOptionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  brightnessContainer: {
    marginTop: 10,
  },
  brightnessValue: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
  speedPresets: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  speedPreset: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSpeedPreset: {
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0,255,136,0.2)',
  },
  speedPresetText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  speedContainer: {
    marginTop: 10,
  },
  speedValue: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  animationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  animationOption: {
    width: (width - 80) / 2,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAnimationOption: {
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0,255,136,0.2)',
  },
  animationName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  animationDescription: {
    color: '#999',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  controlButtons: {
    marginBottom: 20,
  },
  controlButton: {
    marginBottom: 15,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default EnhancedTextDisplayScreen;
