import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

const PresetsScreen = () => {
  const [savedPresets, setSavedPresets] = useState([
    {
      id: '1',
      name: 'My Bedroom',
      description: 'Warm white for reading',
      color: '#ffeb3b',
      brightness: 80,
      effect: 'none',
    },
    {
      id: '2',
      name: 'Party Mode',
      description: 'Rainbow disco effect',
      color: '#ff0000',
      brightness: 100,
      effect: 'disco',
    },
    {
      id: '3',
      name: 'Relax Time',
      description: 'Soft breathing effect',
      color: '#4caf50',
      brightness: 60,
      effect: 'breathing',
    },
  ]);

  const defaultPresets = [
    {
      id: 'default1',
      name: 'Sunrise',
      description: 'Gentle wake-up light',
      colors: ['#ff6b6b', '#ffa726', '#ffeb3b'],
      brightness: 70,
      effect: 'breathing',
      icon: 'wb-sunny',
    },
    {
      id: 'default2',
      name: 'Ocean Breeze',
      description: 'Calming blue waves',
      colors: ['#2196f3', '#00bcd4', '#4dd0e1'],
      brightness: 50,
      effect: 'wave',
      icon: 'pool',
    },
    {
      id: 'default3',
      name: 'Fireplace',
      description: 'Cozy warm glow',
      colors: ['#f44336', '#ff5722', '#ff9800'],
      brightness: 85,
      effect: 'fire',
      icon: 'local-fire-department',
    },
    {
      id: 'default4',
      name: 'Aurora',
      description: 'Northern lights magic',
      colors: ['#4caf50', '#8bc34a', '#cddc39', '#9c27b0'],
      brightness: 75,
      effect: 'aurora',
      icon: 'wb-twilight',
    },
    {
      id: 'default5',
      name: 'Focus Mode',
      description: 'Bright white for work',
      colors: ['#ffffff'],
      brightness: 90,
      effect: 'none',
      icon: 'work',
    },
    {
      id: 'default6',
      name: 'Sleep Mode',
      description: 'Dim warm light',
      colors: ['#ffa726'],
      brightness: 20,
      effect: 'breathing',
      icon: 'bedtime',
    },
  ];

  const handlePresetSelect = (preset) => {
    // Here you would apply the preset to your LED device
    console.log('Preset applied:', preset.name);
    Alert.alert(
      'Preset Applied',
      `${preset.name} has been applied to your LED lights.`,
      [{text: 'OK'}]
    );
  };

  const handleSavePreset = () => {
    Alert.alert(
      'Save Preset',
      'This would save your current LED settings as a new preset.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Save', onPress: () => {
          const newPreset = {
            id: Date.now().toString(),
            name: 'Custom Preset',
            description: 'My custom LED setting',
            color: '#00ff88',
            brightness: 50,
            effect: 'none',
          };
          setSavedPresets([...savedPresets, newPreset]);
        }},
      ]
    );
  };

  const handleDeletePreset = (presetId) => {
    Alert.alert(
      'Delete Preset',
      'Are you sure you want to delete this preset?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: () => {
          setSavedPresets(savedPresets.filter(p => p.id !== presetId));
        }},
      ]
    );
  };

  const renderSavedPreset = (preset) => (
    <TouchableOpacity
      key={preset.id}
      style={styles.presetCard}
      onPress={() => handlePresetSelect(preset)}>
      <View style={styles.presetHeader}>
        <View 
          style={[
            styles.presetColorIndicator,
            {backgroundColor: preset.color}
          ]} 
        />
        <View style={styles.presetInfo}>
          <Text style={styles.presetName}>{preset.name}</Text>
          <Text style={styles.presetDescription}>{preset.description}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePreset(preset.id)}>
          <Icon name="delete" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
      <View style={styles.presetDetails}>
        <Text style={styles.presetDetail}>Brightness: {preset.brightness}%</Text>
        <Text style={styles.presetDetail}>Effect: {preset.effect}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDefaultPreset = (preset) => (
    <TouchableOpacity
      key={preset.id}
      style={styles.defaultPresetCard}
      onPress={() => handlePresetSelect(preset)}>
      <LinearGradient
        colors={preset.colors.length > 1 ? preset.colors : [preset.colors[0], preset.colors[0]]}
        style={styles.defaultPresetGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <Icon name={preset.icon} size={30} color="#fff" />
        <Text style={styles.defaultPresetName}>{preset.name}</Text>
        <Text style={styles.defaultPresetDescription}>{preset.description}</Text>
        <View style={styles.defaultPresetDetails}>
          <Text style={styles.defaultPresetDetail}>Brightness: {preset.brightness}%</Text>
          <Text style={styles.defaultPresetDetail}>Effect: {preset.effect}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Save Current Settings */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSavePreset}>
          <LinearGradient
            colors={['#00ff88', '#00cc6a']}
            style={styles.saveGradient}>
            <Icon name="save" size={24} color="#000" />
            <Text style={styles.saveText}>Save Current Settings</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* My Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Presets</Text>
          {savedPresets.length > 0 ? (
            savedPresets.map(renderSavedPreset)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="bookmark-border" size={50} color="#666" />
              <Text style={styles.emptyStateText}>No saved presets yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Save your current LED settings to create custom presets
              </Text>
            </View>
          )}
        </View>

        {/* Default Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Presets</Text>
          <View style={styles.defaultPresetsGrid}>
            {defaultPresets.map(renderDefaultPreset)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
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
              <Text style={styles.quickActionText}>Relax</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Icon name="music-note" size={24} color="#fff" />
              <Text style={styles.quickActionText}>Party</Text>
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
  saveButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  saveText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  presetCard: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 15,
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  presetDescription: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 2,
  },
  deleteButton: {
    padding: 5,
  },
  presetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  presetDetail: {
    color: '#999',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  emptyStateSubtext: {
    color: '#555',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  defaultPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  defaultPresetCard: {
    width: (width - 60) / 2,
    height: 140,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  defaultPresetGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  defaultPresetName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  defaultPresetDescription: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
    opacity: 0.9,
  },
  defaultPresetDetails: {
    marginTop: 8,
    alignItems: 'center',
  },
  defaultPresetDetail: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.8,
  },
  quickActionsContainer: {
    marginVertical: 20,
  },
  quickActionsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default PresetsScreen;
