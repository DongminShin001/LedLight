import logger from '../utils/Logger';

/**
 * Observer interface for theme change notifications
 */
export class ThemeObserver {
  /**
   * Called when theme changes
   * @param {Object} themeData - Theme change data
   */
  onThemeChanged(themeData) {
    throw new Error('onThemeChanged() must be implemented by subclass');
  }
}

/**
 * Concrete Theme Observer implementations
 */
export class ThemeChangeLogger extends ThemeObserver {
  onThemeChanged(themeData) {
    logger.info('Theme change logged', {
      previousTheme: themeData.previousTheme,
      currentTheme: themeData.currentTheme,
      timestamp: new Date().toISOString(),
    });
  }
}

export class ThemeAnalyticsTracker extends ThemeObserver {
  onThemeChanged(themeData) {
    // Track theme usage analytics
    logger.info('Theme analytics tracked', {
      themeId: themeData.currentTheme,
      themeName: themeData.theme.getDisplayName(),
      isDark: themeData.theme.isDark(),
      sessionId: Date.now(), // In real app, use proper session ID
    });
  }
}

export class ThemePersistenceObserver extends ThemeObserver {
  constructor(storage) {
    super();
    this.storage = storage;
  }

  async onThemeChanged(themeData) {
    try {
      await this.storage.setItem('lastThemeChange', JSON.stringify({
        theme: themeData.currentTheme,
        timestamp: Date.now(),
        themeMetadata: themeData.theme.getMetadata(),
      }));
      logger.info('Theme change persisted', {theme: themeData.currentTheme});
    } catch (error) {
      logger.error('Failed to persist theme change', error);
    }
  }
}

/**
 * Subject interface for theme change notifications
 */
export class ThemeSubject {
  constructor() {
    this.observers = [];
  }

  /**
   * Add observer
   * @param {ThemeObserver} observer - Observer to add
   */
  addObserver(observer) {
    if (!(observer instanceof ThemeObserver)) {
      throw new Error('Observer must extend ThemeObserver');
    }
    
    this.observers.push(observer);
    logger.info('Theme observer added', {observerType: observer.constructor.name});
  }

  /**
   * Remove observer
   * @param {ThemeObserver} observer - Observer to remove
   */
  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
      logger.info('Theme observer removed', {observerType: observer.constructor.name});
    }
  }

  /**
   * Notify all observers of theme change
   * @param {Object} themeData - Theme change data
   */
  notifyObservers(themeData) {
    this.observers.forEach(observer => {
      try {
        observer.onThemeChanged(themeData);
      } catch (error) {
        logger.error('Error in theme observer', {
          observerType: observer.constructor.name,
          error: error.message,
        });
      }
    });
  }

  /**
   * Get observer count
   * @returns {number} Number of observers
   */
  getObserverCount() {
    return this.observers.length;
  }

  /**
   * Clear all observers
   */
  clearObservers() {
    this.observers = [];
    logger.info('All theme observers cleared');
  }
}

/**
 * Theme Manager with Observer Pattern
 */
export class ObservableThemeManager extends ThemeSubject {
  constructor() {
    super();
    this.currentTheme = null;
    this.themeFactory = null;
    this.storage = null;
    this.autoThemeEnabled = false;
    this.autoThemeInterval = null;
  }

  /**
   * Initialize theme manager
   * @param {ThemeFactory} themeFactory - Theme factory instance
   * @param {Object} storage - Storage interface
   */
  initialize(themeFactory, storage) {
    this.themeFactory = themeFactory;
    this.storage = storage;
    
    // Add default observers
    this.addObserver(new ThemeChangeLogger());
    this.addObserver(new ThemeAnalyticsTracker());
    this.addObserver(new ThemePersistenceObserver(storage));
    
    logger.info('Observable theme manager initialized', {
      observerCount: this.getObserverCount(),
    });
  }

