/**
 * DeviceManager Class - Handles device discovery and connection
 * Manages Bluetooth device operations and connection state
 */

import BluetoothService from '../services/BluetoothService';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

class DeviceManager {
  constructor() {
    this.availableDevices = [];
    this.connectedDevice = null;
    this.isScanning = false;
    this.isConnecting = false;
    this.connectionState = 'disconnected'; // disconnected, connecting, connected, error
    
    this.listeners = new Map();
    this.initializeBluetoothListeners();
  }

  /**
   * Initialize Bluetooth service listeners
   */
  initializeBluetoothListeners() {
    BluetoothService.addListener('connected', (device) => {
      this.connectedDevice = device;
      this.connectionState = 'connected';
      this.notifyListeners('deviceConnected', device);
      logger.info('Device connected', {device: device.name});
    });

    BluetoothService.addListener('disconnected', () => {
      this.connectedDevice = null;
      this.connectionState = 'disconnected';
      this.notifyListeners('deviceDisconnected');
      logger.info('Device disconnected');
    });

    BluetoothService.addListener('connectionError', (error) => {
      this.connectionState = 'error';
      this.notifyListeners('connectionError', error);
      logger.error('Device connection error', error);
    });
  }

  /**
   * Request Bluetooth permissions
   * @returns {Promise<boolean>} - Success status
   */
  async requestPermissions() {
    try {
      logger.info('Requesting Bluetooth permissions');
      const success = await BluetoothService.requestPermissions();
      
      if (success) {
        this.notifyListeners('permissionsGranted');
        logger.info('Bluetooth permissions granted');
        return true;
      }
      
      throw new Error('Bluetooth permissions denied');
    } catch (error) {
      logger.error('Failed to request Bluetooth permissions', error);
      this.notifyListeners('permissionsDenied', error);
      throw error;
    }
  }

  /**
   * Enable Bluetooth
   * @returns {Promise<boolean>} - Success status
   */
  async enableBluetooth() {
    try {
      logger.info('Enabling Bluetooth');
      const success = await BluetoothService.enableBluetooth();
      
      if (success) {
        this.notifyListeners('bluetoothEnabled');
        logger.info('Bluetooth enabled successfully');
        return true;
      }
      
      throw new Error('Failed to enable Bluetooth');
    } catch (error) {
      logger.error('Failed to enable Bluetooth', error);
      this.notifyListeners('bluetoothError', error);
      throw error;
    }
  }

  /**
   * Scan for available devices
   * @returns {Promise<Array>} - Array of available devices
   */
  async scanForDevices() {
    try {
      if (this.isScanning) {
        throw new Error('Already scanning for devices');
      }

      this.isScanning = true;
      this.notifyListeners('scanStarted');
      logger.info('Starting device scan');

      const devices = await BluetoothService.getPairedDevices();
      this.availableDevices = devices;
      
      this.isScanning = false;
      this.notifyListeners('scanCompleted', devices);
      logger.info('Device scan completed', {deviceCount: devices.length});
      
      return devices;
    } catch (error) {
      this.isScanning = false;
      this.notifyListeners('scanError', error);
      logger.error('Device scan failed', error);
      throw error;
    }
  }

  /**
   * Connect to a device
   * @param {Object} device - Device object to connect to
   * @returns {Promise<boolean>} - Success status
   */
  async connectToDevice(device) {
    try {
      if (this.isConnecting) {
        throw new Error('Already connecting to a device');
      }

      if (!device || !device.id) {
        throw new Error('Invalid device object');
      }

      this.isConnecting = true;
      this.connectionState = 'connecting';
      this.notifyListeners('connectionStarted', device);
      logger.info('Connecting to device', {device: device.name});

      const success = await BluetoothService.connectToDevice(device);
      
      if (success) {
        this.connectedDevice = device;
        this.connectionState = 'connected';
        this.isConnecting = false;
        this.notifyListeners('deviceConnected', device);
        logger.info('Successfully connected to device', {device: device.name});
        return true;
      }
      
      throw new Error('Failed to connect to device');
    } catch (error) {
      this.isConnecting = false;
      this.connectionState = 'error';
      this.notifyListeners('connectionError', error);
      logger.error('Failed to connect to device', error);
      throw error;
    }
  }

