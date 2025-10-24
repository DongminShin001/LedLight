import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/Logger';

/**
 * Base Repository Interface - Implements Repository Pattern
 */
export class Repository {
  constructor(storageKey) {
    this.storageKey = storageKey;
    this.cache = new Map();
    this.cacheEnabled = true;
  }

  /**
   * Save data
   * @param {string} key - Data key
   * @param {any} data - Data to save
   * @returns {Promise<boolean>} Success status
   */
  async save(key, data) {
    throw new Error('save() must be implemented by subclass');
  }

  /**
   * Find data by key
   * @param {string} key - Data key
   * @returns {Promise<any>} Retrieved data
   */
  async findByKey(key) {
    throw new Error('findByKey() must be implemented by subclass');
  }

  /**
   * Find all data
   * @returns {Promise<Array>} All data
   */
  async findAll() {
    throw new Error('findAll() must be implemented by subclass');
  }

  /**
   * Delete data by key
   * @param {string} key - Data key
   * @returns {Promise<boolean>} Success status
   */
  async delete(key) {
    throw new Error('delete() must be implemented by subclass');
  }

  /**
   * Clear all data
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    throw new Error('clear() must be implemented by subclass');
  }

  /**
   * Enable cache
   */
  enableCache() {
    this.cacheEnabled = true;
  }

  /**
   * Disable cache
   */
  disableCache() {
    this.cacheEnabled = false;
    this.clearCache();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

/**
 * Preset Repository - Manages LED presets
 */
export class PresetRepository extends Repository {
  constructor() {
    super('led_presets');
  }

  async save(key, preset) {
    try {
      const presets = await this.findAll();
      presets[key] = {
        ...preset,
        updatedAt: Date.now(),
      };
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(presets));
      
      if (this.cacheEnabled) {
        this.cache.set(key, preset);
      }
      
      logger.info('Preset saved', {key});
      return true;
    } catch (error) {
      logger.error('Failed to save preset', error);
      return false;
    }
  }

  async findByKey(key) {
    try {
      // Check cache first
      if (this.cacheEnabled && this.cache.has(key)) {
        return this.cache.get(key);
      }

      const presets = await this.findAll();
      const preset = presets[key];
      
      if (preset && this.cacheEnabled) {
        this.cache.set(key, preset);
      }
      
      return preset || null;
    } catch (error) {
      logger.error('Failed to find preset', error);
      return null;
    }
  }

  async findAll() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      logger.error('Failed to find all presets', error);
      return {};
    }
  }

  async delete(key) {
    try {
      const presets = await this.findAll();
      delete presets[key];
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(presets));
      
      if (this.cacheEnabled) {
        this.cache.delete(key);
      }
      
      logger.info('Preset deleted', {key});
      return true;
    } catch (error) {
      logger.error('Failed to delete preset', error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      this.clearCache();
      logger.info('All presets cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear presets', error);
      return false;
    }
  }

  async findByCategory(category) {
    try {
      const presets = await this.findAll();
      return Object.entries(presets)
        .filter(([_, preset]) => preset.category === category)
        .reduce((acc, [key, preset]) => {
          acc[key] = preset;
          return acc;
        }, {});
    } catch (error) {
      logger.error('Failed to find presets by category', error);
      return {};
    }
  }
}

/**
 * Schedule Repository - Manages LED schedules
 */
export class ScheduleRepository extends Repository {
  constructor() {
    super('led_schedules');
  }

  async save(key, schedule) {
    try {
      const schedules = await this.findAll();
      schedules[key] = {
        ...schedule,
        id: key,
        updatedAt: Date.now(),
      };
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(schedules));
      
      if (this.cacheEnabled) {
        this.cache.set(key, schedule);
      }
      
      logger.info('Schedule saved', {key});
      return true;
    } catch (error) {
      logger.error('Failed to save schedule', error);
      return false;
    }
  }

  async findByKey(key) {
    try {
      if (this.cacheEnabled && this.cache.has(key)) {
        return this.cache.get(key);
      }

      const schedules = await this.findAll();
      const schedule = schedules[key];
      
      if (schedule && this.cacheEnabled) {
        this.cache.set(key, schedule);
      }
      
      return schedule || null;
    } catch (error) {
      logger.error('Failed to find schedule', error);
      return null;
    }
  }

  async findAll() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      logger.error('Failed to find all schedules', error);
      return {};
    }
  }

  async delete(key) {
    try {
      const schedules = await this.findAll();
      delete schedules[key];
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(schedules));
      
      if (this.cacheEnabled) {
        this.cache.delete(key);
      }
      
      logger.info('Schedule deleted', {key});
      return true;
    } catch (error) {
      logger.error('Failed to delete schedule', error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      this.clearCache();
      logger.info('All schedules cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear schedules', error);
      return false;
    }
  }

  async findActive() {
    try {
      const schedules = await this.findAll();
      return Object.entries(schedules)
        .filter(([_, schedule]) => schedule.enabled)
        .reduce((acc, [key, schedule]) => {
          acc[key] = schedule;
          return acc;
        }, {});
    } catch (error) {
      logger.error('Failed to find active schedules', error);
      return {};
    }
  }
}

