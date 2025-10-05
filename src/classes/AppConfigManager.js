/**
 * App Configuration Manager
 * Centralized configuration management with environment support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/Logger';

class AppConfigManager {
  constructor() {
    this.config = {
      // App settings
      appName: 'LedLight',
      version: '1.0.0',
      buildNumber: 1,
      
      // Bluetooth settings
      bluetoothScanTimeout: 10000,
      bluetoothConnectionTimeout: 5000,
      bluetoothRetryAttempts: 3,
      bluetoothRetryDelay: 1000,
      
      // LED settings
      ledCommandTimeout: 2000,
      ledMaxBrightness: 100,
      ledMinBrightness: 1,
      
      // UI settings
      defaultTheme: 'dark',
      defaultAccentColor: '#00ff88',
      enableHapticFeedback: true,
      enableAnimations: true,
      
      // Performance settings
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      maxCacheSize: 100,
      enablePerformanceMonitoring: true,
      
      // Debug settings
      debugMode: __DEV__,
      logLevel: __DEV__ ? 'debug' : 'error',
      enableCrashReporting: !__DEV__,
      
      // Feature flags
      features: {
        customText: true,
        colorPalettes: true,
        effects: true,
        presets: true,
        deviceManagement: true,
        performanceOptimization: true,
      },
    };
    
    this.storageKey = 'ledlight_app_config';
    this.isInitialized = false;
  }

  /**
   * Initialize configuration manager
   */
  async initialize() {
    try {
      logger.info('Initializing AppConfigManager');
      
      // Load saved configuration
      await this.loadConfig();
      
      // Apply environment-specific settings
      this.applyEnvironmentSettings();
      
      this.isInitialized = true;
      logger.info('AppConfigManager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AppConfigManager', error);
      throw error;
    }
  }

  /**
   * Load configuration from storage
   */
  async loadConfig() {
    try {
      const savedConfig = await AsyncStorage.getItem(this.storageKey);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        this.config = {...this.config, ...parsedConfig};
        logger.info('Loaded configuration from storage');
      }
    } catch (error) {
      logger.error('Failed to load configuration from storage', error);
    }
  }

  /**
   * Save configuration to storage
   */
  async saveConfig() {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.config));
      logger.info('Configuration saved to storage');
    } catch (error) {
      logger.error('Failed to save configuration to storage', error);
    }
  }

  /**
   * Apply environment-specific settings
   */
  applyEnvironmentSettings() {
    if (__DEV__) {
      this.config.debugMode = true;
      this.config.logLevel = 'debug';
      this.config.enablePerformanceMonitoring = true;
    } else {
      this.config.debugMode = false;
      this.config.logLevel = 'error';
      this.config.enableCrashReporting = true;
    }
  }

  /**
   * Get configuration value
   * @param {string} key - Configuration key
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} - Configuration value
   */
  get(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  /**
   * Set configuration value
   * @param {string} key - Configuration key
   * @param {*} value - Configuration value
   * @param {boolean} save - Whether to save to storage
   */
  async set(key, value, save = true) {
    const keys = key.split('.');
    let config = this.config;
    
    // Navigate to the parent object
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in config) || typeof config[k] !== 'object') {
        config[k] = {};
      }
      config = config[k];
    }
    
    // Set the value
    config[keys[keys.length - 1]] = value;
    
    if (save) {
      await this.saveConfig();
    }
    
    logger.debug(`Configuration updated: ${key} = ${JSON.stringify(value)}`);
  }

  /**
   * Get all configuration
   * @returns {Object} - Complete configuration
   */
  getAll() {
    return {...this.config};
  }

  /**
   * Reset configuration to defaults
   */
  async reset() {
    this.config = {
      ...this.config,
      // Keep essential settings
      appName: 'LedLight',
      version: '1.0.0',
      buildNumber: 1,
    };
    
    await this.saveConfig();
    logger.info('Configuration reset to defaults');
  }

  /**
   * Check if feature is enabled
   * @param {string} feature - Feature name
   * @returns {boolean} - Feature enabled status
   */
  isFeatureEnabled(feature) {
    return this.get(`features.${feature}`, false);
  }

  /**
   * Enable/disable feature
   * @param {string} feature - Feature name
   * @param {boolean} enabled - Feature enabled status
   */
  async setFeature(feature, enabled) {
    await this.set(`features.${feature}`, enabled);
  }

  /**
   * Get app information
   * @returns {Object} - App information
   */
  getAppInfo() {
    return {
      name: this.get('appName'),
      version: this.get('version'),
      buildNumber: this.get('buildNumber'),
      debugMode: this.get('debugMode'),
    };
  }

  /**
   * Get Bluetooth settings
   * @returns {Object} - Bluetooth settings
   */
  getBluetoothSettings() {
    return {
      scanTimeout: this.get('bluetoothScanTimeout'),
      connectionTimeout: this.get('bluetoothConnectionTimeout'),
      retryAttempts: this.get('bluetoothRetryAttempts'),
      retryDelay: this.get('bluetoothRetryDelay'),
    };
  }

  /**
   * Get LED settings
   * @returns {Object} - LED settings
   */
  getLEDSettings() {
    return {
      commandTimeout: this.get('ledCommandTimeout'),
      maxBrightness: this.get('ledMaxBrightness'),
      minBrightness: this.get('ledMinBrightness'),
    };
  }

  /**
   * Get UI settings
   * @returns {Object} - UI settings
   */
  getUISettings() {
    return {
      theme: this.get('defaultTheme'),
      accentColor: this.get('defaultAccentColor'),
      hapticFeedback: this.get('enableHapticFeedback'),
      animations: this.get('enableAnimations'),
    };
  }

  /**
   * Get performance settings
   * @returns {Object} - Performance settings
   */
  getPerformanceSettings() {
    return {
      caching: this.get('enableCaching'),
      cacheTimeout: this.get('cacheTimeout'),
      maxCacheSize: this.get('maxCacheSize'),
      monitoring: this.get('enablePerformanceMonitoring'),
    };
  }

  /**
   * Update multiple settings at once
   * @param {Object} settings - Settings object
   * @param {boolean} save - Whether to save to storage
   */
  async updateSettings(settings, save = true) {
    for (const [key, value] of Object.entries(settings)) {
      await this.set(key, value, false);
    }
    
    if (save) {
      await this.saveConfig();
    }
    
    logger.info('Multiple settings updated', {settings});
  }

  /**
   * Export configuration
   * @returns {Object} - Exported configuration
   */
  exportConfig() {
    return {
      ...this.config,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Import configuration
   * @param {Object} config - Configuration to import
   */
  async importConfig(config) {
    try {
      // Validate configuration
      if (!config || typeof config !== 'object') {
        throw new Error('Invalid configuration format');
      }
      
      // Merge with existing configuration
      this.config = {...this.config, ...config};
      
      // Save imported configuration
      await this.saveConfig();
      
      logger.info('Configuration imported successfully');
    } catch (error) {
      logger.error('Failed to import configuration', error);
      throw error;
    }
  }

  /**
   * Get configuration summary
   * @returns {Object} - Configuration summary
   */
  getSummary() {
    return {
      appInfo: this.getAppInfo(),
      bluetoothSettings: this.getBluetoothSettings(),
      ledSettings: this.getLEDSettings(),
      uiSettings: this.getUISettings(),
      performanceSettings: this.getPerformanceSettings(),
      enabledFeatures: Object.keys(this.config.features).filter(
        feature => this.config.features[feature]
      ),
      isInitialized: this.isInitialized,
    };
  }
}

// Export singleton instance
export default new AppConfigManager();
