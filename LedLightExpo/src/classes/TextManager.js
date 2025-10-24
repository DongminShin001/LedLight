/**
 * TextManager Class - Handles text display operations
 * Manages custom text, animations, and formatting for LED displays
 */

import LEDController from './LEDController';
import {ErrorHandler} from '../utils/ErrorHandler';
import logger from '../utils/Logger';

class TextManager {
  constructor() {
    this.currentText = '';
    this.textColor = '#00ff88';
    this.backgroundColor = '#000000';
    this.textSize = 16;
    this.animation = 'none';
    this.speed = 50;
    this.maxTextLength = 100;
    
    this.animations = [
      {id: 'none', name: 'Static', icon: 'text-fields'},
      {id: 'scroll', name: 'Scroll', icon: 'swap-horiz'},
      {id: 'blink', name: 'Blink', icon: 'flash-on'},
      {id: 'fade', name: 'Fade', icon: 'opacity'},
      {id: 'rainbow', name: 'Rainbow', icon: 'palette'},
      {id: 'wave', name: 'Wave', icon: 'waves'},
    ];

    this.textPresets = [
      {name: 'Welcome', text: 'Welcome!'},
      {name: 'Hello', text: 'Hello World'},
      {name: 'Party', text: 'PARTY TIME!'},
      {name: 'Love', text: 'Love & Light'},
      {name: 'Custom', text: ''},
    ];
  }

  /**
   * Set text content
   * @param {string} text - Text to display
   * @returns {boolean} - Success status
   */
  setText(text) {
    if (typeof text !== 'string') {
      throw new Error('Text must be a string');
    }

    if (text.length > this.maxTextLength) {
      throw new Error(`Text too long. Maximum ${this.maxTextLength} characters allowed.`);
    }

    this.currentText = text;
    logger.info('Text content updated', {text, length: text.length});
    return true;
  }

  /**
   * Get current text
   * @returns {string} - Current text
   */
  getText() {
    return this.currentText;
  }

  /**
   * Set text color
   * @param {string} color - Hex color string
   * @returns {boolean} - Success status
   */
  setTextColor(color) {
    if (!this.isValidHexColor(color)) {
      throw new Error('Invalid hex color format');
    }

    this.textColor = color;
    logger.info('Text color updated', {color});
    return true;
  }

  /**
   * Get text color
   * @returns {string} - Current text color
   */
  getTextColor() {
    return this.textColor;
  }

  /**
   * Set background color
   * @param {string} color - Hex color string
   * @returns {boolean} - Success status
   */
  setBackgroundColor(color) {
    if (!this.isValidHexColor(color)) {
      throw new Error('Invalid hex color format');
    }

    this.backgroundColor = color;
    logger.info('Background color updated', {color});
    return true;
  }

  /**
   * Get background color
   * @returns {string} - Current background color
   */
  getBackgroundColor() {
    return this.backgroundColor;
  }

  /**
   * Set text size
   * @param {number} size - Text size (8-32)
   * @returns {boolean} - Success status
   */
  setTextSize(size) {
    if (typeof size !== 'number' || size < 8 || size > 32) {
      throw new Error('Text size must be a number between 8 and 32');
    }

    this.textSize = Math.round(size);
    logger.info('Text size updated', {size: this.textSize});
    return true;
  }

  /**
   * Get text size
   * @returns {number} - Current text size
   */
  getTextSize() {
    return this.textSize;
  }

  /**
   * Set animation
   * @param {string} animationId - Animation ID
   * @returns {boolean} - Success status
   */
  setAnimation(animationId) {
    const validAnimations = this.animations.map(anim => anim.id);
    if (!validAnimations.includes(animationId)) {
      throw new Error(`Invalid animation. Valid options: ${validAnimations.join(', ')}`);
    }

    this.animation = animationId;
    logger.info('Animation updated', {animation: animationId});
    return true;
  }

  /**
   * Get current animation
   * @returns {string} - Current animation ID
   */
  getAnimation() {
    return this.animation;
  }

  /**
   * Get animation details
   * @returns {Object} - Animation object
   */
  getAnimationDetails() {
    return this.animations.find(anim => anim.id === this.animation);
  }

