import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
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

const {width, height} = Dimensions.get('window');

const DirectionalEffectsScreen = () => {
  const navigation = useNavigation();
  const {theme} = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [activeEffect, setActiveEffect] = useState(null);
  const [speed, setSpeed] = useState(50); // 0-100
  const [direction, setDirection] = useState('right'); // 'left', 'right', 'bounce'
  const [selectedColor, setSelectedColor] = useState('#00ff88');
  const [trailLength, setTrailLength] = useState(5); // 1-10
  const [isPlaying, setIsPlaying] = useState(false);
  const effectIntervalRef = useRef(null);
  const positionRef = useRef(0);
  const directionRef = useRef(1); // 1 for right, -1 for left

  const effects = [
    {
      id: 'chase',
      name: 'Chase',
      description: 'Single LED runs across strip',
      icon: 'arrow-forward',
      preview: ['⚫', '⚫', '⚫', '🟢', '⚫', '⚫', '⚫', '⚫'],
    },
    {
      id: 'wave',
      name: 'Wave',
      description: 'Smooth color wave',
      icon: 'waves',
      preview: ['🟢', '🟡', '🟠', '🔴', '🟣', '🔵', '🔵', '🔵'],
    },
    {
      id: 'scanner',
      name: 'Scanner (KITT)',
      description: 'Knight Rider style scanner',
      icon: 'remove-red-eye',
      preview: ['⚫', '🔴', '🔴', '🔴', '⚫', '⚫', '⚫', '⚫'],
    },
    {
      id: 'comet',
      name: 'Comet',
      description: 'Comet with fading tail',
      icon: 'brightness-1',
      preview: ['⚫', '⚫', '⚫', '🟢', '🟡', '⚫', '⚫', '⚫'],
    },
    {
      id: 'theater',
      name: 'Theater Chase',
      description: 'Every 3rd LED lights up',
      icon: 'theaters',
      preview: ['🟢', '⚫', '⚫', '🟢', '⚫', '⚫', '🟢', '⚫'],
    },
    {
      id: 'rainbow_chase',
      name: 'Rainbow Chase',
      description: 'Rainbow colors running',
      icon: 'palette',
      preview: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚫'],
    },
    {
      id: 'dual',
      name: 'Dual Chase',
      description: 'Two LEDs chase each other',
      icon: 'compare-arrows',
      preview: ['🟢', '⚫', '⚫', '⚫', '🔴', '⚫', '⚫', '⚫'],
    },
    {
      id: 'fill',
      name: 'Fill',
      description: 'Progressively fills strip',
      icon: 'trending-up',
      preview: ['🟢', '🟢', '🟢', '🟢', '⚫', '⚫', '⚫', '⚫'],
    },
  ];

  useEffect(() => {
    checkConnection();
    return () => {
      stopEffect();
    };
  }, []);

  const checkConnection = async () => {
    try {
      const connected = DeviceManager.isDeviceConnected();
      setIsConnected(connected);
    } catch (error) {
      logger.error('Connection check failed', error);
    }
  };

  const startEffect = (effect) => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to a device first.');
      return;
    }

    stopEffect(); // Stop any running effect
    setActiveEffect(effect.id);
    setIsPlaying(true);
    positionRef.current = 0;
    directionRef.current = direction === 'left' ? -1 : 1;

    // Calculate interval based on speed (0-100 maps to 200ms-10ms)
    const interval = 200 - (speed * 1.9);

    effectIntervalRef.current = setInterval(() => {
      runEffectFrame(effect.id);
    }, interval);

    logger.info('Directional effect started', {
      effect: effect.id,
      speed,
      direction,
      color: selectedColor,
    });
  };

  const stopEffect = () => {
    if (effectIntervalRef.current) {
      clearInterval(effectIntervalRef.current);
      effectIntervalRef.current = null;
    }
    setIsPlaying(false);
    setActiveEffect(null);
    positionRef.current = 0;
  };

  const runEffectFrame = async (effectId) => {
    try {
      switch (effectId) {
        case 'chase':
          await runChaseEffect();
          break;
        case 'wave':
          await runWaveEffect();
          break;
        case 'scanner':
          await runScannerEffect();
          break;
        case 'comet':
          await runCometEffect();
          break;
        case 'theater':
          await runTheaterChaseEffect();
          break;
        case 'rainbow_chase':
          await runRainbowChaseEffect();
          break;
        case 'dual':
          await runDualChaseEffect();
          break;
        case 'fill':
          await runFillEffect();
          break;
      }

      // Update position
      updatePosition();
    } catch (error) {
      logger.error('Effect frame failed', error);
    }
  };

  const updatePosition = () => {
    const numLEDs = 50; // Assume 50 LEDs for calculation

    if (direction === 'bounce') {
      positionRef.current += directionRef.current;
      
      // Bounce at ends
      if (positionRef.current >= numLEDs - 1) {
        directionRef.current = -1;
      } else if (positionRef.current <= 0) {
        directionRef.current = 1;
      }
    } else {
      positionRef.current += directionRef.current;
      
      // Wrap around
      if (positionRef.current >= numLEDs) {
        positionRef.current = 0;
      } else if (positionRef.current < 0) {
        positionRef.current = numLEDs - 1;
      }
    }
  };

  // Effect Implementations
  const runChaseEffect = async () => {
    // Single LED running across strip
    const command = {
      type: 'directional_chase',
      position: positionRef.current,
      color: selectedColor,
      direction: directionRef.current,
    };
    await LEDController.sendCustomCommand(command);
  };

  const runWaveEffect = async () => {
    // Smooth color wave
    const command = {
      type: 'directional_wave',
      position: positionRef.current,
      color: selectedColor,
      waveLength: trailLength,
    };
    await LEDController.sendCustomCommand(command);
  };

  const runScannerEffect = async () => {
    // KITT/Cylon scanner effect
    const command = {
      type: 'scanner',
      position: positionRef.current,
      color: selectedColor,
      eyeSize: trailLength,
    };
    await LEDController.sendCustomCommand(command);
  };

  const runCometEffect = async () => {
    // Comet with fading tail
    const command = {
      type: 'comet',
      position: positionRef.current,
      color: selectedColor,
      tailLength: trailLength,
    };
    await LEDController.sendCustomCommand(command);
  };

  const runTheaterChaseEffect = async () => {
    // Every 3rd LED
    const command = {
      type: 'theater_chase',
      position: positionRef.current,
      color: selectedColor,
      spacing: 3,
    };
    await LEDController.sendCustomCommand(command);
  };

  const runRainbowChaseEffect = async () => {
    // Rainbow colors
    const rainbowColors = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0000ff', '#8000ff'];
    const colorIndex = Math.floor(positionRef.current / 5) % rainbowColors.length;
    
    const command = {
      type: 'directional_chase',
      position: positionRef.current,
      color: rainbowColors[colorIndex],
    };
    await LEDController.sendCustomCommand(command);
  };

  const runDualChaseEffect = async () => {
    // Two LEDs chasing
    const command = {
      type: 'dual_chase',
      position: positionRef.current,
      color: selectedColor,
      secondColor: '#ff0000',
      spacing: 25,
    };
    await LEDController.sendCustomCommand(command);
  };

  const runFillEffect = async () => {
    // Progressive fill
    const command = {
      type: 'fill',
      fillLevel: positionRef.current,
      color: selectedColor,
    };
    await LEDController.sendCustomCommand(command);
  };

  const handleSpeedChange = (value) => {
    setSpeed(value);
    
    // Update interval if effect is running
    if (isPlaying && effectIntervalRef.current) {
      const effect = effects.find(e => e.id === activeEffect);
      stopEffect();
      setTimeout(() => startEffect(effect), 100);
    }
  };

  const handleDirectionChange = (newDirection) => {
    setDirection(newDirection);
    directionRef.current = newDirection === 'left' ? -1 : 1;
  };

  const handleColorChange = () => {
    const colors = ['#00ff88', '#ff0088', '#0088ff', '#ff8800', '#8800ff', '#00ff00'];
    const currentIndex = colors.indexOf(selectedColor);
    const nextColor = colors[(currentIndex + 1) % colors.length];
    setSelectedColor(nextColor);
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
            Directional Effects
          </Text>
          <TouchableOpacity onPress={stopEffect} style={styles.stopButton}>
            <Icon name="stop" size={24} color={isPlaying ? theme.colors.error : theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Connection Status */}
        {!isConnected && (
          <View style={styles.warningBanner}>
            <Icon name="warning" size={20} color="#ff9800" />
            <Text style={styles.warningText}>Device not connected</Text>
          </View>
        )}

        {/* Speed Control */}
        <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <View style={styles.cardHeader}>
            <Icon name="speed" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, {color: theme.colors.text}]}>
              Speed: {speed}%
            </Text>
          </View>
          <View style={styles.sliderContainer}>
            <Icon name="remove" size={20} color={theme.colors.textSecondary} />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={speed}
              onValueChange={setSpeed}
              onSlidingComplete={handleSpeedChange}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor={theme.colors.textMuted}
            />
            <Icon name="add" size={20} color={theme.colors.textSecondary} />
          </View>
          <View style={styles.speedLabels}>
            <Text style={[styles.speedLabel, {color: theme.colors.textSecondary}]}>Slow</Text>
            <Text style={[styles.speedLabel, {color: theme.colors.textSecondary}]}>Medium</Text>
            <Text style={[styles.speedLabel, {color: theme.colors.textSecondary}]}>Fast</Text>
          </View>
        </View>

        {/* Direction Control */}
        <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <View style={styles.cardHeader}>
            <Icon name="compare-arrows" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, {color: theme.colors.text}]}>Direction</Text>
          </View>
          <View style={styles.directionButtons}>
            <TouchableOpacity
              style={[
                styles.directionButton,
                direction === 'left' && styles.directionButtonActive,
                {borderColor: theme.colors.primary},
              ]}
              onPress={() => handleDirectionChange('left')}>
              <Icon
                name="arrow-back"
                size={24}
                color={direction === 'left' ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.directionButtonText,
                  {color: direction === 'left' ? theme.colors.primary : theme.colors.textSecondary},
                ]}>
                Left
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.directionButton,
                direction === 'right' && styles.directionButtonActive,
                {borderColor: theme.colors.primary},
              ]}
              onPress={() => handleDirectionChange('right')}>
              <Icon
                name="arrow-forward"
                size={24}
                color={direction === 'right' ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.directionButtonText,
                  {color: direction === 'right' ? theme.colors.primary : theme.colors.textSecondary},
                ]}>
                Right
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.directionButton,
                direction === 'bounce' && styles.directionButtonActive,
                {borderColor: theme.colors.primary},
              ]}
              onPress={() => handleDirectionChange('bounce')}>
              <Icon
                name="swap-horiz"
                size={24}
                color={direction === 'bounce' ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.directionButtonText,
                  {color: direction === 'bounce' ? theme.colors.primary : theme.colors.textSecondary},
                ]}>
                Bounce
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trail/Eye Size Control */}
        <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <View style={styles.cardHeader}>
            <Icon name="lens" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, {color: theme.colors.text}]}>
              Trail Length: {trailLength}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={trailLength}
            onValueChange={setTrailLength}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.textMuted}
          />
        </View>

        {/* Color Selection */}
        <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <View style={styles.cardHeader}>
            <Icon name="palette" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, {color: theme.colors.text}]}>Color</Text>
          </View>
          <TouchableOpacity style={styles.colorButton} onPress={handleColorChange}>
            <View style={[styles.colorPreview, {backgroundColor: selectedColor}]} />
            <Text style={[styles.colorText, {color: theme.colors.text}]}>
              {selectedColor.toUpperCase()}
            </Text>
            <Icon name="refresh" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Effects Grid */}
        <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <View style={styles.cardHeader}>
            <Icon name="auto-awesome" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, {color: theme.colors.text}]}>Effects</Text>
          </View>

          <View style={styles.effectsGrid}>
            {effects.map((effect) => (
              <TouchableOpacity
                key={effect.id}
                style={[
                  styles.effectCard,
                  activeEffect === effect.id && isPlaying && styles.effectCardActive,
                  {backgroundColor: theme.colors.background},
                ]}
                onPress={() => startEffect(effect)}>
                <Icon
                  name={effect.icon}
                  size={32}
                  color={activeEffect === effect.id && isPlaying ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.effectName,
                    {color: activeEffect === effect.id && isPlaying ? theme.colors.primary : theme.colors.text},
                  ]}>
                  {effect.name}
                </Text>
                <Text style={[styles.effectDescription, {color: theme.colors.textSecondary}]}>
                  {effect.description}
                </Text>
                
                {/* Preview */}
                <View style={styles.effectPreview}>
                  {effect.preview.map((led, index) => (
                    <Text key={index} style={styles.previewLed}>
                      {led}
                    </Text>
                  ))}
                </View>

                {activeEffect === effect.id && isPlaying && (
                  <View style={styles.playingIndicator}>
                    <Icon name="play-arrow" size={16} color="#fff" />
                    <Text style={styles.playingText}>Playing</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  stopButton: {
    padding: 8,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
  },
  warningText: {
    color: '#ff9800',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
  },
  speedLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  speedLabel: {
    fontSize: 12,
  },
  directionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  directionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  directionButtonActive: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  directionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  colorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  effectCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  effectCardActive: {
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  effectName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  effectDescription: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  effectPreview: {
    flexDirection: 'row',
    marginTop: 8,
  },
  previewLed: {
    fontSize: 12,
    marginHorizontal: 1,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ff88',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  playingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default DirectionalEffectsScreen;

