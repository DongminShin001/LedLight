import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [isConnected, setIsConnected] = useState(false);
  const [brightness, setBrightness] = useState(50);
  const [isOn, setIsOn] = useState(false);
  const [currentColor, setCurrentColor] = useState('#00ff88');

  const handlePowerToggle = () => {
    setIsOn(!isOn);
    // Here you would send the power command to your LED device
    console.log('Power toggled:', !isOn);
  };

  const handleBrightnessChange = (value) => {
    setBrightness(value);
    // Here you would send brightness command to your LED device
    console.log('Brightness changed:', value);
  };

  const handleColorPress = () => {
    navigation.navigate('ColorPicker');
  };

  const handleConnect = () => {
    // Here you would implement Bluetooth connection logic
    Alert.alert(
      'Connect Device',
      'This would connect to your LED device via Bluetooth',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Connect', onPress: () => setIsConnected(true)},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>LED Controller</Text>
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
            }
          ]}
        />
        <Text style={styles.statusText}>
          {isOn ? 'ON' : 'OFF'}
        </Text>
      </View>

      {/* Power Button */}
      <TouchableOpacity
        style={[styles.powerButton, isOn && styles.powerButtonOn]}
        onPress={handlePowerToggle}>
        <Icon 
          name={isOn ? 'power-off' : 'power'} 
          size={40} 
          color={isOn ? '#000' : '#fff'} 
        />
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
        <LinearGradient
          colors={[currentColor, currentColor]}
          style={styles.colorGradient}>
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
      </View>
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
    justifyContent: 'space-around',
    marginTop: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    minWidth: 80,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
});

export default HomeScreen;
