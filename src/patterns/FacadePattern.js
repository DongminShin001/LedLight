import {CommandFactory, CommandInvoker} from './CommandPattern';
import {LEDStateContext} from './StatePattern';
import {EffectFactory, EffectBuilder} from './DecoratorPattern';
import {RepositoryFactory} from './RepositoryPattern';
import {BluetoothContext} from './StrategyPattern';
import {ErrorHandlerManager} from './ChainOfResponsibility';
import {AdapterFactory, AdapterManager} from './AdapterPattern';
import {MementoManager} from './MementoPattern';
import logger from '../utils/Logger';

/**
 * LED Controller Facade - Simplified API
 * Implements Facade Pattern
 */
export class LEDControllerFacade {
  constructor() {
    // Initialize all subsystems
    this.commandInvoker = new CommandInvoker();
    this.stateContext = new LEDStateContext();
    this.bluetoothContext = new BluetoothContext();
    this.adapterManager = new AdapterManager();
    this.mementoManager = new MementoManager();
    this.errorHandler = ErrorHandlerManager.getInstance();
    
    // Repositories
    this.presetRepo = RepositoryFactory.getPresetRepository();
    this.scheduleRepo = RepositoryFactory.getScheduleRepository();
    this.deviceRepo = RepositoryFactory.getDeviceRepository();
    this.analyticsRepo = RepositoryFactory.getAnalyticsRepository();
    
    // Current device
    this.currentDevice = null;
    this.currentAdapter = null;
    
    // State
    this.isInitialized = false;
    
    logger.info('LED Controller Facade initialized');
  }

