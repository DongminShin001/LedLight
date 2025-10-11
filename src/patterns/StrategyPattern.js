import logger from '../utils/Logger';

/**
 * Base Bluetooth Strategy - Implements Strategy Pattern
 */
export class BluetoothStrategy {
  constructor() {
    this.name = 'Base Strategy';
  }

  /**
   * Connect to device
   * @param {Object} device - Device object
   * @returns {Promise<boolean>} Success status
   */
  async connect(device) {
    throw new Error('connect() must be implemented by subclass');
  }

  /**
   * Disconnect from device
   * @returns {Promise<boolean>} Success status
   */
  async disconnect() {
    throw new Error('disconnect() must be implemented by subclass');
  }

  /**
   * Send data to device
   * @param {string} data - Data to send
   * @returns {Promise<boolean>} Success status
   */
  async sendData(data) {
    throw new Error('sendData() must be implemented by subclass');
  }

  /**
   * Receive data from device
   * @returns {Promise<string>} Received data
   */
  async receiveData() {
    throw new Error('receiveData() must be implemented by subclass');
  }

  /**
   * Check if connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    throw new Error('isConnected() must be implemented by subclass');
  }

  /**
   * Get strategy name
   * @returns {string} Strategy name
   */
  getName() {
    return this.name;
  }
}

/**
 * Bluetooth Classic Strategy
 */
export class BluetoothClassicStrategy extends BluetoothStrategy {
  constructor(bluetoothSerial) {
    super();
    this.name = 'Bluetooth Classic';
    this.bluetoothSerial = bluetoothSerial;
    this.connectedDevice = null;
  }

  async connect(device) {
    try {
      await this.bluetoothSerial.connect(device.id);
      this.connectedDevice = device;
      logger.info('Connected via Bluetooth Classic', {deviceId: device.id});
      return true;
    } catch (error) {
      logger.error('Bluetooth Classic connection failed', error);
      return false;
    }
  }

  async disconnect() {
    try {
      await this.bluetoothSerial.disconnect();
      this.connectedDevice = null;
      logger.info('Disconnected from Bluetooth Classic');
      return true;
    } catch (error) {
      logger.error('Bluetooth Classic disconnection failed', error);
      return false;
    }
  }

  async sendData(data) {
    try {
      await this.bluetoothSerial.write(data);
      logger.info('Data sent via Bluetooth Classic', {dataLength: data.length});
      return true;
    } catch (error) {
      logger.error('Failed to send data via Bluetooth Classic', error);
      return false;
    }
  }

  async receiveData() {
    try {
      const data = await this.bluetoothSerial.read();
      logger.info('Data received via Bluetooth Classic', {dataLength: data.length});
      return data;
    } catch (error) {
      logger.error('Failed to receive data via Bluetooth Classic', error);
      return null;
    }
  }

  isConnected() {
    return this.connectedDevice !== null;
  }
}

/**
 * Bluetooth Low Energy (BLE) Strategy
 */
export class BLEStrategy extends BluetoothStrategy {
  constructor(bleManager) {
    super();
    this.name = 'Bluetooth Low Energy';
    this.bleManager = bleManager;
    this.connectedDevice = null;
    this.characteristic = null;
  }

  async connect(device) {
    try {
      await this.bleManager.connectToDevice(device.id);
      await this.bleManager.discoverAllServicesAndCharacteristicsForDevice(device.id);
      this.connectedDevice = device;
      logger.info('Connected via BLE', {deviceId: device.id});
      return true;
    } catch (error) {
      logger.error('BLE connection failed', error);
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.connectedDevice) {
        await this.bleManager.cancelDeviceConnection(this.connectedDevice.id);
      }
      this.connectedDevice = null;
      logger.info('Disconnected from BLE');
      return true;
    } catch (error) {
      logger.error('BLE disconnection failed', error);
      return false;
    }
  }

  async sendData(data) {
    try {
      if (!this.connectedDevice || !this.characteristic) {
        throw new Error('Not connected or characteristic not set');
      }
      
      await this.bleManager.writeCharacteristicWithResponseForDevice(
        this.connectedDevice.id,
        this.characteristic.serviceUUID,
        this.characteristic.uuid,
        data
      );
      
      logger.info('Data sent via BLE', {dataLength: data.length});
      return true;
    } catch (error) {
      logger.error('Failed to send data via BLE', error);
      return false;
    }
  }

  async receiveData() {
    try {
      if (!this.connectedDevice || !this.characteristic) {
        throw new Error('Not connected or characteristic not set');
      }
      
      const data = await this.bleManager.readCharacteristicForDevice(
        this.connectedDevice.id,
        this.characteristic.serviceUUID,
        this.characteristic.uuid
      );
      
      logger.info('Data received via BLE', {dataLength: data.length});
      return data;
    } catch (error) {
      logger.error('Failed to receive data via BLE', error);
      return null;
    }
  }

  setCharacteristic(characteristic) {
    this.characteristic = characteristic;
  }

  isConnected() {
    return this.connectedDevice !== null;
  }
}

