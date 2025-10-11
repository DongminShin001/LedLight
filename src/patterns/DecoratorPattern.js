import logger from '../utils/Logger';

/**
 * Base Effect Decorator - Implements Decorator Pattern
 */
export class EffectDecorator {
  constructor(effect) {
    this.effect = effect;
  }

  async apply() {
    return await this.effect.apply();
  }

  getDescription() {
    return this.effect.getDescription();
  }

  getConfig() {
    return this.effect.getConfig();
  }
}

/**
 * Base Effect class
 */
export class Effect {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
  }

  async apply() {
    logger.info('Applying effect', {name: this.name});
    return {name: this.name, config: this.config};
  }

  getDescription() {
    return this.name;
  }

  getConfig() {
    return {...this.config};
  }
}

/**
 * Speed Decorator - Adds speed control to effects
 */
export class SpeedDecorator extends EffectDecorator {
  constructor(effect, speed = 1.0) {
    super(effect);
    this.speed = speed;
  }

  async apply() {
    const result = await super.apply();
    logger.info('Adding speed modifier', {speed: this.speed});
    return {
      ...result,
      speed: this.speed,
    };
  }

  getDescription() {
    return `${super.getDescription()} (Speed: ${this.speed}x)`;
  }

  getConfig() {
    return {
      ...super.getConfig(),
      speed: this.speed,
    };
  }
}

/**
 * Intensity Decorator - Adds intensity control to effects
 */
export class IntensityDecorator extends EffectDecorator {
  constructor(effect, intensity = 100) {
    super(effect);
    this.intensity = intensity;
  }

  async apply() {
    const result = await super.apply();
    logger.info('Adding intensity modifier', {intensity: this.intensity});
    return {
      ...result,
      intensity: this.intensity,
    };
  }

  getDescription() {
    return `${super.getDescription()} (Intensity: ${this.intensity}%)`;
  }

  getConfig() {
    return {
      ...super.getConfig(),
      intensity: this.intensity,
    };
  }
}

/**
 * Color Filter Decorator - Adds color filtering to effects
 */
export class ColorFilterDecorator extends EffectDecorator {
  constructor(effect, colorFilter) {
    super(effect);
    this.colorFilter = colorFilter;
  }

  async apply() {
    const result = await super.apply();
    logger.info('Adding color filter', {filter: this.colorFilter});
    return {
      ...result,
      colorFilter: this.colorFilter,
    };
  }

  getDescription() {
    return `${super.getDescription()} (Filter: ${this.colorFilter})`;
  }

  getConfig() {
    return {
      ...super.getConfig(),
      colorFilter: this.colorFilter,
    };
  }
}

/**
 * Reverse Decorator - Reverses effect direction
 */
export class ReverseDecorator extends EffectDecorator {
  constructor(effect) {
    super(effect);
  }

  async apply() {
    const result = await super.apply();
    logger.info('Reversing effect direction');
    return {
      ...result,
      reversed: true,
    };
  }

  getDescription() {
    return `${super.getDescription()} (Reversed)`;
  }

  getConfig() {
    return {
      ...super.getConfig(),
      reversed: true,
    };
  }
}

/**
 * Fade Decorator - Adds fade in/out to effects
 */
export class FadeDecorator extends EffectDecorator {
  constructor(effect, fadeInDuration = 1000, fadeOutDuration = 1000) {
    super(effect);
    this.fadeInDuration = fadeInDuration;
    this.fadeOutDuration = fadeOutDuration;
  }

  async apply() {
    const result = await super.apply();
    logger.info('Adding fade effect', {
      fadeIn: this.fadeInDuration,
      fadeOut: this.fadeOutDuration,
    });
    return {
      ...result,
      fadeInDuration: this.fadeInDuration,
      fadeOutDuration: this.fadeOutDuration,
    };
  }

  getDescription() {
    return `${super.getDescription()} (Fade: ${this.fadeInDuration}ms/${this.fadeOutDuration}ms)`;
  }

  getConfig() {
    return {
      ...super.getConfig(),
      fadeInDuration: this.fadeInDuration,
      fadeOutDuration: this.fadeOutDuration,
    };
  }
}

/**
 * Strobe Decorator - Adds strobe effect
 */
export class StrobeDecorator extends EffectDecorator {
  constructor(effect, frequency = 10) {
    super(effect);
    this.frequency = frequency;
  }

  async apply() {
    const result = await super.apply();
    logger.info('Adding strobe effect', {frequency: this.frequency});
    return {
      ...result,
      strobe: true,
      strobeFrequency: this.frequency,
    };
  }

  getDescription() {
    return `${super.getDescription()} (Strobe: ${this.frequency}Hz)`;
  }

  getConfig() {
    return {
      ...super.getConfig(),
      strobe: true,
      strobeFrequency: this.frequency,
    };
  }
}

/**
 * Effect Builder - Fluent interface for building decorated effects
 */
export class EffectBuilder {
  constructor(baseEffect) {
    this.effect = baseEffect;
  }

  withSpeed(speed) {
    this.effect = new SpeedDecorator(this.effect, speed);
    return this;
  }

  withIntensity(intensity) {
    this.effect = new IntensityDecorator(this.effect, intensity);
    return this;
  }

  withColorFilter(filter) {
    this.effect = new ColorFilterDecorator(this.effect, filter);
    return this;
  }

  withReverse() {
    this.effect = new ReverseDecorator(this.effect);
    return this;
  }

  withFade(fadeInDuration, fadeOutDuration) {
    this.effect = new FadeDecorator(this.effect, fadeInDuration, fadeOutDuration);
    return this;
  }

  withStrobe(frequency) {
    this.effect = new StrobeDecorator(this.effect, frequency);
    return this;
  }

  build() {
    return this.effect;
  }
}

/**
 * Predefined Effects
 */
export class RainbowEffect extends Effect {
  constructor() {
    super('Rainbow', {type: 'rainbow'});
  }
}

export class PulseEffect extends Effect {
  constructor() {
    super('Pulse', {type: 'pulse'});
  }
}

export class WaveEffect extends Effect {
  constructor() {
    super('Wave', {type: 'wave'});
  }
}

export class SparkleEffect extends Effect {
  constructor() {
    super('Sparkle', {type: 'sparkle'});
  }
}

export class BreathingEffect extends Effect {
  constructor() {
    super('Breathing', {type: 'breathing'});
  }
}

export class ChaseEffect extends Effect {
  constructor() {
    super('Chase', {type: 'chase'});
  }
}

/**
 * Effect Factory - Creates effects with decorators
 */
export class EffectFactory {
  static createRainbow() {
    return new RainbowEffect();
  }

  static createPulse() {
    return new PulseEffect();
  }

  static createWave() {
    return new WaveEffect();
  }

  static createSparkle() {
    return new SparkleEffect();
  }

  static createBreathing() {
    return new BreathingEffect();
  }

  static createChase() {
    return new ChaseEffect();
  }

  static createBuilder(effect) {
    return new EffectBuilder(effect);
  }

  static createCustomEffect(name, config) {
    return new Effect(name, config);
  }
}
