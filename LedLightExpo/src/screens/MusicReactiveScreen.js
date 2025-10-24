import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import LEDController from '../classes/LEDController';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

const {width, height} = Dimensions.get('window');

const MusicReactiveScreen = () => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [sensitivity, setSensitivity] = useState(50);
  const [reactiveMode, setReactiveMode] = useState('beat');
  const [isConnected, setIsConnected] = useState(false);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);

  const reactiveModes = [
    {
      id: 'beat',
      name: 'Beat Detection',
      description: 'Responds to music beats',
      icon: 'music-note',
      colors: ['#ff0000', '#00ff00', '#0000ff']
    },
    {
      id: 'frequency',
      name: 'Frequency Analysis',
      description: 'Different colors for different frequencies',
      icon: 'equalizer',
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
    },
    {
      id: 'volume',
      name: 'Volume Reactive',
      description: 'Brightness follows volume',
      icon: 'volume-up',
      colors: ['#ffffff']
    },
    {
      id: 'spectrum',
      name: 'Spectrum Visualizer',
      description: 'Full spectrum color mapping',
      icon: 'graphic-eq',
      colors: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080']
    }
  ];

  useEffect(() => {
    checkConnectionStatus();
    return () => {
      stopAudioListening();
    };
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const connected = await LEDController.isConnected();
      setIsConnected(connected);
    } catch (error) {
      logger.error('Failed to check connection status', error);
    }
  };

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'SmartLED Controller needs microphone access to analyze music for reactive lighting effects.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        logger.error('Microphone permission error', error);
        return false;
      }
    }
    return true; // iOS handles this automatically
  };

  const startAudioListening = async () => {
    try {
      if (!isConnected) {
        Alert.alert('Not Connected', 'Please connect to an LED device first.');
        return;
      }

      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Microphone permission is required for music-reactive features.');
        return;
      }

      // Simulate audio analysis (in a real app, you'd use actual audio processing)
      setIsListening(true);
      logger.info('Music reactive mode started', {mode: reactiveMode});

      // Start simulated audio level monitoring
      startAudioSimulation();
      
      Alert.alert('Music Mode Active', 'Music-reactive lighting is now active!');
    } catch (error) {
      logger.error('Failed to start audio listening', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    }
  };

  const stopAudioListening = () => {
    setIsListening(false);
    setAudioLevel(0);
    
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    
    logger.info('Music reactive mode stopped');
  };

  const startAudioSimulation = () => {
    // Simulate audio level changes for demo purposes
    animationRef.current = setInterval(() => {
      const randomLevel = Math.random() * 100;
      setAudioLevel(randomLevel);
      
      // Send reactive commands to LED controller
      handleAudioReaction(randomLevel);
    }, 100);
  };

  const handleAudioReaction = async (level) => {
    try {
      const adjustedLevel = (level * sensitivity) / 100;
      
      switch (reactiveMode) {
        case 'beat':
          await handleBeatDetection(adjustedLevel);
          break;
        case 'frequency':
          await handleFrequencyAnalysis(adjustedLevel);
          break;
        case 'volume':
          await handleVolumeReactive(adjustedLevel);
          break;
        case 'spectrum':
          await handleSpectrumVisualizer(adjustedLevel);
          break;
      }
    } catch (error) {
      logger.error('Audio reaction failed', error);
    }
  };

  const handleBeatDetection = async (level) => {
    if (level > 70) {
      // Strong beat detected - flash bright color
      const colors = reactiveModes.find(mode => mode.id === 'beat').colors;
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      await LEDController.setColor(randomColor);
      await LEDController.setBrightness(100);
    } else if (level > 40) {
      // Medium beat - moderate brightness
      await LEDController.setBrightness(60);
    } else {
      // Low beat - dim lighting
      await LEDController.setBrightness(20);
    }
  };

  const handleFrequencyAnalysis = async (level) => {
    const colors = reactiveModes.find(mode => mode.id === 'frequency').colors;
    const colorIndex = Math.floor((level / 100) * colors.length);
    const selectedColor = colors[colorIndex] || colors[0];
    
    await LEDController.setColor(selectedColor);
    await LEDController.setBrightness(Math.min(level, 80));
  };

  const handleVolumeReactive = async (level) => {
    await LEDController.setBrightness(level);
    // Keep current color, just adjust brightness
  };

  const handleSpectrumVisualizer = async (level) => {
    const colors = reactiveModes.find(mode => mode.id === 'spectrum').colors;
    const colorIndex = Math.floor((level / 100) * colors.length);
    const selectedColor = colors[colorIndex] || colors[0];
    
    await LEDController.setColor(selectedColor);
    await LEDController.setBrightness(Math.min(level + 20, 100));
  };

  const handleModeChange = async (mode) => {
    setReactiveMode(mode.id);
    logger.info('Reactive mode changed', {mode: mode.id});
    
    if (isListening) {
      // Restart listening with new mode
      stopAudioListening();
      setTimeout(() => {
        startAudioListening();
      }, 100);
    }
  };

  const handleSensitivityChange = (value) => {
    setSensitivity(value);
    logger.info('Sensitivity changed', {sensitivity: value});
  };

  const renderModeCard = (mode) => {
    const isSelected = reactiveMode === mode.id;
    
    return (
      <TouchableOpacity
        key={mode.id}
        style={[styles.modeCard, isSelected && styles.selectedModeCard]}
        onPress={() => handleModeChange(mode)}
        activeOpacity={0.8}>
        <LinearGradient
          colors={mode.colors}
          style={styles.modeIconContainer}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <Icon name={mode.icon} size={32} color="#fff" />
        </LinearGradient>
        <View style={styles.modeInfo}>
          <Text style={styles.modeName}>{mode.name}</Text>
          <Text style={styles.modeDescription}>{mode.description}</Text>
        </View>
        {isSelected && (
          <Icon name="check-circle" size={24} color="#00ff88" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Music Reactive</Text>
        <TouchableOpacity
          style={[styles.controlButton, isListening && styles.activeButton]}
          onPress={isListening ? stopAudioListening : startAudioListening}>
          <Icon
            name={isListening ? 'stop' : 'play-arrow'}
            size={24}
            color={isListening ? '#000' : '#fff'}
          />
          <Text style={[styles.controlButtonText, isListening && styles.activeButtonText]}>
            {isListening ? 'Stop' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Audio Level Visualizer */}
        <View style={styles.visualizerSection}>
          <Text style={styles.sectionTitle}>Audio Level</Text>
          <View style={styles.visualizerContainer}>
            <LinearGradient
              colors={['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00']}
              style={styles.visualizerBar}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <View
                style={[
                  styles.visualizerLevel,
                  {width: `${audioLevel}%`}
                ]}
              />
            </LinearGradient>
            <Text style={styles.audioLevelText}>{Math.round(audioLevel)}%</Text>
          </View>
        </View>

        {/* Reactive Modes */}
        <View style={styles.modesSection}>
          <Text style={styles.sectionTitle}>Reactive Modes</Text>
          {reactiveModes.map(renderModeCard)}
        </View>

        {/* Sensitivity Control */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Sensitivity</Text>
          <View style={styles.sliderContainer}>
            <Icon name="tune" size={20} color="#666" />
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={100}
              value={sensitivity}
              onValueChange={handleSensitivityChange}
              minimumTrackTintColor="#00ff88"
              maximumTrackTintColor="#333"
              thumbStyle={styles.sliderThumb}
            />
            <Icon name="graphic-eq" size={20} color="#666" />
          </View>
          <Text style={styles.sliderValue}>{sensitivity}%</Text>
        </View>

        {/* Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <Icon name="bluetooth" size={20} color={isConnected ? '#00ff88' : '#666'} />
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Icon name="mic" size={20} color={isListening ? '#00ff88' : '#666'} />
            <Text style={styles.statusText}>
              {isListening ? 'Listening' : 'Not Listening'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: '#00ff88',
  },
  controlButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeButtonText: {
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  visualizerSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  visualizerContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  visualizerBar: {
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  visualizerLevel: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
  },
  audioLevelText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00ff88',
    textAlign: 'center',
    letterSpacing: 1,
  },
  modesSection: {
    marginBottom: 30,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  selectedModeCard: {
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  modeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 12,
    color: '#999',
  },
  controlsSection: {
    marginBottom: 30,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
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
  sliderValue: {
    fontSize: 16,
    color: '#00ff88',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  statusSection: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
});

export default MusicReactiveScreen;