/**
 * WiFi Strategy (for future ESP32 WiFi support)
 */
export class WiFiStrategy extends BluetoothStrategy {
  constructor() {
    super();
    this.name = 'WiFi';
    this.socket = null;
    this.host = null;
    this.port = null;
  }

  async connect(device) {
    try {
      this.host = device.host;
      this.port = device.port;
      // WiFi socket connection implementation would go here
      logger.info('Connected via WiFi', {host: this.host, port: this.port});
      return true;
    } catch (error) {
      logger.error('WiFi connection failed', error);
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.socket) {
        // Close socket connection
        this.socket = null;
      }
      logger.info('Disconnected from WiFi');
      return true;
    } catch (error) {
      logger.error('WiFi disconnection failed', error);
      return false;
    }
  }

  async sendData(data) {
    try {
      // Send data over WiFi socket
      logger.info('Data sent via WiFi', {dataLength: data.length});
      return true;
    } catch (error) {
      logger.error('Failed to send data via WiFi', error);
      return false;
    }
  }

  async receiveData() {
    try {
      // Receive data from WiFi socket
      logger.info('Data received via WiFi');
      return '';
    } catch (error) {
      logger.error('Failed to receive data via WiFi', error);
      return null;
    }
  }

  isConnected() {
    return this.socket !== null;
  }
}

/**
 * Mock Strategy (for testing)
 */
export class MockStrategy extends BluetoothStrategy {
  constructor() {
    super();
    this.name = 'Mock Connection';
    this.connected = false;
    this.dataQueue = [];
  }

  async connect(device) {
    this.connected = true;
    logger.info('Mock connection established', {deviceId: device.id});
    return true;
  }

  async disconnect() {
    this.connected = false;
    logger.info('Mock connection closed');
    return true;
  }

  async sendData(data) {
    this.dataQueue.push(data);
    logger.info('Mock data sent', {data});
    return true;
  }

  async receiveData() {
    const data = this.dataQueue.shift() || 'mock_response';
    logger.info('Mock data received', {data});
    return data;
  }

  isConnected() {
    return this.connected;
  }
}

/**
 * Bluetooth Context - Manages strategy selection
 */
export class BluetoothContext {
  constructor() {
    this.strategy = null;
    this.availableStrategies = new Map();
  }

  /**
   * Register a strategy
   * @param {string} name - Strategy name
   * @param {BluetoothStrategy} strategy - Strategy instance
   */
  registerStrategy(name, strategy) {
    this.availableStrategies.set(name, strategy);
    logger.info('Strategy registered', {name});
  }

  /**
   * Set current strategy
   * @param {string} name - Strategy name
   */
  setStrategy(name) {
    const strategy = this.availableStrategies.get(name);
    if (!strategy) {
      throw new Error(`Strategy not found: ${name}`);
    }
    this.strategy = strategy;
    logger.info('Strategy set', {name});
  }

  /**
   * Auto-select strategy based on device
   * @param {Object} device - Device object
   */
  autoSelectStrategy(device) {
    if (device.type === 'BLE') {
      this.setStrategy('BLE');
    } else if (device.type === 'WiFi') {
      this.setStrategy('WiFi');
    } else if (device.type === 'Mock') {
      this.setStrategy('Mock');
    } else {
      this.setStrategy('Bluetooth Classic');
    }
    logger.info('Strategy auto-selected', {deviceType: device.type});
  }

  /**
   * Connect using current strategy
   * @param {Object} device - Device object
   * @returns {Promise<boolean>} Success status
   */
  async connect(device) {
    if (!this.strategy) {
      throw new Error('No strategy set');
    }
    return await this.strategy.connect(device);
  }

  /**
   * Disconnect using current strategy
   * @returns {Promise<boolean>} Success status
   */
  async disconnect() {
    if (!this.strategy) {
      throw new Error('No strategy set');
    }
    return await this.strategy.disconnect();
  }

  /**
   * Send data using current strategy
   * @param {string} data - Data to send
   * @returns {Promise<boolean>} Success status
   */
  async sendData(data) {
    if (!this.strategy) {
      throw new Error('No strategy set');
    }
    return await this.strategy.sendData(data);
  }

  /**
   * Receive data using current strategy
   * @returns {Promise<string>} Received data
   */
  async receiveData() {
    if (!this.strategy) {
      throw new Error('No strategy set');
    }
    return await this.strategy.receiveData();
  }

  /**
   * Check connection status
   * @returns {boolean} Connection status
   */
  isConnected() {
    if (!this.strategy) {
      return false;
    }
    return this.strategy.isConnected();
  }

  /**
   * Get current strategy name
   * @returns {string} Strategy name
   */
  getCurrentStrategyName() {
    return this.strategy ? this.strategy.getName() : 'None';
  }

  /**
   * Get available strategies
   * @returns {Array} Array of strategy names
   */
  getAvailableStrategies() {
    return Array.from(this.availableStrategies.keys());
  }
}
