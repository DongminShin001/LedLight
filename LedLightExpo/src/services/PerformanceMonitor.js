import { NativeModules } from 'react-native';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTimes: [],
      memoryUsage: [],
      networkRequests: [],
      userInteractions: [],
      errors: [],
    };
    
    this.thresholds = {
      maxRenderTime: 16, // 60fps = 16ms per frame
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      maxNetworkLatency: 5000, // 5 seconds
    };
    
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.startTime = Date.now();
  }

  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startTime = Date.now();

    // Monitor performance every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 5000);

    // Monitor memory usage
    this.startMemoryMonitoring();

    // Monitor network requests
    this.startNetworkMonitoring();

    console.log('Performance monitoring started');
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.stopMemoryMonitoring();
    this.stopNetworkMonitoring();

    console.log('Performance monitoring stopped');
  }

  // Render Performance
  measureRenderTime(componentName, renderFunction) {
    const startTime = performance.now();
    
    try {
      const result = renderFunction();
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      this.metrics.renderTimes.push({
        component: componentName,
        renderTime,
        timestamp: Date.now(),
      });

      // Check if render time exceeds threshold
      if (renderTime > this.thresholds.maxRenderTime) {
        this.logPerformanceIssue('slow_render', {
          component: componentName,
          renderTime,
          threshold: this.thresholds.maxRenderTime,
        });
      }

      return result;
    } catch (error) {
      this.logError('render_error', {
        component: componentName,
        error: error.message,
      });
      throw error;
    }
  }

  // Memory Monitoring
  startMemoryMonitoring() {
    if (Platform.OS === 'android' && NativeModules.PerformanceMonitor) {
      // Use native Android memory monitoring if available
      this.memoryMonitoringInterval = setInterval(async () => {
        try {
          const memoryInfo = await NativeModules.PerformanceMonitor.getMemoryInfo();
          this.metrics.memoryUsage.push({
            ...memoryInfo,
            timestamp: Date.now(),
          });

          if (memoryInfo.totalMemory > this.thresholds.maxMemoryUsage) {
            this.logPerformanceIssue('high_memory', {
              totalMemory: memoryInfo.totalMemory,
              threshold: this.thresholds.maxMemoryUsage,
            });
          }
        } catch (error) {
          console.error('Error monitoring memory:', error);
        }
      }, 10000); // Check every 10 seconds
    }
  }

  stopMemoryMonitoring() {
    if (this.memoryMonitoringInterval) {
      clearInterval(this.memoryMonitoringInterval);
      this.memoryMonitoringInterval = null;
    }
  }

  // Network Monitoring
  startNetworkMonitoring() {
    // Monitor fetch requests
    const originalFetch = global.fetch;
    global.fetch = async (...args) => {
      const startTime = Date.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = Date.now();
        const latency = endTime - startTime;

        this.metrics.networkRequests.push({
          url,
          latency,
          status: response.status,
          timestamp: Date.now(),
        });

        if (latency > this.thresholds.maxNetworkLatency) {
          this.logPerformanceIssue('slow_network', {
            url,
            latency,
            threshold: this.thresholds.maxNetworkLatency,
          });
        }

        return response;
      } catch (error) {
        this.logError('network_error', {
          url,
          error: error.message,
        });
        throw error;
      }
    };
  }

  stopNetworkMonitoring() {
    // Restore original fetch if needed
    // Note: This is a simplified approach
  }

  // User Interaction Tracking
  trackUserInteraction(action, component, data = {}) {
    this.metrics.userInteractions.push({
      action,
      component,
      data,
      timestamp: Date.now(),
    });
  }

  // Error Tracking
  logError(type, errorData) {
    const error = {
      type,
      ...errorData,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
    };

    this.metrics.errors.push(error);

    // Send critical errors immediately
    if (type === 'critical_error' || type === 'crash') {
      this.sendErrorReport(error);
    }
  }

  logPerformanceIssue(type, issueData) {
    const issue = {
      type,
      ...issueData,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
    };

    console.warn('Performance issue detected:', issue);

    // Store performance issues
    if (!this.metrics.performanceIssues) {
      this.metrics.performanceIssues = [];
    }
    this.metrics.performanceIssues.push(issue);
  }

  // Metrics Collection
  collectMetrics() {
    const currentTime = Date.now();
    const sessionDuration = currentTime - this.startTime;

    const metrics = {
      sessionDuration,
      renderTimes: this.getRecentMetrics('renderTimes', 60000), // Last minute
      memoryUsage: this.getRecentMetrics('memoryUsage', 60000),
      networkRequests: this.getRecentMetrics('networkRequests', 60000),
      userInteractions: this.getRecentMetrics('userInteractions', 60000),
      errors: this.getRecentMetrics('errors', 60000),
      performanceIssues: this.getRecentMetrics('performanceIssues', 60000),
    };

    // Calculate performance scores
    const performanceScore = this.calculatePerformanceScore(metrics);
    
    return {
      ...metrics,
      performanceScore,
      timestamp: currentTime,
    };
  }

  getRecentMetrics(metricType, timeWindow) {
    const cutoffTime = Date.now() - timeWindow;
    return this.metrics[metricType].filter(metric => metric.timestamp > cutoffTime);
  }

  calculatePerformanceScore(metrics) {
    let score = 100;

    // Deduct points for slow renders
    const slowRenders = metrics.renderTimes.filter(rt => rt.renderTime > this.thresholds.maxRenderTime);
    score -= slowRenders.length * 5;

    // Deduct points for high memory usage
    const highMemory = metrics.memoryUsage.filter(mu => mu.totalMemory > this.thresholds.maxMemoryUsage);
    score -= highMemory.length * 3;

    // Deduct points for slow network requests
    const slowRequests = metrics.networkRequests.filter(nr => nr.latency > this.thresholds.maxNetworkLatency);
    score -= slowRequests.length * 2;

    // Deduct points for errors
    score -= metrics.errors.length * 10;

    return Math.max(0, Math.min(100, score));
  }

  // Reporting
  async sendErrorReport(error) {
    try {
      // In a real app, you would send this to your error reporting service
      console.error('Critical error report:', error);
      
      // Example: Send to crash reporting service
      // await CrashReportingService.reportError(error);
    } catch (reportingError) {
      console.error('Failed to send error report:', reportingError);
    }
  }

  async sendPerformanceReport() {
    try {
      const metrics = this.collectMetrics();
      
      // In a real app, you would send this to your analytics service
      console.log('Performance report:', metrics);
      
      // Example: Send to analytics service
      // await AnalyticsService.trackPerformance(metrics);
    } catch (error) {
      console.error('Failed to send performance report:', error);
    }
  }

  // Utility Methods
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  getMetrics() {
    return {
      ...this.metrics,
      sessionId: this.getSessionId(),
      sessionDuration: Date.now() - this.startTime,
    };
  }

  clearMetrics() {
    this.metrics = {
      renderTimes: [],
      memoryUsage: [],
      networkRequests: [],
      userInteractions: [],
      errors: [],
      performanceIssues: [],
    };
    this.startTime = Date.now();
  }

  // Performance Optimization Suggestions
  getOptimizationSuggestions() {
    const suggestions = [];
    const recentMetrics = this.collectMetrics();

    // Check for slow renders
    const avgRenderTime = recentMetrics.renderTimes.reduce((sum, rt) => sum + rt.renderTime, 0) / recentMetrics.renderTimes.length;
    if (avgRenderTime > this.thresholds.maxRenderTime) {
      suggestions.push({
        type: 'render_performance',
        priority: 'high',
        message: 'Average render time is high. Consider optimizing component rendering.',
        details: `Average render time: ${avgRenderTime.toFixed(2)}ms`,
      });
    }

    // Check for memory usage
    const avgMemory = recentMetrics.memoryUsage.reduce((sum, mu) => sum + mu.totalMemory, 0) / recentMetrics.memoryUsage.length;
    if (avgMemory > this.thresholds.maxMemoryUsage * 0.8) {
      suggestions.push({
        type: 'memory_usage',
        priority: 'medium',
        message: 'Memory usage is high. Consider implementing memory optimization.',
        details: `Average memory usage: ${(avgMemory / 1024 / 1024).toFixed(2)}MB`,
      });
    }

    // Check for network performance
    const avgLatency = recentMetrics.networkRequests.reduce((sum, nr) => sum + nr.latency, 0) / recentMetrics.networkRequests.length;
    if (avgLatency > this.thresholds.maxNetworkLatency * 0.8) {
      suggestions.push({
        type: 'network_performance',
        priority: 'medium',
        message: 'Network requests are slow. Consider implementing caching or optimization.',
        details: `Average latency: ${avgLatency.toFixed(2)}ms`,
      });
    }

    return suggestions;
  }

  // Cleanup
  cleanup() {
    this.stopMonitoring();
    this.clearMetrics();
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
