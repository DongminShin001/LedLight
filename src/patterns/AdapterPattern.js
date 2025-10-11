import logger from '../utils/Logger';

/**
 * Base Device Adapter - Implements Adapter Pattern
 */
export class DeviceAdapter {
  constructor(device) {
    this.device = device;
    this.adapterName = 'Base Adapter';
  }

  /**
   * Convert command to device-specific format
   * @param {Object} command - Generic command
   * @returns {string} Device-specific command
   */
  convertCommand(command) {
    throw new Error('convertCommand() must be implemented by subclass');
  }

  /**
   * Parse device response
   * @param {string} response - Device response
   * @returns {Object} Parsed response
   */
  parseResponse(response) {
    throw new Error('parseResponse() must be implemented by subclass');
  }

  /**
   * Get adapter name
   * @returns {string} Adapter name
   */
  getName() {
    return this.adapterName;
  }
}

/**
 * Arduino LED Adapter
 */
export class ArduinoLEDAdapter extends DeviceAdapter {
  constructor(device) {
    super(device);
    this.adapterName = 'Arduino LED Adapter';
  }

  convertCommand(command) {
    const {type, value} = command;
    
    switch (type) {
      case 'color':
        return `C:${this.rgbToHex(value)}\n`;
      case 'brightness':
        return `B:${value}\n`;
      case 'power':
        return `P:${value ? '1' : '0'}\n`;
      case 'effect':
        return `E:${this.effectToCode(value)}\n`;
      default:
        return `U:${value}\n`; // Unknown command
    }
  }

  parseResponse(response) {
    const parts = response.split(':');
    if (parts.length !== 2) {
      return {success: false, message: 'Invalid response'};
    }

    const [code, value] = parts;
    
    switch (code) {
      case 'OK':
        return {success: true, value};
      case 'ERR':
        return {success: false, error: value};
      case 'STATUS':
        return {success: true, status: this.parseStatus(value)};
      default:
        return {success: false, message: 'Unknown response'};
    }
  }

  rgbToHex(rgb) {
    // Convert RGB object to hex string
    const r = Math.round(rgb.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(rgb.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(rgb.b * 255).toString(16).padStart(2, '0');
    return `${r}${g}${b}`;
  }

  effectToCode(effect) {
    const effects = {
      rainbow: '01',
      pulse: '02',
      wave: '03',
      sparkle: '04',
      breathing: '05',
      chase: '06',
    };
    return effects[effect] || '00';
  }

  parseStatus(value) {
    const [power, brightness, color] = value.split(',');
    return {
      power: power === '1',
      brightness: parseInt(brightness),
      color: color,
    };
  }
}

/**
 * ESP32 LED Adapter
 */
export class ESP32LEDAdapter extends DeviceAdapter {
  constructor(device) {
    super(device);
    this.adapterName = 'ESP32 LED Adapter';
  }

  convertCommand(command) {
    // ESP32 uses JSON commands
    return JSON.stringify({
      cmd: command.type,
      val: command.value,
      ts: Date.now(),
    }) + '\n';
  }

  parseResponse(response) {
    try {
      const data = JSON.parse(response);
      return {
        success: data.status === 'ok',
        data: data.data,
        error: data.error,
      };
    } catch (error) {
      logger.error('Failed to parse ESP32 response', error);
      return {success: false, error: 'Invalid JSON'};
    }
  }
}

/**
 * WS2812B Strip Adapter
 */
export class WS2812BAdapter extends DeviceAdapter {
  constructor(device) {
    super(device);
    this.adapterName = 'WS2812B Strip Adapter';
    this.ledCount = device.ledCount || 60;
  }

  convertCommand(command) {
    const {type, value} = command;
    
    switch (type) {
      case 'color':
        // Set all LEDs to same color
        return this.createPixelArray(value);
      case 'pattern':
        return this.createPattern(value);
      case 'brightness':
        return `BRIGHTNESS:${value}\n`;
      default:
        return `CMD:${type}:${value}\n`;
    }
  }

  parseResponse(response) {
    if (response.startsWith('ACK')) {
      return {success: true, acknowledged: true};
    }
    if (response.startsWith('NACK')) {
      return {success: false, error: 'Command rejected'};
    }
    return {success: false, error: 'Unknown response'};
  }

  createPixelArray(color) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    
    const pixels = Array(this.ledCount).fill(`${r},${g},${b}`).join(';');
    return `PIXELS:${pixels}\n`;
  }

  createPattern(pattern) {
    return `PATTERN:${pattern.name}:${pattern.params}\n`;
  }
}

/**
 * Generic Bluetooth LED Adapter
 */
export class GenericBluetoothAdapter extends DeviceAdapter {
  constructor(device) {
    super(device);
    this.adapterName = 'Generic Bluetooth Adapter';
  }