  /**
   * Initialize the controller
   */
  async initialize() {
    try {
      await this.loadConfiguration();
      this.isInitialized = true;
      logger.info('LED Controller Facade ready');
      return true;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        context: 'initialization',
        notifyUser: this.notifyUser,
      });
      return false;
    }
  }

  /**
   * Connect to device
   * @param {Object} device - Device object
   * @returns {Promise<boolean>} Success status
   */
  async connect(device) {
    try {
      // Create adapter for device
      this.currentAdapter = AdapterFactory.createAdapter(device);
      this.adapterManager.addAdapter(device.id, this.currentAdapter);
      this.adapterManager.setCurrentAdapter(device.id);
      
      // Set up Bluetooth strategy
      this.bluetoothContext.autoSelectStrategy(device);
      
      // Update state
      this.stateContext.onConnecting();
      
      // Connect
      const success = await this.bluetoothContext.connect(device);
      
      if (success) {
        this.currentDevice = device;
        this.stateContext.onConnected();
        await this.deviceRepo.save(device.id, device);
        await this.saveAnalytics('connection', {deviceId: device.id, success: true});
        logger.info('Device connected successfully', {deviceId: device.id});
        return true;
      }
      
      throw new Error('Connection failed');
    } catch (error) {
      this.stateContext.onError(error);
      await this.errorHandler.handleError(error, {
        context: 'connection',
        device,
        attemptReconnect: true,
        reconnectCallback: this.connect.bind(this),
        notifyUser: this.notifyUser,
      });
      return false;
    }
  }

  /**
   * Disconnect from device
   * @returns {Promise<boolean>} Success status
   */
  async disconnect() {
    try {
      await this.bluetoothContext.disconnect();
      this.stateContext.onDisconnected();
      this.currentDevice = null;
      await this.saveAnalytics('disconnection', {timestamp: Date.now()});
      logger.info('Device disconnected');
      return true;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        context: 'disconnection',
        notifyUser: this.notifyUser,
      });
      return false;
    }
  }

  /**
   * Set LED color
   * @param {string} color - Color value (hex or RGB)
   * @returns {Promise<boolean>} Success status
   */
  async setColor(color) {
    try {
      const command = CommandFactory.createSetColorCommand(this, color);
      await this.commandInvoker.executeCommand(command);
      await this.stateContext.changeColor(color);
      this.mementoManager.updateProperty('color', color);
      await this.saveAnalytics('color_change', {color});
      return true;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        context: 'setColor',
        notifyUser: this.notifyUser,
      });
      return false;
    }
  }

  /**
   * Set LED brightness
   * @param {number} brightness - Brightness value (0-100)
   * @returns {Promise<boolean>} Success status
   */
  async setBrightness(brightness) {
    try {
      const command = CommandFactory.createSetBrightnessCommand(this, brightness);
      await this.commandInvoker.executeCommand(command);
      await this.stateContext.changeBrightness(brightness);
      this.mementoManager.updateProperty('brightness', brightness);
      await this.saveAnalytics('brightness_change', {brightness});
      return true;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        context: 'setBrightness',
        notifyUser: this.notifyUser,
      });
      return false;
    }
  }

  /**
   * Toggle LED power
   * @returns {Promise<boolean>} Success status
   */
  async togglePower() {
    try {
      const command = CommandFactory.createTogglePowerCommand(this);
      await this.commandInvoker.executeCommand(command);
      
      const newState = !this.mementoManager.getProperty('power');
      if (newState) {
        await this.stateContext.powerOn();
      } else {
        await this.stateContext.powerOff();
      }
      
      this.mementoManager.updateProperty('power', newState);
      await this.saveAnalytics('power_toggle', {power: newState});
      return true;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        context: 'togglePower',
        notifyUser: this.notifyUser,
      });
      return false;
    }
  }

  /**
   * Set LED effect
   * @param {string} effectName - Effect name
   * @param {Object} options - Effect options
   * @returns {Promise<boolean>} Success status
   */
  async setEffect(effectName, options = {}) {
    try {
      // Create base effect
      let effect;
      switch (effectName) {
        case 'rainbow':
          effect = EffectFactory.createRainbow();
          break;
        case 'pulse':
          effect = EffectFactory.createPulse();
          break;
        case 'wave':
          effect = EffectFactory.createWave();
          break;
        case 'sparkle':
          effect = EffectFactory.createSparkle();
          break;
        case 'breathing':
          effect = EffectFactory.createBreathing();
          break;
        case 'chase':
          effect = EffectFactory.createChase();
          break;
        default:
          effect = EffectFactory.createCustomEffect(effectName, options);
      }

      // Apply decorators
      const builder = EffectFactory.createBuilder(effect);
      if (options.speed) builder.withSpeed(options.speed);
      if (options.intensity) builder.withIntensity(options.intensity);
      if (options.colorFilter) builder.withColorFilter(options.colorFilter);
      if (options.reverse) builder.withReverse();
      if (options.fade) builder.withFade(options.fade.in, options.fade.out);
      if (options.strobe) builder.withStrobe(options.strobe);
      
      const enhancedEffect = builder.build();
      const effectConfig = await enhancedEffect.apply();
      
      // Execute command
      const command = CommandFactory.createSetEffectCommand(this, effectConfig);
      await this.commandInvoker.executeCommand(command);
      await this.stateContext.changeEffect(effectName);
      
      this.mementoManager.updateProperty('effect', effectName);
      await this.saveAnalytics('effect_change', {effect: effectName, options});
      
      return true;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        context: 'setEffect',
        notifyUser: this.notifyUser,
      });
      return false;
    }
  }

  /**
   * Undo last operation
   * @returns {Promise<boolean>} Success status
   */
  async undo() {
    try {
      const success = await this.commandInvoker.undo();
      if (success) {
        this.mementoManager.undo();
        await this.saveAnalytics('undo', {timestamp: Date.now()});
      }
      return success;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        context: 'undo',
        notifyUser: this.notifyUser,
      });
      return false;
    }
  }

  /**
   * Redo last undone operation
   * @returns {Promise<boolean>} Success status
   */
  async redo() {
    try {
      const success = await this.commandInvoker.redo();
      if (success) {
        this.mementoManager.redo();
        await this.saveAnalytics('redo', {timestamp: Date.now()});
      }
      return success;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        context: 'redo',
        notifyUser: this.notifyUser,
      });
      return false;
    }
  }

  /**
   * Save preset
   * @param {string} name - Preset name
   * @param {Object} preset - Preset data
   * @returns {Promise<boolean>} Success status
   */
  async savePreset(name, preset = null) {
    try {
      const presetData = preset || this.mementoManager.getState();
      await this.presetRepo.save(name, {
        ...presetData,
        name,
        createdAt: Date.now(),
      });
      await this.saveAnalytics('preset_saved', {name});
      logger.info('Preset saved', {name});
      return true;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        context: 'savePreset',
        notifyUser: this.notifyUser,
      });
      return false;
    }
  }

  /**
   * Load preset
   * @param {string} name - Preset name
   * @returns {Promise<boolean>} Success status
   */
  async loadPreset(name) {
    try {
      const preset = await this.presetRepo.findByKey(name);
      if (!preset) {
        throw new Error('Preset not found');
      }

      // Apply preset
      if (preset.color) await this.setColor(preset.color);
      if (preset.brightness) await this.setBrightness(preset.brightness);
      if (preset.effect) await this.setEffect(preset.effect);
      
      this.mementoManager.setState(preset);
      await this.saveAnalytics('preset_loaded', {name});
      logger.info('Preset loaded', {name});
      return true;
    } catch (error) {
      await this.errorHandler.handleError(error, {
        context: 'loadPreset',
        notifyUser: this.notifyUser,
      });
      return false;
    }
  }

  /**
   * Get all presets
   * @returns {Promise<Object>} Presets object
   */
  async getPresets() {
    return await this.presetRepo.findAll();
  }

  /**
   * Delete preset
   * @param {string} name - Preset name
   * @returns {Promise<boolean>} Success status
   */
  async deletePreset(name) {
    return await this.presetRepo.delete(name);
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return {
      ...this.mementoManager.getState(),
      stateContext: this.stateContext.getCurrentStateName(),
      device: this.currentDevice,
      isConnected: this.bluetoothContext.isConnected(),
      canUndo: this.commandInvoker.canUndo(),
      canRedo: this.commandInvoker.canRedo(),
    };
  }

  /**
   * Get analytics
   * @param {string} key - Analytics key
   * @returns {Promise<Array>} Analytics data
   */
  async getAnalytics(key) {
    return await this.analyticsRepo.findByKey(key);
  }

  /**
   * Get command history
   * @returns {Array} Command history
   */
  getCommandHistory() {
    return this.commandInvoker.getHistory();
  }

  /**
   * Get state history
   * @returns {Array} State history
   */
  getStateHistory() {
    return this.mementoManager.getHistory();
  }

  /**
   * Reset to default state
   */
  reset() {
    this.commandInvoker.clearHistory();
    this.mementoManager.reset();
    this.stateContext.reset();
    logger.info('Controller reset to default state');
  }

  // Private methods

  async loadConfiguration() {
    // Load saved configuration
    logger.info('Loading configuration');
  }

  async saveAnalytics(event, data) {
    await this.analyticsRepo.save(event, data);
  }

  notifyUser(notification) {
    logger.info('User notification', notification);
    // This will be implemented by the UI layer
  }

  // Implement receiver methods for commands

  getCurrentColor() {
    return this.mementoManager.getProperty('color');
  }

  getCurrentBrightness() {
    return this.mementoManager.getProperty('brightness');
  }

  isPoweredOn() {
    return this.mementoManager.getProperty('power');
  }

  getCurrentEffect() {
    return this.mementoManager.getProperty('effect');
  }

  async sendCommand(command) {
    if (!this.currentAdapter) {
      throw new Error('No device connected');
    }
    
    const deviceCommand = this.currentAdapter.convertCommand(command);
    await this.bluetoothContext.sendData(deviceCommand);
  }
}

