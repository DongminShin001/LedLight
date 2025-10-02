/**
 * Security Utilities for LED Controller App
 */

import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

// Security constants
const SECURITY_CONFIG = {
  ENCRYPTION_KEY: 'led-controller-secure-key-2025',
  STORAGE_PREFIX: 'led_controller_',
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
};

// Input validation utilities
export const InputValidator = {
  // Validate hex color input
  validateHexColor: (color) => {
    if (!color || typeof color !== 'string') {
      return {valid: false, error: 'Color must be a string'};
    }
    
    const hexPattern = /^#?[0-9A-Fa-f]{6}$/;
    if (!hexPattern.test(color)) {
      return {valid: false, error: 'Invalid hex color format'};
    }
    
    return {valid: true};
  },
  
  // Validate brightness input
  validateBrightness: (brightness) => {
    if (typeof brightness !== 'number') {
      return {valid: false, error: 'Brightness must be a number'};
    }
    
    if (brightness < 0 || brightness > 100) {
      return {valid: false, error: 'Brightness must be between 0 and 100'};
    }
    
    return {valid: true};
  },
  
  // Validate device name input
  validateDeviceName: (name) => {
    if (!name || typeof name !== 'string') {
      return {valid: false, error: 'Device name must be a string'};
    }
    
    if (name.length < 1 || name.length > 50) {
      return {valid: false, error: 'Device name must be between 1 and 50 characters'};
    }
    
    // Check for potentially malicious characters
    const maliciousPattern = /[<>\"'&]/;
    if (maliciousPattern.test(name)) {
      return {valid: false, error: 'Device name contains invalid characters'};
    }
    
    return {valid: true};
  },
  
  // Validate command input
  validateCommand: (command) => {
    if (!command || typeof command !== 'string') {
      return {valid: false, error: 'Command must be a string'};
    }
    
    if (command.length > 100) {
      return {valid: false, error: 'Command too long'};
    }
    
    // Check for potentially malicious commands
    const maliciousPattern = /[;|&$`]/;
    if (maliciousPattern.test(command)) {
      return {valid: false, error: 'Command contains invalid characters'};
    }
    
    return {valid: true};
  },
  
  // Sanitize string input
  sanitizeString: (input) => {
    if (typeof input !== 'string') {
      return '';
    }
    
    return input
      .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
      .trim()
      .substring(0, 1000); // Limit length
  },
};

// Encryption utilities
export const EncryptionUtils = {
  // Encrypt sensitive data
  encrypt: (data) => {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        SECURITY_CONFIG.ENCRYPTION_KEY
      ).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  },
  
  // Decrypt sensitive data
  decrypt: (encryptedData) => {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        encryptedData,
        SECURITY_CONFIG.ENCRYPTION_KEY
      ).toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Invalid encrypted data');
      }
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  },
  
  // Hash sensitive data (one-way)
  hash: (data) => {
    try {
      return CryptoJS.SHA256(data).toString();
    } catch (error) {
      console.error('Hashing error:', error);
      throw new Error('Failed to hash data');
    }
  },
};

// Secure storage utilities
export const SecureStorage = {
  // Store encrypted data
  setItem: async (key, value) => {
    try {
      const encryptedValue = EncryptionUtils.encrypt(value);
      await AsyncStorage.setItem(
        `${SECURITY_CONFIG.STORAGE_PREFIX}${key}`,
        encryptedValue
      );
    } catch (error) {
      console.error('Secure storage set error:', error);
      throw new Error('Failed to store data securely');
    }
  },
  
  // Retrieve and decrypt data
  getItem: async (key) => {
    try {
      const encryptedValue = await AsyncStorage.getItem(
        `${SECURITY_CONFIG.STORAGE_PREFIX}${key}`
      );
      
      if (!encryptedValue) {
        return null;
      }
      
      return EncryptionUtils.decrypt(encryptedValue);
    } catch (error) {
      console.error('Secure storage get error:', error);
      return null;
    }
  },
  
  // Remove secure data
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(`${SECURITY_CONFIG.STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.error('Secure storage remove error:', error);
    }
  },
  
  // Clear all secure data
  clear: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(key => 
        key.startsWith(SECURITY_CONFIG.STORAGE_PREFIX)
      );
      
      await AsyncStorage.multiRemove(secureKeys);
    } catch (error) {
      console.error('Secure storage clear error:', error);
    }
  },
};

