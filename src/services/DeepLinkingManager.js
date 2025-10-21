import {Linking} from 'react-native';
import logger from '../utils/Logger';
import AnalyticsManager from './AnalyticsManager';

/**
 * Deep Linking Manager
 * Handles deep links and URL schemes for SmartLED Controller
 */
export class DeepLinkingManager {
  static instance = null;
  static isInitialized = false;

  constructor() {
    if (DeepLinkingManager.instance) {
      return DeepLinkingManager.instance;
    }

    this.isInitialized = false;
    this.urlHandlers = new Map();
    this.schemes = ['smartled', 'ledcontroller', 'led'];
    this.domains = ['smartledcontroller.com', 'ledcontroller.app'];
    this.pendingUrl = null;

    DeepLinkingManager.instance = this;
  }

  static getInstance() {
    if (!DeepLinkingManager.instance) {
      DeepLinkingManager.instance = new DeepLinkingManager();
    }
    return DeepLinkingManager.instance;
  }

  /**
   * Initialize deep linking
   */
  async initialize() {
    try {
      this.setupUrlHandlers();
      this.setupInitialUrl();
      this.isInitialized = true;
      
      logger.info('Deep linking manager initialized', {
        schemes: this.schemes,
        domains: this.domains,
        handlers: this.urlHandlers.size,
      });

      // Track initialization
      AnalyticsManager.trackEvent('deep_linking_initialized', {
        schemes: this.schemes,
        domains: this.domains,
      });
    } catch (error) {
      logger.error('Failed to initialize deep linking', error);
      throw error;
    }
  }

  /**
   * Setup URL handlers
   */
  setupUrlHandlers() {
    // LED Control Handlers
    this.registerHandler('led/control', this.handleLEDControl);
    this.registerHandler('led/color', this.handleLEDColor);
    this.registerHandler('led/brightness', this.handleLEDBrightness);
    this.registerHandler('led/power', this.handleLEDPower);
    this.registerHandler('led/effect', this.handleLEDEffect);

    // Device Handlers
    this.registerHandler('device/connect', this.handleDeviceConnect);
    this.registerHandler('device/disconnect', this.handleDeviceDisconnect);
    this.registerHandler('device/list', this.handleDeviceList);

    // Preset Handlers
    this.registerHandler('preset/load', this.handlePresetLoad);
    this.registerHandler('preset/save', this.handlePresetSave);
    this.registerHandler('preset/share', this.handlePresetShare);

    // Schedule Handlers
    this.registerHandler('schedule/create', this.handleScheduleCreate);
    this.registerHandler('schedule/edit', this.handleScheduleEdit);
    this.registerHandler('schedule/delete', this.handleScheduleDelete);

    // Theme Handlers
    this.registerHandler('theme/set', this.handleThemeSet);
    this.registerHandler('theme/custom', this.handleThemeCustom);

    // Settings Handlers
    this.registerHandler('settings/open', this.handleSettingsOpen);
    this.registerHandler('settings/bluetooth', this.handleBluetoothSettings);

    // Share Handlers
    this.registerHandler('share/preset', this.handleSharePreset);
    this.registerHandler('share/effect', this.handleShareEffect);
    this.registerHandler('share/device', this.handleShareDevice);

    // Setup universal link listener
    Linking.addEventListener('url', this.handleUrl);
  }

