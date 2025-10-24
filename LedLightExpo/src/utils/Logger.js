/**
 * Logger Utility for LED Controller App
 * Provides structured logging with different levels
 */

import {Platform} from 'react-native';

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  constructor() {
    this.logLevel = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory
  }

  setLogLevel(level) {
    this.logLevel = level;
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const platform = Platform.OS;
    
    return {
      timestamp,
      level,
      platform,
      message,
      data,
    };
  }

  log(level, message, data = null) {
    if (level <= this.logLevel) {
      const formattedMessage = this.formatMessage(level, message, data);
      
      // Add to in-memory logs
      this.logs.push(formattedMessage);
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }
      
      // Console output
      const consoleMessage = `[${formattedMessage.timestamp}] ${message}`;
      
      switch (level) {
        case LOG_LEVELS.ERROR:
          console.error(consoleMessage, data);
          break;
        case LOG_LEVELS.WARN:
          console.warn(consoleMessage, data);
          break;
        case LOG_LEVELS.INFO:
          console.info(consoleMessage, data);
          break;
        case LOG_LEVELS.DEBUG:
          console.log(consoleMessage, data);
          break;
      }
    }
  }

  error(message, data = null) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = null) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }

  // Get logs for debugging or crash reporting
  getLogs(level = null) {
    if (level !== null) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs as JSON
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
export {LOG_LEVELS};
