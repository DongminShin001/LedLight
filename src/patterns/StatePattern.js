import logger from '../utils/Logger';

/**
 * Base State class - Implements State Pattern
 */
export class LEDState {
  constructor(context) {
    this.context = context;
    this.stateName = 'Base';
  }

  /**
   * Enter this state
   */
  onEnter() {
    logger.info('Entering state', {state: this.stateName});
  }

  /**
   * Exit this state
   */
  onExit() {
    logger.info('Exiting state', {state: this.stateName});
  }

  /**
   * Handle power on
   */
  async powerOn() {
    throw new Error('powerOn() must be implemented by subclass');
  }

  /**
   * Handle power off
   */
  async powerOff() {
    throw new Error('powerOff() must be implemented by subclass');
  }

  /**
   * Handle color change
   */
  async changeColor(color) {
    throw new Error('changeColor() must be implemented by subclass');
  }

  /**
   * Handle brightness change
   */
  async changeBrightness(brightness) {
    throw new Error('changeBrightness() must be implemented by subclass');
  }

  /**
   * Handle effect change
   */
  async changeEffect(effect) {
    throw new Error('changeEffect() must be implemented by subclass');
  }

  /**
   * Get state name
   */
  getStateName() {
    return this.stateName;
  }

  /**
   * Get state info
   */
  getStateInfo() {
    return {
      name: this.stateName,
      timestamp: Date.now(),
    };
  }
}

/**
 * Off State - LED is powered off
 */
export class OffState extends LEDState {
  constructor(context) {
    super(context);
    this.stateName = 'Off';
  }

  onEnter() {
    super.onEnter();
    this.context.setLEDStatus('off');
  }

  async powerOn() {
    logger.info('Powering on LED');
    this.context.setState(this.context.states.on);
    return true;
  }

  async powerOff() {
    logger.warn('LED is already off');
    return false;
  }

  async changeColor(color) {
    logger.warn('Cannot change color while LED is off');
    return false;
  }

  async changeBrightness(brightness) {
    logger.warn('Cannot change brightness while LED is off');
    return false;
  }

  async changeEffect(effect) {
    logger.warn('Cannot change effect while LED is off');
    return false;
  }
}

/**
 * On State - LED is powered on
 */
export class OnState extends LEDState {
  constructor(context) {
    super(context);
    this.stateName = 'On';
  }

  onEnter() {
    super.onEnter();
    this.context.setLEDStatus('on');
  }

  async powerOn() {
    logger.warn('LED is already on');
    return false;
  }

  async powerOff() {
    logger.info('Powering off LED');
    this.context.setState(this.context.states.off);
    return true;
  }

  async changeColor(color) {
    logger.info('Changing color', {color});
    await this.context.sendColorCommand(color);
    return true;
  }

  async changeBrightness(brightness) {
    logger.info('Changing brightness', {brightness});
    await this.context.sendBrightnessCommand(brightness);
    return true;
  }

  async changeEffect(effect) {
    logger.info('Changing to effect mode', {effect});
    this.context.setState(this.context.states.effect);
    await this.context.sendEffectCommand(effect);
    return true;
  }
}

/**
 * Effect State - LED is running an effect
 */
export class EffectState extends LEDState {
  constructor(context) {
    super(context);
    this.stateName = 'Effect';
    this.currentEffect = null;
  }

  onEnter() {
    super.onEnter();
    this.context.setLEDStatus('effect');
  }

  async powerOn() {
    logger.warn('LED is already on (in effect mode)');
    return false;
  }

  async powerOff() {
    logger.info('Stopping effect and powering off');
    await this.context.stopEffect();
    this.context.setState(this.context.states.off);
    return true;
  }

  async changeColor(color) {
    logger.info('Stopping effect and changing to solid color');
    await this.context.stopEffect();
    this.context.setState(this.context.states.on);
    await this.context.sendColorCommand(color);
    return true;
  }

  async changeBrightness(brightness) {
    logger.info('Changing effect brightness', {brightness});
    await this.context.sendBrightnessCommand(brightness);
    return true;
  }

  async changeEffect(effect) {
    logger.info('Changing effect', {from: this.currentEffect, to: effect});
    this.currentEffect = effect;
    await this.context.sendEffectCommand(effect);
    return true;
  }
}

/**
 * Connecting State - LED is connecting to device
 */
export class ConnectingState extends LEDState {
  constructor(context) {
    super(context);
    this.stateName = 'Connecting';
  }

  onEnter() {
    super.onEnter();
    this.context.setLEDStatus('connecting');
  }

  async powerOn() {
    logger.warn('Cannot power on while connecting');
    return false;
  }

  async powerOff() {
    logger.warn('Cannot power off while connecting');
    return false;
  }

  async changeColor(color) {
    logger.warn('Cannot change color while connecting');
    return false;
  }

  async changeBrightness(brightness) {
    logger.warn('Cannot change brightness while connecting');
    return false;
  }

  async changeEffect(effect) {
    logger.warn('Cannot change effect while connecting');
    return false;
  }
}

/**
 * Error State - LED encountered an error
 */
export class ErrorState extends LEDState {
  constructor(context) {
    super(context);
    this.stateName = 'Error';
    this.errorMessage = null;
  }

  onEnter() {
    super.onEnter();
    this.context.setLEDStatus('error');
  }

  setError(error) {
    this.errorMessage = error;
    logger.error('LED entered error state', {error});
  }

