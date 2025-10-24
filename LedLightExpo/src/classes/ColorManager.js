/**
 * ColorManager Class - Handles color operations and palettes
 * Manages color selection, palettes, and color-related functionality
 */

import LEDController from './LEDController';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

class ColorManager {
  constructor() {
    this.selectedColor = '#00ff88';
    this.colorHistory = [];
    this.maxHistorySize = 20;
    
    this.colorPalettes = [
      {
        name: 'Neon',
        colors: ['#00ff88', '#ff0080', '#00ffff', '#ffff00', '#ff8000', '#8000ff'],
        description: 'Bright neon colors for vibrant displays',
      },
      {
        name: 'Warm',
        colors: ['#ff6b6b', '#ffa726', '#ffeb3b', '#ff5722', '#ff9800', '#f44336'],
        description: 'Warm colors for cozy lighting',
      },
      {
        name: 'Cool',
        colors: ['#2196f3', '#00bcd4', '#4dd0e1', '#009688', '#4caf50', '#8bc34a'],
        description: 'Cool colors for relaxing atmosphere',
      },
      {
        name: 'Pastel',
        colors: ['#ffcdd2', '#f8bbd9', '#e1bee7', '#c5cae9', '#bbdefb', '#b3e5fc'],
        description: 'Soft pastel colors for gentle lighting',
      },
      {
        name: 'Monochrome',
        colors: ['#ffffff', '#e0e0e0', '#9e9e9e', '#616161', '#424242', '#000000'],
        description: 'Black, white, and gray tones',
      },
      {
        name: 'Rainbow',
        colors: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff'],
        description: 'Full spectrum rainbow colors',
      },
    ];

    this.colorPresets = [
      {
        name: 'Sunset',
        colors: ['#ff6b6b', '#ffa726', '#ffeb3b'],
        gradient: ['#ff6b6b', '#ffa726', '#ffeb3b'],
        description: 'Warm sunset colors',
      },
      {
        name: 'Ocean',
        colors: ['#2196f3', '#00bcd4', '#4dd0e1'],
        gradient: ['#2196f3', '#00bcd4', '#4dd0e1'],
        description: 'Cool ocean blues',
      },
      {
        name: 'Forest',
        colors: ['#4caf50', '#8bc34a', '#cddc39'],
        gradient: ['#4caf50', '#8bc34a', '#cddc39'],
        description: 'Natural forest greens',
      },
      {
        name: 'Purple',
        colors: ['#9c27b0', '#e91e63', '#f06292'],
        gradient: ['#9c27b0', '#e91e63', '#f06292'],
        description: 'Rich purple tones',
      },
      {
        name: 'Fire',
        colors: ['#f44336', '#ff5722', '#ff9800'],
        gradient: ['#f44336', '#ff5722', '#ff9800'],
        description: 'Fiery red and orange',
      },
      {
        name: 'Ice',
        colors: ['#00bcd4', '#e1f5fe', '#ffffff'],
        gradient: ['#00bcd4', '#e1f5fe', '#ffffff'],
        description: 'Cool ice blues and whites',
      },
    ];

    this.basicColors = [
      '#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00',
      '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff',
      '#ff00ff', '#ff0080', '#ffffff', '#ff8080', '#80ff80',
      '#8080ff', '#ffff80', '#ff80ff', '#80ffff', '#000000',
    ];
  }

  /**
   * Set selected color
   * @param {string} color - Hex color string
   * @returns {boolean} - Success status
   */
  setSelectedColor(color) {
    if (!this.isValidHexColor(color)) {
      throw new Error('Invalid hex color format');
    }

    this.selectedColor = color;
    this.addToHistory(color);
    logger.info('Selected color updated', {color});
    return true;
  }

  /**
   * Get selected color
   * @returns {string} - Current selected color
   */
  getSelectedColor() {
    return this.selectedColor;
  }

