import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemeFactory, ThemeBuilder} from './ThemeFactory';
import {ObservableThemeManager} from './ThemeObserver';
import logger from '../utils/Logger';

/**
 * Main Theme Manager - Singleton Pattern
 * Uses ObservableThemeManager with ThemeFactory
 */
class ThemeManager {
  constructor() {
    if (ThemeManager.instance) {
      return ThemeManager.instance;
    }

    this.observableManager = new ObservableThemeManager();
    this.isInitialized = false;
    ThemeManager.instance = this;
  }

  /**
   * Initialize the theme manager
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      this.observableManager.initialize(ThemeFactory, AsyncStorage);
      await this.observableManager.loadSavedTheme();
      this.isInitialized = true;
      logger.info('Theme manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize theme manager', error);
      throw error;
    }
  }

  /**
   * Get singleton instance
   * @returns {ThemeManager}
   */
  static getInstance() {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * Get current theme
   * @returns {Theme} Current theme instance
   */
  getCurrentTheme() {
    return this.observableManager.getCurrentTheme();
  }

  /**
   * Get theme by name
   * @param {string} themeName - Theme name
   * @returns {Theme} Theme instance
   */
  getTheme(themeName) {
    return ThemeFactory.createTheme(themeName);
  }

  /**
   * Set theme
   * @param {string} themeName - Theme name to set
   * @returns {Promise<boolean>} Success status
   */
  async setTheme(themeName) {
    return await this.observableManager.setTheme(themeName);
  }

  /**
   * Load saved theme
   * @returns {Promise<void>}
   */
  async loadSavedTheme() {
    return await this.observableManager.loadSavedTheme();
  }

  /**
   * Get all available themes
   * @returns {Object[]} Array of theme metadata
   */
  getAvailableThemes() {
    return this.observableManager.getAvailableThemes();
  }

  /**
   * Add theme observer
   * @param {ThemeObserver} observer - Observer to add
   */
  addObserver(observer) {
    this.observableManager.addObserver(observer);
  }

  /**
   * Remove theme observer
   * @param {ThemeObserver} observer - Observer to remove
   */
  removeObserver(observer) {
    this.observableManager.removeObserver(observer);
  }

  /**
   * Add theme listener (legacy support)
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addListener(event, callback) {
    // Legacy support - convert to observer pattern
    const legacyObserver = {
      onThemeChanged: (data) => {
        if (event === 'themeChanged') {
          callback(data);
        }
      }
    };
    this.addObserver(legacyObserver);
  }

  /**
   * Remove theme listener (legacy support)
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeListener(event, callback) {
    // Legacy support - observers are managed differently
    logger.warn('removeListener is deprecated, use removeObserver instead');
  }

  /**
   * Get theme-aware styles
   * @param {Function} styleFunction - Style function
   * @returns {Object} Style object
   */
  getStyles(styleFunction) {
    const theme = this.getCurrentTheme();
    return styleFunction(theme);
  }

  /**
   * Enable auto theme
   * @returns {Promise<void>}
   */
  async enableAutoTheme() {
    return await this.observableManager.enableAutoTheme();
  }

  /**
   * Disable auto theme
   * @returns {Promise<void>}
   */
  async disableAutoTheme() {
    return await this.observableManager.disableAutoTheme();
  }

  /**
   * Check if auto theme is enabled
   * @returns {Promise<boolean>}
   */
  async isAutoThemeEnabled() {
    return await this.observableManager.isAutoThemeEnabled();
  }

  /**
   * Get current theme name
   * @returns {string} Current theme name
   */
  get currentTheme() {
    return this.getCurrentTheme()?.getId() || 'dark';
  }

  /**
   * Create custom theme using builder
   * @param {string} name - Theme name
   * @param {string} description - Theme description
   * @returns {ThemeBuilder} Theme builder instance
   */
  createCustomTheme(name, description) {
    return new ThemeBuilder(name, description);
  }

  /**
   * Register custom theme
   * @param {string} name - Theme name
   * @param {Theme} theme - Theme instance
   */
  registerCustomTheme(name, theme) {
    ThemeFactory.registerTheme(name, theme.constructor);
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.observableManager.cleanup();
  }
}

// Export singleton instance
export default ThemeManager.getInstance();
