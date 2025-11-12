import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from './Logger';

const SETTINGS_KEY = '@app_settings';

/**
 * Settings Manager
 * Manages persistent user preferences
 */
class SettingsManager {
  constructor() {
    this.settings = {
      // Connection Settings
      autoConnect: false,
      autoReconnect: true,
      connectionTimeout: 10000,

      // UI Settings
      hapticEnabled: true,
      notificationsEnabled: true,
      animationSpeed: 50,
      keepScreenAwake: false,

      // LED Settings
      defaultBrightness: 50,
      defaultColor: '#00ff88',
      rememberLastState: true,

      // Advanced Settings
      debugMode: false,
      performanceMode: false,
      saveHistory: true,
      maxHistoryItems: 50,

      // Accessibility
      largeText: false,
      highContrast: false,
      reduceMotion: false,
      screenReaderEnabled: false,

      // Safety
      showSafetyWarnings: true,
      requireConfirmation: true,

      // App Behavior
      theme: 'dark', // 'dark', 'light', 'auto'
      language: 'en',
      firstLaunch: true,
    };
  }

  /**
   * Initialize settings from storage
   */
  async initialize() {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = {...this.settings, ...parsed};
        logger.info('Settings loaded', {settingsCount: Object.keys(this.settings).length});
      } else {
        // First time - save defaults
        await this.save();
        logger.info('Default settings created');
      }
    } catch (error) {
      logger.error('Failed to load settings', error);
    }
  }

  /**
   * Save settings to storage
   */
  async save() {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      logger.info('Settings saved');
    } catch (error) {
      logger.error('Failed to save settings', error);
    }
  }

  /**
   * Get a setting value
   */
  get(key) {
    return this.settings[key];
  }

  /**
   * Set a setting value
   */
  async set(key, value) {
    this.settings[key] = value;
    await this.save();
    logger.info('Setting updated', {key, value});
  }

  /**
   * Get all settings
   */
  getAll() {
    return {...this.settings};
  }

  /**
   * Update multiple settings at once
   */
  async updateMultiple(updates) {
    this.settings = {...this.settings, ...updates};
    await this.save();
    logger.info('Multiple settings updated', {updateCount: Object.keys(updates).length});
  }

  /**
   * Reset to defaults
   */
  async reset() {
    const defaultSettings = {
      autoConnect: false,
      autoReconnect: true,
      connectionTimeout: 10000,
      hapticEnabled: true,
      notificationsEnabled: true,
      animationSpeed: 50,
      keepScreenAwake: false,
      defaultBrightness: 50,
      defaultColor: '#00ff88',
      rememberLastState: true,
      debugMode: false,
      performanceMode: false,
      saveHistory: true,
      maxHistoryItems: 50,
      largeText: false,
      highContrast: false,
      reduceMotion: false,
      screenReaderEnabled: false,
      showSafetyWarnings: true,
      requireConfirmation: true,
      theme: 'dark',
      language: 'en',
      firstLaunch: false, // Keep this false to not show tutorial again
    };
    this.settings = defaultSettings;
    await this.save();
    logger.info('Settings reset to defaults');
  }

  /**
   * Clear all settings
   */
  async clear() {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
      logger.info('Settings cleared');
    } catch (error) {
      logger.error('Failed to clear settings', error);
    }
  }

  /**
   * Export settings as JSON string
   */
  export() {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON string
   */
  async import(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.settings = {...this.settings, ...imported};
      await this.save();
      logger.info('Settings imported');
      return true;
    } catch (error) {
      logger.error('Failed to import settings', error);
      return false;
    }
  }

  // Specific setting helpers

  /**
   * Check if haptic feedback is enabled
   */
  isHapticEnabled() {
    return this.settings.hapticEnabled;
  }

  /**
   * Check if notifications are enabled
   */
  areNotificationsEnabled() {
    return this.settings.notificationsEnabled;
  }

  /**
   * Get animation speed multiplier (0.1 to 1.0)
   */
  getAnimationSpeedMultiplier() {
    return this.settings.animationSpeed / 100;
  }

  /**
   * Check if this is first launch
   */
  isFirstLaunch() {
    return this.settings.firstLaunch;
  }

  /**
   * Mark app as launched
   */
  async markAsLaunched() {
    await this.set('firstLaunch', false);
  }

  /**
   * Get theme preference
   */
  getThemePreference() {
    return this.settings.theme;
  }

  /**
   * Check if should auto-connect
   */
  shouldAutoConnect() {
    return this.settings.autoConnect;
  }

  /**
   * Check if should auto-reconnect
   */
  shouldAutoReconnect() {
    return this.settings.autoReconnect;
  }

  /**
   * Get connection timeout in milliseconds
   */
  getConnectionTimeout() {
    return this.settings.connectionTimeout;
  }

  /**
   * Get default brightness (0-100)
   */
  getDefaultBrightness() {
    return this.settings.defaultBrightness;
  }

  /**
   * Get default color (hex)
   */
  getDefaultColor() {
    return this.settings.defaultColor;
  }

  /**
   * Check if should show safety warnings
   */
  shouldShowSafetyWarnings() {
    return this.settings.showSafetyWarnings;
  }

  /**
   * Check if should require confirmation for critical actions
   */
  shouldRequireConfirmation() {
    return this.settings.requireConfirmation;
  }

  /**
   * Check if performance mode is enabled
   */
  isPerformanceModeEnabled() {
    return this.settings.performanceMode;
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugModeEnabled() {
    return this.settings.debugMode;
  }

  /**
   * Check if should save history
   */
  shouldSaveHistory() {
    return this.settings.saveHistory;
  }

  /**
   * Get max history items to keep
   */
  getMaxHistoryItems() {
    return this.settings.maxHistoryItems;
  }
}

// Export singleton instance
const settingsManager = new SettingsManager();
export default settingsManager;