// Rate limiting utilities
export const RateLimiter = {
  attempts: new Map(),
  
  // Check if action is rate limited
  isRateLimited: (key, maxAttempts = 5, windowMs = 60000) => {
    const now = Date.now();
    const attempts = RateLimiter.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    RateLimiter.attempts.set(key, validAttempts);
    
    return validAttempts.length >= maxAttempts;
  },
  
  // Record an attempt
  recordAttempt: (key) => {
    const now = Date.now();
    const attempts = RateLimiter.attempts.get(key) || [];
    attempts.push(now);
    RateLimiter.attempts.set(key, attempts);
  },
  
  // Clear attempts for a key
  clearAttempts: (key) => {
    RateLimiter.attempts.delete(key);
  },
  
  // Get remaining attempts
  getRemainingAttempts: (key, maxAttempts = 5, windowMs = 60000) => {
    const now = Date.now();
    const attempts = RateLimiter.attempts.get(key) || [];
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    return Math.max(0, maxAttempts - validAttempts.length);
  },
};

// Session management
export const SessionManager = {
  // Create a new session
  createSession: async (userId) => {
    const sessionId = EncryptionUtils.hash(`${userId}-${Date.now()}`);
    const sessionData = {
      userId,
      sessionId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };
    
    await SecureStorage.setItem('session', sessionData);
    return sessionId;
  },
  
  // Validate session
  validateSession: async () => {
    try {
      const sessionData = await SecureStorage.getItem('session');
      
      if (!sessionData) {
        return false;
      }
      
      const now = Date.now();
      const sessionAge = now - sessionData.createdAt;
      const timeSinceLastActivity = now - sessionData.lastActivity;
      
      // Check if session has expired
      if (sessionAge > SECURITY_CONFIG.SESSION_TIMEOUT || 
          timeSinceLastActivity > SECURITY_CONFIG.SESSION_TIMEOUT) {
        await SessionManager.destroySession();
        return false;
      }
      
      // Update last activity
      sessionData.lastActivity = now;
      await SecureStorage.setItem('session', sessionData);
      
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  },
  
  // Destroy session
  destroySession: async () => {
    await SecureStorage.removeItem('session');
  },
  
  // Get current session
  getCurrentSession: async () => {
    return await SecureStorage.getItem('session');
  },
};

// Device security utilities
export const DeviceSecurity = {
  // Check if device is rooted/jailbroken (basic check)
  isDeviceSecure: () => {
    // This is a basic check - in production, you'd want more sophisticated detection
    if (Platform.OS === 'android') {
      // Check for common root indicators
      return true; // Simplified for this example
    }
    
    if (Platform.OS === 'ios') {
      // Check for common jailbreak indicators
      return true; // Simplified for this example
    }
    
    return true;
  },
  
  // Validate device fingerprint
  getDeviceFingerprint: () => {
    const deviceInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      timestamp: Date.now(),
    };
    
    return EncryptionUtils.hash(JSON.stringify(deviceInfo));
  },
};

// Security audit utilities
export const SecurityAudit = {
  // Audit user actions
  logAction: async (action, details = {}) => {
    try {
      const auditLog = {
        action,
        details,
        timestamp: Date.now(),
        deviceFingerprint: DeviceSecurity.getDeviceFingerprint(),
      };
      
      // Store audit log securely
      const logs = await SecureStorage.getItem('audit_logs') || [];
      logs.push(auditLog);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      await SecureStorage.setItem('audit_logs', logs);
    } catch (error) {
      console.error('Security audit log error:', error);
    }
  },
  
  // Get audit logs
  getAuditLogs: async () => {
    return await SecureStorage.getItem('audit_logs') || [];
  },
  
  // Clear audit logs
  clearAuditLogs: async () => {
    await SecureStorage.removeItem('audit_logs');
  },
};

// Security middleware for API calls
export const SecurityMiddleware = {
  // Validate request before processing
  validateRequest: (requestData) => {
    // Check for required fields
    if (!requestData || typeof requestData !== 'object') {
      throw new Error('Invalid request data');
    }
    
    // Check request size
    const requestSize = JSON.stringify(requestData).length;
    if (requestSize > 10000) { // 10KB limit
      throw new Error('Request too large');
    }
    
    // Validate each field
    Object.entries(requestData).forEach(([key, value]) => {
      if (typeof key !== 'string' || key.length > 100) {
        throw new Error('Invalid request field name');
      }
      
      if (typeof value === 'string' && value.length > 1000) {
        throw new Error('Field value too long');
      }
    });
    
    return true;
  },
  
  // Sanitize response data
  sanitizeResponse: (responseData) => {
    if (typeof responseData === 'string') {
      return InputValidator.sanitizeString(responseData);
    }
    
    if (typeof responseData === 'object' && responseData !== null) {
      const sanitized = {};
      Object.entries(responseData).forEach(([key, value]) => {
        sanitized[InputValidator.sanitizeString(key)] = 
          typeof value === 'string' ? InputValidator.sanitizeString(value) : value;
      });
      return sanitized;
    }
    
    return responseData;
  },
};
