import {useState, useEffect, useRef} from 'react';
import ThemeManager from '../theme/ThemeManager';
import {ThemeObserver} from '../theme/ThemeObserver';
import logger from '../utils/Logger';

/**
 * Custom hook for theme management with OOP design
 * Uses Observer pattern for theme change notifications
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const observerRef = useRef(null);

  useEffect(() => {
    // Initialize theme manager
    const initializeTheme = async () => {
      try {
        await ThemeManager.initialize();
        const currentTheme = ThemeManager.getCurrentTheme();
        setTheme(currentTheme);
        setIsLoading(false);
        logger.info('Theme hook initialized', {themeId: currentTheme?.getId()});
      } catch (error) {
        logger.error('Failed to initialize theme in hook', error);
        setIsLoading(false);
      }
    };

    initializeTheme();

    // Create theme observer
    observerRef.current = new class extends ThemeObserver {
      onThemeChanged(themeData) {
        setTheme(themeData.theme);
        logger.info('Theme updated in hook via observer', {
          themeId: themeData.currentTheme,
          themeName: themeData.theme.getDisplayName(),
        });
      }
    };

    // Add observer to theme manager
    ThemeManager.addObserver(observerRef.current);

    return () => {
      if (observerRef.current) {
        ThemeManager.removeObserver(observerRef.current);
      }
    };
  }, []);

  /**
   * Change theme
   * @param {string} themeName - Theme name to change to
   * @returns {Promise<boolean>} Success status
   */
  const changeTheme = async themeName => {
    try {
      const success = await ThemeManager.setTheme(themeName);
      if (success) {
        logger.info('Theme changed via hook', {theme: themeName});
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to change theme via hook', error);
      return false;
    }
  };

  /**
   * Get theme-aware styles
   * @param {Function} styleFunction - Style function
   * @returns {Object} Style object
   */
  const getThemeStyles = styleFunction => {
    return ThemeManager.getStyles(styleFunction);
  };

  /**
   * Get available themes
   * @returns {Object[]} Array of theme metadata
   */
  const getAvailableThemes = () => {
    return ThemeManager.getAvailableThemes();
  };

  /**
   * Enable auto theme
   * @returns {Promise<void>}
   */
  const enableAutoTheme = async () => {
    return await ThemeManager.enableAutoTheme();
  };

  /**
   * Disable auto theme
   * @returns {Promise<void>}
   */
  const disableAutoTheme = async () => {
    return await ThemeManager.disableAutoTheme();
  };

  /**
   * Check if auto theme is enabled
   * @returns {Promise<boolean>}
   */
  const isAutoThemeEnabled = async () => {
    return await ThemeManager.isAutoThemeEnabled();
  };

  /**
   * Create custom theme
   * @param {string} name - Theme name
   * @param {string} description - Theme description
   * @returns {ThemeBuilder} Theme builder instance
   */
  const createCustomTheme = (name, description) => {
    return ThemeManager.createCustomTheme(name, description);
  };

  return {
    theme,
    isLoading,
    changeTheme,
    getThemeStyles,
    getAvailableThemes,
    enableAutoTheme,
    disableAutoTheme,
    isAutoThemeEnabled,
    createCustomTheme,
    currentThemeName: theme?.getId() || 'dark',
    currentThemeDisplayName: theme?.getDisplayName() || 'Dark Mode',
  };
};

/**
 * Hook for theme-aware styles
 * @param {Function} styleFunction - Style function
 * @returns {Object} Style object
 */
export const useThemeStyles = styleFunction => {
  const {theme} = useTheme();
  return theme ? styleFunction(theme) : {};
};

/**
 * Hook for theme metadata
 * @returns {Object} Theme metadata
 */
export const useThemeMetadata = () => {
  const {theme} = useTheme();
  return theme ? theme.getMetadata() : null;
};

/**
 * Hook for theme utilities
 * @returns {Object} Theme utility functions
 */
export const useThemeUtils = () => {
  const {theme} = useTheme();
  
  return {
    isDark: theme?.isDark() || false,
    isLight: theme?.isLight() || false,
    getPrimaryColor: theme?.getPrimaryColor() || '#00ff88',
    getBackgroundColor: theme?.getBackgroundColor() || '#0f0f0f',
    getTextColor: theme?.getTextColor() || '#ffffff',
    getPrimaryGradient: theme?.getPrimaryGradient() || ['#00ff88', '#00cc6a'],
    getShadow: (size = 'md') => theme?.getShadow(size) || {},
    getSpacing: (size = 'md') => theme?.getSpacing(size) || 12,
    getBorderRadius: (size = 'md') => theme?.getBorderRadius(size) || 12,
  };
};

export default useTheme;
