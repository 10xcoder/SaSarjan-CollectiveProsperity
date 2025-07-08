# Infrastructure - Monitoring & Observability

## Quick Reference
- **Time Estimate**: 2-3 hours total
- **Dependencies**: None ✅
- **Apps Affected**: All apps
- **Priority**: HIGH

---

## 📊 **Application Monitoring**

### **PROMPT 1: Sentry Error Tracking**
**Time**: 45 minutes

```
Implement comprehensive error tracking with Sentry across all SaSarjan apps:

1. **Sentry Configuration**:
   - Install @sentry/nextjs in all apps
   - Create sentry.client.config.js and sentry.server.config.js
   - Configure environment-specific DSNs
   - Set up source maps for better error tracking

2. **Error Boundaries**:
   - Create global error boundary component
   - Implement error fallback UI components
   - Add error boundaries to critical app sections
   - Capture and report React errors to Sentry

3. **Custom Error Tracking**:
   - Add custom error events for business logic failures
   - Track user actions that lead to errors
   - Monitor API call failures and timeouts
   - Track performance issues and slow queries

4. **Integration Setup**:
   - Configure for each app:
     * /apps/web (SaSarjan portal)
     * /apps/admin (Admin dashboard)
     * /apps/10x-growth (10xGrowth app)
     * /apps/talentexcel (TalentExcel app)
     * /apps/sevapremi (SevaPremi app)

5. **Alert Configuration**:
   - Set up email alerts for critical errors
   - Configure Slack notifications for development team
   - Create escalation rules for production issues
   - Set up performance degradation alerts

6. **Performance Monitoring**:
   - Enable Sentry Performance monitoring
   - Track Core Web Vitals (LCP, FID, CLS)
   - Monitor API response times
   - Track database query performance

Configuration example for each app's next.config.mjs:
```javascript
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  {
    // Your Next.js config
  },
  {
    silent: true,
    org: "sasarjan",
    project: "sasarjan-web", // Change per app
  }
);
```
```

---

## 🏥 **Health Monitoring**

### **PROMPT 2: Health Check System**
**Time**: 30 minutes

```
Implement comprehensive health checks for all SaSarjan applications:

1. **Health Check Endpoints**:
   - Create /api/health route in each app
   - Return JSON with app status, database connectivity, external services
   - Include response time metrics
   - Add dependency health checks

2. **Health Check Implementation**:
   ```typescript
   // /apps/*/src/app/api/health/route.ts
   export async function GET() {
     const checks = {
       database: await checkDatabase(),
       supabase: await checkSupabase(),
       redis: await checkRedis(), // if used
       external_apis: await checkExternalAPIs(),
       memory_usage: process.memoryUsage(),
       uptime: process.uptime(),
     };
     
     const isHealthy = Object.values(checks).every(check => 
       typeof check === 'object' ? check.status === 'ok' : check
     );
     
     return Response.json({
       status: isHealthy ? 'ok' : 'error',
       timestamp: new Date().toISOString(),
       checks,
     }, { status: isHealthy ? 200 : 503 });
   }
   ```

3. **Database Health Checks**:
   - Test connection to Supabase
   - Verify read/write operations
   - Check for slow queries
   - Monitor connection pool status

4. **External Service Checks**:
   - Verify third-party API connectivity
   - Check authentication status
   - Monitor rate limits
   - Test critical integrations

5. **System Resource Monitoring**:
   - Memory usage tracking
   - CPU utilization
   - Disk space monitoring
   - Network connectivity

6. **Health Dashboard Integration**:
   - Display health status in admin dashboard
   - Create alerts for health check failures
   - Historical health data tracking
   - Service dependency mapping

Implement in all apps with consistent format and comprehensive coverage.
```

---

## 📈 **Performance Monitoring**

### **PROMPT 3: Application Performance Monitoring**
**Time**: 1 hour