/**
 * Device Repository - Manages connected devices
 */
export class DeviceRepository extends Repository {
  constructor() {
    super('led_devices');
  }

  async save(key, device) {
    try {
      const devices = await this.findAll();
      devices[key] = {
        ...device,
        id: key,
        lastConnected: Date.now(),
      };
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(devices));
      
      if (this.cacheEnabled) {
        this.cache.set(key, device);
      }
      
      logger.info('Device saved', {key});
      return true;
    } catch (error) {
      logger.error('Failed to save device', error);
      return false;
    }
  }

  async findByKey(key) {
    try {
      if (this.cacheEnabled && this.cache.has(key)) {
        return this.cache.get(key);
      }

      const devices = await this.findAll();
      const device = devices[key];
      
      if (device && this.cacheEnabled) {
        this.cache.set(key, device);
      }
      
      return device || null;
    } catch (error) {
      logger.error('Failed to find device', error);
      return null;
    }
  }

  async findAll() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      logger.error('Failed to find all devices', error);
      return {};
    }
  }

  async delete(key) {
    try {
      const devices = await this.findAll();
      delete devices[key];
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(devices));
      
      if (this.cacheEnabled) {
        this.cache.delete(key);
      }
      
      logger.info('Device deleted', {key});
      return true;
    } catch (error) {
      logger.error('Failed to delete device', error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      this.clearCache();
      logger.info('All devices cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear devices', error);
      return false;
    }
  }

  async findRecent(limit = 5) {
    try {
      const devices = await this.findAll();
      return Object.entries(devices)
        .sort(([_, a], [__, b]) => b.lastConnected - a.lastConnected)
        .slice(0, limit)
        .reduce((acc, [key, device]) => {
          acc[key] = device;
          return acc;
        }, {});
    } catch (error) {
      logger.error('Failed to find recent devices', error);
      return {};
    }
  }
}

/**
 * Analytics Repository - Manages analytics data
 */
export class AnalyticsRepository extends Repository {
  constructor() {
    super('led_analytics');
  }

  async save(key, data) {
    try {
      const analytics = await this.findAll();
      
      if (!analytics[key]) {
        analytics[key] = [];
      }
      
      analytics[key].push({
        ...data,
        timestamp: Date.now(),
      });
      
      // Keep only last 1000 entries per key
      if (analytics[key].length > 1000) {
        analytics[key] = analytics[key].slice(-1000);
      }
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(analytics));
      logger.info('Analytics saved', {key});
      return true;
    } catch (error) {
      logger.error('Failed to save analytics', error);
      return false;
    }
  }

  async findByKey(key) {
    try {
      const analytics = await this.findAll();
      return analytics[key] || [];
    } catch (error) {
      logger.error('Failed to find analytics', error);
      return [];
    }
  }

  async findAll() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      logger.error('Failed to find all analytics', error);
      return {};
    }
  }

  async delete(key) {
    try {
      const analytics = await this.findAll();
      delete analytics[key];
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(analytics));
      logger.info('Analytics deleted', {key});
      return true;
    } catch (error) {
      logger.error('Failed to delete analytics', error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      this.clearCache();
      logger.info('All analytics cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear analytics', error);
      return false;
    }
  }

  async findByDateRange(key, startDate, endDate) {
    try {
      const data = await this.findByKey(key);
      return data.filter(item => 
        item.timestamp >= startDate && item.timestamp <= endDate
      );
    } catch (error) {
      logger.error('Failed to find analytics by date range', error);
      return [];
    }
  }
}

/**
 * Repository Factory - Creates repository instances
 */
export class RepositoryFactory {
  static instances = new Map();

  static getPresetRepository() {
    if (!this.instances.has('preset')) {
      this.instances.set('preset', new PresetRepository());
    }
    return this.instances.get('preset');
  }

  static getScheduleRepository() {
    if (!this.instances.has('schedule')) {
      this.instances.set('schedule', new ScheduleRepository());
    }
    return this.instances.get('schedule');
  }

  static getDeviceRepository() {
    if (!this.instances.has('device')) {
      this.instances.set('device', new DeviceRepository());
    }
    return this.instances.get('device');
  }

  static getAnalyticsRepository() {
    if (!this.instances.has('analytics')) {
      this.instances.set('analytics', new AnalyticsRepository());
    }
    return this.instances.get('analytics');
  }

  static clearAllInstances() {
    this.instances.clear();
  }
}