  async powerOn() {
    logger.warn('Cannot power on in error state. Please reconnect.');
    return false;
  }

  async powerOff() {
    logger.warn('Cannot power off in error state. Please reconnect.');
    return false;
  }

  async changeColor(color) {
    logger.warn('Cannot change color in error state. Please reconnect.');
    return false;
  }

  async changeBrightness(brightness) {
    logger.warn('Cannot change brightness in error state. Please reconnect.');
    return false;
  }

  async changeEffect(effect) {
    logger.warn('Cannot change effect in error state. Please reconnect.');
    return false;
  }

  getStateInfo() {
    return {
      ...super.getStateInfo(),
      error: this.errorMessage,
    };
  }
}

/**
 * LED State Context - Manages state transitions
 */
export class LEDStateContext {
  constructor() {
    // Initialize all states
    this.states = {
      off: new OffState(this),
      on: new OnState(this),
      effect: new EffectState(this),
      connecting: new ConnectingState(this),
      error: new ErrorState(this),
    };

    // Set initial state
    this.currentState = this.states.off;
    this.ledStatus = 'off';
    this.stateHistory = [];
    this.maxHistorySize = 50;
  }

  /**
   * Set current state
   * @param {LEDState} newState - New state to transition to
   */
  setState(newState) {
    if (this.currentState) {
      this.currentState.onExit();
      this.addToHistory(this.currentState.getStateName());
    }

    this.currentState = newState;
    this.currentState.onEnter();

    logger.info('State transition', {
      from: this.stateHistory.length > 0 ? this.stateHistory[this.stateHistory.length - 1] : 'none',
      to: newState.getStateName(),
    });
  }

  /**
   * Add state to history
   * @param {string} stateName - State name
   */
  addToHistory(stateName) {
    this.stateHistory.push({
      state: stateName,
      timestamp: Date.now(),
    });

    // Limit history size
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  /**
   * Get current state
   * @returns {LEDState} Current state
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Get current state name
   * @returns {string} State name
   */
  getCurrentStateName() {
    return this.currentState.getStateName();
  }

  /**
   * Set LED status
   * @param {string} status - Status string
   */
  setLEDStatus(status) {
    this.ledStatus = status;
  }

  /**
   * Get LED status
   * @returns {string} LED status
   */
  getLEDStatus() {
    return this.ledStatus;
  }

  /**
   * Power on LED
   * @returns {Promise<boolean>} Success status
   */
  async powerOn() {
    return await this.currentState.powerOn();
  }

  /**
   * Power off LED
   * @returns {Promise<boolean>} Success status
   */
  async powerOff() {
    return await this.currentState.powerOff();
  }

  /**
   * Change color
   * @param {string} color - Color value
   * @returns {Promise<boolean>} Success status
   */
  async changeColor(color) {
    return await this.currentState.changeColor(color);
  }

  /**
   * Change brightness
   * @param {number} brightness - Brightness value
   * @returns {Promise<boolean>} Success status
   */
  async changeBrightness(brightness) {
    return await this.currentState.changeBrightness(brightness);
  }

  /**
   * Change effect
   * @param {string} effect - Effect name
   * @returns {Promise<boolean>} Success status
   */
  async changeEffect(effect) {
    return await this.currentState.changeEffect(effect);
  }

  /**
   * Handle connection
   */
  onConnecting() {
    this.setState(this.states.connecting);
  }

  /**
   * Handle successful connection
   */
  onConnected() {
    this.setState(this.states.off);
  }

  /**
   * Handle disconnection
   */
  onDisconnected() {
    this.setState(this.states.off);
  }

  /**
   * Handle error
   * @param {Error} error - Error object
   */
  onError(error) {
    this.states.error.setError(error.message);
    this.setState(this.states.error);
  }

  /**
   * Send color command (placeholder for actual implementation)
   * @param {string} color - Color value
   */
  async sendColorCommand(color) {
    logger.info('Sending color command', {color});
    // This will be implemented by the actual LED controller
  }

  /**
   * Send brightness command (placeholder for actual implementation)
   * @param {number} brightness - Brightness value
   */
  async sendBrightnessCommand(brightness) {
    logger.info('Sending brightness command', {brightness});
    // This will be implemented by the actual LED controller
  }

  /**
   * Send effect command (placeholder for actual implementation)
   * @param {string} effect - Effect name
   */
  async sendEffectCommand(effect) {
    logger.info('Sending effect command', {effect});
    // This will be implemented by the actual LED controller
  }

  /**
   * Stop effect (placeholder for actual implementation)
   */
  async stopEffect() {
    logger.info('Stopping effect');
    // This will be implemented by the actual LED controller
  }

  /**
   * Get state history
   * @returns {Array} State history
   */
  getStateHistory() {
    return [...this.stateHistory];
  }

  /**
   * Get state statistics
   * @returns {Object} State statistics
   */
  getStatistics() {
    const stateCounts = this.stateHistory.reduce((acc, item) => {
      acc[item.state] = (acc[item.state] || 0) + 1;
      return acc;
    }, {});

    return {
      currentState: this.getCurrentStateName(),
      currentStatus: this.ledStatus,
      historySize: this.stateHistory.length,
      stateCounts,
    };
  }

  /**
   * Reset state context
   */
  reset() {
    this.setState(this.states.off);
    this.stateHistory = [];
    logger.info('State context reset');
  }
}
