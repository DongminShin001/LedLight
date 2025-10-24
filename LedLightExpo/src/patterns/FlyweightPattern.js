import logger from '../utils/Logger';

/**
 * Flyweight - Shared LED configuration
 * Implements Flyweight Pattern for memory optimization
 */
export class LEDConfigurationFlyweight {
  constructor(intrinsicState) {
    // Intrinsic state - shared between many LEDs
    this.colorProfile = intrinsicState.colorProfile;
    this.effectPreset = intrinsicState.effectPreset;
    this.animationCurve = intrinsicState.animationCurve;
    this.transitionType = intrinsicState.transitionType;
  }

  /**
   * Apply configuration with extrinsic state
   */
  apply(extrinsicState) {
    logger.info('Applying flyweight configuration', {
      intrinsic: {
        colorProfile: this.colorProfile,
        effectPreset: this.effectPreset,
      },
      extrinsic: extrinsicState,
    });

    return {
      ...extrinsicState,
      colorProfile: this.colorProfile,
      effectPreset: this.effectPreset,
      animationCurve: this.animationCurve,
      transitionType: this.transitionType,
    };
  }

  /**
   * Get intrinsic state
   */
  getIntrinsicState() {
    return {
      colorProfile: this.colorProfile,
      effectPreset: this.effectPreset,
      animationCurve: this.animationCurve,
      transitionType: this.transitionType,
    };
  }
}

/**
 * Flyweight Factory - Manages flyweight instances
 */
export class LEDConfigurationFactory {
  constructor() {
    this.flyweights = new Map();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Get or create flyweight
   */
  getFlyweight(intrinsicState) {
    const key = this.getKey(intrinsicState);
    
    if (this.flyweights.has(key)) {
      this.hitCount++;
      logger.info('Flyweight cache hit', {key, hitCount: this.hitCount});
      return this.flyweights.get(key);
    }

    this.missCount++;
    logger.info('Flyweight cache miss, creating new', {key, missCount: this.missCount});
    const flyweight = new LEDConfigurationFlyweight(intrinsicState);
    this.flyweights.set(key, flyweight);
    return flyweight;
  }

  /**
   * Get key from intrinsic state
   */
  getKey(intrinsicState) {
    return `${intrinsicState.colorProfile}-${intrinsicState.effectPreset}-${intrinsicState.animationCurve}-${intrinsicState.transitionType}`;
  }

  /**
   * Get flyweight count
   */
  getFlyweightCount() {
    return this.flyweights.size;
  }

  /**
   * Get cache statistics
   */
  getStatistics() {
    const total = this.hitCount + this.missCount;
    return {
      flyweightCount: this.flyweights.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: total > 0 ? (this.hitCount / total * 100).toFixed(2) + '%' : '0%',
      memoryEstimate: this.estimateMemory(),
    };
  }

  /**
   * Estimate memory savings
   */
  estimateMemory() {
    const avgFlyweightSize = 200; // bytes
    const savedInstances = this.hitCount;
    const savedBytes = savedInstances * avgFlyweightSize;
    return {
      flyweights: this.flyweights.size * avgFlyweightSize,
      savedBytes,
      savedKB: (savedBytes / 1024).toFixed(2),
    };
  }

  /**
   * Clear all flyweights
   */
  clear() {
    this.flyweights.clear();
    this.hitCount = 0;
    this.missCount = 0;
    logger.info('Flyweight factory cleared');
  }
}

/**
 * LED with Flyweight - Uses shared configuration
 */
export class FlyweightLED {
  constructor(id, position, flyweight) {
    // Extrinsic state - unique to each LED
    this.id = id;
    this.position = position;
    this.brightness = 100;
    this.power = false;
    
    // Shared flyweight
    this.flyweight = flyweight;
  }

  /**
   * Apply configuration
   */
  applyConfiguration() {
    const config = this.flyweight.apply({
      id: this.id,
      position: this.position,
      brightness: this.brightness,
      power: this.power,
    });
    
    logger.info('Configuration applied to LED', {id: this.id, config});
    return config;
  }

  /**
   * Set brightness (extrinsic state)
   */
  setBrightness(brightness) {
    this.brightness = brightness;
  }

  /**
   * Toggle power (extrinsic state)
   */
  togglePower() {
    this.power = !this.power;
  }

  /**
   * Get state
   */
  getState() {
    return {
      id: this.id,
      position: this.position,
      brightness: this.brightness,
      power: this.power,
      sharedConfig: this.flyweight.getIntrinsicState(),
    };
  }
}

/**
 * LED Strip Manager - Manages many LEDs with flyweights
 */
export class LEDStripManager {
  constructor(ledCount, configFactory) {
    this.ledCount = ledCount;
    this.configFactory = configFactory;
    this.leds = [];
    this.initialized = false;
  }

  /**
   * Initialize LED strip
   */
  initialize(defaultConfig) {
    const flyweight = this.configFactory.getFlyweight(defaultConfig);
    
    for (let i = 0; i < this.ledCount; i++) {
      const led = new FlyweightLED(
        `LED-${i}`,
        {x: i * 10, y: 0},
        flyweight
      );
      this.leds.push(led);
    }

    this.initialized = true;
    logger.info('LED strip initialized', {
      ledCount: this.ledCount,
      flyweightCount: this.configFactory.getFlyweightCount(),
    });
  }