```
Implement detailed performance monitoring for the SaSarjan platform:

1. **Core Web Vitals Tracking**:
   - Implement web-vitals library in all apps
   - Track Largest Contentful Paint (LCP)
   - Monitor First Input Delay (FID)
   - Measure Cumulative Layout Shift (CLS)
   - Send metrics to analytics dashboard

2. **API Performance Monitoring**:
   - Add response time tracking to all API routes
   - Monitor database query execution times
   - Track external API call durations
   - Implement request/response logging

3. **Real User Monitoring (RUM)**:
   - Track page load times across different devices
   - Monitor user interaction performance
   - Measure JavaScript bundle load times
   - Track network performance variations

4. **Performance Analytics**:
   - Create performance dashboard in admin app
   - Show performance trends over time
   - Identify performance bottlenecks
   - Generate performance reports

5. **Performance Budgets**:
   - Set performance thresholds for each metric
   - Create alerts for performance degradation
   - Implement automated performance testing
   - Block deployments that exceed budgets

6. **Optimization Recommendations**:
   - Automated performance audit system
   - Identify slow components and pages
   - Suggest optimization strategies
   - Track improvement progress

Example implementation:
```typescript
// Performance tracking utility
export function trackPerformance(metricName: string, value: number) {
  // Send to analytics
  analytics.track('performance_metric', {
    metric: metricName,
    value,
    timestamp: Date.now(),
    page: window.location.pathname,
    user_agent: navigator.userAgent,
  });
  
  // Check against performance budget
  checkPerformanceBudget(metricName, value);
}
```
```

---

## 🔄 **Application Logging**

### **PROMPT 4: Structured Logging System**
**Time**: 45 minutes

```
Implement comprehensive structured logging across all SaSarjan applications:

1. **Logging Configuration**:
   - Set up Winston or Pino for server-side logging
   - Configure different log levels (error, warn, info, debug)
   - Implement log rotation and retention policies
   - Create environment-specific logging configs

2. **Structured Log Format**:
   ```typescript
   interface LogEntry {
     timestamp: string;
     level: 'error' | 'warn' | 'info' | 'debug';
     message: string;
     app: string;
     userId?: string;
     sessionId?: string;
     requestId?: string;
     metadata?: Record<string, any>;
   }
   ```

3. **Application Logging**:
   - Log all API requests and responses
   - Track user authentication events
   - Monitor database operations
   - Log error conditions and exceptions

4. **Security Event Logging**:
   - Failed authentication attempts
   - Permission denied events
   - Suspicious activity patterns
   - Admin privilege usage

5. **Business Event Logging**:
   - User registration and onboarding
   - App installations and usage
   - Bundle purchases and cancellations
   - Content creation and moderation

6. **Log Aggregation**:
   - Centralize logs from all applications
   - Implement log search and filtering
   - Create log-based alerts and dashboards
   - Set up log correlation across services

7. **Log Analysis Dashboard**:
   - Real-time log monitoring
   - Error trend analysis
   - User behavior insights
   - System performance correlation

Example logging middleware:
```typescript
export function loggingMiddleware(req: Request) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  logger.info('API Request', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });
  
  return () => {
    const duration = Date.now() - startTime;
    logger.info('API Response', {
      requestId,
      duration,
      status: res.status,
    });
  };
}
```
```

---

## 💾 **Database Monitoring**

### **PROMPT 5: Database Performance & Backup Monitoring**
**Time**: 30 minutes

```
Implement comprehensive database monitoring and backup systems:

1. **Database Performance Monitoring**:
   - Track query execution times
   - Monitor connection pool usage
   - Identify slow and frequent queries
   - Track database size and growth

2. **Automated Backup System**:
   - Set up daily automated backups of Supabase
   - Implement backup verification procedures
   - Create backup retention policies (30 days)
   - Test backup restoration procedures

3. **Backup Monitoring**:
   - Monitor backup job success/failure
   - Verify backup file integrity
   - Track backup file sizes and locations
   - Alert on backup failures

4. **Database Health Checks**:
   - Monitor database connectivity
   - Check for deadlocks and blocking queries
   - Track database error rates
   - Monitor replication lag (if applicable)

5. **Query Performance Analysis**:
   - Identify N+1 query problems
   - Track slow query patterns
   - Monitor index usage and suggestions
   - Analyze query execution plans

6. **Database Dashboard**:
   - Real-time database metrics
   - Query performance visualization
   - Backup status and history
   - Database health indicators

Backup script example:
```bash
#!/bin/bash
# Database backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="sasarjan_backup_$DATE.sql"

# Create backup
supabase db dump > "$BACKUP_FILE"

# Verify backup
if [ -s "$BACKUP_FILE" ]; then
  echo "Backup successful: $BACKUP_FILE"
  # Upload to cloud storage
  aws s3 cp "$BACKUP_FILE" s3://sasarjan-backups/
else
  echo "Backup failed!" >&2
  exit 1
fi
```
```

---

## 📊 **Monitoring Dashboard**

### **PROMPT 6: Unified Monitoring Dashboard**
**Time**: 1 hour

