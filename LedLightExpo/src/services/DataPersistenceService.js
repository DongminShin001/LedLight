import AsyncStorage from '@react-native-async-storage/async-storage';

class DataPersistenceService {
  constructor() {
    this.storageKeys = {
      USER_PREFERENCES: 'user_preferences',
      LED_PRESETS: 'led_presets',
      DEVICE_SETTINGS: 'device_settings',
      SCHEDULES: 'schedules',
      ANALYTICS: 'analytics',
      THEME_SETTINGS: 'theme_settings',
    };
  }

  // Generic storage methods
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  }

  async getItem(key, defaultValue = null) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return defaultValue;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  }

  async clearAll() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // User Preferences
  async saveUserPreferences(preferences) {
    const defaultPreferences = {
      autoConnect: true,
      nightMode: false,
      hapticFeedback: true,
      soundEffects: true,
      language: 'en',
      units: 'metric',
      notifications: true,
      analytics: true,
      ...preferences,
    };

    return await this.setItem(this.storageKeys.USER_PREFERENCES, defaultPreferences);
  }

  async getUserPreferences() {
    return await this.getItem(this.storageKeys.USER_PREFERENCES, {
      autoConnect: true,
      nightMode: false,
      hapticFeedback: true,
      soundEffects: true,
      language: 'en',
      units: 'metric',
      notifications: true,
      analytics: true,
    });
  }

  // LED Presets
  async savePreset(preset) {
    const presets = await this.getPresets();
    const newPreset = {
      id: preset.id || Date.now().toString(),
      name: preset.name || 'Untitled Preset',
      color: preset.color || '#6366f1',
      brightness: preset.brightness || 75,
      effect: preset.effect || 'solid',
      speed: preset.speed || 50,
      createdAt: preset.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...preset,
    };

    const existingIndex = presets.findIndex(p => p.id === newPreset.id);
    if (existingIndex >= 0) {
      presets[existingIndex] = newPreset;
    } else {
      presets.push(newPreset);
    }

    return await this.setItem(this.storageKeys.LED_PRESETS, presets);
  }

  async getPresets() {
    return await this.getItem(this.storageKeys.LED_PRESETS, []);
  }

  async getPreset(presetId) {
    const presets = await this.getPresets();
    return presets.find(p => p.id === presetId);
  }

  async deletePreset(presetId) {
    const presets = await this.getPresets();
    const filteredPresets = presets.filter(p => p.id !== presetId);
    return await this.setItem(this.storageKeys.LED_PRESETS, filteredPresets);
  }

  // Device Settings
  async saveDeviceSettings(deviceId, settings) {
    const allSettings = await this.getDeviceSettings();
    allSettings[deviceId] = {
      lastConnected: new Date().toISOString(),
      ...settings,
    };
    return await this.setItem(this.storageKeys.DEVICE_SETTINGS, allSettings);
  }

  async getDeviceSettings() {
    return await this.getItem(this.storageKeys.DEVICE_SETTINGS, {});
  }

  async getDeviceSetting(deviceId) {
    const allSettings = await this.getDeviceSettings();
    return allSettings[deviceId] || {};
  }

  // Schedules
  async saveSchedule(schedule) {
    const schedules = await this.getSchedules();
    const newSchedule = {
      id: schedule.id || Date.now().toString(),
      name: schedule.name || 'Untitled Schedule',
      enabled: schedule.enabled || false,
      startTime: schedule.startTime || '18:00',
      endTime: schedule.endTime || '22:00',
      days: schedule.days || [1, 2, 3, 4, 5], // Monday to Friday
      color: schedule.color || '#6366f1',
      brightness: schedule.brightness || 75,
      effect: schedule.effect || 'solid',
      createdAt: schedule.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...schedule,
    };

    const existingIndex = schedules.findIndex(s => s.id === newSchedule.id);
    if (existingIndex >= 0) {
      schedules[existingIndex] = newSchedule;
    } else {
      schedules.push(newSchedule);
    }

    return await this.setItem(this.storageKeys.SCHEDULES, schedules);
  }

  async getSchedules() {
    return await this.getItem(this.storageKeys.SCHEDULES, []);
  }

  async getSchedule(scheduleId) {
    const schedules = await this.getSchedules();
    return schedules.find(s => s.id === scheduleId);
  }

  async deleteSchedule(scheduleId) {
    const schedules = await this.getSchedules();
    const filteredSchedules = schedules.filter(s => s.id !== scheduleId);
    return await this.setItem(this.storageKeys.SCHEDULES, filteredSchedules);
  }

  async getActiveSchedules() {
    const schedules = await this.getSchedules();
    return schedules.filter(s => s.enabled);
  }

  // Analytics
  async saveAnalyticsData(data) {
    const analytics = await this.getAnalyticsData();
    const newData = {
      timestamp: new Date().toISOString(),
      ...data,
    };

    analytics.push(newData);

    // Keep only last 1000 entries
    if (analytics.length > 1000) {
      analytics.splice(0, analytics.length - 1000);
    }

    return await this.setItem(this.storageKeys.ANALYTICS, analytics);
  }

  async getAnalyticsData() {
    return await this.getItem(this.storageKeys.ANALYTICS, []);
  }

  async getAnalyticsSummary() {
    const analytics = await this.getAnalyticsData();
    const now = new Date();
    const last24Hours = analytics.filter(a => 
      new Date(a.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
    );
    const last7Days = analytics.filter(a => 
      new Date(a.timestamp) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    );

    return {
      totalSessions: analytics.length,
      sessionsLast24Hours: last24Hours.length,
      sessionsLast7Days: last7Days.length,
      averageSessionDuration: this.calculateAverageSessionDuration(analytics),
      mostUsedColors: this.getMostUsedColors(analytics),
      mostUsedEffects: this.getMostUsedEffects(analytics),
    };
  }

  calculateAverageSessionDuration(analytics) {
    const sessions = analytics.filter(a => a.sessionDuration);
    if (sessions.length === 0) return 0;
    
    const totalDuration = sessions.reduce((sum, session) => sum + session.sessionDuration, 0);
    return Math.round(totalDuration / sessions.length);
  }

  getMostUsedColors(analytics) {
    const colorCounts = {};
    analytics.forEach(a => {
      if (a.color) {
        colorCounts[a.color] = (colorCounts[a.color] || 0) + 1;
      }
    });

    return Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([color, count]) => ({ color, count }));
  }

  getMostUsedEffects(analytics) {
    const effectCounts = {};
    analytics.forEach(a => {
      if (a.effect) {
        effectCounts[a.effect] = (effectCounts[a.effect] || 0) + 1;
      }
    });

    return Object.entries(effectCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([effect, count]) => ({ effect, count }));
  }

  // Theme Settings
  async saveThemeSettings(themeSettings) {
    const defaultThemeSettings = {
      currentTheme: 'dark',
      autoTheme: false,
      customThemes: [],
      ...themeSettings,
    };

    return await this.setItem(this.storageKeys.THEME_SETTINGS, defaultThemeSettings);
  }

  async getThemeSettings() {
    return await this.getItem(this.storageKeys.THEME_SETTINGS, {
      currentTheme: 'dark',
      autoTheme: false,
      customThemes: [],
    });
  }

  // Export/Import functionality
  async exportData() {
    try {
      const data = {
        userPreferences: await this.getUserPreferences(),
        presets: await this.getPresets(),
        deviceSettings: await this.getDeviceSettings(),
        schedules: await this.getSchedules(),
        themeSettings: await this.getThemeSettings(),
        exportDate: new Date().toISOString(),
        version: '2.0.0',
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.userPreferences) {
        await this.saveUserPreferences(data.userPreferences);
      }
      
      if (data.presets) {
        await this.setItem(this.storageKeys.LED_PRESETS, data.presets);
      }
      
      if (data.deviceSettings) {
        await this.setItem(this.storageKeys.DEVICE_SETTINGS, data.deviceSettings);
      }
      
      if (data.schedules) {
        await this.setItem(this.storageKeys.SCHEDULES, data.schedules);
      }
      
      if (data.themeSettings) {
        await this.saveThemeSettings(data.themeSettings);
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Storage management
  async getStorageInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const storageInfo = {
        totalKeys: keys.length,
        totalSize: 0,
        keys: [],
      };

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        const size = value ? value.length : 0;
        storageInfo.totalSize += size;
        storageInfo.keys.push({
          key,
          size,
        });
      }

      return storageInfo;
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  async cleanupOldData() {
    try {
      const analytics = await this.getAnalyticsData();
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      const filteredAnalytics = analytics.filter(a => 
        new Date(a.timestamp) > cutoffDate
      );

      await this.setItem(this.storageKeys.ANALYTICS, filteredAnalytics);
      return true;
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      return false;
    }
  }
}

// Singleton instance
const dataPersistenceService = new DataPersistenceService();

export default dataPersistenceService;
