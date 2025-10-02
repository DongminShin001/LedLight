import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import BluetoothService from '../services/BluetoothService';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

const {width, height} = Dimensions.get('window');

const TextDisplayScreen = () => {
  const navigation = useNavigation();
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#00ff88');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textSize, setTextSize] = useState(16);
  const [animation, setAnimation] = useState('none');
  const [speed, setSpeed] = useState(50);
  const [isConnected, setIsConnected] = useState(false);

  // Predefined color palettes
  const colorPalettes = [
    {
      name: 'Neon',
      colors: ['#00ff88', '#ff0080', '#00ffff', '#ffff00', '#ff8000', '#8000ff'],
    },
    {
      name: 'Warm',
      colors: ['#ff6b6b', '#ffa726', '#ffeb3b', '#ff5722', '#ff9800', '#f44336'],
    },
    {
      name: 'Cool',
      colors: ['#2196f3', '#00bcd4', '#4dd0e1', '#009688', '#4caf50', '#8bc34a'],
    },
    {
      name: 'Pastel',
      colors: ['#ffcdd2', '#f8bbd9', '#e1bee7', '#c5cae9', '#bbdefb', '#b3e5fc'],
    },
    {
      name: 'Monochrome',
      colors: ['#ffffff', '#e0e0e0', '#9e9e9e', '#616161', '#424242', '#000000'],
    },
    {
      name: 'Rainbow',
      colors: [
        '#ff0000',
        '#ff8000',
        '#ffff00',
        '#80ff00',
        '#00ff00',
        '#00ff80',
        '#00ffff',
        '#0080ff',
        '#0000ff',
        '#8000ff',
        '#ff00ff',
      ],
    },
  ];

  const animations = [
    {id: 'none', name: 'Static', icon: 'text-fields'},
    {id: 'scroll', name: 'Scroll', icon: 'swap-horiz'},
    {id: 'blink', name: 'Blink', icon: 'flash-on'},
    {id: 'fade', name: 'Fade', icon: 'opacity'},
    {id: 'rainbow', name: 'Rainbow', icon: 'palette'},
    {id: 'wave', name: 'Wave', icon: 'waves'},
  ];

  useEffect(() => {
    // Check connection status
    const status = BluetoothService.getConnectionStatus();
    setIsConnected(status.isConnected);

    // Listen for connection changes
    const handleConnectionChange = device => {
      setIsConnected(true);
    };

    const handleDisconnection = () => {
      setIsConnected(false);
    };

    BluetoothService.addListener('connected', handleConnectionChange);
    BluetoothService.addListener('disconnected', handleDisconnection);

    return () => {
      BluetoothService.removeListener('connected', handleConnectionChange);
      BluetoothService.removeListener('disconnected', handleDisconnection);
    };
  }, []);

  const handleSendText = async () => {
    if (!customText.trim()) {
      Alert.alert('Error', 'Please enter some text to display');
      return;
    }

    if (!isConnected) {
      Alert.alert('Not Connected', 'Please connect to a LED device first');
      return;
    }

    try {
      logger.info('Sending custom text to LED device', {
        text: customText,
        color: textColor,
        backgroundColor,
        size: textSize,
        animation,
        speed,
      });

      // Send text display command
      const command = `TEXT:${customText}|COLOR:${textColor.replace(
        '#',
        '',
      )}|BG:${backgroundColor.replace(
        '#',
        '',
      )}|SIZE:${textSize}|ANIM:${animation}|SPEED:${speed}\n`;

      const success = await BluetoothService.sendCommand(command);

      if (success) {
        Alert.alert('Success', 'Text sent to LED device!');
        logger.info('Text successfully sent to LED device');
      } else {
        throw new Error('Failed to send text command');
      }
    } catch (error) {
      logger.error('Error sending text to LED device', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    }
  };

  const handleColorSelect = color => {
    setTextColor(color);
  };

  const handleBackgroundColorSelect = color => {
    setBackgroundColor(color);
  };

  const renderColorPalette = (palette, onColorSelect) => (
    <View key={palette.name} style={styles.paletteContainer}>
      <Text style={styles.paletteName}>{palette.name}</Text>
      <View style={styles.colorRow}>
        {palette.colors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.colorButton, {backgroundColor: color}]}
            onPress={() => onColorSelect(color)}
          />
        ))}
      </View>
    </View>
  );

  const renderAnimationOption = anim => (
    <TouchableOpacity
      key={anim.id}
      style={[styles.animationButton, animation === anim.id && styles.selectedAnimationButton]}
      onPress={() => setAnimation(anim.id)}>
      <Icon name={anim.icon} size={24} color={animation === anim.id ? '#000' : '#fff'} />
      <Text style={[styles.animationText, animation === anim.id && styles.selectedAnimationText]}>
        {anim.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Custom Text Display</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <View
            style={[styles.statusIndicator, {backgroundColor: isConnected ? '#00ff88' : '#ff4444'}]}
          />
          <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Not Connected'}</Text>
        </View>

        {/* Text Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Text to Display</Text>
          <TextInput
            style={styles.textInput}
            value={customText}
            onChangeText={setCustomText}
            placeholder="Enter your custom text here..."
            placeholderTextColor="#666"
            multiline
            maxLength={100}
          />
          <Text style={styles.characterCount}>{customText.length}/100</Text>
        </View>

        {/* Text Preview */}
        {customText ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={[styles.previewContainer, {backgroundColor}]}>
              <Text
                style={[
                  styles.previewText,
                  {
                    color: textColor,
                    fontSize: textSize,
                  },
                ]}>
                {customText}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Text Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Text Color</Text>
          <View style={styles.currentColorContainer}>
            <View style={[styles.currentColor, {backgroundColor: textColor}]} />
            <Text style={styles.currentColorText}>{textColor}</Text>
          </View>

          {colorPalettes.map(palette => renderColorPalette(palette, handleColorSelect))}
        </View>

        {/* Background Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Background Color</Text>
          <View style={styles.currentColorContainer}>
            <View style={[styles.currentColor, {backgroundColor}]} />
            <Text style={styles.currentColorText}>{backgroundColor}</Text>
          </View>

          {colorPalettes.map(palette => renderColorPalette(palette, handleBackgroundColorSelect))}
        </View>

        {/* Text Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Text Size</Text>
          <View style={styles.sizeContainer}>
            <TouchableOpacity
              style={styles.sizeButton}
              onPress={() => setTextSize(Math.max(8, textSize - 2))}>
              <Icon name="remove" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.sizeText}>{textSize}px</Text>
            <TouchableOpacity
              style={styles.sizeButton}
              onPress={() => setTextSize(Math.min(32, textSize + 2))}>
              <Icon name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Animation Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Animation</Text>
          <View style={styles.animationContainer}>{animations.map(renderAnimationOption)}</View>
        </View>

        {/* Speed Control */}
        {animation !== 'none' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Animation Speed</Text>
            <View style={styles.speedContainer}>
              <TouchableOpacity
                style={styles.speedButton}
                onPress={() => setSpeed(Math.max(1, speed - 10))}>
                <Icon name="remove" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.speedText}>{speed}%</Text>
              <TouchableOpacity
                style={styles.speedButton}
                onPress={() => setSpeed(Math.min(100, speed + 10))}>
                <Icon name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendButton, !isConnected && styles.disabledButton]}
          onPress={handleSendText}
          disabled={!isConnected || !customText.trim()}>
          <LinearGradient
            colors={isConnected ? ['#00ff88', '#00cc6a'] : ['#666', '#555']}
            style={styles.sendButtonGradient}>
            <Icon name="send" size={24} color={isConnected ? '#000' : '#999'} />
            <Text style={[styles.sendButtonText, !isConnected && styles.disabledText]}>
              Send to LED Device
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  previewContainer: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  previewText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  currentColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  currentColor: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  currentColorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  paletteContainer: {
    marginBottom: 15,
  },
  paletteName: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  sizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButton: {
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  animationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  animationButton: {
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
    width: (width - 60) / 2,
  },
  selectedAnimationButton: {
    backgroundColor: '#00ff88',
  },
  animationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
  },
  selectedAnimationText: {
    color: '#000',
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedButton: {
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  sendButton: {
    marginVertical: 30,
    borderRadius: 25,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  sendButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  disabledText: {
    color: '#999',
  },
});

export default TextDisplayScreen;