  convertCommand(command) {
    // Simple protocol: TYPE,VALUE
    return `${command.type},${JSON.stringify(command.value)}\n`;
  }

  parseResponse(response) {
    const [status, ...data] = response.split(',');
    return {
      success: status === 'OK',
      data: data.join(','),
    };
  }
}

/**
 * Adapter Factory - Creates appropriate adapter for device
 */
export class AdapterFactory {
  static adapters = {
    arduino: ArduinoLEDAdapter,
    esp32: ESP32LEDAdapter,
    ws2812b: WS2812BAdapter,
    generic: GenericBluetoothAdapter,
  };

  /**
   * Create adapter for device
   * @param {Object} device - Device object
   * @returns {DeviceAdapter} Adapter instance
   */
  static createAdapter(device) {
    const deviceType = device.type?.toLowerCase() || 'generic';
    const AdapterClass = this.adapters[deviceType] || GenericBluetoothAdapter;
    
    const adapter = new AdapterClass(device);
    logger.info('Adapter created', {
      deviceType,
      adapterName: adapter.getName(),
    });
    
    return adapter;
  }

  /**
   * Register custom adapter
   * @param {string} type - Device type
   * @param {class} AdapterClass - Adapter class
   */
  static registerAdapter(type, AdapterClass) {
    this.adapters[type.toLowerCase()] = AdapterClass;
    logger.info('Custom adapter registered', {type});
  }

  /**
   * Get available adapter types
   * @returns {Array} Array of adapter types
   */
  static getAvailableTypes() {
    return Object.keys(this.adapters);
  }
}

/**
 * Adapter Manager - Manages multiple device adapters
 */
export class AdapterManager {
  constructor() {
    this.adapters = new Map();
    this.currentAdapter = null;
  }

  /**
   * Add adapter for device
   * @param {string} deviceId - Device ID
   * @param {DeviceAdapter} adapter - Adapter instance
   */
  addAdapter(deviceId, adapter) {
    this.adapters.set(deviceId, adapter);
    logger.info('Adapter added', {deviceId, adapterName: adapter.getName()});
  }

  /**
   * Get adapter for device
   * @param {string} deviceId - Device ID
   * @returns {DeviceAdapter} Adapter instance
   */
  getAdapter(deviceId) {
    return this.adapters.get(deviceId);
  }

  /**
   * Set current adapter
   * @param {string} deviceId - Device ID
   */
  setCurrentAdapter(deviceId) {
    const adapter = this.adapters.get(deviceId);
    if (adapter) {
      this.currentAdapter = adapter;
      logger.info('Current adapter set', {deviceId, adapterName: adapter.getName()});
    } else {
      logger.warn('Adapter not found', {deviceId});
    }
  }

  /**
   * Get current adapter
   * @returns {DeviceAdapter} Current adapter
   */
  getCurrentAdapter() {
    return this.currentAdapter;
  }

  /**
   * Remove adapter
   * @param {string} deviceId - Device ID
   */
  removeAdapter(deviceId) {
    const removed = this.adapters.delete(deviceId);
    if (removed) {
      logger.info('Adapter removed', {deviceId});
    }
    return removed;
  }

  /**
   * Clear all adapters
   */
  clearAdapters() {
    this.adapters.clear();
    this.currentAdapter = null;
    logger.info('All adapters cleared');
  }

  /**
   * Get adapter count
   * @returns {number} Number of adapters
   */
  getAdapterCount() {
    return this.adapters.size;
  }
}
