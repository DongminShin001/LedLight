import logger from '../utils/Logger';

/**
 * Base Screen Manager class
 * Manages screen registration and lifecycle
 */
export class ScreenManager {
  constructor() {
    this.screens = new Map();
    this.screenInstances = new Map();
    this.currentScreen = null;
    this.screenHistory = [];
    this.maxHistorySize = 50;
  }

  /**
   * Register a screen
   * @param {string} name - Screen name
   * @param {React.Component} component - Screen component
   * @param {Object} config - Screen configuration
   */
  registerScreen(name, component, config = {}) {
    const screenConfig = {
      name,
      component,
      ...config,
      registeredAt: Date.now(),
    };

    this.screens.set(name, screenConfig);
    logger.info('Screen registered', {name, config});
  }

  /**
   * Get screen configuration
   * @param {string} name - Screen name
   * @returns {Object} Screen configuration
   */
  getScreen(name) {
    return this.screens.get(name);
  }

  /**
   * Get all registered screens
   * @returns {Map} Map of screen configurations
   */
  getAllScreens() {
    return this.screens;
  }

  /**
   * Check if screen is registered
   * @param {string} name - Screen name
   * @returns {boolean} True if screen is registered
   */
  hasScreen(name) {
    return this.screens.has(name);
  }

  /**
   * Unregister a screen
   * @param {string} name - Screen name
   */
  unregisterScreen(name) {
    if (this.screens.has(name)) {
      this.screens.delete(name);
      this.screenInstances.delete(name);
      logger.info('Screen unregistered', {name});
    }
  }

  /**
   * Set current screen
   * @param {string} name - Screen name
   */
  setCurrentScreen(name) {
    if (this.currentScreen) {
      this.addToHistory(this.currentScreen);
    }
    this.currentScreen = name;
    logger.info('Current screen changed', {from: this.currentScreen, to: name});
  }

  /**
   * Get current screen
   * @returns {string} Current screen name
   */
  getCurrentScreen() {
    return this.currentScreen;
  }

  /**
   * Add screen to history
   * @param {string} name - Screen name
   */
  addToHistory(name) {
    this.screenHistory.push({
      name,
      timestamp: Date.now(),
    });

    // Limit history size
    if (this.screenHistory.length > this.maxHistorySize) {
      this.screenHistory.shift();
    }
  }

  /**
   * Get screen history
   * @returns {Array} Screen history
   */
  getHistory() {
    return [...this.screenHistory];
  }

  /**
   * Clear screen history
   */
  clearHistory() {
    this.screenHistory = [];
    logger.info('Screen history cleared');
  }

  /**
   * Get screen statistics
   * @returns {Object} Screen statistics
   */
  getStatistics() {
    const totalScreens = this.screens.size;
    const historyCount = this.screenHistory.length;
    const screenNames = Array.from(this.screens.keys());

    return {
      totalScreens,
      historyCount,
      currentScreen: this.currentScreen,
      screenNames,
      registeredScreens: screenNames,
    };
  }

  /**
   * Clear all screens
   */
  clear() {
    this.screens.clear();
    this.screenInstances.clear();
    this.currentScreen = null;
    this.clearHistory();
    logger.info('Screen manager cleared');
  }
}

/**
 * Screen Lifecycle Manager
 * Manages screen lifecycle events
 */
export class ScreenLifecycleManager {
  constructor() {
    this.lifecycleListeners = new Map();
    this.screenStates = new Map();
  }

  /**
   * Add lifecycle listener
   * @param {string} event - Lifecycle event
   * @param {Function} callback - Callback function
   */
  addLifecycleListener(event, callback) {
    if (!this.lifecycleListeners.has(event)) {
      this.lifecycleListeners.set(event, []);
    }
    this.lifecycleListeners.get(event).push(callback);
  }

  /**
   * Remove lifecycle listener
   * @param {string} event - Lifecycle event
   * @param {Function} callback - Callback function
   */
  removeLifecycleListener(event, callback) {
    const listeners = this.lifecycleListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Notify lifecycle event
   * @param {string} event - Lifecycle event
   * @param {Object} data - Event data
   */
  notifyLifecycleEvent(event, data) {
    const listeners = this.lifecycleListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error('Error in lifecycle listener', error);
        }
      });
    }
  }

  /**
   * Set screen state
   * @param {string} screenName - Screen name
   * @param {string} state - Screen state
   */
  setScreenState(screenName, state) {
    this.screenStates.set(screenName, {
      state,
      timestamp: Date.now(),
    });

    this.notifyLifecycleEvent('stateChanged', {
      screenName,
      state,
      timestamp: Date.now(),
    });
  }

  /**
   * Get screen state
   * @param {string} screenName - Screen name
   * @returns {Object} Screen state
   */
  getScreenState(screenName) {
    return this.screenStates.get(screenName);
  }

  /**
   * Get all screen states
   * @returns {Map} Map of screen states
   */
  getAllScreenStates() {
    return this.screenStates;
  }
}

/**
 * Screen Factory
 * Creates screen instances with proper configuration
 */
export class ScreenFactory {
  static createScreen(name, component, config = {}) {
    const defaultConfig = {
      title: name,
      headerShown: false,
      ...config,
    };

    return {
      name,
      component,
      config: defaultConfig,
    };
  }

  static createStackScreen(name, component, options = {}) {
    return this.createScreen(name, component, {
      type: 'stack',
      ...options,
    });
  }

  static createTabScreen(name, component, icon, options = {}) {
    return this.createScreen(name, component, {
      type: 'tab',
      icon,
      ...options,
    });
  }
}

/**
 * Screen Observer
 * Observes screen events and changes
 */
export class ScreenObserver {
  constructor() {
    this.observers = new Map();
  }

  /**
   * Add screen observer
   * @param {string} screenName - Screen name
   * @param {Function} callback - Observer callback
   */
  addObserver(screenName, callback) {
    if (!this.observers.has(screenName)) {
      this.observers.set(screenName, []);
    }
    this.observers.get(screenName).push(callback);
  }

  /**
   * Remove screen observer
   * @param {string} screenName - Screen name
   * @param {Function} callback - Observer callback
   */
  removeObserver(screenName, callback) {
    const screenObservers = this.observers.get(screenName);
    if (screenObservers) {
      const index = screenObservers.indexOf(callback);
      if (index > -1) {
        screenObservers.splice(index, 1);
      }
    }
  }

  /**
   * Notify screen observers
   * @param {string} screenName - Screen name
   * @param {Object} data - Event data
   */
  notifyObservers(screenName, data) {
    const screenObservers = this.observers.get(screenName);
    if (screenObservers) {
      screenObservers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error('Error in screen observer', error);
        }
      });
    }
  }

  /**
   * Get observers for screen
   * @param {string} screenName - Screen name
   * @returns {Array} Array of observers
   */
  getObservers(screenName) {
    return this.observers.get(screenName) || [];
  }
}
