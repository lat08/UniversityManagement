/**
 * Performance monitoring utilities for Core Web Vitals
 * Tracks LCP, FID, CLS, TTFB, and custom metrics
 */

type PerformanceMetric = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
};

type MetricCallback = (metric: PerformanceMetric) => void;

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  TTI: { good: 3000, poor: 5000 }, // Time to Interactive
};

const getRating = (value: number, metric: keyof typeof THRESHOLDS): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[metric];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

/**
 * Report Core Web Vitals to analytics
 */
export const reportWebVitals = (callback: MetricCallback): void => {
  if (typeof window === 'undefined') return;

  // Use web-vitals library if available
  // import('web-vitals').then(({ onCLS, onFID, onLCP, onTTFB }) => {
  //   onCLS((metric) => callback({ ...metric, rating: getRating(metric.value, 'CLS') }));
  //   onFID((metric) => callback({ ...metric, rating: getRating(metric.value, 'FID') }));
  //   onLCP((metric) => callback({ ...metric, rating: getRating(metric.value, 'LCP') }));
  //   onTTFB((metric) => callback({ ...metric, rating: getRating(metric.value, 'TTFB') }));
  // });

  // Fallback: Use PerformanceObserver
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
        const value = lastEntry.renderTime ?? lastEntry.loadTime ?? 0;
        
        callback({
          name: 'LCP',
          value,
          rating: getRating(value, 'LCP'),
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {
      // Observer not supported
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!layoutShift.hadRecentInput && layoutShift.value) {
            clsValue += layoutShift.value;
          }
        }
        
        callback({
          name: 'CLS',
          value: clsValue,
          rating: getRating(clsValue, 'CLS'),
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch {
      // Observer not supported
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0] as PerformanceEventTiming;
        const value = firstInput.processingStart - firstInput.startTime;
        
        callback({
          name: 'FID',
          value,
          rating: getRating(value, 'FID'),
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch {
      // Observer not supported
    }
  }
};

/**
 * Measure custom performance timing
 */
export const measurePerformance = (markName: string, startMark?: string): number => {
  if (typeof window === 'undefined' || !('performance' in window)) return 0;

  try {
    if (startMark) {
      performance.measure(markName, startMark);
      const measure = performance.getEntriesByName(markName)[0];
      return measure?.duration ?? 0;
    }
    
    performance.mark(markName);
    return 0;
  } catch {
    return 0;
  }
};

/**
 * Log performance metrics (dev only)
 */
export const logPerformanceMetric = (metric: PerformanceMetric): void => {
  if (process.env.NODE_ENV !== 'development') return;

  // Intentionally empty for production - would integrate with analytics service
  // Future: Add console.log for development debugging if needed
  void metric;
};

/**
 * Track React Query cache performance
 */
export const trackQueryPerformance = (queryKey: unknown[], duration: number): void => {
  const metric: PerformanceMetric = {
    name: `query:${JSON.stringify(queryKey)}`,
    value: duration,
    rating: duration < 1000 ? 'good' : duration < 3000 ? 'needs-improvement' : 'poor',
  };
  
  logPerformanceMetric(metric);
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // window.gtag?.('event', 'query_performance', { ...metric });
  }
};