  /**
   * Setup initial URL
   */
  async setupInitialUrl() {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        this.pendingUrl = initialUrl;
        logger.info('Initial URL detected', {url: initialUrl});
        
        AnalyticsManager.trackEvent('deep_link_initial_url', {
          url: initialUrl,
        });
      }
    } catch (error) {
      logger.error('Failed to get initial URL', error);
    }
  }

  /**
   * Register URL handler
   */
  registerHandler(path, handler) {
    this.urlHandlers.set(path, handler);
    logger.debug('URL handler registered', {path});
  }

  /**
   * Handle incoming URL
   */
  handleUrl = (event) => {
    const url = event.url;
    logger.info('Deep link received', {url});
    
    AnalyticsManager.trackEvent('deep_link_received', {
      url,
      timestamp: Date.now(),
    });

    this.processUrl(url);
  };

  /**
   * Process URL
   */
  processUrl(url) {
    try {
      const parsedUrl = this.parseUrl(url);
      if (!parsedUrl) {
        logger.warn('Invalid URL format', {url});
        return false;
      }

      const handler = this.urlHandlers.get(parsedUrl.path);
      if (!handler) {
        logger.warn('No handler found for path', {path: parsedUrl.path});
        return false;
      }

      handler(parsedUrl);
      return true;
    } catch (error) {
      logger.error('Failed to process URL', {url, error: error.message});
      return false;
    }
  }

  /**
   * Parse URL
   */
  parseUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // Extract scheme and path
      const scheme = urlObj.protocol.replace(':', '');
      const path = urlObj.pathname.replace('/', '');
      const params = Object.fromEntries(urlObj.searchParams);
      
      return {
        scheme,
        path,
        params,
        hostname: urlObj.hostname,
        fullUrl: url,
      };
    } catch (error) {
      logger.error('Failed to parse URL', {url, error: error.message});
      return null;
    }
  }

  /**
   * Process pending URL
   */
  processPendingUrl() {
    if (this.pendingUrl) {
      const url = this.pendingUrl;
      this.pendingUrl = null;
      return this.processUrl(url);
    }
    return false;
  }

  // LED Control Handlers
  handleLEDControl = (parsedUrl) => {
    logger.info('LED control deep link', parsedUrl);
    
    AnalyticsManager.trackEvent('deep_link_led_control', parsedUrl.params);
    
    // Navigate to LED control screen with parameters
    // This would integrate with navigation
  };

  handleLEDColor = (parsedUrl) => {
    logger.info('LED color deep link', parsedUrl);
    
    const {color, brightness} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_led_color', {
      color,
      brightness,
    });
    
    // Set LED color
  };

  handleLEDBrightness = (parsedUrl) => {
    logger.info('LED brightness deep link', parsedUrl);
    
    const {brightness} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_led_brightness', {
      brightness,
    });
    
    // Set LED brightness
  };

  handleLEDPower = (parsedUrl) => {
    logger.info('LED power deep link', parsedUrl);
    
    const {power} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_led_power', {
      power,
    });
    
    // Toggle LED power
  };

  handleLEDEffect = (parsedUrl) => {
    logger.info('LED effect deep link', parsedUrl);
    
    const {effect, speed, intensity} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_led_effect', {
      effect,
      speed,
      intensity,
    });
    
    // Set LED effect
  };

  // Device Handlers
  handleDeviceConnect = (parsedUrl) => {
    logger.info('Device connect deep link', parsedUrl);
    
    const {deviceId, deviceName} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_device_connect', {
      deviceId,
      deviceName,
    });
    
    // Connect to device
  };

  handleDeviceDisconnect = (parsedUrl) => {
    logger.info('Device disconnect deep link', parsedUrl);
    
    AnalyticsManager.trackEvent('deep_link_device_disconnect');
    
    // Disconnect device
  };

  handleDeviceList = (parsedUrl) => {
    logger.info('Device list deep link', parsedUrl);
    
    AnalyticsManager.trackEvent('deep_link_device_list');
    
    // Navigate to device list
  };

  // Preset Handlers
  handlePresetLoad = (parsedUrl) => {
    logger.info('Preset load deep link', parsedUrl);
    
    const {presetId, presetName} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_preset_load', {
      presetId,
      presetName,
    });
    
    // Load preset
  };

  handlePresetSave = (parsedUrl) => {
    logger.info('Preset save deep link', parsedUrl);
    
    const {presetName, presetData} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_preset_save', {
      presetName,
    });
    
    // Save preset
  };

  handlePresetShare = (parsedUrl) => {
    logger.info('Preset share deep link', parsedUrl);
    
    const {presetId, shareToken} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_preset_share', {
      presetId,
      shareToken,
    });
    
    // Share preset
  };

  // Schedule Handlers
  handleScheduleCreate = (parsedUrl) => {
    logger.info('Schedule create deep link', parsedUrl);
    
    const {time, action, repeat} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_schedule_create', {
      time,
      action,
      repeat,
    });
    
    // Create schedule
  };

  handleScheduleEdit = (parsedUrl) => {
    logger.info('Schedule edit deep link', parsedUrl);
    
    const {scheduleId} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_schedule_edit', {
      scheduleId,
    });
    
    // Edit schedule
  };

  handleScheduleDelete = (parsedUrl) => {
    logger.info('Schedule delete deep link', parsedUrl);
    
    const {scheduleId} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_schedule_delete', {
      scheduleId,
    });
    
    // Delete schedule
  };

  // Theme Handlers
  handleThemeSet = (parsedUrl) => {
    logger.info('Theme set deep link', parsedUrl);
    
    const {themeName} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_theme_set', {
      themeName,
    });
    
    // Set theme
  };

  handleThemeCustom = (parsedUrl) => {
    logger.info('Theme custom deep link', parsedUrl);
    
    const {colors, name} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_theme_custom', {
      name,
    });
    
    // Create custom theme
  };

  // Settings Handlers
  handleSettingsOpen = (parsedUrl) => {
    logger.info('Settings open deep link', parsedUrl);
    
    const {section} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_settings_open', {
      section,
    });
    
    // Open settings
  };

  handleBluetoothSettings = (parsedUrl) => {
    logger.info('Bluetooth settings deep link', parsedUrl);
    
    AnalyticsManager.trackEvent('deep_link_bluetooth_settings');
    
    // Open Bluetooth settings
  };

  // Share Handlers
  handleSharePreset = (parsedUrl) => {
    logger.info('Share preset deep link', parsedUrl);
    
    const {presetId, shareToken} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_share_preset', {
      presetId,
      shareToken,
    });
    
    // Share preset
  };

  handleShareEffect = (parsedUrl) => {
    logger.info('Share effect deep link', parsedUrl);
    
    const {effectId, shareToken} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_share_effect', {
      effectId,
      shareToken,
    });
    
    // Share effect
  };

  handleShareDevice = (parsedUrl) => {
    logger.info('Share device deep link', parsedUrl);
    
    const {deviceId, shareToken} = parsedUrl.params;
    
    AnalyticsManager.trackEvent('deep_link_share_device', {
      deviceId,
      shareToken,
    });
    
    // Share device
  };

  /**
   * Generate deep link URL
   */
  generateUrl(scheme, path, params = {}) {
    try {
      const url = new URL(`${scheme}://${path}`);
      
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      
      return url.toString();
    } catch (error) {
      logger.error('Failed to generate URL', {scheme, path, params, error: error.message});
      return null;
    }
  }

  /**
   * Share deep link
   */
  async shareDeepLink(scheme, path, params = {}) {
    try {
      const url = this.generateUrl(scheme, path, params);
      if (!url) {
        return false;
      }

      // In a real app, you would use Share API
      logger.info('Deep link generated for sharing', {url});
      
      AnalyticsManager.trackEvent('deep_link_shared', {
        url,
        scheme,
        path,
      });
      
      return url;
    } catch (error) {
      logger.error('Failed to share deep link', error);
      return false;
    }
  }

  /**
   * Get supported schemes
   */
  getSupportedSchemes() {
    return [...this.schemes];
  }

  /**
   * Get supported domains
   */
  getSupportedDomains() {
    return [...this.domains];
  }

  /**
   * Get URL handlers
   */
  getUrlHandlers() {
    return Array.from(this.urlHandlers.keys());
  }

  /**
   * Cleanup
   */
  cleanup() {
    Linking.removeEventListener('url', this.handleUrl);
  }
}

export default DeepLinkingManager.getInstance();
