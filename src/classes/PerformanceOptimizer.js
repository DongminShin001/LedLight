/**
 * PerformanceOptimizer Class - Advanced performance optimization
 * Provides caching, debouncing, and memory management
 */

import logger from '../utils/Logger';

class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.debounceTimers = new Map();
    this.throttleTimers = new Map();
    this.memoryStats = {
      cacheSize: 0,
      maxCacheSize: 100,
      hitCount: 0,
      missCount: 0,
    };
    
    this.initializeMemoryMonitoring();
  }

  /**
   * Initialize memory monitoring
   */
  initializeMemoryMonitoring() {
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      this.cleanupCache();
      this.logMemoryStats();
    }, 30000);
  }

  /**
   * Cache with TTL (Time To Live)
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  setCache(key, value, ttl = 300000) { // 5 minutes default
    const expiry = Date.now() + ttl;
    this.cache.set(key, {value, expiry});
    this.memoryStats.cacheSize++;
    
    // Cleanup if cache is too large
    if (this.memoryStats.cacheSize > this.memoryStats.maxCacheSize) {
      this.cleanupCache();
    }
    
    logger.debug(`Cached value for key: ${key}`, {ttl, cacheSize: this.memoryStats.cacheSize});
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {*} - Cached value or null
   */
  getCache(key) {
    const cached = this.cache.get(key);
    
    if (!cached) {
      this.memoryStats.missCount++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      this.memoryStats.cacheSize--;
      this.memoryStats.missCount++;
      return null;
    }
    
    this.memoryStats.hitCount++;
    return cached.value;
  }

  /**
   * Clear specific cache entry
   * @param {string} key - Cache key
   */
  clearCache(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.memoryStats.cacheSize--;
      logger.debug(`Cleared cache for key: ${key}`);
    }
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.clear();
    this.memoryStats.cacheSize = 0;
    logger.info('Cleared all cache');
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiry) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    this.memoryStats.cacheSize -= cleanedCount;
    
    if (cleanedCount > 0) {
      logger.debug(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Debounce function execution
   * @param {string} key - Debounce key
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @param {...*} args - Function arguments
   */
  debounce(key, func, delay = 300, ...args) {
    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      func(...args);
      this.debounceTimers.delete(key);
    }, delay);
    
    this.debounceTimers.set(key, timer);
    logger.debug(`Debounced function for key: ${key}`, {delay});
  }

  /**
   * Throttle function execution
   * @param {string} key - Throttle key
   * @param {Function} func - Function to throttle
   * @param {number} delay - Delay in milliseconds
   * @param {...*} args - Function arguments
   */
  throttle(key, func, delay = 100, ...args) {
    if (this.throttleTimers.has(key)) {
      return; // Already throttled
    }
    
    func(...args);
    
    const timer = setTimeout(() => {
      this.throttleTimers.delete(key);
    }, delay);
    
    this.throttleTimers.set(key, timer);
    logger.debug(`Throttled function for key: ${key}`, {delay});
  }

  /**
   * Clear debounce timer
   * @param {string} key - Debounce key
   */
  clearDebounce(key) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
      this.debounceTimers.delete(key);
      logger.debug(`Cleared debounce timer for key: ${key}`);
    }
  }

  /**
   * Clear throttle timer
   * @param {string} key - Throttle key
   */
  clearThrottle(key) {
    if (this.throttleTimers.has(key)) {
      clearTimeout(this.throttleTimers.get(key));
      this.throttleTimers.delete(key);
      logger.debug(`Cleared throttle timer for key: ${key}`);
    }
  }

  /**
   * Clear all timers
   */
  clearAllTimers() {
    // Clear debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    
    // Clear throttle timers
    for (const timer of this.throttleTimers.values()) {
      clearTimeout(timer);
    }
    this.throttleTimers.clear();
    
    logger.info('Cleared all performance timers');
  }

  /**
   * Batch operations for better performance
   * @param {Array} operations - Array of operations
   * @param {number} batchSize - Batch size
   * @returns {Promise<Array>} - Results
   */
  async batchOperations(operations, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
      
      // Small delay between batches to prevent blocking
      if (i + batchSize < operations.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    logger.debug(`Processed ${operations.length} operations in batches of ${batchSize}`);
    return results;
  }

  /**
   * Memoize function results
   * @param {Function} func - Function to memoize
   * @param {Function} keyGenerator - Key generator function
   * @returns {Function} - Memoized function
   */
  memoize(func, keyGenerator = (...args) => JSON.stringify(args)) {
    return (...args) => {
      const key = keyGenerator(...args);
      const cached = this.getCache(key);
      
      if (cached !== null) {
        return cached;
      }
      
      const result = func(...args);
      this.setCache(key, result);
      return result;
    };
  }

  /**
   * Lazy load data
   * @param {string} key - Lazy load key
   * @param {Function} loader - Data loader function
   * @returns {Promise<*>} - Loaded data
   */
  async lazyLoad(key, loader) {
    const cached = this.getCache(key);
    if (cached !== null) {
      return cached;
    }
    
    try {
      const data = await loader();
      this.setCache(key, data);
      return data;
    } catch (error) {
      logger.error(`Failed to lazy load data for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Preload data
   * @param {Array} loaders - Array of loader functions
   * @returns {Promise<Array>} - Preloaded data
   */
  async preload(loaders) {
    const promises = loaders.map(async (loader, index) => {
      try {
        return await loader();
      } catch (error) {
        logger.error(`Failed to preload data at index: ${index}`, error);
        return null;
      }
    });
    
    const results = await Promise.all(promises);
    logger.info(`Preloaded ${loaders.length} data sources`);
    return results;
  }

  /**
   * Get memory statistics
   * @returns {Object} - Memory statistics
   */
  getMemoryStats() {
    const hitRate = this.memoryStats.hitCount + this.memoryStats.missCount > 0 
      ? (this.memoryStats.hitCount / (this.memoryStats.hitCount + this.memoryStats.missCount)) * 100 
      : 0;
    
    return {
      ...this.memoryStats,
      hitRate: Math.round(hitRate * 100) / 100,
      activeDebounceTimers: this.debounceTimers.size,
      activeThrottleTimers: this.throttleTimers.size,
    };
  }

  /**
   * Log memory statistics
   */
  logMemoryStats() {
    const stats = this.getMemoryStats();
    logger.info('Performance Optimizer Memory Stats', stats);
  }

  /**
   * Optimize image loading
   * @param {string} imageUrl - Image URL
   * @param {Object} options - Optimization options
   * @returns {Promise<string>} - Optimized image URL
   */
  async optimizeImage(imageUrl, options = {}) {
    const cacheKey = `image_${imageUrl}_${JSON.stringify(options)}`;
    const cached = this.getCache(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // In a real implementation, you would optimize the image here
    // For now, we'll just cache the original URL
    this.setCache(cacheKey, imageUrl, 3600000); // 1 hour cache
    return imageUrl;
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    logger.info('Cleaning up PerformanceOptimizer');
    this.clearAllCache();
    this.clearAllTimers();
  }
}

// Export singleton instance
export default new PerformanceOptimizer();
