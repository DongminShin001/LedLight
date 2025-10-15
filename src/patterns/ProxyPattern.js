import logger from '../utils/Logger';

/**
 * Base Subject Interface
 */
export class LEDControlInterface {
  async setColor(color) {
    throw new Error('setColor() must be implemented');
  }

  async setBrightness(brightness) {
    throw new Error('setBrightness() must be implemented');
  }

  async togglePower() {
    throw new Error('togglePower() must be implemented');
  }

  async setEffect(effect) {
    throw new Error('setEffect() must be implemented');
  }
}

/**
 * Real Subject - Actual LED Controller
 */
export class RealLEDController extends LEDControlInterface {
  constructor(device) {
    super();
    this.device = device;
    this.isConnected = false;
  }

  async connect() {
    logger.info('Connecting to device', {deviceId: this.device.id});
    // Actual connection logic
    this.isConnected = true;
    return true;
  }

  async setColor(color) {
    logger.info('Setting color on real device', {color});
    // Actual color setting logic
    return {success: true, color};
  }

  async setBrightness(brightness) {
    logger.info('Setting brightness on real device', {brightness});
    // Actual brightness setting logic
    return {success: true, brightness};
  }

  async togglePower() {
    logger.info('Toggling power on real device');
    // Actual power toggle logic
    return {success: true};
  }

  async setEffect(effect) {
    logger.info('Setting effect on real device', {effect});
    // Actual effect setting logic
    return {success: true, effect};
  }
}

/**
 * Virtual Proxy - Lazy initialization
 */
export class LazyLEDProxy extends LEDControlInterface {
  constructor(deviceFactory) {
    super();
    this.deviceFactory = deviceFactory;
    this.realController = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (!this.isInitialized) {
      logger.info('Lazy loading real controller');
      this.realController = await this.deviceFactory();
      await this.realController.connect();
      this.isInitialized = true;
    }
  }

  async setColor(color) {
    await this.initialize();
    return await this.realController.setColor(color);
  }

  async setBrightness(brightness) {
    await this.initialize();
    return await this.realController.setBrightness(brightness);
  }

  async togglePower() {
    await this.initialize();
    return await this.realController.togglePower();
  }

  async setEffect(effect) {
    await this.initialize();
    return await this.realController.setEffect(effect);
  }
}

/**
 * Protection Proxy - Access control
 */
export class ProtectedLEDProxy extends LEDControlInterface {
  constructor(realController, accessControl) {
    super();
    this.realController = realController;
    this.accessControl = accessControl;
  }

  async checkAccess(operation) {
    return await this.accessControl.hasPermission(operation);
  }

  async setColor(color) {
    if (await this.checkAccess('setColor')) {
      logger.info('Access granted for setColor');
      return await this.realController.setColor(color);
    }
    logger.warn('Access denied for setColor');
    throw new Error('Access denied: insufficient permissions');
  }

  async setBrightness(brightness) {
    if (await this.checkAccess('setBrightness')) {
      logger.info('Access granted for setBrightness');
      return await this.realController.setBrightness(brightness);
    }
    logger.warn('Access denied for setBrightness');
    throw new Error('Access denied: insufficient permissions');
  }

  async togglePower() {
    if (await this.checkAccess('togglePower')) {
      logger.info('Access granted for togglePower');
      return await this.realController.togglePower();
    }
    logger.warn('Access denied for togglePower');
    throw new Error('Access denied: insufficient permissions');
  }

  async setEffect(effect) {
    if (await this.checkAccess('setEffect')) {
      logger.info('Access granted for setEffect');
      return await this.realController.setEffect(effect);
    }
    logger.warn('Access denied for setEffect');
    throw new Error('Access denied: insufficient permissions');
  }
}

/**
 * Caching Proxy - Cache results
 */
export class CachingLEDProxy extends LEDControlInterface {
  constructor(realController) {
    super();
    this.realController = realController;
    this.cache = new Map();
    this.cacheTimeout = 5000; // 5 seconds
  }

  getCacheKey(method, ...args) {
    return `${method}:${JSON.stringify(args)}`;
  }

  async getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      logger.info('Cache hit', {key});
      return cached.value;
    }
    return null;
  }

  setCache(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  async setColor(color) {
    const key = this.getCacheKey('setColor', color);
    const cached = await this.getFromCache(key);
    if (cached) return cached;

    const result = await this.realController.setColor(color);
    this.setCache(key, result);
    return result;
  }

  async setBrightness(brightness) {
    const key = this.getCacheKey('setBrightness', brightness);
    const cached = await this.getFromCache(key);
    if (cached) return cached;

    const result = await this.realController.setBrightness(brightness);
    this.setCache(key, result);
    return result;
  }

  async togglePower() {
    // Don't cache power toggle
    return await this.realController.togglePower();
  }

  async setEffect(effect) {
    const key = this.getCacheKey('setEffect', effect);
    const cached = await this.getFromCache(key);
    if (cached) return cached;

    const result = await this.realController.setEffect(effect);
    this.setCache(key, result);
    return result;
  }

  clearCache() {
    this.cache.clear();
    logger.info('Cache cleared');
  }
}

