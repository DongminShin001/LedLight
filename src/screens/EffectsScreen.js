import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

const EffectsScreen = () => {
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const effects = [
    {
      id: 'rainbow',
      name: 'Rainbow',
      description: 'Smooth color transitions',
      icon: 'palette',
      colors: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff'],
    },
    {
      id: 'breathing',
      name: 'Breathing',
      description: 'Gentle fade in and out',
      icon: 'favorite',
      colors: ['#ff6b6b', '#ffa726'],
    },
    {
      id: 'strobe',
      name: 'Strobe',
      description: 'Fast flashing effect',
      icon: 'flash-on',
      colors: ['#ffffff', '#000000'],
    },
    {
      id: 'wave',
      name: 'Wave',
      description: 'Moving wave pattern',
      icon: 'waves',
      colors: ['#2196f3', '#00bcd4', '#4dd0e1'],
    },
    {
      id: 'fire',
      name: 'Fire',
      description: 'Flickering fire effect',
      icon: 'local-fire-department',
      colors: ['#f44336', '#ff5722', '#ff9800'],
    },
    {
      id: 'aurora',
      name: 'Aurora',
      description: 'Northern lights simulation',
      icon: 'wb-twilight',
      colors: ['#4caf50', '#8bc34a', '#cddc39', '#9c27b0'],
    },
    {
      id: 'disco',
      name: 'Disco',
      description: 'Party mode with random colors',
      icon: 'music-note',
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
    },
    {
      id: 'sunset',
      name: 'Sunset',
      description: 'Warm sunset colors',
      icon: 'wb-sunny',
      colors: ['#ff6b6b', '#ffa726', '#ffeb3b'],
    },
    {
      id: 'ocean',
      name: 'Ocean',
      description: 'Calming ocean waves',
      icon: 'pool',
      colors: ['#2196f3', '#00bcd4', '#4dd0e1'],
    },
  ];

  const handleEffectSelect = (effect) => {
    setSelectedEffect(effect);
    // Here you would send the effect command to your LED device
    console.log('Effect selected:', effect.name);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Here you would start/stop the effect
    console.log('Effect', isPlaying ? 'stopped' : 'started');
  };

  const handleSpeedChange = (speed) => {
    // Here you would adjust the effect speed
    console.log('Speed changed:', speed);
  };

  const renderEffectCard = (effect) => (
    <TouchableOpacity
      key={effect.id}
      style={[
        styles.effectCard,
        selectedEffect?.id === effect.id && styles.selectedEffectCard
      ]}
      onPress={() => handleEffectSelect(effect)}>
      <LinearGradient
        colors={effect.colors.slice(0, 3)}
        style={styles.effectGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <Icon name={effect.icon} size={30} color="#fff" />
        <Text style={styles.effectName}>{effect.name}</Text>
        <Text style={styles.effectDescription}>{effect.description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Effects Grid */}
        <View style={styles.effectsGrid}>
          {effects.map(renderEffectCard)}
        </View>

        {/* Effect Controls */}
        {selectedEffect && (
          <View style={styles.controlsContainer}>
            <Text style={styles.controlsTitle}>Effect Controls</Text>
            
            {/* Play/Pause Button */}
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playButtonActive]}
              onPress={handlePlayPause}>
              <Icon 
                name={isPlaying ? 'pause' : 'play-arrow'} 
                size={30} 
                color={isPlaying ? '#000' : '#fff'} 
              />
              <Text style={[styles.playText, isPlaying && styles.playTextActive]}>
                {isPlaying ? 'Stop' : 'Play'} Effect
              </Text>
            </TouchableOpacity>

            {/* Speed Control */}
            <View style={styles.speedContainer}>
              <Text style={styles.speedLabel}>Speed</Text>
              <View style={styles.speedButtons}>
                {['Slow', 'Medium', 'Fast'].map((speed, index) => (
                  <TouchableOpacity
                    key={speed}
                    style={styles.speedButton}
                    onPress={() => handleSpeedChange(speed)}>
                    <Text style={styles.speedText}>{speed}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Intensity Control */}
            <View style={styles.intensityContainer}>
              <Text style={styles.intensityLabel}>Intensity</Text>
              <View style={styles.intensityButtons}>
                {['Low', 'Medium', 'High'].map((intensity, index) => (
                  <TouchableOpacity
                    key={intensity}
                    style={styles.intensityButton}
                    onPress={() => console.log('Intensity:', intensity)}>
                    <Text style={styles.intensityText}>{intensity}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Quick Effects */}
        <View style={styles.quickEffectsContainer}>
          <Text style={styles.quickEffectsTitle}>Quick Effects</Text>
          <View style={styles.quickEffectsRow}>
            <TouchableOpacity style={styles.quickEffectButton}>
              <Icon name="wb-sunny" size={24} color="#fff" />
              <Text style={styles.quickEffectText}>Daylight</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickEffectButton}>
              <Icon name="nightlight-round" size={24} color="#fff" />
              <Text style={styles.quickEffectText}>Night</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickEffectButton}>
              <Icon name="favorite" size={24} color="#fff" />
              <Text style={styles.quickEffectText}>Relax</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickEffectButton}>
              <Icon name="music-note" size={24} color="#fff" />
              <Text style={styles.quickEffectText}>Party</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  effectCard: {
    width: (width - 60) / 2,
    height: 120,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  selectedEffectCard: {
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  effectGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  effectName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  effectDescription: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
    opacity: 0.9,
  },
  controlsContainer: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    marginVertical: 20,
  },
  controlsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ff88',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  playButtonActive: {
    backgroundColor: '#ff4444',
  },
  playText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  playTextActive: {
    color: '#fff',
  },
  speedContainer: {
    marginBottom: 15,
  },
  speedLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  speedButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  speedButton: {
    backgroundColor: '#555',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  speedText: {
    color: '#fff',
    fontSize: 14,
  },
  intensityContainer: {
    marginBottom: 15,
  },
  intensityLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  intensityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityButton: {
    backgroundColor: '#555',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  intensityText: {
    color: '#fff',
    fontSize: 14,
  },
  quickEffectsContainer: {
    marginVertical: 20,
  },
  quickEffectsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  quickEffectsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickEffectButton: {
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  quickEffectText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default EffectsScreen;