  /**
   * Get all available animations
   * @returns {Array} - Array of animation objects
   */
  getAvailableAnimations() {
    return [...this.animations];
  }

  /**
   * Set animation speed
   * @param {number} speed - Speed value (1-100)
   * @returns {boolean} - Success status
   */
  setSpeed(speed) {
    if (typeof speed !== 'number' || speed < 1 || speed > 100) {
      throw new Error('Speed must be a number between 1 and 100');
    }

    this.speed = Math.round(speed);
    logger.info('Animation speed updated', {speed: this.speed});
    return true;
  }

  /**
   * Get animation speed
   * @returns {number} - Current speed
   */
  getSpeed() {
    return this.speed;
  }

  /**
   * Generate command string for LED device
   * @returns {string} - Command string
   */
  generateCommand() {
    if (!this.currentText.trim()) {
      throw new Error('No text to display');
    }

    const cleanText = this.currentText.trim();
    const cleanColor = this.textColor.replace('#', '');
    const cleanBgColor = this.backgroundColor.replace('#', '');

    const command = `TEXT:${cleanText}|COLOR:${cleanColor}|BG:${cleanBgColor}|SIZE:${this.textSize}|ANIM:${this.animation}|SPEED:${this.speed}\n`;
    
    logger.info('Generated text display command', {
      text: cleanText,
      color: this.textColor,
      backgroundColor: this.backgroundColor,
      size: this.textSize,
      animation: this.animation,
      speed: this.speed,
      command: command.trim()
    });

    return command;
  }

  /**
   * Send text to LED device
   * @returns {Promise<boolean>} - Success status
   */
  async sendToLED() {
    try {
      const command = this.generateCommand();
      const success = await LEDController.sendCommand(command);
      
      if (success) {
        logger.info('Text successfully sent to LED device');
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to send text to LED device', error);
      throw error;
    }
  }

  /**
   * Load text preset
   * @param {string} presetName - Preset name
   * @returns {boolean} - Success status
   */
  loadPreset(presetName) {
    const preset = this.textPresets.find(p => p.name === presetName);
    if (!preset) {
      throw new Error(`Preset not found: ${presetName}`);
    }

    this.setText(preset.text);
    logger.info('Text preset loaded', {presetName, text: preset.text});
    return true;
  }

  /**
   * Get available presets
   * @returns {Array} - Array of preset objects
   */
  getPresets() {
    return [...this.textPresets];
  }

  /**
   * Save current text as preset
   * @param {string} presetName - Preset name
   * @returns {boolean} - Success status
   */
  savePreset(presetName) {
    if (!presetName || typeof presetName !== 'string') {
      throw new Error('Preset name must be a non-empty string');
    }

    const existingPreset = this.textPresets.find(p => p.name === presetName);
    if (existingPreset) {
      existingPreset.text = this.currentText;
    } else {
      this.textPresets.push({name: presetName, text: this.currentText});
    }

    logger.info('Text preset saved', {presetName, text: this.currentText});
    return true;
  }

  /**
   * Get current text configuration
   * @returns {Object} - Current configuration
   */
  getConfiguration() {
    return {
      text: this.currentText,
      textColor: this.textColor,
      backgroundColor: this.backgroundColor,
      textSize: this.textSize,
      animation: this.animation,
      speed: this.speed,
      maxLength: this.maxTextLength,
      characterCount: this.currentText.length,
    };
  }

  /**
   * Reset to default configuration
   */
  reset() {
    this.currentText = '';
    this.textColor = '#00ff88';
    this.backgroundColor = '#000000';
    this.textSize = 16;
    this.animation = 'none';
    this.speed = 50;
    
    logger.info('TextManager reset to default configuration');
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
   * Get text preview data
   * @returns {Object} - Preview data
   */
  getPreviewData() {
    return {
      text: this.currentText,
      textColor: this.textColor,
      backgroundColor: this.backgroundColor,
      textSize: this.textSize,
      animation: this.animation,
      speed: this.speed,
      isEmpty: !this.currentText.trim(),
    };
  }
}

// Export singleton instance
export default new TextManager();
