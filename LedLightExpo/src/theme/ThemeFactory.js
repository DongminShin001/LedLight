import {DarkTheme, LightTheme, NeonTheme, OceanTheme, SunsetTheme} from './Themes';
import logger from '../utils/Logger';

/**
 * Theme Factory for creating theme instances
 * Implements Factory Pattern
 */
export class ThemeFactory {
  static themes = {
    dark: DarkTheme,
    light: LightTheme,
    neon: NeonTheme,
    ocean: OceanTheme,
    sunset: SunsetTheme,
  };

  /**
   * Create a theme instance by name
   * @param {string} themeName - Name of the theme to create
   * @returns {Theme} Theme instance
   */
  static createTheme(themeName) {
    const ThemeClass = this.themes[themeName];
    
    if (!ThemeClass) {
      logger.warn('Theme not found, falling back to dark theme', {themeName});
      return new DarkTheme();
    }

    try {
      const theme = new ThemeClass();
      theme.validate();
      logger.info('Theme created successfully', {themeName, themeId: theme.getId()});
      return theme;
    } catch (error) {
      logger.error('Failed to create theme', {themeName, error: error.message});
      return new DarkTheme();
    }
  }

  /**
   * Get all available theme names
   * @returns {string[]} Array of theme names
   */
  static getAvailableThemeNames() {
    return Object.keys(this.themes);
  }

  /**
   * Check if theme exists
   * @param {string} themeName - Name of the theme to check
   * @returns {boolean} True if theme exists
   */
  static hasTheme(themeName) {
    return themeName in this.themes;
  }

  /**
   * Register a new theme class
   * @param {string} name - Theme name
   * @param {class} ThemeClass - Theme class extending Theme
   */
  static registerTheme(name, ThemeClass) {
    if (!ThemeClass.prototype || !ThemeClass.prototype.initializeTheme) {
      throw new Error('Theme class must extend Theme base class');
    }

    this.themes[name] = ThemeClass;
    logger.info('Theme registered', {name});
  }

  /**
   * Unregister a theme
   * @param {string} name - Theme name to unregister
   */
  static unregisterTheme(name) {
    if (name in this.themes) {
      delete this.themes[name];
      logger.info('Theme unregistered', {name});
    }
  }

  /**
   * Get theme metadata for all themes
   * @returns {Object[]} Array of theme metadata
   */
  static getAllThemeMetadata() {
    return Object.keys(this.themes).map(name => {
      const theme = this.createTheme(name);
      return theme.getMetadata();
    });
  }

  /**
   * Create themes by category
   * @param {string} category - Theme category (dark, light, colorful)
   * @returns {Theme[]} Array of theme instances
   */
  static createThemesByCategory(category) {
    const categoryMap = {
      dark: ['dark', 'neon'],
      light: ['light'],
      colorful: ['neon', 'ocean', 'sunset'],
    };

    const themeNames = categoryMap[category] || [];
    return themeNames.map(name => this.createTheme(name));
  }
}

/**
 * Theme Builder for creating custom themes
 * Implements Builder Pattern
 */
export class ThemeBuilder {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.colors = {};
    this.gradients = {};
    this.typography = {};
    this.spacing = {};
    this.borderRadius = {};
    this.shadows = {};
  }

  /**
   * Set colors
   * @param {Object} colors - Color configuration
   * @returns {ThemeBuilder} Builder instance
   */
  setColors(colors) {
    this.colors = { ...this.colors, ...colors };
    return this;
  }

  /**
   * Set gradients
   * @param {Object} gradients - Gradient configuration
   * @returns {ThemeBuilder} Builder instance
   */
  setGradients(gradients) {
    this.gradients = { ...this.gradients, ...gradients };
    return this;
  }

  /**
   * Set typography
   * @param {Object} typography - Typography configuration
   * @returns {ThemeBuilder} Builder instance
   */
  setTypography(typography) {
    this.typography = { ...this.typography, ...typography };
    return this;
  }

  /**
   * Set spacing
   * @param {Object} spacing - Spacing configuration
   * @returns {ThemeBuilder} Builder instance
   */
  setSpacing(spacing) {
    this.spacing = { ...this.spacing, ...spacing };
    return this;
  }

  /**
   * Set border radius
   * @param {Object} borderRadius - Border radius configuration
   * @returns {ThemeBuilder} Builder instance
   */
  setBorderRadius(borderRadius) {
    this.borderRadius = { ...this.borderRadius, ...borderRadius };
    return this;
  }

  /**
   * Set shadows
   * @param {Object} shadows - Shadow configuration
   * @returns {ThemeBuilder} Builder instance
   */
  setShadows(shadows) {
    this.shadows = { ...this.shadows, ...shadows };
    return this;
  }

  /**
   * Build the custom theme
   * @returns {CustomTheme} Custom theme instance
   */
  build() {
    return new CustomTheme(
      this.name,
      this.description,
      this.colors,
      this.gradients,
      this.typography,
      this.spacing,
      this.borderRadius,
      this.shadows
    );
  }
}

/**
 * Custom Theme class for builder-created themes
 */
class CustomTheme {
  constructor(name, description, colors, gradients, typography, spacing, borderRadius, shadows) {
    this.name = name;
    this.description = description;
    this.colors = colors;
    this.gradients = gradients;
    this.typography = typography;
    this.spacing = spacing;
    this.borderRadius = borderRadius;
    this.shadows = shadows;
  }

  getId() {
    return this.name.toLowerCase().replace(/\s+/g, '_');
  }

  getDisplayName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getPrimaryColor() {
    return this.colors.primary;
  }

  getBackgroundColor() {
    return this.colors.background;
  }

  getTextColor() {
    return this.colors.text;
  }

  getPrimaryGradient() {
    return this.gradients.primary;
  }

  getShadow(size = 'md') {
    return this.shadows[size] || this.shadows.md;
  }

  getSpacing(size = 'md') {
    return this.spacing[size] || this.spacing.md;
  }

  getBorderRadius(size = 'md') {
    return this.borderRadius[size] || this.borderRadius.md;
  }

  isDark() {
    return this.colors.background && this.colors.background.startsWith('#0') || 
           this.colors.background && this.colors.background.startsWith('#1');
  }

  isLight() {
    return this.colors.background === '#FFFFFF' || 
           this.colors.background === '#F2F2F7';
  }

  getMetadata() {
    return {
      id: this.getId(),
      name: this.getDisplayName(),
      description: this.getDescription(),
      isDark: this.isDark(),
      isLight: this.isLight(),
      primaryColor: this.getPrimaryColor(),
      backgroundColor: this.getBackgroundColor(),
    };
  }

  validate() {
    const required = ['colors', 'gradients', 'typography', 'spacing', 'borderRadius', 'shadows'];
    const missing = required.filter(prop => !this[prop] || Object.keys(this[prop]).length === 0);
    
    if (missing.length > 0) {
      throw new Error(`Custom theme validation failed. Missing properties: ${missing.join(', ')}`);
    }
    
    return true;
  }
}
