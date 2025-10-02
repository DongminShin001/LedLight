import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

const ColorPickerScreen = ({navigation}) => {
  const [selectedColor, setSelectedColor] = useState('#00ff88');

  const predefinedColors = [
    '#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00',
    '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff',
    '#ff00ff', '#ff0080', '#ffffff', '#ff8080', '#80ff80',
    '#8080ff', '#ffff80', '#ff80ff', '#80ffff', '#000000',
  ];

  const colorPresets = [
    {
      name: 'Sunset',
      colors: ['#ff6b6b', '#ffa726', '#ffeb3b'],
      gradient: ['#ff6b6b', '#ffa726', '#ffeb3b'],
    },
    {
      name: 'Ocean',
      colors: ['#2196f3', '#00bcd4', '#4dd0e1'],
      gradient: ['#2196f3', '#00bcd4', '#4dd0e1'],
    },
    {
      name: 'Forest',
      colors: ['#4caf50', '#8bc34a', '#cddc39'],
      gradient: ['#4caf50', '#8bc34a', '#cddc39'],
    },
    {
      name: 'Purple',
      colors: ['#9c27b0', '#e91e63', '#f06292'],
      gradient: ['#9c27b0', '#e91e63', '#f06292'],
    },
    {
      name: 'Fire',
      colors: ['#f44336', '#ff5722', '#ff9800'],
      gradient: ['#f44336', '#ff5722', '#ff9800'],
    },
    {
      name: 'Ice',
      colors: ['#00bcd4', '#e1f5fe', '#ffffff'],
      gradient: ['#00bcd4', '#e1f5fe', '#ffffff'],
    },
  ];

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    // Here you would send the color command to your LED device
    console.log('Color selected:', color);
  };

  const handlePresetSelect = (preset) => {
    setSelectedColor(preset.colors[0]);
    // Here you would send the preset command to your LED device
    console.log('Preset selected:', preset.name);
  };

  const handleApply = () => {
    // Apply the selected color
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Current Color Preview */}
      <View style={styles.previewContainer}>
        <View 
          style={[
            styles.colorPreview,
            {backgroundColor: selectedColor}
          ]}
        />
        <Text style={styles.previewText}>Selected Color</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Predefined Colors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Colors</Text>
          <View style={styles.colorGrid}>
            {predefinedColors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorButton,
                  {backgroundColor: color},
                  selectedColor === color && styles.selectedColorButton
                ]}
                onPress={() => handleColorSelect(color)}
              />
            ))}
          </View>
        </View>

        {/* Color Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Presets</Text>
          <View style={styles.presetGrid}>
            {colorPresets.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={styles.presetButton}
                onPress={() => handlePresetSelect(preset)}>
                <LinearGradient
                  colors={preset.gradient}
                  style={styles.presetGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}>
                  <Text style={styles.presetText}>{preset.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Color Picker Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Color</Text>
          <TouchableOpacity style={styles.customColorButton}>
            <Icon name="tune" size={24} color="#fff" />
            <Text style={styles.customColorText}>Advanced Color Picker</Text>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
        <LinearGradient
          colors={['#00ff88', '#00cc6a']}
          style={styles.applyGradient}>
          <Text style={styles.applyText}>Apply Color</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  colorPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    shadowColor: '#00ff88',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  previewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: (width - 60) / 5,
    height: (width - 60) / 5,
    borderRadius: (width - 60) / 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorButton: {
    borderColor: '#00ff88',
    borderWidth: 3,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetButton: {
    width: (width - 60) / 2,
    height: 80,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  presetGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  customColorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  customColorText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  applyButton: {
    margin: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  applyGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  applyText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ColorPickerScreen;
