import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from 'react-native';

class BluetoothLEDService {
  constructor() {
    this.isConnected = false;
    this.isScanning = false;
    this.devices = [];
    this.currentDevice = null;
    this.eventEmitter = null;
    this.listeners = [];
    
    this.initializeService();
  }

  initializeService() {
    try {
      // Initialize Bluetooth service
      this.eventEmitter = new NativeEventEmitter(NativeModules.BluetoothLEDService);
      this.setupEventListeners();
    } catch (error) {
      console.log('Bluetooth service not available, using mock service');
      this.isMockService = true;
    }
  }

  setupEventListeners() {
    if (this.eventEmitter) {
      this.eventEmitter.addListener('DeviceFound', this.handleDeviceFound.bind(this));
      this.eventEmitter.addListener('DeviceConnected', this.handleDeviceConnected.bind(this));
      this.eventEmitter.addListener('DeviceDisconnected', this.handleDeviceDisconnected.bind(this));
      this.eventEmitter.addListener('DataReceived', this.handleDataReceived.bind(this));
      this.eventEmitter.addListener('Error', this.handleError.bind(this));
    }
  }

  async requestPermissions() {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      return Object.values(granted).every(permission => permission === 'granted');
    }
    return true;
  }

  async startScan() {
    if (this.isScanning) return;

    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      throw new Error('Bluetooth permissions not granted');
    }

    this.isScanning = true;
    this.devices = [];

    if (this.isMockService) {
      // Mock scanning
      setTimeout(() => {
        this.addMockDevices();
        this.isScanning = false;
        this.notifyListeners('scanComplete', this.devices);
      }, 2000);
    } else {
      try {
        await NativeModules.BluetoothLEDService.startScan();
      } catch (error) {
        this.isScanning = false;
        throw error;
      }
    }
  }

  stopScan() {
    this.isScanning = false;
    if (!this.isMockService) {
      NativeModules.BluetoothLEDService.stopScan();
    }
  }

  addMockDevices() {
    const mockDevices = [
      {
        id: 'mock-device-1',
        name: 'SmartLED Pro',
        address: '00:11:22:33:44:55',
        rssi: -45,
        isConnectable: true,
        services: ['LED_CONTROL_SERVICE'],
      },
      {
        id: 'mock-device-2',
        name: 'LED Strip Controller',
        address: '00:11:22:33:44:66',
        rssi: -60,
        isConnectable: true,
        services: ['LED_CONTROL_SERVICE'],
      },
      {
        id: 'mock-device-3',
        name: 'Arduino LED Controller',
        address: '00:11:22:33:44:77',
        rssi: -70,
        isConnectable: true,
        services: ['LED_CONTROL_SERVICE'],
      },
    ];

    mockDevices.forEach(device => {
      this.handleDeviceFound(device);
    });
  }

  async connectToDevice(deviceId) {
    if (this.isConnected) {
      await this.disconnect();
    }

    const device = this.devices.find(d => d.id === deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    try {
      if (this.isMockService) {
        // Mock connection
        setTimeout(() => {
          this.currentDevice = device;
          this.isConnected = true;
          this.notifyListeners('connected', device);
        }, 1000);
      } else {
        await NativeModules.BluetoothLEDService.connect(deviceId);
      }
    } catch (error) {
      throw new Error(`Failed to connect to device: ${error.message}`);
    }
  }

  async disconnect() {
    if (!this.isConnected) return;

    try {
      if (this.isMockService) {
        // Mock disconnection
        setTimeout(() => {
          this.isConnected = false;
          this.currentDevice = null;
          this.notifyListeners('disconnected');
        }, 500);
      } else {
        await NativeModules.BluetoothLEDService.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  async sendCommand(command) {
    if (!this.isConnected) {
      throw new Error('No device connected');
    }

    const commandData = {
      timestamp: Date.now(),
      ...command,
    };

    try {
      if (this.isMockService) {
        // Mock command sending
        console.log('Sending command:', commandData);
        this.notifyListeners('commandSent', commandData);
      } else {
        await NativeModules.BluetoothLEDService.sendCommand(JSON.stringify(commandData));
      }
    } catch (error) {
      throw new Error(`Failed to send command: ${error.message}`);
    }
  }

  // LED Control Commands
  async setPower(isOn) {
    return await this.sendCommand({
      type: 'POWER',
      value: isOn ? 1 : 0,
    });
  }

  async setBrightness(brightness) {
    const clampedBrightness = Math.max(0, Math.min(255, Math.round(brightness * 2.55)));
    return await this.sendCommand({
      type: 'BRIGHTNESS',
      value: clampedBrightness,
    });
  }

  async setColor(red, green, blue) {
    return await this.sendCommand({
      type: 'COLOR',
      red: Math.max(0, Math.min(255, red)),
      green: Math.max(0, Math.min(255, green)),
      blue: Math.max(0, Math.min(255, blue)),
    });
  }

  async setEffect(effectName, speed = 50) {
    return await this.sendCommand({
      type: 'EFFECT',
      effect: effectName,
      speed: Math.max(0, Math.min(100, speed)),
    });
  }

  async setMusicMode(enabled) {
    return await this.sendCommand({
      type: 'MUSIC_MODE',
      enabled: enabled,
    });
  }

  async setSchedule(schedule) {
    return await this.sendCommand({
      type: 'SCHEDULE',
      schedule: schedule,
    });
  }

  // Event Handlers
  handleDeviceFound(device) {
    if (!this.devices.find(d => d.id === device.id)) {
      this.devices.push(device);
      this.notifyListeners('deviceFound', device);
    }
  }

  handleDeviceConnected(device) {
    this.currentDevice = device;
    this.isConnected = true;
    this.notifyListeners('connected', device);
  }

  handleDeviceDisconnected() {
    this.isConnected = false;
    this.currentDevice = null;
    this.notifyListeners('disconnected');
  }

  handleDataReceived(data) {
    try {
      const parsedData = JSON.parse(data);
      this.notifyListeners('dataReceived', parsedData);
    } catch (error) {
      console.error('Error parsing received data:', error);
    }
  }

  handleError(error) {
    console.error('Bluetooth error:', error);
    this.notifyListeners('error', error);
  }

  // Listener Management
  addListener(event, callback) {
    const listener = { event, callback };
    this.listeners.push(listener);
    return () => this.removeListener(listener);
  }

  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(listener => listener.event === event)
      .forEach(listener => listener.callback(data));
  }

  // Getters
  getConnectedDevice() {
    return this.currentDevice;
  }

  getAvailableDevices() {
    return this.devices;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isScanning: this.isScanning,
      device: this.currentDevice,
    };
  }

  // Cleanup
  cleanup() {
    this.listeners = [];
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners();
    }
  }
}

// Singleton instance
const bluetoothLEDService = new BluetoothLEDService();

export default bluetoothLEDService;
