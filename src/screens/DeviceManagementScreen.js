import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LEDController from '../classes/LEDController';
import DeviceManager from '../classes/DeviceManager';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

const DeviceManagementScreen = () => {
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceSettings, setDeviceSettings] = useState({
    name: '',
    autoConnect: false,
    brightness: 75,
    defaultColor: '#00ff88',
    defaultEffect: 'none',
    powerOnStartup: false
  });

  useEffect(() => {
    loadDevices();
    checkConnectionStatus();
    setupEventListeners();
  }, []);

  const setupEventListeners = () => {
    const handleDeviceConnected = (device) => {
      setConnectedDevice(device);
      logger.info('Device connected in DeviceManagement', {device: device.name});
    };

    const handleDeviceDisconnected = () => {
      setConnectedDevice(null);
      logger.info('Device disconnected in DeviceManagement');
    };

    DeviceManager.addListener('deviceConnected', handleDeviceConnected);
    DeviceManager.addListener('deviceDisconnected', handleDeviceDisconnected);

    return () => {
      DeviceManager.removeListener('deviceConnected', handleDeviceConnected);
      DeviceManager.removeListener('deviceDisconnected', handleDeviceDisconnected);
    };
  };

  const loadDevices = async () => {
    try {
      // In a real app, load from storage
      const savedDevices = [
        {
          id: '1',
          name: 'Living Room LED Strip',
          address: '00:11:22:33:44:55',
          type: 'LED Strip',
          status: 'connected',
          lastSeen: new Date(),
          settings: {
            autoConnect: true,
            brightness: 80,
            defaultColor: '#00ff88',
            defaultEffect: 'breathing',
            powerOnStartup: true
          }
        },
        {
          id: '2',
          name: 'Bedroom RGB Bulb',
          address: '00:11:22:33:44:66',
          type: 'RGB Bulb',
          status: 'disconnected',
          lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
          settings: {
            autoConnect: false,
            brightness: 60,
            defaultColor: '#ff6b6b',
            defaultEffect: 'none',
            powerOnStartup: false
          }
        },
        {
          id: '3',
          name: 'Kitchen Strip Light',
          address: '00:11:22:33:44:77',
          type: 'LED Strip',
          status: 'disconnected',
          lastSeen: new Date(Date.now() - 7200000), // 2 hours ago
          settings: {
            autoConnect: true,
            brightness: 90,
            defaultColor: '#ffffff',
            defaultEffect: 'none',
            powerOnStartup: true
          }
        }
      ];
      setDevices(savedDevices);
      logger.info('Devices loaded', {count: savedDevices.length});
    } catch (error) {
      logger.error('Failed to load devices', error);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const connected = DeviceManager.isDeviceConnected();
      if (connected) {
        const device = DeviceManager.getConnectedDevice();
        setConnectedDevice(device);
      }
    } catch (error) {
      logger.error('Failed to check connection status', error);
    }
  };

  const handleScanForDevices = async () => {
    try {
      setIsScanning(true);
      logger.info('Starting device scan');

      const foundDevices = await DeviceManager.scanForDevices();
      
      // Update device list with found devices
      const updatedDevices = devices.map(device => {
        const foundDevice = foundDevices.find(found => found.address === device.address);
        if (foundDevice) {
          return {
            ...device,
            status: 'available',
            lastSeen: new Date()
          };
        }
        return device;
      });

      setDevices(updatedDevices);
      setIsScanning(false);
      
      logger.info('Device scan completed', {foundCount: foundDevices.length});
      Alert.alert('Scan Complete', `Found ${foundDevices.length} devices`);
    } catch (error) {
      setIsScanning(false);
      logger.error('Device scan failed', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Scan Error', userMessage);
    }
  };

  const handleConnectDevice = async (device) => {
    try {
      logger.info('Connecting to device', {deviceId: device.id, deviceName: device.name});
      
      await DeviceManager.connectToDevice(device);
      setConnectedDevice(device);
      
      // Update device status
      setDevices(prev => 
        prev.map(d => 
          d.id === device.id 
            ? {...d, status: 'connected', lastSeen: new Date()}
            : d
        )
      );
      
      logger.info('Device connected successfully', {deviceId: device.id});
      Alert.alert('Connected', `Connected to ${device.name}`);
    } catch (error) {
      logger.error('Failed to connect to device', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Connection Error', userMessage);
    }
  };

  const handleDisconnectDevice = async () => {
    try {
      if (!connectedDevice) return;
      
      logger.info('Disconnecting from device', {deviceId: connectedDevice.id});
      
      await DeviceManager.disconnect();
      setConnectedDevice(null);
      
      // Update device status
      setDevices(prev => 
        prev.map(d => 
          d.id === connectedDevice.id 
            ? {...d, status: 'disconnected'}
            : d
        )
      );
      
      logger.info('Device disconnected successfully');
      Alert.alert('Disconnected', 'Device disconnected successfully');
    } catch (error) {
      logger.error('Failed to disconnect device', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Disconnect Error', userMessage);
    }
  };

  const handleDeviceSettings = (device) => {
    setSelectedDevice(device);
    setDeviceSettings(device.settings);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = async () => {
    try {
      if (!selectedDevice) return;
      
      // Update device settings
      setDevices(prev => 
        prev.map(d => 
          d.id === selectedDevice.id 
            ? {...d, settings: deviceSettings}
            : d
        )
      );
      
      setShowSettingsModal(false);
      logger.info('Device settings saved', {deviceId: selectedDevice.id});
      Alert.alert('Success', 'Device settings saved successfully!');
    } catch (error) {
      logger.error('Failed to save device settings', error);
      const userMessage = ErrorHandler.getUserFriendlyMessage(error);
      Alert.alert('Error', userMessage);
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    Alert.alert(
      'Remove Device',
      'Are you sure you want to remove this device from your list?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setDevices(prev => prev.filter(d => d.id !== deviceId));
            logger.info('Device removed', {deviceId});
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#00ff88';
      case 'available': return '#ffa500';
      case 'disconnected': return '#666';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return 'bluetooth-connected';
      case 'available': return 'bluetooth';
      case 'disconnected': return 'bluetooth-disabled';
      default: return 'bluetooth-disabled';
    }
  };

  const formatLastSeen = (lastSeen) => {
    const now = new Date();
    const diff = now - lastSeen;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderDeviceCard = (device) => {
    const isConnected = device.id === connectedDevice?.id;
    
    return (
      <View key={device.id} style={styles.deviceCard}>
        <View style={styles.deviceHeader}>
          <View style={styles.deviceInfo}>
            <View style={styles.deviceNameRow}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <View style={styles.deviceType}>
                <Text style={styles.deviceTypeText}>{device.type}</Text>
              </View>
            </View>
            <Text style={styles.deviceAddress}>{device.address}</Text>
            <View style={styles.deviceStatus}>
              <Icon 
                name={getStatusIcon(device.status)} 
                size={16} 
                color={getStatusColor(device.status)} 
              />
              <Text style={[styles.statusText, {color: getStatusColor(device.status)}]}>
                {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
              </Text>
              <Text style={styles.lastSeenText}>
                • {formatLastSeen(device.lastSeen)}
              </Text>
            </View>
          </View>
          
          <View style={styles.deviceActions}>
            {isConnected ? (
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={handleDisconnectDevice}>
                <Icon name="bluetooth-disabled" size={20} color="#ff4444" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={() => handleConnectDevice(device)}
                disabled={device.status === 'disconnected'}>
                <Icon name="bluetooth" size={20} color="#00ff88" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => handleDeviceSettings(device)}>
              <Icon name="settings" size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveDevice(device.id)}>
              <Icon name="delete" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        {device.settings && (
          <View style={styles.deviceSettings}>
            <View style={styles.settingRow}>
              <Icon name="brightness-high" size={16} color="#00ff88" />
              <Text style={styles.settingText}>Brightness: {device.settings.brightness}%</Text>
            </View>
            <View style={styles.settingRow}>
              <Icon name="palette" size={16} color="#00ff88" />
              <Text style={styles.settingText}>Default Color: {device.settings.defaultColor}</Text>
            </View>
            {device.settings.autoConnect && (
              <View style={styles.settingRow}>
                <Icon name="auto-awesome" size={16} color="#00ff88" />
                <Text style={styles.settingText}>Auto-connect enabled</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Device Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.scanButton, isScanning && styles.scanButtonActive]}
            onPress={handleScanForDevices}
            disabled={isScanning}>
            <Icon 
              name={isScanning ? "refresh" : "bluetooth-searching"} 
              size={20} 
              color={isScanning ? "#000" : "#fff"} 
            />
            <Text style={[styles.scanButtonText, isScanning && styles.scanButtonTextActive]}>
              {isScanning ? 'Scanning...' : 'Scan'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}>
            <Icon name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {devices.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="bluetooth-disabled" size={64} color="#666" />
            <Text style={styles.emptyTitle}>No Devices</Text>
            <Text style={styles.emptyDescription}>
              Scan for devices or add a new LED controller to get started
            </Text>
            <TouchableOpacity
              style={styles.emptyActionButton}
              onPress={handleScanForDevices}>
              <Icon name="bluetooth-searching" size={20} color="#fff" />
              <Text style={styles.emptyActionText}>Scan for Devices</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {connectedDevice && (
              <View style={styles.connectedDeviceCard}>
                <LinearGradient
                  colors={['#00ff88', '#00cc6a']}
                  style={styles.connectedGradient}>
                  <View style={styles.connectedInfo}>
                    <Icon name="bluetooth-connected" size={24} color="#fff" />
                    <View style={styles.connectedDetails}>
                      <Text style={styles.connectedTitle}>Currently Connected</Text>
                      <Text style={styles.connectedDeviceName}>{connectedDevice.name}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={handleDisconnectDevice}>
                    <Icon name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
            
            {devices.map(renderDeviceCard)}
          </>
        )}
      </ScrollView>

      {/* Device Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Device Settings</Text>
            <TouchableOpacity onPress={handleSaveSettings}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Device Name</Text>
              <TextInput
                style={styles.textInput}
                value={deviceSettings.name}
                onChangeText={(text) => setDeviceSettings(prev => ({...prev, name: text}))}
                placeholder="Enter device name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Auto-connect</Text>
                <Switch
                  value={deviceSettings.autoConnect}
                  onValueChange={(value) => setDeviceSettings(prev => ({...prev, autoConnect: value}))}
                  trackColor={{false: '#333', true: '#00ff88'}}
                  thumbColor={deviceSettings.autoConnect ? '#fff' : '#999'}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Power on startup</Text>
                <Switch
                  value={deviceSettings.powerOnStartup}
                  onValueChange={(value) => setDeviceSettings(prev => ({...prev, powerOnStartup: value}))}
                  trackColor={{false: '#333', true: '#00ff88'}}
                  thumbColor={deviceSettings.powerOnStartup ? '#fff' : '#999'}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Default Brightness: {deviceSettings.brightness}%</Text>
              <View style={styles.sliderContainer}>
                <Icon name="brightness-low" size={20} color="#666" />
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={100}
                  value={deviceSettings.brightness}
                  onValueChange={(value) => setDeviceSettings(prev => ({...prev, brightness: value}))}
                  minimumTrackTintColor="#00ff88"
                  maximumTrackTintColor="#333"
                  thumbStyle={styles.sliderThumb}
                />
                <Icon name="brightness-high" size={20} color="#666" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Default Color</Text>
              <View style={styles.colorPreview}>
                <View style={[styles.colorSwatch, {backgroundColor: deviceSettings.defaultColor}]} />
                <Text style={styles.colorText}>{deviceSettings.defaultColor}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  scanButtonActive: {
    backgroundColor: '#00ff88',
  },
  scanButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  scanButtonTextActive: {
    color: '#000',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ff88',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyActionText: {
    color: '#000',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectedDeviceCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  connectedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  connectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  connectedDetails: {
    marginLeft: 15,
  },
  connectedTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  connectedDeviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  disconnectButton: {
    padding: 5,
  },
  deviceCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
  },
  deviceType: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  deviceTypeText: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  deviceAddress: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  lastSeenText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  deviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectButton: {
    padding: 8,
    marginRight: 5,
  },
  settingsButton: {
    padding: 8,
    marginRight: 5,
  },
  removeButton: {
    padding: 8,
  },
  deviceSettings: {
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 15,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#999',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    fontSize: 16,
    color: '#00ff88',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#fff',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
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
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  colorText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default DeviceManagementScreen;
