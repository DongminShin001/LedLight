import logger from '../utils/Logger';

/**
 * Mediator Pattern - Centralized communication between components
 */

/**
 * Base Mediator Interface
 */
export class Mediator {
  notify(sender, event, data) {
    throw new Error('notify() must be implemented');
  }
}

/**
 * LED Control Mediator - Coordinates all LED components
 */
export class LEDControlMediator extends Mediator {
  constructor() {
    super();
    this.components = new Map();
    this.eventListeners = new Map();
  }

  /**
   * Register component
   */
  registerComponent(name, component) {
    this.components.set(name, component);
    component.setMediator(this);
    logger.info('Component registered with mediator', {name});
  }

  /**
   * Unregister component
   */
  unregisterComponent(name) {
    const component = this.components.get(name);
    if (component) {
      component.setMediator(null);
      this.components.delete(name);
      logger.info('Component unregistered from mediator', {name});
    }
  }

  /**
   * Get component
   */
  getComponent(name) {
    return this.components.get(name);
  }

  /**
   * Notify mediator of event
   */
  notify(sender, event, data = {}) {
    logger.info('Mediator received notification', {
      sender: sender.constructor.name,
      event,
      data,
    });

    switch (event) {
      case 'colorChanged':
        this.handleColorChanged(sender, data);
        break;
      case 'brightnessChanged':
        this.handleBrightnessChanged(sender, data);
        break;
      case 'powerToggled':
        this.handlePowerToggled(sender, data);
        break;
      case 'effectChanged':
        this.handleEffectChanged(sender, data);
        break;
      case 'deviceConnected':
        this.handleDeviceConnected(sender, data);
        break;
      case 'deviceDisconnected':
        this.handleDeviceDisconnected(sender, data);
        break;
      case 'errorOccurred':
        this.handleError(sender, data);
        break;
      default:
        this.handleGenericEvent(sender, event, data);
    }

    // Trigger event listeners
    this.triggerEventListeners(event, {sender, data});
  }

  /**
   * Add event listener
   */
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Trigger event listeners
   */
  triggerEventListeners(event, eventData) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(eventData);
        } catch (error) {
          logger.error('Error in event listener', error);
        }
      });
    }
  }

  // Event handlers

  handleColorChanged(sender, data) {
    const ui = this.components.get('ui');
    const analytics = this.components.get('analytics');
    const storage = this.components.get('storage');

    if (ui) ui.updateColorDisplay(data.color);
    if (analytics) analytics.trackColorChange(data.color);
    if (storage) storage.saveLastColor(data.color);
  }

  handleBrightnessChanged(sender, data) {
    const ui = this.components.get('ui');
    const analytics = this.components.get('analytics');

    if (ui) ui.updateBrightnessDisplay(data.brightness);
    if (analytics) analytics.trackBrightnessChange(data.brightness);
  }

  handlePowerToggled(sender, data) {
    const ui = this.components.get('ui');
    const analytics = this.components.get('analytics');
    const scheduler = this.components.get('scheduler');

    if (ui) ui.updatePowerStatus(data.power);
    if (analytics) analytics.trackPowerToggle(data.power);
    if (scheduler && !data.power) scheduler.pauseSchedules();
  }

  handleEffectChanged(sender, data) {
    const ui = this.components.get('ui');
    const analytics = this.components.get('analytics');

    if (ui) ui.updateEffectDisplay(data.effect);
    if (analytics) analytics.trackEffectChange(data.effect);
  }

  handleDeviceConnected(sender, data) {
    const ui = this.components.get('ui');
    const storage = this.components.get('storage');
    const scheduler = this.components.get('scheduler');

    if (ui) ui.showConnectionStatus('connected', data.device);
    if (storage) storage.saveConnectedDevice(data.device);
    if (scheduler) scheduler.resumeSchedules();
  }

  handleDeviceDisconnected(sender, data) {
    const ui = this.components.get('ui');
    const scheduler = this.components.get('scheduler');

    if (ui) ui.showConnectionStatus('disconnected');
    if (scheduler) scheduler.pauseSchedules();
  }

  handleError(sender, data) {
    const ui = this.components.get('ui');
    const analytics = this.components.get('analytics');

    if (ui) ui.showError(data.error);
    if (analytics) analytics.trackError(data.error);
  }

  handleGenericEvent(sender, event, data) {
    logger.info('Generic event handled', {sender: sender.constructor.name, event, data});
  }
}

/**
 * Base Component with Mediator
 */
export class MediatorComponent {
  constructor() {
    this.mediator = null;
  }

  setMediator(mediator) {
    this.mediator = mediator;
  }

  notify(event, data) {
    if (this.mediator) {
      this.mediator.notify(this, event, data);
    }
  }
}

/**
 * UI Component
 */