  /**
   * Set current theme
   * @param {string} themeName - Name of theme to set
   * @returns {Promise<boolean>} Success status
   */
  async setTheme(themeName) {
    if (!this.themeFactory) {
      throw new Error('Theme manager not initialized');
    }

    const previousTheme = this.currentTheme?.getId();
    const newTheme = this.themeFactory.createTheme(themeName);

    if (!newTheme) {
      logger.error('Failed to create theme', {themeName});
      return false;
    }

    try {
      // Save theme preference
      await this.storage.setItem('selectedTheme', themeName);
      
      // Update current theme
      this.currentTheme = newTheme;
      
      // Notify observers
      this.notifyObservers({
        previousTheme,
        currentTheme: themeName,
        theme: newTheme,
        timestamp: Date.now(),
      });

      logger.info('Theme changed successfully', {
        from: previousTheme,
        to: themeName,
      });

      return true;
    } catch (error) {
      logger.error('Failed to set theme', {themeName, error: error.message});
      return false;
    }
  }

  /**
   * Get current theme
   * @returns {Theme} Current theme instance
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Load saved theme
   * @returns {Promise<void>}
   */
  async loadSavedTheme() {
    try {
      const savedTheme = await this.storage.getItem('selectedTheme');
      if (savedTheme && this.themeFactory.hasTheme(savedTheme)) {
        await this.setTheme(savedTheme);
        logger.info('Saved theme loaded', {theme: savedTheme});
      } else {
        // Set default theme
        await this.setTheme('dark');
        logger.info('Default theme set', {theme: 'dark'});
      }
    } catch (error) {
      logger.error('Failed to load saved theme', error);
      // Set default theme as fallback
      await this.setTheme('dark');
    }
  }

  /**
   * Get available themes
   * @returns {Object[]} Array of theme metadata
   */
  getAvailableThemes() {
    return this.themeFactory.getAllThemeMetadata();
  }

  /**
   * Enable auto theme switching
   * @returns {Promise<void>}
   */
  async enableAutoTheme() {
    this.autoThemeEnabled = true;
    await this.storage.setItem('autoTheme', 'true');
    
    // Start auto theme checking
    this.startAutoThemeChecking();
    
    logger.info('Auto theme enabled');
  }

  /**
   * Disable auto theme switching
   * @returns {Promise<void>}
   */
  async disableAutoTheme() {
    this.autoThemeEnabled = false;
    await this.storage.removeItem('autoTheme');
    
    // Stop auto theme checking
    this.stopAutoThemeChecking();
    
    logger.info('Auto theme disabled');
  }

  /**
   * Check if auto theme is enabled
   * @returns {Promise<boolean>}
   */
  async isAutoThemeEnabled() {
    try {
      const autoTheme = await this.storage.getItem('autoTheme');
      return autoTheme === 'true';
    } catch (error) {
      logger.error('Failed to check auto theme status', error);
      return false;
    }
  }

  /**
   * Start auto theme checking
   * @private
   */
  startAutoThemeChecking() {
    this.stopAutoThemeChecking(); // Clear any existing interval
    
    this.autoThemeInterval = setInterval(() => {
      this.checkAndApplyAutoTheme();
    }, 60000); // Check every minute
  }

  /**
   * Stop auto theme checking
   * @private
   */
  stopAutoThemeChecking() {
    if (this.autoThemeInterval) {
      clearInterval(this.autoThemeInterval);
      this.autoThemeInterval = null;
    }
  }

  /**
   * Check and apply auto theme based on time
   * @private
   */
  checkAndApplyAutoTheme() {
    if (!this.autoThemeEnabled) return;

    const hour = new Date().getHours();
    let suggestedTheme = 'dark';

    if (hour >= 6 && hour < 12) {
      suggestedTheme = 'light'; // Morning
    } else if (hour >= 12 && hour < 18) {
      suggestedTheme = 'ocean'; // Afternoon
    } else if (hour >= 18 && hour < 22) {
      suggestedTheme = 'sunset'; // Evening
    } else {
      suggestedTheme = 'dark'; // Night
    }

    // Only change if different from current theme
    if (this.currentTheme?.getId() !== suggestedTheme) {
      this.setTheme(suggestedTheme);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopAutoThemeChecking();
    this.clearObservers();
    logger.info('Theme manager cleaned up');
  }
}
