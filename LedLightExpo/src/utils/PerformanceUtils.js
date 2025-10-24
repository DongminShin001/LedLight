/**
 * Performance Optimization Utilities
 */

import {useCallback, useMemo, useRef, useEffect} from 'react';
import {InteractionManager, Dimensions} from 'react-native';

// Debounce hook for performance optimization
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for performance optimization
export const useThrottle = (value, delay) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecuted = useRef(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, delay - (Date.now() - lastExecuted.current));

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttledValue;
};

// Memoized callback hook
export const useMemoizedCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

// Memoized value hook
export const useMemoizedValue = (value, deps) => {
  return useMemo(() => value, deps);
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const renderStartTime = useRef();
  const renderCount = useRef(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;

    const measureRender = () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        
        if (__DEV__) {
          console.log(`[Performance] ${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
        }
      }
    };

    // Measure after interaction is complete
    InteractionManager.runAfterInteractions(measureRender);

    return () => {
      measureRender();
    };
  });

  return {
    renderCount: renderCount.current,
  };
};

// Lazy loading hook
export const useLazyLoad = (loadFunction, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    if (hasLoaded.current || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await loadFunction();
      setData(result);
      hasLoaded.current = true;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [loadFunction, loading]);

  useEffect(() => {
    load();
  }, deps);

  return {data, loading, error, reload: load};
};

// Image optimization utilities
export const optimizeImageSize = (width, height, maxWidth = 400, maxHeight = 400) => {
  const {width: screenWidth} = Dimensions.get('window');
  const maxDisplayWidth = Math.min(maxWidth, screenWidth);
  
  if (width <= maxDisplayWidth && height <= maxHeight) {
    return {width, height};
  }
  
  const aspectRatio = width / height;
  
  if (width > maxDisplayWidth) {
    return {
      width: maxDisplayWidth,
      height: maxDisplayWidth / aspectRatio,
    };
  }
  
  if (height > maxHeight) {
    return {
      width: maxHeight * aspectRatio,
      height: maxHeight,
    };
  }
  
  return {width, height};
};

// Memory management utilities
export const MemoryManager = {
  // Clear unused images from cache
  clearImageCache: () => {
    if (typeof Image !== 'undefined' && Image.clearMemoryCache) {
      Image.clearMemoryCache();
    }
  },
  
  // Clear disk cache
  clearDiskCache: () => {
    if (typeof Image !== 'undefined' && Image.clearDiskCache) {
      Image.clearDiskCache();
    }
  },
  
  // Get memory usage info
  getMemoryInfo: () => {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  },
};

// Component performance optimization
export const withPerformanceOptimization = (WrappedComponent) => {
  return React.memo(WrappedComponent, (prevProps, nextProps) => {
    // Custom comparison logic for better performance
    const keys = Object.keys(nextProps);
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    
    return true;
  });
};

// Batch state updates for better performance
export const useBatchedUpdates = () => {
  const batchedUpdates = useRef([]);
  const timeoutRef = useRef(null);

  const batchUpdate = useCallback((updateFn) => {
    batchedUpdates.current.push(updateFn);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const updates = batchedUpdates.current;
      batchedUpdates.current = [];
      
      // Execute all updates in a single batch
      InteractionManager.runAfterInteractions(() => {
        updates.forEach(update => update());
      });
    }, 16); // ~60fps
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return batchUpdate;
};

// Preload resources
export const ResourcePreloader = {
  preloadImages: (imageUrls) => {
    return Promise.all(
      imageUrls.map(url => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(url);
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = url;
        });
      })
    );
  },
  
  preloadFonts: (fontUrls) => {
    return Promise.all(
      fontUrls.map(url => {
        return new Promise((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'font';
          link.href = url;
          link.crossOrigin = 'anonymous';
          link.onload = () => resolve(url);
          link.onerror = () => reject(new Error(`Failed to load font: ${url}`));
          document.head.appendChild(link);
        });
      })
    );
  },
};

// Performance metrics collection
export const PerformanceMetrics = {
  metrics: new Map(),
  
  startTiming: (name) => {
    PerformanceMetrics.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null,
    });
  },
  
  endTiming: (name) => {
    const metric = PerformanceMetrics.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      if (__DEV__) {
        console.log(`[Performance] ${name}: ${metric.duration.toFixed(2)}ms`);
      }
    }
  },
  
  getMetrics: () => {
    return Array.from(PerformanceMetrics.metrics.entries()).map(([name, data]) => ({
      name,
      ...data,
    }));
  },
  
  clearMetrics: () => {
    PerformanceMetrics.metrics.clear();
  },
};
