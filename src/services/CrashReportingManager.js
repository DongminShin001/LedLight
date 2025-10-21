import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/Logger';

/**
 * Advanced Crash Reporting Manager
 * Comprehensive crash detection and reporting for SmartLED Controller
 */
export class CrashReportingManager {
  static instance = null;
  static crashes = [];
  static isInitialized = false;

  constructor() {
    if (CrashReportingManager.instance) {
      return CrashReportingManager.instance;
    }

    this.isInitialized = false;
    this.crashQueue = [];
    this.maxCrashesInMemory = 50;
    this.sessionId = null;
    this.userId = null;
    this.appVersion = '1.0.0';
    this.platform = 'react-native';

    CrashReportingManager.instance = this;
  }

  static getInstance() {
    if (!CrashReportingManager.instance) {
      CrashReportingManager.instance = new CrashReportingManager();
    }
    return CrashReportingManager.instance;
  }

  /**
   * Initialize crash reporting
   */
  async initialize() {
    try {
      await this.loadCrashData();
      this.setupGlobalErrorHandlers();
      this.setupUnhandledRejectionHandler();
      this.isInitialized = true;
      
      logger.info('Crash reporting manager initialized', {
        sessionId: this.sessionId,
        userId: this.userId,
        pendingCrashes: this.crashQueue.length,
      });

      // Check for previous crashes
      await this.checkForPreviousCrashes();
    } catch (error) {
      logger.error('Failed to initialize crash reporting', error);
      throw error;
    }
  }

  /**
   * Load crash data from storage
   */
  async loadCrashData() {
    try {
      const storedCrashes = await AsyncStorage.getItem('crash_reports');
      if (storedCrashes) {
        this.crashQueue = JSON.parse(storedCrashes);
        logger.info('Loaded crash reports', {count: this.crashQueue.length});
      }

      const sessionData = await AsyncStorage.getItem('crash_session_data');
      if (sessionData) {
        const data = JSON.parse(sessionData);
        this.sessionId = data.sessionId;
        this.userId = data.userId;
      }
    } catch (error) {
      logger.error('Failed to load crash data', error);
    }
  }

  /**
   * Save crash data to storage
   */
  async saveCrashData() {
    try {
      await AsyncStorage.setItem('crash_reports', JSON.stringify(this.crashQueue));
      await AsyncStorage.setItem('crash_session_data', JSON.stringify({
        sessionId: this.sessionId,
        userId: this.userId,
      }));
    } catch (error) {
      logger.error('Failed to save crash data', error);
    }
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // Handle JavaScript errors
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.reportCrash(error, {
        isFatal,
        type: 'javascript_error',
        handler: 'global',
      });
      
      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // Handle React Native errors
    if (global.HermesInternal) {
      global.HermesInternal.setPromiseRejectionTracker((id, rejection) => {
        this.reportCrash(new Error(`Promise rejection: ${rejection}`), {
          type: 'promise_rejection',
          rejectionId: id,
          rejection,
        });
      });
    }
  }

