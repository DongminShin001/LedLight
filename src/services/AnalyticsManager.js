import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/Logger';

/**
 * Advanced Analytics Manager
 * Comprehensive analytics tracking for SmartLED Controller
 */
export class AnalyticsManager {
  static instance = null;
  static events = [];
  static sessionId = null;
  static userId = null;
  static isInitialized = false;

  constructor() {
    if (AnalyticsManager.instance) {
      return AnalyticsManager.instance;
    }

    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.isInitialized = false;
    this.eventQueue = [];
    this.flushInterval = null;
    this.maxEventsInMemory = 100;
    this.flushIntervalMs = 30000; // 30 seconds

    AnalyticsManager.instance = this;
  }

  static getInstance() {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * Initialize analytics
   */
  async initialize() {
    try {
      await this.loadUserId();
      await this.loadPendingEvents();
      this.startFlushInterval();
      this.isInitialized = true;
      
      logger.info('Analytics manager initialized', {
        sessionId: this.sessionId,
        userId: this.userId,
        pendingEvents: this.eventQueue.length,
      });

      // Track app launch
      this.trackEvent('app_launch', {
        timestamp: Date.now(),
        version: '1.0.0',
        platform: 'react-native',
      });
    } catch (error) {
      logger.error('Failed to initialize analytics', error);
      throw error;
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load user ID from storage
   */
  async loadUserId() {
    try {
      const storedUserId = await AsyncStorage.getItem('analytics_user_id');
      if (storedUserId) {
        this.userId = storedUserId;
      } else {
        this.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('analytics_user_id', this.userId);
      }
    } catch (error) {
      logger.error('Failed to load user ID', error);
      this.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  /**
   * Load pending events from storage
   */
  async loadPendingEvents() {
    try {
      const storedEvents = await AsyncStorage.getItem('analytics_pending_events');
      if (storedEvents) {
        this.eventQueue = JSON.parse(storedEvents);
        logger.info('Loaded pending events', {count: this.eventQueue.length});
      }
    } catch (error) {
      logger.error('Failed to load pending events', error);
      this.eventQueue = [];
    }
  }

  /**
   * Save pending events to storage
   */
  async savePendingEvents() {
    try {
      await AsyncStorage.setItem('analytics_pending_events', JSON.stringify(this.eventQueue));
    } catch (error) {
      logger.error('Failed to save pending events', error);
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName, properties = {}) {
    try {
      const event = {
        eventName,
        properties: {
          ...properties,
          sessionId: this.sessionId,
          userId: this.userId,
          timestamp: Date.now(),
          platform: 'react-native',
          appVersion: '1.0.0',
        },
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      this.eventQueue.push(event);
      AnalyticsManager.events.push(event);

      // Prevent memory overflow
      if (this.eventQueue.length > this.maxEventsInMemory) {
        this.eventQueue = this.eventQueue.slice(-this.maxEventsInMemory);
      }

      logger.info('Event tracked', {eventName, properties: event.properties});

      // Save to storage
      this.savePendingEvents();

      return event.id;
    } catch (error) {
      logger.error('Failed to track event', error);
      return null;
    }
  }

  /**
   * Track user action
   */
  trackUserAction(action, target, properties = {}) {
    return this.trackEvent('user_action', {
      action,
      target,
      ...properties,
    });
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName, properties = {}) {
    return this.trackEvent('screen_view', {
      screenName,
      ...properties,
    });
  }

  /**
   * Track LED control actions
   */
  trackLEDAction(action, properties = {}) {
    return this.trackEvent('led_action', {
      action,
      ...properties,
    });
  }

  /**
   * Track device connection events
   */
  trackDeviceEvent(eventType, properties = {}) {
    return this.trackEvent('device_event', {
      eventType,
      ...properties,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metricName, value, properties = {}) {
    return this.trackEvent('performance', {
      metricName,
      value,
      ...properties,
    });
  }

  /**
   * Track error events
   */
  trackError(error, context = {}) {
    return this.trackEvent('error', {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      context,
    });
  }

  /**
   * Track business metrics
   */
  trackBusinessMetric(metricName, value, properties = {}) {
    return this.trackEvent('business_metric', {
      metricName,
      value,
      ...properties,
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties) {
    this.trackEvent('user_properties_set', properties);
  }

  /**
   * Set user ID
   */
  setUserId(userId) {
    this.userId = userId;
    AsyncStorage.setItem('analytics_user_id', userId);
    this.trackEvent('user_id_set', {userId});
  }

  /**
   * Start flush interval
   */
  startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, this.flushIntervalMs);
  }

  /**
   * Stop flush interval
   */
  stopFlushInterval() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Flush events to analytics service
   */
  async flushEvents() {
    if (this.eventQueue.length === 0) {
      return;
    }

    try {
      const eventsToFlush = [...this.eventQueue];
      this.eventQueue = [];

      // In a real app, you would send these to your analytics service
      // For now, we'll just log them
      logger.info('Flushing analytics events', {
        count: eventsToFlush.length,
        events: eventsToFlush,
      });

      // Simulate API call
      await this.sendEventsToService(eventsToFlush);

      // Clear from storage
      await AsyncStorage.removeItem('analytics_pending_events');

    } catch (error) {
      logger.error('Failed to flush events', error);
      // Restore events to queue
      this.eventQueue = [...this.eventQueue, ...eventsToFlush];
    }
  }

  /**
   * Send events to analytics service
   */
  async sendEventsToService(events) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In a real app, you would send to Firebase Analytics, Mixpanel, etc.
    logger.info('Events sent to analytics service', {count: events.length});
  }

  /**
   * Get analytics data
   */
  getAnalyticsData() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      totalEvents: AnalyticsManager.events.length,
      pendingEvents: this.eventQueue.length,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Get event history
   */
  getEventHistory(limit = 50) {
    return AnalyticsManager.events.slice(-limit);
  }

  /**
   * Clear analytics data
   */
  async clearAnalyticsData() {
    try {
      this.eventQueue = [];
      AnalyticsManager.events = [];
      await AsyncStorage.removeItem('analytics_pending_events');
      await AsyncStorage.removeItem('analytics_user_id');
      
      logger.info('Analytics data cleared');
    } catch (error) {
      logger.error('Failed to clear analytics data', error);
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.stopFlushInterval();
    this.flushEvents();
  }
}

export default AnalyticsManager.getInstance();