  /**
   * Apply color to LED device
   * @param {string} color - Hex color string
   * @returns {Promise<boolean>} - Success status
   */
  async applyColor(color) {
    try {
      if (color) {
        this.setSelectedColor(color);
      }

      const success = await LEDController.setColor(this.selectedColor);
      
      if (success) {
        logger.info('Color applied to LED device', {color: this.selectedColor});
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to apply color to LED device', error);
      throw error;
    }
  }

  /**
   * Apply color preset to LED device
   * @param {string} presetName - Preset name
   * @returns {Promise<boolean>} - Success status
   */
  async applyPreset(presetName) {
    try {
      const preset = this.colorPresets.find(p => p.name === presetName);
      if (!preset) {
        throw new Error(`Color preset not found: ${presetName}`);
      }

      const success = await LEDController.setPreset(presetName);
      
      if (success) {
        this.setSelectedColor(preset.colors[0]);
        logger.info('Color preset applied to LED device', {presetName});
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to apply color preset', error);
      throw error;
    }
  }

  /**
   * Get color palettes
   * @returns {Array} - Array of color palette objects
   */
  getColorPalettes() {
    return [...this.colorPalettes];
  }

  /**
   * Get color presets
   * @returns {Array} - Array of color preset objects
   */
  getColorPresets() {
    return [...this.colorPresets];
  }

  /**
   * Get basic colors
   * @returns {Array} - Array of basic color strings
   */
  getBasicColors() {
    return [...this.basicColors];
  }

  /**
   * Get color palette by name
   * @param {string} name - Palette name
   * @returns {Object|null} - Palette object or null
   */
  getPaletteByName(name) {
    return this.colorPalettes.find(palette => palette.name === name) || null;
  }

  /**
   * Get color preset by name
   * @param {string} name - Preset name
   * @returns {Object|null} - Preset object or null
   */
  getPresetByName(name) {
    return this.colorPresets.find(preset => preset.name === name) || null;
  }

  /**
   * Add color to history
   * @param {string} color - Hex color string
   */
  addToHistory(color) {
    if (!this.isValidHexColor(color)) {
      return;
    }

    // Remove if already exists
    const existingIndex = this.colorHistory.indexOf(color);
    if (existingIndex > -1) {
      this.colorHistory.splice(existingIndex, 1);
    }

    // Add to beginning
    this.colorHistory.unshift(color);

    // Limit history size
    if (this.colorHistory.length > this.maxHistorySize) {
      this.colorHistory = this.colorHistory.slice(0, this.maxHistorySize);
    }

    logger.debug('Color added to history', {color, historySize: this.colorHistory.length});
  }

  /**
   * Get color history
   * @returns {Array} - Array of recent colors
   */
  getColorHistory() {
    return [...this.colorHistory];
  }

  /**
   * Clear color history
   */
  clearHistory() {
    this.colorHistory = [];
    logger.info('Color history cleared');
  }

  /**
   * Convert hex color to RGB
   * @param {string} hex - Hex color string
   * @returns {Object} - RGB object
   */
  hexToRgb(hex) {
    if (!this.isValidHexColor(hex)) {
      throw new Error('Invalid hex color format');
    }

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  /**
   * Convert RGB to hex color
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @returns {string} - Hex color string
   */
  rgbToHex(r, g, b) {
    if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number') {
      throw new Error('RGB values must be numbers');
    }

    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new Error('RGB values must be between 0 and 255');
    }

    const toHex = (n) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Get complementary color
   * @param {string} hex - Hex color string
   * @returns {string} - Complementary hex color
   */
  getComplementaryColor(hex) {
    const rgb = this.hexToRgb(hex);
    return this.rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
  }

  /**
   * Get analogous colors
   * @param {string} hex - Hex color string
   * @returns {Array} - Array of analogous colors
   */
  getAnalogousColors(hex) {
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const colors = [];
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue; // Skip the original color
      const newHsl = {...hsl, h: (hsl.h + i * 30 + 360) % 360};
      const newRgb = this.hslToRgb(newHsl.h, newHsl.s, newHsl.l);
      colors.push(this.rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }
    
    return colors;
  }

  /**
   * Convert RGB to HSL
   * @param {number} r - Red value
   * @param {number} g - Green value
   * @param {number} b - Blue value
   * @returns {Object} - HSL object
   */
  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  /**
   * Convert HSL to RGB
   * @param {number} h - Hue value
   * @param {number} s - Saturation value
   * @param {number} l - Lightness value
   * @returns {Object} - RGB object
   */
  hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  /**
   * Validate hex color format
   * @param {string} color - Color string
   * @returns {boolean} - Valid status
   */
  isValidHexColor(color) {
    const hexPattern = /^#?[0-9A-Fa-f]{6}$/;
    return hexPattern.test(color);
  }

  /**
   * Get random color
   * @returns {string} - Random hex color
   */
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /**
   * Get current color configuration
   * @returns {Object} - Current configuration
   */
  getConfiguration() {
    return {
      selectedColor: this.selectedColor,
      colorHistory: this.colorHistory,
      palettes: this.colorPalettes.length,
      presets: this.colorPresets.length,
      basicColors: this.basicColors.length,
    };
  }

  /**
   * Reset to default configuration
   */
  reset() {
    this.selectedColor = '#00ff88';
    this.colorHistory = [];
    logger.info('ColorManager reset to default configuration');
  }
}

// Export singleton instance
export default new ColorManager();