/**
 * Simple LED Control Facade - Ultra-simplified API
 */
export class SimpleLEDFacade {
  constructor() {
    this.controller = new LEDControllerFacade();
  }

  async init() {
    return await this.controller.initialize();
  }

  async connect(device) {
    return await this.controller.connect(device);
  }

  async disconnect() {
    return await this.controller.disconnect();
  }

  async on() {
    if (!this.controller.isPoweredOn()) {
      return await this.controller.togglePower();
    }
    return true;
  }

  async off() {
    if (this.controller.isPoweredOn()) {
      return await this.controller.togglePower();
    }
    return true;
  }

  async color(color) {
    return await this.controller.setColor(color);
  }

  async bright(level) {
    return await this.controller.setBrightness(level);
  }

  async rainbow(speed = 1.0) {
    return await this.controller.setEffect('rainbow', {speed});
  }

  async pulse(speed = 1.0) {
    return await this.controller.setEffect('pulse', {speed});
  }

  async wave(speed = 1.0) {
    return await this.controller.setEffect('wave', {speed});
  }

  async undo() {
    return await this.controller.undo();
  }

  async redo() {
    return await this.controller.redo();
  }

  async save(name) {
    return await this.controller.savePreset(name);
  }

  async load(name) {
    return await this.controller.loadPreset(name);
  }
}

export default LEDControllerFacade;
