import BluetoothClassic from 'react-native-bluetooth-classic';
import {PermissionsAndroid, Platform, Alert} from 'react-native';
import {
  BluetoothError,
  DeviceConnectionError,
  PermissionError,
  CommandError,
  ValidationError,
  ErrorHandler,
} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

class BluetoothService {
  constructor() {
    this.isConnected = false;
    this.device = null;
    this.listeners = [];
    this.connectionTimeout = null;
    this.commandTimeout = 2000; // 2 seconds
    this.maxRetryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Request Bluetooth permissions
  async requestPermissions() {
    logger.info('Requesting Bluetooth permissions');
    
    if (Platform.OS === 'android') {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];
        
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        const allGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );
        
        if (!allGranted) {
          const deniedPermissions = Object.entries(granted)
            .filter(([_, status]) => status !== PermissionsAndroid.RESULTS.GRANTED)
            .map(([permission, _]) => permission);
          
          logger.warn('Some permissions denied', {deniedPermissions});
          throw new PermissionError(
            'Required Bluetooth permissions were denied',
            deniedPermissions.join(', ')
          );
        }
        
        logger.info('All Bluetooth permissions granted');
        return true;
      } catch (error) {
        logger.error('Permission request failed', error);
        throw new PermissionError(
          'Failed to request Bluetooth permissions',
          'BLUETOOTH_PERMISSIONS',
          error
        );
      }
    }
    
    logger.info('iOS platform - permissions not required');
    return true;
  }

  // Enable Bluetooth
  async enableBluetooth() {
    logger.info('Checking Bluetooth status');
    
    try {
      const enabled = await BluetoothClassic.isBluetoothEnabled();
      
      if (!enabled) {
        logger.info('Bluetooth is disabled, requesting to enable');
        await BluetoothClassic.requestBluetoothEnabled();
        
        // Wait a moment for Bluetooth to enable
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify Bluetooth is now enabled
        const nowEnabled = await BluetoothClassic.isBluetoothEnabled();
        if (!nowEnabled) {
          throw new BluetoothError('Bluetooth was not enabled by user');
        }
        
        logger.info('Bluetooth enabled successfully');
      } else {
        logger.info('Bluetooth is already enabled');
      }
      
      return true;
    } catch (error) {
      logger.error('Failed to enable Bluetooth', error);
      throw new BluetoothError(
        'Failed to enable Bluetooth',
        'BLUETOOTH_ENABLE_ERROR',
        error
      );
    }
  }

  // Get paired devices
  async getPairedDevices() {
    logger.info('Retrieving paired devices');
    
    try {
      const devices = await BluetoothClassic.getBondedDevices();
      const ledDevices = devices.filter(device => 
        device.name && device.name.toLowerCase().includes('led')
      );
      
      logger.info(`Found ${ledDevices.length} LED devices`, {
        totalDevices: devices.length,
        ledDevices: ledDevices.map(d => ({id: d.id, name: d.name}))
      });
      
      return ledDevices;
    } catch (error) {
      logger.error('Failed to get paired devices', error);
      throw new BluetoothError(
        'Failed to retrieve paired devices',
        'GET_DEVICES_ERROR',
        error
      );
    }
  }

  // Connect to device with retry logic
  async connectToDevice(device, retryCount = 0) {
    if (!device || !device.id) {
      throw new ValidationError('Invalid device provided', 'device', device);
    }
    
    logger.info(`Attempting to connect to device: ${device.name}`, {
      deviceId: device.id,
      attempt: retryCount + 1
    });
    
    try {
      // Set connection timeout
      const connectionPromise = BluetoothClassic.connectToDevice(device.id);
      const timeoutPromise = new Promise((_, reject) => {
        this.connectionTimeout = setTimeout(() => {
          reject(new DeviceConnectionError(
            'Connection timeout',
            device.id
          ));
        }, 10000); // 10 second timeout
      });
      
      await Promise.race([connectionPromise, timeoutPromise]);
      
      // Clear timeout if connection succeeded
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      
      this.isConnected = true;
      this.device = device;
      
      logger.info(`Successfully connected to device: ${device.name}`);
      this.notifyListeners('connected', device);
      
      return true;
    } catch (error) {
      logger.error(`Connection attempt ${retryCount + 1} failed`, error);
      
      // Clear timeout on error
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      
      // Retry logic
      if (retryCount < this.maxRetryAttempts - 1) {
        logger.info(`Retrying connection in ${this.retryDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connectToDevice(device, retryCount + 1);
      }
      
      // Max retries reached
      const connectionError = new DeviceConnectionError(
        `Failed to connect to device after ${this.maxRetryAttempts} attempts`,
        device.id,
        error
      );
      
      this.notifyListeners('connectionError', connectionError);
      throw connectionError;
    }
  }

  // Disconnect from device
  async disconnect() {
    if (!this.isConnected) {
      logger.warn('Attempted to disconnect when not connected');
      return true;
    }
    
    logger.info(`Disconnecting from device: ${this.device?.name}`);
    
    try {
      await BluetoothClassic.disconnect();
      
      this.isConnected = false;
      const disconnectedDevice = this.device;
      this.device = null;
      
      logger.info('Successfully disconnected from device');
      this.notifyListeners('disconnected', disconnectedDevice);
      
      return true;
    } catch (error) {
      logger.error('Error during disconnect', error);
      
      // Force disconnect state even if error occurred
      this.isConnected = false;
      this.device = null;
      
      throw new BluetoothError(
        'Error occurred during disconnect',
        'DISCONNECT_ERROR',
        error
      );
    }
  }

  // Send command to LED device with validation and timeout
  async sendCommand(command, retryCount = 0) {
    if (!this.isConnected) {
      throw new CommandError('Not connected to any device', command);
    }
    
    if (!command || typeof command !== 'string') {
      throw new ValidationError('Command must be a non-empty string', 'command', command);
    }
    
    logger.debug(`Sending command: ${command.trim()}`, {
      deviceId: this.device.id,
      attempt: retryCount + 1
    });
    
    try {
      const commandPromise = BluetoothClassic.writeToDevice(this.device.id, command);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new CommandError('Command timeout', command));
        }, this.commandTimeout);
      });
      
      await Promise.race([commandPromise, timeoutPromise]);
      
      logger.debug('Command sent successfully', {command: command.trim()});
      return true;
    } catch (error) {
      logger.error(`Command failed (attempt ${retryCount + 1})`, error);
      
      // Retry logic for command failures
      if (retryCount < this.maxRetryAttempts - 1) {
        logger.info(`Retrying command in ${this.retryDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.sendCommand(command, retryCount + 1);
      }
      
      // Max retries reached
      throw new CommandError(
        `Failed to send command after ${this.maxRetryAttempts} attempts: ${command}`,
        command,
        error
      );
    }
  }

  // LED Control Commands with validation
  async setPower(isOn) {
    if (typeof isOn !== 'boolean') {
      throw new ValidationError('Power state must be a boolean', 'isOn', isOn);
    }
    
    const command = isOn ? 'POWER_ON\n' : 'POWER_OFF\n';
    logger.info(`Setting power: ${isOn ? 'ON' : 'OFF'}`);
    return await this.sendCommand(command);
  }

  async setColor(hexColor) {
    if (!hexColor || typeof hexColor !== 'string') {
      throw new ValidationError('Color must be a valid hex string', 'hexColor', hexColor);
    }
    
    // Validate hex color format
    const hexPattern = /^#?[0-9A-Fa-f]{6}$/;
    if (!hexPattern.test(hexColor)) {
      throw new ValidationError('Invalid hex color format', 'hexColor', hexColor);
    }
    
    const rgb = this.hexToRgb(hexColor);
    const command = `COLOR:${rgb.r},${rgb.g},${rgb.b}\n`;
    
    logger.info(`Setting color: ${hexColor} (RGB: ${rgb.r},${rgb.g},${rgb.b})`);
    return await this.sendCommand(command);
  }

  async setBrightness(brightness) {
    if (typeof brightness !== 'number' || brightness < 0 || brightness > 100) {
      throw new ValidationError('Brightness must be a number between 0 and 100', 'brightness', brightness);
    }
    
    const command = `BRIGHTNESS:${Math.round(brightness)}\n`;
    logger.info(`Setting brightness: ${brightness}%`);
    return await this.sendCommand(command);
  }

  async setEffect(effectName, speed = 50) {
    if (!effectName || typeof effectName !== 'string') {
      throw new ValidationError('Effect name must be a non-empty string', 'effectName', effectName);
    }
    
    if (typeof speed !== 'number' || speed < 1 || speed > 100) {
      throw new ValidationError('Speed must be a number between 1 and 100', 'speed', speed);
    }
    
    const command = `EFFECT:${effectName}:${Math.round(speed)}\n`;
    logger.info(`Setting effect: ${effectName} at speed ${speed}`);
    return await this.sendCommand(command);
  }

  async setPreset(presetName) {
    if (!presetName || typeof presetName !== 'string') {
      throw new ValidationError('Preset name must be a non-empty string', 'presetName', presetName);
    }
    
    const command = `PRESET:${presetName}\n`;
    logger.info(`Setting preset: ${presetName}`);
    return await this.sendCommand(command);
  }

  // Utility function to convert hex to RGB with validation
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw new ValidationError('Invalid hex color format', 'hex', hex);
    }
    
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  // Event listeners with improved management
  addListener(event, callback) {
    if (typeof event !== 'string' || typeof callback !== 'function') {
      throw new ValidationError('Event must be string and callback must be function', 'event/callback', {event, callback});
    }
    
    this.listeners.push({event, callback});
    logger.debug(`Added listener for event: ${event}`);
  }

  removeListener(event, callback) {
    const initialLength = this.listeners.length;
    this.listeners = this.listeners.filter(
      listener => !(listener.event === event && listener.callback === callback)
    );
    
    const removedCount = initialLength - this.listeners.length;
    logger.debug(`Removed ${removedCount} listener(s) for event: ${event}`);
  }

  removeAllListeners(event = null) {
    if (event) {
      const initialLength = this.listeners.length;
      this.listeners = this.listeners.filter(listener => listener.event !== event);
      const removedCount = initialLength - this.listeners.length;
      logger.debug(`Removed all ${removedCount} listener(s) for event: ${event}`);
    } else {
      const removedCount = this.listeners.length;
      this.listeners = [];
      logger.debug(`Removed all ${removedCount} listeners`);
    }
  }

  notifyListeners(event, data) {
    const eventListeners = this.listeners.filter(listener => listener.event === event);
    logger.debug(`Notifying ${eventListeners.length} listener(s) for event: ${event}`);
    
    eventListeners.forEach(listener => {
      try {
        listener.callback(data);
      } catch (error) {
        logger.error(`Error in event listener for ${event}`, error);
      }
    });
  }

  // Get connection status with detailed information
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      device: this.device ? {
        id: this.device.id,
        name: this.device.name,
        address: this.device.address
      } : null,
      connectionTime: this.isConnected ? new Date().toISOString() : null,
      listenerCount: this.listeners.length,
    };
  }

  // Cleanup method
  cleanup() {
    logger.info('Cleaning up Bluetooth service');
    
    // Clear any pending timeouts
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    // Remove all listeners
    this.removeAllListeners();
    
    // Disconnect if connected
    if (this.isConnected) {
      this.disconnect().catch(error => {
        logger.error('Error during cleanup disconnect', error);
      });
    }
  }
}

export default new BluetoothService();