/**
 * Logging Proxy - Log all operations
 */
export class LoggingLEDProxy extends LEDControlInterface {
  constructor(realController) {
    super();
    this.realController = realController;
    this.operationLog = [];
  }

  logOperation(method, args, result, error = null) {
    const logEntry = {
      method,
      args,
      result,
      error,
      timestamp: Date.now(),
    };
    this.operationLog.push(logEntry);
    logger.info('Operation logged', logEntry);
  }

  async setColor(color) {
    try {
      const result = await this.realController.setColor(color);
      this.logOperation('setColor', {color}, result);
      return result;
    } catch (error) {
      this.logOperation('setColor', {color}, null, error.message);
      throw error;
    }
  }

  async setBrightness(brightness) {
    try {
      const result = await this.realController.setBrightness(brightness);
      this.logOperation('setBrightness', {brightness}, result);
      return result;
    } catch (error) {
      this.logOperation('setBrightness', {brightness}, null, error.message);
      throw error;
    }
  }

  async togglePower() {
    try {
      const result = await this.realController.togglePower();
      this.logOperation('togglePower', {}, result);
      return result;
    } catch (error) {
      this.logOperation('togglePower', {}, null, error.message);
      throw error;
    }
  }

  async setEffect(effect) {
    try {
      const result = await this.realController.setEffect(effect);
      this.logOperation('setEffect', {effect}, result);
      return result;
    } catch (error) {
      this.logOperation('setEffect', {effect}, null, error.message);
      throw error;
    }
  }

  getOperationLog() {
    return [...this.operationLog];
  }

  clearLog() {
    this.operationLog = [];
    logger.info('Operation log cleared');
  }
}

/**
 * Smart Proxy - Combines multiple proxy behaviors
 */
export class SmartLEDProxy extends LEDControlInterface {
  constructor(realController, options = {}) {
    super();
    
    let proxy = realController;
    
    // Apply caching if enabled
    if (options.enableCaching) {
      proxy = new CachingLEDProxy(proxy);
      logger.info('Caching enabled');
    }
    
    // Apply logging if enabled
    if (options.enableLogging) {
      proxy = new LoggingLEDProxy(proxy);
      logger.info('Logging enabled');
    }
    
    // Apply access control if enabled
    if (options.accessControl) {
      proxy = new ProtectedLEDProxy(proxy, options.accessControl);
      logger.info('Access control enabled');
    }
    
    this.proxy = proxy;
  }

  async setColor(color) {
    return await this.proxy.setColor(color);
  }

  async setBrightness(brightness) {
    return await this.proxy.setBrightness(brightness);
  }

  async togglePower() {
    return await this.proxy.togglePower();
  }

  async setEffect(effect) {
    return await this.proxy.setEffect(effect);
  }

  getProxy() {
    return this.proxy;
  }
}

/**
 * Access Control System
 */
export class AccessControl {
  constructor() {
    this.permissions = new Map();
    this.roles = new Map();
    this.currentRole = 'guest';
  }

  setRole(role) {
    this.currentRole = role;
    logger.info('Role set', {role});
  }

  defineRole(roleName, permissions) {
    this.roles.set(roleName, new Set(permissions));
    logger.info('Role defined', {roleName, permissions});
  }

  async hasPermission(operation) {
    const rolePermissions = this.roles.get(this.currentRole);
    if (!rolePermissions) {
      return false;
    }
    return rolePermissions.has(operation) || rolePermissions.has('*');
  }

  grantPermission(role, operation) {
    if (!this.roles.has(role)) {
      this.roles.set(role, new Set());
    }
    this.roles.get(role).add(operation);
    logger.info('Permission granted', {role, operation});
  }

  revokePermission(role, operation) {
    const rolePermissions = this.roles.get(role);
    if (rolePermissions) {
      rolePermissions.delete(operation);
      logger.info('Permission revoked', {role, operation});
    }
  }
}

/**
 * Proxy Factory - Create different types of proxies
 */
export class ProxyFactory {
  static createLazyProxy(deviceFactory) {
    return new LazyLEDProxy(deviceFactory);
  }

  static createProtectedProxy(realController, accessControl) {
    return new ProtectedLEDProxy(realController, accessControl);
  }

  static createCachingProxy(realController) {
    return new CachingLEDProxy(realController);
  }

  static createLoggingProxy(realController) {
    return new LoggingLEDProxy(realController);
  }

  static createSmartProxy(realController, options) {
    return new SmartLEDProxy(realController, options);
  }
}

export default ProxyFactory;