  /**
   * Set configuration for range
   */
  setConfiguration(startIndex, endIndex, intrinsicState) {
    const flyweight = this.configFactory.getFlyweight(intrinsicState);
    
    for (let i = startIndex; i <= endIndex && i < this.leds.length; i++) {
      this.leds[i].flyweight = flyweight;
    }

    logger.info('Configuration set for LED range', {
      startIndex,
      endIndex,
      config: intrinsicState,
    });
  }

  /**
   * Set brightness for all
   */
  setBrightnessAll(brightness) {
    this.leds.forEach(led => led.setBrightness(brightness));
  }

  /**
   * Set brightness for range
   */
  setBrightnessRange(startIndex, endIndex, brightness) {
    for (let i = startIndex; i <= endIndex && i < this.leds.length; i++) {
      this.leds[i].setBrightness(brightness);
    }
  }

  /**
   * Get LED at index
   */
  getLED(index) {
    return this.leds[index];
  }

  /**
   * Get all LEDs
   */
  getAllLEDs() {
    return this.leds;
  }

  /**
   * Get memory statistics
   */
  getMemoryStatistics() {
    const factoryStats = this.configFactory.getStatistics();
    const ledStateSize = 100; // bytes per LED extrinsic state
    const totalLEDState = this.ledCount * ledStateSize;
    
    return {
      ...factoryStats,
      ledCount: this.ledCount,
      ledStateMemory: totalLEDState,
      totalMemoryKB: ((totalLEDState + factoryStats.memoryEstimate.flyweights) / 1024).toFixed(2),
    };
  }
}

/**
 * Color Palette Flyweight - Shared color palettes
 */
export class ColorPaletteFlyweight {
  constructor(paletteName, colors) {
    this.paletteName = paletteName;
    this.colors = colors;
  }

  /**
   * Get color at index
   */
  getColor(index) {
    return this.colors[index % this.colors.length];
  }

  /**
   * Get color count
   */
  getColorCount() {
    return this.colors.length;
  }

  /**
   * Get all colors
   */
  getAllColors() {
    return [...this.colors];
  }
}

/**
 * Color Palette Factory
 */
export class ColorPaletteFactory {
  constructor() {
    this.palettes = new Map();
    this.initializePredefinedPalettes();
  }

  /**
   * Initialize predefined palettes
   */
  initializePredefinedPalettes() {
    this.createPalette('rainbow', [
      '#FF0000', '#FF7F00', '#FFFF00', '#00FF00',
      '#0000FF', '#4B0082', '#9400D3'
    ]);

    this.createPalette('warm', [
      '#FF0000', '#FF4500', '#FFA500', '#FFD700', '#FFFF00'
    ]);

    this.createPalette('cool', [
      '#00FFFF', '#0080FF', '#0000FF', '#4B0082', '#9400D3'
    ]);

    this.createPalette('pastel', [
      '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'
    ]);

    this.createPalette('neon', [
      '#FF10F0', '#39FF14', '#FFFF00', '#FF073A', '#00FFFF'
    ]);
  }

  /**
   * Create or get palette
   */
  createPalette(name, colors) {
    if (!this.palettes.has(name)) {
      const palette = new ColorPaletteFlyweight(name, colors);
      this.palettes.set(name, palette);
      logger.info('Color palette created', {name, colorCount: colors.length});
    }
    return this.palettes.get(name);
  }

  /**
   * Get palette
   */
  getPalette(name) {
    return this.palettes.get(name);
  }

  /**
   * Get all palette names
   */
  getPaletteNames() {
    return Array.from(this.palettes.keys());
  }

  /**
   * Get palette count
   */
  getPaletteCount() {
    return this.palettes.size;
  }
}

/**
 * Effect Template Flyweight - Shared effect templates
 */
export class EffectTemplateFlyweight {
  constructor(templateName, template) {
    this.templateName = templateName;
    this.template = template;
  }

  /**
   * Apply template with parameters
   */
  apply(parameters) {
    return {
      ...this.template,
      ...parameters,
      templateName: this.templateName,
    };
  }

  /**
   * Get template
   */
  getTemplate() {
    return {...this.template};
  }
}

/**
 * Effect Template Factory
 */
export class EffectTemplateFactory {
  constructor() {
    this.templates = new Map();
    this.initializePredefinedTemplates();
  }

  /**
   * Initialize predefined templates
   */
  initializePredefinedTemplates() {
    this.createTemplate('fade', {
      duration: 1000,
      curve: 'linear',
      repeat: false,
    });

    this.createTemplate('pulse', {
      duration: 500,
      curve: 'sine',
      repeat: true,
    });

    this.createTemplate('chase', {
      duration: 2000,
      curve: 'linear',
      repeat: true,
      direction: 'forward',
    });

    this.createTemplate('strobe', {
      duration: 100,
      curve: 'step',
      repeat: true,
    });
  }

  /**
   * Create template
   */
  createTemplate(name, template) {
    if (!this.templates.has(name)) {
      const flyweight = new EffectTemplateFlyweight(name, template);
      this.templates.set(name, flyweight);
      logger.info('Effect template created', {name});
    }
    return this.templates.get(name);
  }

  /**
   * Get template
   */
  getTemplate(name) {
    return this.templates.get(name);
  }

  /**
   * Get all template names
   */
  getTemplateNames() {
    return Array.from(this.templates.keys());
  }
}

export default LEDConfigurationFactory;
