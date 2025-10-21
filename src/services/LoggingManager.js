import AsyncStorage from '@react-native-async-storage/async-storage';
import CrashReportingManager from './CrashReportingManager';

/**
 * Advanced Logging Manager
 * Comprehensive logging system for SmartLED Controller
 */
export class LoggingManager {
  static instance = null;
  static logs = [];
  static isInitialized = false;

  constructor() {
    if (LoggingManager.instance) {
      return LoggingManager.instance;
    }

    this.isInitialized = false;
    this.logQueue = [];
    this.maxLogsInMemory = 1000;
    this.maxLogsInStorage = 5000;
    this.flushInterval = null;
    this.flushIntervalMs = 10000; // 10 seconds
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4,
    };
    this.currentLogLevel = this.logLevels.INFO;

    LoggingManager.instance = this;
  }

  static getInstance() {
    if (!LoggingManager.instance) {
      LoggingManager.instance = new LoggingManager();
    }
    return LoggingManager.instance;
  }

  /**
   * Initialize logging system
   */
  async initialize() {
    try {
      await this.loadLogSettings();
      await this.loadPendingLogs();
      this.startFlushInterval();
      this.setupConsoleOverrides();
      this.isInitialized = true;
      
      this.info('Logging manager initialized', {
        maxLogsInMemory: this.maxLogsInMemory,
        currentLogLevel: this.currentLogLevel,
        pendingLogs: this.logQueue.length,
      });
    } catch (error) {
      console.error('Failed to initialize logging manager', error);
      throw error;
    }
  }

  /**
   * Load log settings from storage
   */
  async loadLogSettings() {
    try {
      const settings = await AsyncStorage.getItem('logging_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.currentLogLevel = parsedSettings.logLevel || this.logLevels.INFO;
        this.maxLogsInMemory = parsedSettings.maxLogsInMemory || 1000;
      }
    } catch (error) {
      console.error('Failed to load log settings', error);
    }
  }

  /**
   * Save log settings to storage
   */
  async saveLogSettings() {
    try {
      const settings = {
        logLevel: this.currentLogLevel,
        maxLogsInMemory: this.maxLogsInMemory,
      };
      await AsyncStorage.setItem('logging_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save log settings', error);
    }
  }

  /**
   * Load pending logs from storage
   */
  async loadPendingLogs() {
    try {
      const storedLogs = await AsyncStorage.getItem('pending_logs');
      if (storedLogs) {
        this.logQueue = JSON.parse(storedLogs);
        this.info('Loaded pending logs', {count: this.logQueue.length});
      }
    } catch (error) {
      console.error('Failed to load pending logs', error);
      this.logQueue = [];
    }
  }

  /**
   * Save pending logs to storage
   */
  async savePendingLogs() {
    try {
      await AsyncStorage.setItem('pending_logs', JSON.stringify(this.logQueue));
    } catch (error) {
      console.error('Failed to save pending logs', error);
    }
  }

  /**
   * Setup console overrides
   */
  setupConsoleOverrides() {
    // Override console methods to capture all logs
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    };

    console.log = (...args) => {
      this.debug('Console Log', {args});
      originalConsole.log.apply(console, args);
    };

    console.error = (...args) => {
      this.error('Console Error', {args});
      originalConsole.error.apply(console, args);
    };

    console.warn = (...args) => {
      this.warn('Console Warning', {args});
      originalConsole.warn.apply(console, args);
    };

    console.info = (...args) => {
      this.info('Console Info', {args});
      originalConsole.info.apply(console, args);
    };

    console.debug = (...args) => {
      this.debug('Console Debug', {args});
      originalConsole.debug.apply(console, args);
    };
  }

  /**
   * Log a message
   */
  log(level, message, data = {}) {
    if (level > this.currentLogLevel) {
      return;
    }

    try {
      const logEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        level: this.getLevelName(level),
        message,
        data,
        stack: this.getStackTrace(),
        sessionId: this.getSessionId(),
        userId: this.getUserId(),
      };

      this.logQueue.push(logEntry);
      LoggingManager.logs.push(logEntry);

      // Prevent memory overflow
      if (this.logQueue.length > this.maxLogsInMemory) {
        this.logQueue = this.logQueue.slice(-this.maxLogsInMemory);
      }

      // Save to storage
      this.savePendingLogs();

      // Send to external logging service if needed
      this.sendToExternalService(logEntry);

      return logEntry.id;
    } catch (error) {
      console.error('Failed to log message', error);
      return null;
    }
  }

  /**
   * Log error message
   */
  error(message, data = {}) {
    const logId = this.log(this.logLevels.ERROR, message, data);
    
    // Also report to crash reporting if it's a critical error
    if (data.isCritical) {
      CrashReportingManager.reportNonFatalError(new Error(message), {
        logId,
        ...data,
      });
    }
    
    return logId;
  }

  /**
   * Log warning message
   */
  warn(message, data = {}) {
    return this.log(this.logLevels.WARN, message, data);
  }

  /**
   * Log info message
   */
  info(message, data = {}) {
    return this.log(this.logLevels.INFO, message, data);
  }

  /**
   * Log debug message
   */
  debug(message, data = {}) {
    return this.log(this.logLevels.DEBUG, message, data);
  }

  /**
   * Log trace message
   */
  trace(message, data = {}) {
    return this.log(this.logLevels.TRACE, message, data);
  }

  /**
   * Get level name from level number
   */
  getLevelName(level) {
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
    return levelNames[level] || 'UNKNOWN';
  }

  /**
   * Get stack trace
   */
  getStackTrace() {
    try {
      const stack = new Error().stack;
      return stack ? stack.split('\n').slice(2, 6).join('\n') : '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Get session ID
   */
  getSessionId() {
    // In a real app, you would get this from session manager
    return 'session_' + Date.now();
  }

  /**
   * Get user ID
   */
  getUserId() {
    // In a real app, you would get this from user manager
    return 'user_' + Date.now();
  }

  /**
   * Send log to external service
   */
  async sendToExternalService(logEntry) {
    try {
      // In a real app, you would send to external logging service
      // For now, we'll just simulate it
      if (logEntry.level === 'ERROR') {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.debug('Log sent to external service', {logId: logEntry.id});
      }
    } catch (error) {
      console.error('Failed to send log to external service', error);
    }
  }

  /**
   * Start flush interval
   */
  startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flushLogs();
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
   * Flush logs to external service
   */
  async flushLogs() {
    if (this.logQueue.length === 0) {
      return;
    }

    try {
      const logsToFlush = [...this.logQueue];
      this.logQueue = [];

      // Send to external service
      await this.sendLogsToService(logsToFlush);

      // Clear from storage
      await AsyncStorage.removeItem('pending_logs');

      this.debug('Logs flushed to service', {count: logsToFlush.length});
    } catch (error) {
      console.error('Failed to flush logs', error);
      // Restore logs to queue
      this.logQueue = [...this.logQueue, ...logsToFlush];
    }
  }

  /**
   * Send logs to service
   */
  async sendLogsToService(logs) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    this.debug('Logs sent to service', {count: logs.length});
  }

  /**
   * Set log level
   */
  setLogLevel(level) {
    this.currentLogLevel = level;
    this.saveLogSettings();
    this.info('Log level changed', {newLevel: this.getLevelName(level)});
  }

  /**
   * Get current log level
   */
  getLogLevel() {
    return this.currentLogLevel;
  }

  /**
   * Get log statistics
   */
  getLogStatistics() {
    const logs = LoggingManager.logs;
    const stats = {
      totalLogs: logs.length,
      errorLogs: logs.filter(l => l.level === 'ERROR').length,
      warnLogs: logs.filter(l => l.level === 'WARN').length,
      infoLogs: logs.filter(l => l.level === 'INFO').length,
      debugLogs: logs.filter(l => l.level === 'DEBUG').length,
      traceLogs: logs.filter(l => l.level === 'TRACE').length,
      pendingLogs: this.logQueue.length,
      currentLogLevel: this.getLevelName(this.currentLogLevel),
    };

    return stats;
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit = 100) {
    return LoggingManager.logs.slice(-limit);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level, limit = 100) {
    const levelName = this.getLevelName(level);
    return LoggingManager.logs
      .filter(log => log.level === levelName)
      .slice(-limit);
  }

  /**
   * Search logs
   */
  searchLogs(query, limit = 100) {
    return LoggingManager.logs
      .filter(log => 
        log.message.toLowerCase().includes(query.toLowerCase()) ||
        JSON.stringify(log.data).toLowerCase().includes(query.toLowerCase())
      )
      .slice(-limit);
  }

  /**
   * Clear logs
   */
  async clearLogs() {
    try {
      this.logQueue = [];
      LoggingManager.logs = [];
      await AsyncStorage.removeItem('pending_logs');
      await AsyncStorage.removeItem('logging_settings');
      
      this.info('Logs cleared');
    } catch (error) {
      console.error('Failed to clear logs', error);
    }
  }

  /**
   * Export logs
   */
  exportLogs() {
    return {
      logs: LoggingManager.logs,
      statistics: this.getLogStatistics(),
      settings: {
        logLevel: this.currentLogLevel,
        maxLogsInMemory: this.maxLogsInMemory,
      },
    };
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.stopFlushInterval();
    this.flushLogs();
  }
}

// Create singleton instance
const loggingManager = LoggingManager.getInstance();

// Export convenience methods
export const log = {
  error: (message, data) => loggingManager.error(message, data),
  warn: (message, data) => loggingManager.warn(message, data),
  info: (message, data) => loggingManager.info(message, data),
  debug: (message, data) => loggingManager.debug(message, data),
  trace: (message, data) => loggingManager.trace(message, data),
};

export default loggingManager;
