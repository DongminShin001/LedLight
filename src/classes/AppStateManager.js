/**
 * AppStateManager Class - Centralized state management
 * Manages global app state and provides reactive updates
 */

import {DeviceManager} from './DeviceManager';
import {LEDController} from './LEDController';
import {ColorManager} from './ColorManager';
import {TextManager} from './TextManager';
import logger from '../utils/Logger';

class AppStateManager {
  constructor() {
    this.state = {
      // Device state
      isConnected: false,
      connectedDevice: null,
      connectionState: 'disconnected',
      
      // LED state
      isPoweredOn: false,
      currentColor: '#00ff88',
      currentBrightness: 50,
      currentEffect: null,
      
      // UI state
      isLoading: false,
      error: null,
      lastUpdate: null,
    };
    
    this.listeners = new Map();
    this.updateInterval = null;
    this.isInitialized = false;
    
    this.initialize();
  }

  /**
   * Initialize the state manager
   */
  async initialize() {
    try {
      logger.info('Initializing AppStateManager');
      
      // Set up event listeners for all managers
      this.setupEventListeners();
      
      // Start periodic state updates
      this.startPeriodicUpdates();
      
      // Initial state sync
      await this.syncState();
      
      this.isInitialized = true;
      this.notifyListeners('initialized');
      logger.info('AppStateManager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AppStateManager', error);
      this.setState({error: error.message});
    }
  }

  /**
   * Set up event listeners for all managers
   */
  setupEventListeners() {
    // Device Manager events
    DeviceManager.addListener('deviceConnected', (device) => {
      this.setState({
        isConnected: true,
        connectedDevice: device,
        connectionState: 'connected',
        error: null,
      });
    });

    DeviceManager.addListener('deviceDisconnected', () => {
      this.setState({
        isConnected: false,
        connectedDevice: null,
        connectionState: 'disconnected',
        isPoweredOn: false,
      });
    });

    DeviceManager.addListener('connectionError', (error) => {
      this.setState({
        connectionState: 'error',
        error: error.message,
      });
    });

    // LED Controller events
    LEDController.addListener('powerChanged', (isOn) => {
      this.setState({isPoweredOn: isOn});
    });

    LEDController.addListener('colorChanged', (color) => {
      this.setState({currentColor: color});
    });

    LEDController.addListener('brightnessChanged', (brightness) => {
      this.setState({currentBrightness: brightness});
    });

    LEDController.addListener('effectChanged', (effect) => {
      this.setState({currentEffect: effect});
    });
  }

  /**
   * Start periodic state updates
   */
  startPeriodicUpdates() {
    this.updateInterval = setInterval(() => {
      this.syncState();
    }, 5000); // Update every 5 seconds
  }

  /**
   * Stop periodic updates
   */
  stopPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Sync state with all managers
   */
  async syncState() {
    try {
      const deviceState = DeviceManager.getConnectionInfo();
      const ledState = LEDController.getState();
      
      const newState = {
        isConnected: deviceState.connectedDevice !== null,
        connectedDevice: deviceState.connectedDevice,
        connectionState: deviceState.state,
        isPoweredOn: ledState.isPoweredOn,
        currentColor: ledState.color,
        currentBrightness: ledState.brightness,
        currentEffect: ledState.effect,
        lastUpdate: new Date().toISOString(),
      };
      
      this.setState(newState);
    } catch (error) {
      logger.error('Failed to sync state', error);
    }
  }

  /**
   * Set state and notify listeners
   * @param {Object} newState - New state properties
   */
  setState(newState) {
    const oldState = {...this.state};
    this.state = {...this.state, ...newState};
    
    // Notify listeners of state changes
    this.notifyListeners('stateChanged', {
      oldState,
      newState: this.state,
      changes: newState,
    });
    
    logger.debug('AppStateManager state updated', {changes: newState});
  }

  /**
   * Get current state
   * @returns {Object} - Current state
   */
  getState() {
    return {...this.state};
  }

  /**
   * Get specific state property
   * @param {string} key - State key
   * @returns {*} - State value
   */
  getStateProperty(key) {
    return this.state[key];
  }

  /**
   * Check if device is connected
   * @returns {boolean} - Connection status
   */
  isDeviceConnected() {
    return this.state.isConnected;
  }

  /**
   * Check if LED is powered on
   * @returns {boolean} - Power status
   */
  isLEDPoweredOn() {
    return this.state.isPoweredOn;
  }

  /**
   * Get connection info
   * @returns {Object} - Connection information
   */
  getConnectionInfo() {
    return {
      isConnected: this.state.isConnected,
      device: this.state.connectedDevice,
      state: this.state.connectionState,
    };
  }

  /**
   * Get LED info
   * @returns {Object} - LED information
   */
  getLEDInfo() {
    return {
      isPoweredOn: this.state.isPoweredOn,
      color: this.state.currentColor,
      brightness: this.state.currentBrightness,
      effect: this.state.currentEffect,
    };
  }

  /**
   * Set loading state
   * @param {boolean} isLoading - Loading status
   */
  setLoading(isLoading) {
    this.setState({isLoading});
  }

  /**
   * Set error state
   * @param {string|null} error - Error message
   */
  setError(error) {
    this.setState({error});
  }

  /**
   * Clear error state
   */
  clearError() {
    this.setState({error: null});
  }

  /**
   * Add state change listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    logger.debug(`Added AppStateManager listener for event: ${event}`);
  }

  /**
   * Remove state change listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        logger.debug(`Removed AppStateManager listener for event: ${event}`);
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
          logger.error(`Error in AppStateManager listener for ${event}`, error);
        }
      });
    }
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.setState({
      isConnected: false,
      connectedDevice: null,
      connectionState: 'disconnected',
      isPoweredOn: false,
      currentColor: '#00ff88',
      currentBrightness: 50,
      currentEffect: null,
      isLoading: false,
      error: null,
      lastUpdate: null,
    });
    
    logger.info('AppStateManager reset to initial state');
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    logger.info('Cleaning up AppStateManager');
    this.stopPeriodicUpdates();
    this.listeners.clear();
    this.isInitialized = false;
  }
}

// Export singleton instance
export default new AppStateManager();