  /**
   * Disconnect from current device
   * @returns {Promise<boolean>} - Success status
   */
  async disconnect() {
    try {
      if (!this.connectedDevice) {
        return true; // Already disconnected
      }

      logger.info('Disconnecting from device', {device: this.connectedDevice.name});
      const success = await BluetoothService.disconnect();
      
      if (success) {
        this.connectedDevice = null;
        this.connectionState = 'disconnected';
        this.notifyListeners('deviceDisconnected');
        logger.info('Successfully disconnected from device');
        return true;
      }
      
      throw new Error('Failed to disconnect from device');
    } catch (error) {
      logger.error('Failed to disconnect from device', error);
      throw error;
    }
  }

  /**
   * Get available devices
   * @returns {Array} - Array of available devices
   */
  getAvailableDevices() {
    return [...this.availableDevices];
  }

  /**
   * Get connected device
   * @returns {Object|null} - Connected device object or null
   */
  getConnectedDevice() {
    return this.connectedDevice;
  }

  /**
   * Check if device is connected
   * @returns {boolean} - Connection status
   */
  isDeviceConnected() {
    return this.connectedDevice !== null && this.connectionState === 'connected';
  }

  /**
   * Get connection state
   * @returns {string} - Connection state
   */
  getConnectionState() {
    return this.connectionState;
  }

  /**
   * Check if currently scanning
   * @returns {boolean} - Scanning status
   */
  isCurrentlyScanning() {
    return this.isScanning;
  }

  /**
   * Check if currently connecting
   * @returns {boolean} - Connecting status
   */
  isCurrentlyConnecting() {
    return this.isConnecting;
  }

  /**
   * Get device by ID
   * @param {string} deviceId - Device ID
   * @returns {Object|null} - Device object or null
   */
  getDeviceById(deviceId) {
    return this.availableDevices.find(device => device.id === deviceId) || null;
  }

  /**
   * Get device by name
   * @param {string} deviceName - Device name
   * @returns {Object|null} - Device object or null
   */
  getDeviceByName(deviceName) {
    return this.availableDevices.find(device => 
      device.name.toLowerCase().includes(deviceName.toLowerCase())
    ) || null;
  }

  /**
   * Filter devices by name pattern
   * @param {string} pattern - Name pattern to search for
   * @returns {Array} - Array of matching devices
   */
  filterDevicesByName(pattern) {
    if (!pattern) {
      return this.getAvailableDevices();
    }

    return this.availableDevices.filter(device =>
      device.name.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Get device connection info
   * @returns {Object} - Connection information
   */
  getConnectionInfo() {
    return {
      state: this.connectionState,
      connectedDevice: this.connectedDevice,
      isScanning: this.isScanning,
      isConnecting: this.isConnecting,
      availableDevicesCount: this.availableDevices.length,
    };
  }

  /**
   * Refresh device list
   * @returns {Promise<Array>} - Updated device list
   */
  async refreshDevices() {
    try {
      logger.info('Refreshing device list');
      const devices = await this.scanForDevices();
      this.notifyListeners('devicesRefreshed', devices);
      return devices;
    } catch (error) {
      logger.error('Failed to refresh devices', error);
      throw error;
    }
  }

  /**
   * Initialize device manager
   * @returns {Promise<boolean>} - Success status
   */
  async initialize() {
    try {
      logger.info('Initializing DeviceManager');
      
      // Request permissions
      await this.requestPermissions();
      
      // Enable Bluetooth
      await this.enableBluetooth();
      
      // Scan for devices
      await this.scanForDevices();
      
      this.notifyListeners('initialized');
      logger.info('DeviceManager initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize DeviceManager', error);
      this.notifyListeners('initializationError', error);
      throw error;
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    logger.debug(`Added listener for event: ${event}`);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        logger.debug(`Removed listener for event: ${event}`);
      }
    }
  }

  /**
   * Notify all listeners of an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Error in event listener for ${event}`, error);
        }
      });
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    logger.info('Cleaning up DeviceManager');
    this.listeners.clear();
    
    if (this.connectedDevice) {
      this.disconnect().catch(error => {
        logger.error('Error during cleanup disconnect', error);
      });
    }
  }
}

// Export singleton instance
export default new DeviceManager();