```
Create a comprehensive monitoring dashboard in the admin app:

1. **Dashboard Overview** (/apps/admin/src/app/monitoring/page.tsx):
   - System health summary
   - Real-time metrics widgets
   - Alert status and counts
   - Performance indicators

2. **Application Metrics**:
   - Response time charts
   - Error rate trends
   - User activity metrics
   - Performance score tracking

3. **Infrastructure Metrics**:
   - Server resource utilization
   - Database performance graphs
   - Network latency monitoring
   - External service status

4. **Alert Management**:
   - Active alerts dashboard
   - Alert history and trends
   - Alert acknowledgment system
   - Escalation status tracking

5. **Real-time Data**:
   - Live metric updates using WebSockets
   - Real-time log streaming
   - Live user activity feed
   - System event timeline

6. **Reporting Features**:
   - Generate daily/weekly/monthly reports
   - Export metrics data
   - Scheduled report delivery
   - Custom report builder

7. **Interactive Features**:
   - Drill-down capabilities for metrics
   - Time range selection
   - Metric correlation analysis
   - Anomaly detection highlighting

Dashboard component structure:
```typescript
interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'alert' | 'log';
  config: Record<string, any>;
  refreshInterval: number;
}

export function MonitoringDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SystemHealthWidget />
      <ResponseTimeChart />
      <ErrorRateWidget />
      <DatabaseMetrics />
      <ActiveAlertsWidget />
      <RecentEventsLog />
    </div>
  );
}
```
```

---

## ✅ **Success Criteria Checklist**

### **After PROMPT 1 (Sentry)**
- [ ] All apps report errors to Sentry
- [ ] Error boundaries catch React errors
- [ ] Performance monitoring captures Core Web Vitals
- [ ] Alerts configured for critical errors

### **After PROMPT 2 (Health Checks)**
- [ ] All apps have /api/health endpoints
- [ ] Health checks verify database connectivity
- [ ] External service dependencies are monitored
- [ ] Health status visible in dashboard

### **After PROMPT 3 (Performance)**
- [ ] Core Web Vitals tracked across all pages
- [ ] API response times monitored
- [ ] Performance budgets enforced
- [ ] Performance dashboard shows trends

### **After PROMPT 4 (Logging)**
- [ ] Structured logs capture all important events
- [ ] Logs are searchable and filterable
- [ ] Security events are properly logged
- [ ] Log retention policies implemented

### **After PROMPT 5 (Database)**
- [ ] Database performance metrics tracked
- [ ] Automated backups running daily
- [ ] Backup verification procedures in place
- [ ] Database health visible in dashboard

### **After PROMPT 6 (Dashboard)**
- [ ] Unified monitoring dashboard operational
- [ ] Real-time metrics updating correctly
- [ ] Alerts visible and manageable
- [ ] Reports can be generated and exported

---

## 🧪 **Testing Commands**

```bash
# Test health endpoints
curl http://localhost:3000/api/health
curl http://localhost:3001/api/health
curl http://localhost:3002/api/health

# Test error tracking
# Trigger intentional error and verify Sentry capture

# Test performance monitoring
# Load test pages and verify metrics collection

# Test backup system
./scripts/backup-database.sh

# Test monitoring dashboard
# Access /admin/monitoring and verify all widgets load
```

---

## 📁 **Related Files**

### **Configuration Files**
- `/apps/*/sentry.client.config.js`
- `/apps/*/sentry.server.config.js`
- `/apps/*/next.config.mjs` (Sentry integration)

### **Health Check Endpoints**
- `/apps/*/src/app/api/health/route.ts`

### **Monitoring Components**
- `/apps/admin/src/app/monitoring/page.tsx`
- `/apps/admin/src/components/monitoring/`

### **Utilities**
- `/packages/shared/src/lib/logger.ts`
- `/packages/shared/src/lib/monitoring.ts`
- `/scripts/backup-database.sh`

---

## 🚨 **Critical Alerts Configuration**

### **High Priority Alerts**
- Application down (health check fails)
- High error rate (>5% in 5 minutes)
- Database connectivity issues
- Performance degradation (>2s response time)

### **Medium Priority Alerts**
- Backup failures
- High memory usage (>80%)
- Slow query detection
- External service timeouts

### **Alert Channels**
- Email: admin@sasarjan.com
- Slack: #alerts channel
- SMS: For critical production issues

---

**📊 Comprehensive monitoring is essential for maintaining a reliable platform! 🔍**