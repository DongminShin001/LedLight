/**
 * LEDController Class - Main controller for LED operations
 * Handles all LED-related functionality using OOP principles
 */

import BluetoothService from '../services/BluetoothService';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

class LEDController {
  constructor() {
    this.isConnected = false;
    this.currentDevice = null;
    this.currentColor = '#00ff88';
    this.currentBrightness = 50;
    this.isPoweredOn = false;
    this.currentEffect = null;
    this.listeners = new Map();
    
    this.initializeConnectionListeners();
  }

  /**
   * Initialize connection event listeners
   */
  initializeConnectionListeners() {
    BluetoothService.addListener('connected', (device) => {
      this.isConnected = true;
      this.currentDevice = device;
      this.notifyListeners('connected', device);
      logger.info('LED device connected', {device: device.name});
    });

    BluetoothService.addListener('disconnected', () => {
      this.isConnected = false;
      this.currentDevice = null;
      this.notifyListeners('disconnected');
      logger.info('LED device disconnected');
    });

    BluetoothService.addListener('connectionError', (error) => {
      this.notifyListeners('connectionError', error);
      logger.error('LED connection error', error);
    });
  }

  /**
   * Connect to a LED device
   * @param {Object} device - Device object to connect to
   * @returns {Promise<boolean>} - Success status
   */
  async connectToDevice(device) {
    try {
      logger.info('Attempting to connect to LED device', {device: device.name});
      const success = await BluetoothService.connectToDevice(device);
      
      if (success) {
        this.isConnected = true;
        this.currentDevice = device;
        this.notifyListeners('connected', device);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to connect to LED device', error);
      this.notifyListeners('connectionError', error);
      throw error;
    }
  }

  /**
   * Disconnect from current device
   * @returns {Promise<boolean>} - Success status
   */
  async disconnect() {
    try {
      if (!this.isConnected) {
        return true;
      }

      logger.info('Disconnecting from LED device');
      const success = await BluetoothService.disconnect();
      
      if (success) {
        this.isConnected = false;
        this.currentDevice = null;
        this.notifyListeners('disconnected');
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to disconnect from LED device', error);
      throw error;
    }
  }

  /**
   * Set LED power state
   * @param {boolean} isOn - Power state
   * @returns {Promise<boolean>} - Success status
   */
  async setPower(isOn) {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to any LED device');
      }

      logger.info('Setting LED power', {isOn});
      const success = await BluetoothService.setPower(isOn);
      
      if (success) {
        this.isPoweredOn = isOn;
        this.notifyListeners('powerChanged', isOn);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to set LED power', error);
      throw error;
    }
  }

  /**
   * Set LED color
   * @param {string} color - Hex color string
   * @returns {Promise<boolean>} - Success status
   */
  async setColor(color) {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to any LED device');
      }

      logger.info('Setting LED color', {color});
      const success = await BluetoothService.setColor(color);
      
      if (success) {
        this.currentColor = color;
        this.notifyListeners('colorChanged', color);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to set LED color', error);
      throw error;
    }
  }

  /**
   * Set LED brightness
   * @param {number} brightness - Brightness value (0-100)
   * @returns {Promise<boolean>} - Success status
   */
  async setBrightness(brightness) {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to any LED device');
      }

      logger.info('Setting LED brightness', {brightness});
      const success = await BluetoothService.setBrightness(brightness);
      
      if (success) {
        this.currentBrightness = brightness;
        this.notifyListeners('brightnessChanged', brightness);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to set LED brightness', error);
      throw error;
    }
  }

  /**
   * Set LED effect
   * @param {string} effectName - Effect name
   * @param {number} speed - Effect speed (1-100)
   * @returns {Promise<boolean>} - Success status
   */
  async setEffect(effectName, speed = 50) {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to any LED device');
      }

      logger.info('Setting LED effect', {effectName, speed});
      const success = await BluetoothService.setEffect(effectName, speed);
      
      if (success) {
        this.currentEffect = {name: effectName, speed};
        this.notifyListeners('effectChanged', {name: effectName, speed});
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to set LED effect', error);
      throw error;
    }
  }

  /**
   * Set LED preset
   * @param {string} presetName - Preset name
   * @returns {Promise<boolean>} - Success status
   */
  async setPreset(presetName) {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to any LED device');
      }

      logger.info('Setting LED preset', {presetName});
      const success = await BluetoothService.setPreset(presetName);
      
      if (success) {
        this.notifyListeners('presetChanged', presetName);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to set LED preset', error);
      throw error;
    }
  }

  /**
   * Send custom command to LED device
   * @param {string} command - Command string
   * @returns {Promise<boolean>} - Success status
   */
  async sendCommand(command) {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to any LED device');
      }

      logger.info('Sending custom command to LED device', {command});
      const success = await BluetoothService.sendCommand(command);
      
      if (success) {
        this.notifyListeners('commandSent', command);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to send command to LED device', error);
      throw error;
    }
  }

  /**
   * Get available LED devices
   * @returns {Promise<Array>} - Array of available devices
   */
  async getAvailableDevices() {
    try {
      logger.info('Getting available LED devices');
      const devices = await BluetoothService.getPairedDevices();
      this.notifyListeners('devicesListed', devices);
      return devices;
    } catch (error) {
      logger.error('Failed to get available devices', error);
      throw error;
    }
  }

  /**
   * Get current LED state
   * @returns {Object} - Current state object
   */
  getState() {
    return {
      isConnected: this.isConnected,
      device: this.currentDevice,
      color: this.currentColor,
      brightness: this.currentBrightness,
      isPoweredOn: this.isPoweredOn,
      effect: this.currentEffect,
    };
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
    logger.info('Cleaning up LEDController');
    this.listeners.clear();
    
    if (this.isConnected) {
      this.disconnect().catch(error => {
        logger.error('Error during cleanup disconnect', error);
      });
    }
  }
}

// Export singleton instance
export default new LEDController();