  /**
   * Setup unhandled promise rejection handler
   */
  setupUnhandledRejectionHandler() {
    // Handle unhandled promise rejections
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this is an unhandled promise rejection
      const message = args.join(' ');
      if (message.includes('Unhandled promise rejection') || 
          message.includes('Possible Unhandled Promise Rejection')) {
        this.reportCrash(new Error(message), {
          type: 'unhandled_promise_rejection',
          args,
        });
      }
      
      // Call original console.error
      originalConsoleError.apply(console, args);
    };
  }

  /**
   * Report a crash
   */
  reportCrash(error, context = {}) {
    try {
      const crashReport = {
        id: `crash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        context: {
          ...context,
          sessionId: this.sessionId,
          userId: this.userId,
          appVersion: this.appVersion,
          platform: this.platform,
          deviceInfo: this.getDeviceInfo(),
          memoryInfo: this.getMemoryInfo(),
        },
        severity: this.determineSeverity(error, context),
        status: 'pending',
      };

      this.crashQueue.push(crashReport);
      CrashReportingManager.crashes.push(crashReport);

      // Prevent memory overflow
      if (this.crashQueue.length > this.maxCrashesInMemory) {
        this.crashQueue = this.crashQueue.slice(-this.maxCrashesInMemory);
      }

      logger.error('Crash reported', {
        crashId: crashReport.id,
        error: crashReport.error,
        context: crashReport.context,
        severity: crashReport.severity,
      });

      // Save to storage
      this.saveCrashData();

      // Send to crash reporting service
      this.sendCrashReport(crashReport);

      return crashReport.id;
    } catch (reportError) {
      logger.error('Failed to report crash', reportError);
      return null;
    }
  }

  /**
   * Determine crash severity
   */
  determineSeverity(error, context) {
    if (context.isFatal) {
      return 'critical';
    }
    
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'high';
    }
    
    if (context.type === 'promise_rejection') {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Get device information
   */
  getDeviceInfo() {
    return {
      platform: 'react-native',
      version: '1.0.0',
      // In a real app, you would get actual device info
      deviceModel: 'Unknown',
      osVersion: 'Unknown',
      screenSize: 'Unknown',
    };
  }

  /**
   * Get memory information
   */
  getMemoryInfo() {
    return {
      // In a real app, you would get actual memory info
      usedJSHeapSize: 'Unknown',
      totalJSHeapSize: 'Unknown',
      jsHeapSizeLimit: 'Unknown',
    };
  }

  /**
   * Send crash report to service
   */
  async sendCrashReport(crashReport) {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // In a real app, you would send to Crashlytics, Sentry, etc.
      logger.info('Crash report sent to service', {
        crashId: crashReport.id,
        severity: crashReport.severity,
      });

      // Mark as sent
      crashReport.status = 'sent';
      this.saveCrashData();
    } catch (error) {
      logger.error('Failed to send crash report', error);
      crashReport.status = 'failed';
    }
  }

  /**
   * Check for previous crashes
   */
  async checkForPreviousCrashes() {
    try {
      const lastCrashTime = await AsyncStorage.getItem('last_crash_time');
      const currentTime = Date.now();
      
      if (lastCrashTime) {
        const timeSinceLastCrash = currentTime - parseInt(lastCrashTime);
        
        // If app crashed recently (within 5 minutes), report it
        if (timeSinceLastCrash < 5 * 60 * 1000) {
          this.reportCrash(new Error('App crashed recently'), {
            type: 'previous_crash',
            timeSinceLastCrash,
            lastCrashTime: parseInt(lastCrashTime),
          });
        }
      }
      
      // Update last crash time
      await AsyncStorage.setItem('last_crash_time', currentTime.toString());
    } catch (error) {
      logger.error('Failed to check for previous crashes', error);
    }
  }

  /**
   * Report non-fatal error
   */
  reportNonFatalError(error, context = {}) {
    return this.reportCrash(error, {
      ...context,
      isFatal: false,
      type: 'non_fatal_error',
    });
  }

  /**
   * Report custom error
   */
  reportCustomError(message, context = {}) {
    const error = new Error(message);
    return this.reportCrash(error, {
      ...context,
      type: 'custom_error',
    });
  }

  /**
   * Set user context
   */
  setUserContext(userId, properties = {}) {
    this.userId = userId;
    this.trackEvent('user_context_set', {
      userId,
      properties,
    });
  }

  /**
   * Set session context
   */
  setSessionContext(sessionId) {
    this.sessionId = sessionId;
  }

  /**
   * Track event for crash context
   */
  trackEvent(eventName, properties = {}) {
    // This would integrate with analytics
    logger.info('Crash context event tracked', {eventName, properties});
  }

  /**
   * Get crash statistics
   */
  getCrashStatistics() {
    const crashes = CrashReportingManager.crashes;
    const stats = {
      totalCrashes: crashes.length,
      criticalCrashes: crashes.filter(c => c.severity === 'critical').length,
      highSeverityCrashes: crashes.filter(c => c.severity === 'high').length,
      mediumSeverityCrashes: crashes.filter(c => c.severity === 'medium').length,
      lowSeverityCrashes: crashes.filter(c => c.severity === 'low').length,
      pendingCrashes: this.crashQueue.length,
      sentCrashes: crashes.filter(c => c.status === 'sent').length,
      failedCrashes: crashes.filter(c => c.status === 'failed').length,
    };

    return stats;
  }

  /**
   * Get recent crashes
   */
  getRecentCrashes(limit = 10) {
    return CrashReportingManager.crashes.slice(-limit);
  }

  /**
   * Clear crash data
   */
  async clearCrashData() {
    try {
      this.crashQueue = [];
      CrashReportingManager.crashes = [];
      await AsyncStorage.removeItem('crash_reports');
      await AsyncStorage.removeItem('crash_session_data');
      await AsyncStorage.removeItem('last_crash_time');
      
      logger.info('Crash data cleared');
    } catch (error) {
      logger.error('Failed to clear crash data', error);
    }
  }

  /**
   * Test crash reporting
   */
  testCrashReporting() {
    try {
      throw new Error('Test crash for crash reporting system');
    } catch (error) {
      this.reportCrash(error, {
        type: 'test_crash',
        isTest: true,
      });
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.saveCrashData();
  }
}

export default CrashReportingManager.getInstance();