export class UIComponent extends MediatorComponent {
  constructor() {
    super();
    this.state = {
      color: '#ffffff',
      brightness: 100,
      power: false,
      effect: null,
      connectionStatus: 'disconnected',
    };
  }

  updateColorDisplay(color) {
    this.state.color = color;
    logger.info('UI: Color display updated', {color});
  }

  updateBrightnessDisplay(brightness) {
    this.state.brightness = brightness;
    logger.info('UI: Brightness display updated', {brightness});
  }

  updatePowerStatus(power) {
    this.state.power = power;
    logger.info('UI: Power status updated', {power});
  }

  updateEffectDisplay(effect) {
    this.state.effect = effect;
    logger.info('UI: Effect display updated', {effect});
  }

  showConnectionStatus(status, device = null) {
    this.state.connectionStatus = status;
    logger.info('UI: Connection status updated', {status, device});
  }

  showError(error) {
    logger.info('UI: Error displayed', {error});
  }

  // User actions trigger notifications
  userChangedColor(color) {
    this.notify('colorChanged', {color});
  }

  userChangedBrightness(brightness) {
    this.notify('brightnessChanged', {brightness});
  }

  userToggledPower() {
    this.notify('powerToggled', {power: !this.state.power});
  }

  userChangedEffect(effect) {
    this.notify('effectChanged', {effect});
  }

  getState() {
    return {...this.state};
  }
}

/**
 * Analytics Component
 */
export class AnalyticsComponent extends MediatorComponent {
  constructor() {
    super();
    this.events = [];
  }

  trackColorChange(color) {
    this.logEvent('color_change', {color});
  }

  trackBrightnessChange(brightness) {
    this.logEvent('brightness_change', {brightness});
  }

  trackPowerToggle(power) {
    this.logEvent('power_toggle', {power});
  }

  trackEffectChange(effect) {
    this.logEvent('effect_change', {effect});
  }

  trackError(error) {
    this.logEvent('error', {error});
  }

  logEvent(eventType, data) {
    const event = {
      type: eventType,
      data,
      timestamp: Date.now(),
    };
    this.events.push(event);
    logger.info('Analytics: Event tracked', event);
  }

  getEvents() {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

/**
 * Storage Component
 */
export class StorageComponent extends MediatorComponent {
  constructor() {
    super();
    this.storage = {
      lastColor: null,
      connectedDevice: null,
      preferences: {},
    };
  }

  saveLastColor(color) {
    this.storage.lastColor = color;
    logger.info('Storage: Last color saved', {color});
  }

  saveConnectedDevice(device) {
    this.storage.connectedDevice = device;
    logger.info('Storage: Connected device saved', {device});
  }

  savePreference(key, value) {
    this.storage.preferences[key] = value;
    logger.info('Storage: Preference saved', {key, value});
  }

  getStorage() {
    return {...this.storage};
  }
}

/**
 * Scheduler Component
 */
export class SchedulerComponent extends MediatorComponent {
  constructor() {
    super();
    this.schedules = [];
    this.isPaused = false;
  }

  addSchedule(schedule) {
    this.schedules.push(schedule);
    logger.info('Scheduler: Schedule added', {schedule});
  }

  pauseSchedules() {
    this.isPaused = true;
    logger.info('Scheduler: Schedules paused');
  }

  resumeSchedules() {
    this.isPaused = false;
    logger.info('Scheduler: Schedules resumed');
  }

  getSchedules() {
    return [...this.schedules];
  }

  isPausedStatus() {
    return this.isPaused;
  }
}

/**
 * Mediator Manager - Singleton for managing mediator
 */
export class MediatorManager {
  static instance = null;

  constructor() {
    if (MediatorManager.instance) {
      return MediatorManager.instance;
    }

    this.mediator = new LEDControlMediator();
    this.initializeComponents();
    MediatorManager.instance = this;
  }

  static getInstance() {
    if (!MediatorManager.instance) {
      MediatorManager.instance = new MediatorManager();
    }
    return MediatorManager.instance;
  }

  initializeComponents() {
    this.ui = new UIComponent();
    this.analytics = new AnalyticsComponent();
    this.storage = new StorageComponent();
    this.scheduler = new SchedulerComponent();

    this.mediator.registerComponent('ui', this.ui);
    this.mediator.registerComponent('analytics', this.analytics);
    this.mediator.registerComponent('storage', this.storage);
    this.mediator.registerComponent('scheduler', this.scheduler);

    logger.info('Mediator manager initialized with all components');
  }

  getMediator() {
    return this.mediator;
  }

  getComponent(name) {
    return this.mediator.getComponent(name);
  }

  addEventListener(event, callback) {
    this.mediator.addEventListener(event, callback);
  }

  removeEventListener(event, callback) {
    this.mediator.removeEventListener(event, callback);
  }
}

export default LEDControlMediator;
