import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import LEDController from '../classes/LEDController';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

const {width, height} = Dimensions.get('window');

const AdvancedEffectsScreen = () => {
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [effectSpeed, setEffectSpeed] = useState(50);
  const [effectIntensity, setEffectIntensity] = useState(75);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customColors, setCustomColors] = useState(['#ff0000', '#00ff00', '#0000ff']);
  const animationRef = useRef(new Animated.Value(0)).current;

  const effects = [
    {
      id: 'rainbow',
      name: 'Rainbow Wave',
      description: 'Smooth rainbow color transition',
      icon: 'palette',
      colors: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'],
      category: 'basic'
    },
    {
      id: 'breathing',
      name: 'Breathing Light',
      description: 'Gentle brightness pulsing effect',
      icon: 'favorite',
      colors: ['#ffffff'],
      category: 'basic'
    },
    {
      id: 'strobe',
      name: 'Strobe Flash',
      description: 'Rapid on/off flashing',
      icon: 'flash-on',
      colors: ['#ffffff'],
      category: 'basic'
    },
    {
      id: 'fire',
      name: 'Fire Effect',
      description: 'Flickering fire-like colors',
      icon: 'local-fire-department',
      colors: ['#ff0000', '#ff4500', '#ff8c00', '#ffa500'],
      category: 'advanced'
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      description: 'Blue wave-like patterns',
      icon: 'waves',
      colors: ['#0066cc', '#0099ff', '#66ccff', '#99ddff'],
      category: 'advanced'
    },
    {
      id: 'aurora',
      name: 'Aurora Borealis',
      description: 'Northern lights simulation',
      icon: 'wb-sunny',
      colors: ['#00ff88', '#88ff00', '#00ffaa', '#aaff00'],
      category: 'advanced'
    },
    {
      id: 'disco',
      name: 'Disco Party',
      description: 'Multi-color party lighting',
      icon: 'party-mode',
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
      category: 'party'
    },
    {
      id: 'relax',
      name: 'Relaxation',
      description: 'Calming warm colors',
      icon: 'spa',
      colors: ['#ff6b6b', '#ffa726', '#ffcc02', '#66bb6a'],
      category: 'wellness'
    },
    {
      id: 'focus',
      name: 'Focus Mode',
      description: 'Cool white for concentration',
      icon: 'psychology',
      colors: ['#ffffff', '#f0f0f0', '#e0e0e0'],
      category: 'wellness'
    },
    {
      id: 'custom',
      name: 'Custom Effect',
      description: 'Create your own pattern',
      icon: 'build',
      colors: customColors,
      category: 'custom'
    }
  ];

  const categories = [
    {id: 'basic', name: 'Basic Effects', icon: 'star'},
    {id: 'advanced', name: 'Advanced', icon: 'auto-awesome'},
    {id: 'party', name: 'Party Mode', icon: 'party-mode'},
    {id: 'wellness', name: 'Wellness', icon: 'spa'},
    {id: 'custom', name: 'Custom', icon: 'build'}
  ];

  useEffect(() => {
    if (isPlaying && selectedEffect) {
      startEffectAnimation();
    } else {
      stopEffectAnimation();
    }
  }, [isPlaying, selectedEffect]);

  const startEffectAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationRef, {
          toValue: 1,
          duration: 2000 - (effectSpeed * 20),
          useNativeDriver: false,
        }),
        Animated.timing(animationRef, {
          toValue: 0,
          duration: 2000 - (effectSpeed * 20),
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const stopEffectAnimation = () => {
    animationRef.stopAnimation();
    animationRef.setValue(0);
  };

  const handleEffectSelect = async (effect) => {
    try {
      setSelectedEffect(effect);
      logger.info('Effect selected', {effectId: effect.id, effectName: effect.name});
      
      // Send effect command to LED controller
      const success = await LEDController.setEffect(effect.id, effectSpeed);
      if (success) {
        Alert.alert('Success', `${effect.name} effect applied!`);
      }
    } catch (error) {
      logger.error('Failed to apply effect', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await LEDController.stopEffect();
        setIsPlaying(false);
        logger.info('Effect stopped');
      } else {
        if (selectedEffect) {
          await LEDController.startEffect(selectedEffect.id, effectSpeed, effectIntensity);
          setIsPlaying(true);
          logger.info('Effect started', {effect: selectedEffect.id});
        } else {
          Alert.alert('No Effect Selected', 'Please select an effect first.');
        }
      }
    } catch (error) {
      logger.error('Play/pause failed', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    }
  };

  const handleSpeedChange = async (speed) => {
    setEffectSpeed(speed);
    if (isPlaying && selectedEffect) {
      try {
        await LEDController.setEffectSpeed(speed);
        logger.info('Effect speed changed', {speed});
      } catch (error) {
        logger.error('Speed change failed', error);
      }
    }
  };

  const handleIntensityChange = async (intensity) => {
    setEffectIntensity(intensity);
    if (isPlaying && selectedEffect) {
      try {
        await LEDController.setEffectIntensity(intensity);
        logger.info('Effect intensity changed', {intensity});
      } catch (error) {
        logger.error('Intensity change failed', error);
      }
    }
  };

  const renderEffectCard = (effect) => {
    const isSelected = selectedEffect?.id === effect.id;
    const animatedOpacity = isSelected ? animationRef : new Animated.Value(1);

    return (
      <Animated.View
        key={effect.id}
        style={[
          styles.effectCard,
          isSelected && styles.selectedEffectCard,
          {opacity: animatedOpacity}
        ]}>
        <TouchableOpacity
          style={styles.effectCardContent}
          onPress={() => handleEffectSelect(effect)}
          activeOpacity={0.8}>
          <LinearGradient
            colors={effect.colors}
            style={styles.effectIconContainer}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <Icon name={effect.icon} size={32} color="#fff" />
          </LinearGradient>
          <View style={styles.effectInfo}>
            <Text style={styles.effectName}>{effect.name}</Text>
            <Text style={styles.effectDescription}>{effect.description}</Text>
          </View>
          {isSelected && (
            <Icon name="check-circle" size={24} color="#00ff88" />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategory = (category) => {
    const categoryEffects = effects.filter(effect => effect.category === category.id);
    
    return (
      <View key={category.id} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Icon name={category.icon} size={24} color="#00ff88" />
          <Text style={styles.categoryTitle}>{category.name}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.effectsScrollView}>
          {categoryEffects.map(renderEffectCard)}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Advanced Effects</Text>
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={handlePlayPause}>
          <Icon
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={32}
            color={isPlaying ? '#000' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {categories.map(renderCategory)}

        {selectedEffect && (
          <View style={styles.controlsSection}>
            <Text style={styles.controlsTitle}>Effect Controls</Text>
            
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Speed</Text>
              <View style={styles.sliderContainer}>
                <Icon name="slow-motion-video" size={20} color="#666" />
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={100}
                  value={effectSpeed}
                  onValueChange={handleSpeedChange}
                  minimumTrackTintColor="#00ff88"
                  maximumTrackTintColor="#333"
                  thumbStyle={styles.sliderThumb}
                />
                <Icon name="speed" size={20} color="#666" />
              </View>
              <Text style={styles.sliderValue}>{effectSpeed}%</Text>
            </View>

            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Intensity</Text>
              <View style={styles.sliderContainer}>
                <Icon name="brightness-low" size={20} color="#666" />
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={100}
                  value={effectIntensity}
                  onValueChange={handleIntensityChange}
                  minimumTrackTintColor="#00ff88"
                  maximumTrackTintColor="#333"
                  thumbStyle={styles.sliderThumb}
                />
                <Icon name="brightness-high" size={20} color="#666" />
              </View>
              <Text style={styles.sliderValue}>{effectIntensity}%</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: '#00ff88',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  effectsScrollView: {
    flexDirection: 'row',
  },
  effectCard: {
    marginRight: 15,
    borderRadius: 15,
    backgroundColor: '#333',
    overflow: 'hidden',
    minWidth: 150,
  },
  selectedEffectCard: {
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  effectCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  effectIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  effectInfo: {
    flex: 1,
  },
  effectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  effectDescription: {
    fontSize: 12,
    color: '#999',
  },
  controlsSection: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  controlGroup: {
    marginBottom: 20,
  },
  controlLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
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
});

export default AdvancedEffectsScreen;
