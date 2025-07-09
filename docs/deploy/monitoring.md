# 📊 Monitoring & Alerts Guide

**Comprehensive monitoring setup for production systems**

---

## 🚀 Quick Setup

### Essential Monitoring Stack
```bash
# Install monitoring packages
pnpm add @sentry/nextjs @vercel/analytics @opentelemetry/api

# Install health check utilities
pnpm add @hapi/boom express-rate-limit helmet
```

### Basic Health Check
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  });
}
```

---

## 📋 Monitoring Categories

### 🔍 Error Tracking
```javascript
// lib/sentry.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});

export { Sentry };
```

### 📈 Performance Monitoring
```javascript
// lib/performance.js
import { Analytics } from '@vercel/analytics/react';

export function trackPerformance(metricName, value, tags = {}) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Track Core Web Vitals
    const vitals = {
      FCP: performance.getEntriesByType('paint')[0]?.startTime,
      LCP: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
      CLS: performance.getEntriesByType('layout-shift').reduce((sum, entry) => sum + entry.value, 0),
    };
    
    console.log('Performance Metrics:', vitals);
  }
}
```

### 🔄 System Health
```javascript
// lib/health-check.js
export async function checkSystemHealth() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    external_apis: await checkExternalAPIs(),
    disk_space: await checkDiskSpace(),
    memory: await checkMemoryUsage(),
  };
  
  const isHealthy = Object.values(checks).every(check => check.status === 'healthy');
  
  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  };
}
```

---

## 🎯 App-Specific Monitoring

### SaSarjan Main App
```javascript
// apps/web/lib/monitoring.js
export const monitoringConfig = {
  appName: 'SaSarjan',
  criticalEndpoints: [
    '/api/auth/session',
    '/api/bundles',
    '/api/prosperity-wheel',
    '/api/payments',
  ],
  performanceThresholds: {
    pageLoad: 3000, // 3 seconds
    apiResponse: 1000, // 1 second
    databaseQuery: 500, // 500ms
  },
  errorThresholds: {
    errorRate: 0.01, // 1%
    criticalErrors: 0, // No critical errors
  },
};
```

### TalentExcel App
```javascript
// apps/talentexcel/lib/monitoring.js
export const monitoringConfig = {
  appName: 'TalentExcel',
  criticalEndpoints: [
    '/api/internships',
    '/api/applications',
    '/api/profiles',
  ],
  performanceThresholds: {
    searchQuery: 2000, // 2 seconds
    locationLookup: 1500, // 1.5 seconds
  },
};
```

### 10xGrowth App
```javascript
// apps/10x-growth/lib/monitoring.js
export const monitoringConfig = {
  appName: '10xGrowth',
  criticalEndpoints: [
    '/api/landing-pages',
    '/api/analytics',
    '/api/admin',
  ],
  performanceThresholds: {
    pageBuilder: 5000, // 5 seconds
    analyticsQuery: 3000, // 3 seconds
  },
};
```

---

## 🔧 Monitoring Implementation

### Error Boundary with Monitoring
```javascript
// components/ErrorBoundary.js
import React from 'react';
import { Sentry } from '../lib/sentry';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, {
      tags: {
        component: 'ErrorBoundary',
      },
      extra: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### API Monitoring Middleware
```javascript
// middleware/monitoring.js
import { Sentry } from '../lib/sentry';

export function withMonitoring(handler) {
  return async (req, res) => {
    const startTime = Date.now();
    
    try {
      await handler(req, res);
      
      // Track successful requests
      const duration = Date.now() - startTime;
      console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
      
    } catch (error) {
      // Track errors
      Sentry.captureException(error, {
        tags: {
          method: req.method,
          url: req.url,
        },
        extra: {
          headers: req.headers,
          body: req.body,
        },
      });
      
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
```

### Database Query Monitoring
```javascript
// lib/db-monitor.js
export function monitorQuery(query, params = []) {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      const duration = Date.now() - startTime;
      
      if (error) {
        Sentry.captureException(error, {
          tags: {
            type: 'database_error',
            query: query.substring(0, 100),
          },
          extra: {
            params,
            duration,
          },
        });
        reject(error);
      } else {
        // Log slow queries
        if (duration > 1000) {
          console.warn(`Slow query detected: ${duration}ms`, query);
        }
        resolve(results);
      }
    });
  });
}
```

---

## 📊 Analytics & Metrics

### User Analytics
```javascript
// lib/analytics.js
import { track } from '@vercel/analytics';

export function trackUserEvent(event, properties = {}) {
  track(event, {
    ...properties,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  });
}

export function trackPageView(page) {
  trackUserEvent('page_view', {
    page,
    referrer: document.referrer,
  });
}

export function trackConversion(type, value) {
  trackUserEvent('conversion', {
    type,
    value,
    currency: 'INR',
  });
}
```

### Business Metrics
```javascript
// lib/business-metrics.js
export async function trackBusinessMetrics() {
  const metrics = {
    daily_active_users: await getDailyActiveUsers(),
    conversion_rate: await getConversionRate(),
    average_order_value: await getAverageOrderValue(),
    churn_rate: await getChurnRate(),
  };
  
  // Send to analytics service
  await sendToAnalytics('business_metrics', metrics);
  
  return metrics;
}
```

### Performance Metrics
```javascript
// lib/performance-metrics.js
export function collectPerformanceMetrics() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    const metrics = {
      // Page load times
      dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load_complete: navigation.loadEventEnd - navigation.loadEventStart,
      
      // Paint metrics
      first_paint: paint.find(p => p.name === 'first-paint')?.startTime,
      first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
      
      // Network metrics
      dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp_connect: navigation.connectEnd - navigation.connectStart,
      request_response: navigation.responseEnd - navigation.requestStart,
    };
    
    return metrics;
  }
  
  return null;
}
```

---

## 🚨 Alert Configuration

### Email Alerts
```javascript
// lib/alerts.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendAlert(type, message, severity = 'medium') {
  const alertConfig = {
    critical: {
      subject: '🚨 CRITICAL ALERT - SaSarjan App Store',
      recipients: ['admin@sasarjan.com', 'tech@sasarjan.com'],
    },
    warning: {
      subject: '⚠️ WARNING - SaSarjan App Store',
      recipients: ['tech@sasarjan.com'],
    },
    info: {
      subject: 'ℹ️ INFO - SaSarjan App Store',
      recipients: ['monitoring@sasarjan.com'],
    },
  };

  const config = alertConfig[severity] || alertConfig.info;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: config.recipients.join(', '),
    subject: config.subject,
    html: `
      <h2>Alert: ${type}</h2>
      <p><strong>Severity:</strong> ${severity}</p>
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      <p><strong>Message:</strong></p>
      <pre>${message}</pre>
    `,
  });
}
```

### Webhook Alerts
```javascript
// lib/webhook-alerts.js
export async function sendWebhookAlert(webhook_url, alert_data) {
  try {
    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Alert: ${alert_data.type}`,
        attachments: [
          {
            color: alert_data.severity === 'critical' ? 'danger' : 'warning',
            fields: [
              {
                title: 'Severity',
                value: alert_data.severity,
                short: true,
              },
              {
                title: 'Time',
                value: new Date().toISOString(),
                short: true,
              },
              {
                title: 'Message',
                value: alert_data.message,
                short: false,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook alert failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to send webhook alert:', error);
  }
}
```

---

## 📈 Dashboard Setup

### Health Dashboard
```javascript
// pages/api/dashboard/health.js
export default async function handler(req, res) {
  const health = await checkSystemHealth();
  const metrics = await collectSystemMetrics();
  
  res.status(200).json({
    ...health,
    metrics,
    apps: {
      sasarjan: await checkAppHealth('sasarjan'),
      talentexcel: await checkAppHealth('talentexcel'),
      '10xgrowth': await checkAppHealth('10xgrowth'),
      sevapremi: await checkAppHealth('sevapremi'),
      admin: await checkAppHealth('admin'),
    },
  });
}
```

### Metrics Dashboard
```javascript
// pages/api/dashboard/metrics.js
export default async function handler(req, res) {
  const timeRange = req.query.timeRange || '24h';
  
  const metrics = {
    performance: await getPerformanceMetrics(timeRange),
    errors: await getErrorMetrics(timeRange),
    users: await getUserMetrics(timeRange),
    business: await getBusinessMetrics(timeRange),
  };
  
  res.status(200).json(metrics);
}
```

---

## 🔧 Monitoring Tools Integration

### Sentry Configuration
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Error filtering
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    // Filter out network errors
    if (error && error.message && error.message.includes('Network Error')) {
      return null;
    }
    
    return event;
  },
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'nextjs-app',
    },
  },
});
```

### Vercel Analytics
```javascript
// pages/_app.js
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

### Custom Monitoring Service
```javascript
// lib/custom-monitoring.js
class MonitoringService {
  constructor(config) {
    this.config = config;
    this.metrics = new Map();
    this.alerts = [];
  }

  async trackMetric(name, value, tags = {}) {
    const metric = {
      name,
      value,
      tags,
      timestamp: new Date().toISOString(),
    };
    
    this.metrics.set(name, metric);
    
    // Check thresholds
    await this.checkThresholds(metric);
  }

  async checkThresholds(metric) {
    const threshold = this.config.thresholds[metric.name];
    
    if (threshold && metric.value > threshold) {
      await this.sendAlert({
        type: 'threshold_exceeded',
        metric: metric.name,
        value: metric.value,
        threshold,
      });
    }
  }

  async sendAlert(alert) {
    this.alerts.push(alert);
    
    // Send to external services
    await sendAlert(alert.type, JSON.stringify(alert, null, 2));
  }
}

export const monitoring = new MonitoringService({
  thresholds: {
    response_time: 5000,
    error_rate: 0.01,
    cpu_usage: 80,
    memory_usage: 90,
  },
});
```

---

## 🎯 Monitoring Checklist

### Initial Setup
- [ ] Sentry error tracking configured
- [ ] Vercel Analytics enabled
- [ ] Health check endpoints created
- [ ] Performance monitoring active
- [ ] Database monitoring enabled

### Alert Configuration
- [ ] Email alerts configured
- [ ] Webhook alerts set up
- [ ] Threshold-based alerts enabled
- [ ] Escalation policies defined
- [ ] On-call rotation established

### Dashboard Setup
- [ ] Health dashboard accessible
- [ ] Metrics dashboard created
- [ ] Performance dashboard active
- [ ] Error dashboard configured
- [ ] Business metrics tracked

### Testing
- [ ] Alert system tested
- [ ] Monitoring accuracy verified
- [ ] Performance baselines established
- [ ] Error tracking validated
- [ ] Dashboard functionality confirmed

---

## 📊 Key Metrics to Monitor

### Performance Metrics
- Response time (p95, p99)
- Core Web Vitals (LCP, FID, CLS)
- Database query performance
- API endpoint performance
- Page load times

### Error Metrics
- Error rate (%)
- Critical errors count
- 4xx/5xx HTTP errors
- Database connection errors
- Third-party service errors

### Business Metrics
- Daily/Monthly active users
- Conversion rates
- Revenue metrics
- User retention
- Feature adoption

### System Metrics
- CPU usage
- Memory usage
- Disk space
- Network latency
- Database connections

---

**✅ Monitoring system is operational when all metrics are being collected and alerts are functioning properly.**