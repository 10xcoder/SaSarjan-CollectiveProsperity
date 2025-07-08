# Module Sharing Patterns - SaSarjan App Store

**Created**: 05-Jul-2025  
**Version**: 1.0  
**Audience**: Platform developers, module creators, app builders

## Overview

This document outlines best practices and patterns for sharing modules between apps in the SaSarjan ecosystem. Effective module sharing enables rapid development, consistent user experience, and efficient maintenance.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Module Types & Sharing Strategies](#module-types--sharing-strategies)
3. [Implementation Patterns](#implementation-patterns)
4. [Customization Techniques](#customization-techniques)
5. [Communication Patterns](#communication-patterns)
6. [Data Sharing Patterns](#data-sharing-patterns)
7. [Security Considerations](#security-considerations)
8. [Performance Optimization](#performance-optimization)
9. [Real-World Examples](#real-world-examples)
10. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

## Core Principles

### 1. Design for Reusability

- Build modules with multiple use cases in mind
- Avoid hard-coding app-specific logic
- Use configuration over code changes

### 2. Maintain Loose Coupling

- Modules should be independent
- Use events and APIs for communication
- Avoid direct module dependencies

### 3. Enable Customization

- Provide configuration options
- Support theming and styling
- Allow behavior overrides

### 4. Ensure Backward Compatibility

- Version modules properly
- Deprecate gracefully
- Maintain stable APIs

## Module Types & Sharing Strategies

### 1. Core Modules (100% Shared)

These modules are identical across all apps:

```typescript
// @sasarjan/auth - Used by all apps
export const AuthModule = {
  // Same authentication flow everywhere
  login: async (credentials) => { /* ... */ },
  logout: async () => { /* ... */ },
  getUser: async () => { /* ... */ }
};
```

**Sharing Strategy**: Direct import, no modifications

### 2. Configurable Modules (80% Shared)

Modules with app-specific configuration:

```typescript
// @sasarjan/profile - Configured per app
export const ProfileModule = {
  config: {
    fields: ['name', 'email', 'bio'], // Base fields
    customFields: [], // App can add more
    validation: {}, // App-specific rules
    theme: {} // App branding
  }
};

// TalentExcel configuration
const talentExcelProfile = {
  ...ProfileModule,
  config: {
    ...ProfileModule.config,
    customFields: ['skills', 'experience', 'education'],
    validation: {
      skills: { required: true, min: 3 }
    }
  }
};
```

**Sharing Strategy**: Base module + configuration

### 3. Extended Modules (60% Shared)

Modules that add app-specific features:

```typescript
// Base messaging module
class BaseMessaging {
  sendMessage(to, message) { /* ... */ }
  getMessages() { /* ... */ }
}

// TalentExcel extends with interview scheduling
class TalentExcelMessaging extends BaseMessaging {
  scheduleInterview(candidateId, time) {
    const message = this.createInterviewInvite(time);
    return this.sendMessage(candidateId, message);
  }
}

// SevaPremi extends with volunteer coordination
class SevaPremiMessaging extends BaseMessaging {
  coordinateVolunteers(projectId, volunteers) {
    const message = this.createCoordinationMessage(projectId);
    return this.broadcastMessage(volunteers, message);
  }
}
```

**Sharing Strategy**: Inheritance/composition

### 4. Cloned Modules (40% Shared)

Modules copied and significantly modified:

```typescript
// Original: TalentExcel Job Board
const JobBoardModule = {
  schema: {
    job: { title, company, salary, requirements }
  },
  features: ['search', 'filter', 'apply']
};

// Cloned: 10xGrowth Startup Jobs
const StartupJobsModule = {
  schema: {
    job: {
      ...JobBoardModule.schema.job,
      equity_range,
      startup_stage,
      remote_policy
    }
  },
  features: [
    ...JobBoardModule.features,
    'equity_calculator',
    'founder_chat'
  ]
};
```

**Sharing Strategy**: Template + customization

## Implementation Patterns

### 1. Plugin Architecture Pattern

```typescript
// Core module with plugin system
class ContentModule {
  private plugins: Map<string, Plugin> = new Map();

  registerPlugin(name: string, plugin: Plugin) {
    this.plugins.set(name, plugin);
  }

  async processContent(content: Content) {
    // Core processing
    let processed = await this.coreProcess(content);

    // Apply plugins
    for (const plugin of this.plugins.values()) {
      if (plugin.canProcess(content)) {
        processed = await plugin.process(processed);
      }
    }

    return processed;
  }
}

// App-specific plugin
class TalentExcelContentPlugin implements Plugin {
  canProcess(content: Content) {
    return content.type === 'job_posting';
  }

  async process(content: Content) {
    // Add talent matching score
    content.matchScore = await this.calculateMatch(content);
    return content;
  }
}
```

### 2. Strategy Pattern for Behaviors

```typescript
// Define strategy interface
interface SearchStrategy {
  search(query: string, filters: any): Promise<Results>;
}

// Core search module
class SearchModule {
  constructor(private strategy: SearchStrategy) {}

  async performSearch(query: string, filters: any) {
    return this.strategy.search(query, filters);
  }
}

// App-specific strategies
class TalentSearchStrategy implements SearchStrategy {
  async search(query: string, filters: any) {
    // Search with skill matching, experience weighting
  }
}

class SevaSearchStrategy implements SearchStrategy {
  async search(query: string, filters: any) {
    // Search with location priority, cause matching
  }
}
```

### 3. Composition Over Inheritance

```typescript
// Composable module features
const withPagination = (Module) => ({
  ...Module,
  paginate(items, page, limit) {
    const start = (page - 1) * limit;
    return items.slice(start, start + limit);
  }
});

const withFiltering = (Module) => ({
  ...Module,
  filter(items, criteria) {
    return items.filter(item =>
      Object.entries(criteria).every(([key, value]) =>
        item[key] === value
      )
    );
  }
});

// Compose features as needed
const TalentExcelListModule = withPagination(withFiltering(BaseListModule));
const SevaPremiListModule = withFiltering(BaseListModule); // No pagination needed
```

### 4. Adapter Pattern for External Services

```typescript
// Generic payment interface
interface PaymentAdapter {
  processPayment(amount: number, currency: string): Promise<Transaction>;
  refund(transactionId: string): Promise<Refund>;
}

// Razorpay adapter for Indian apps
class RazorpayAdapter implements PaymentAdapter {
  async processPayment(amount: number, currency: string) {
    // Razorpay-specific implementation
  }
}

// PayPal adapter for international
class PayPalAdapter implements PaymentAdapter {
  async processPayment(amount: number, currency: string) {
    // PayPal-specific implementation
  }
}

// Module uses adapter
class PaymentModule {
  constructor(private adapter: PaymentAdapter) {}

  async charge(userId: string, amount: number) {
    const user = await this.getUser(userId);
    const currency = user.preferredCurrency;
    return this.adapter.processPayment(amount, currency);
  }
}
```

## Customization Techniques

### 1. Configuration-Driven Customization

```typescript
// Module with extensive configuration
export const FormModule = {
  create(config: FormConfig) {
    return {
      fields: config.fields || [],
      validation: config.validation || {},
      styling: config.styling || defaultStyles,
      behavior: config.behavior || defaultBehavior,

      render() {
        return this.fields.map(field =>
          this.renderField(field, this.styling)
        );
      }
    };
  }
};

// TalentExcel job application form
const jobApplicationForm = FormModule.create({
  fields: [
    { name: 'resume', type: 'file', required: true },
    { name: 'coverLetter', type: 'textarea' },
    { name: 'portfolio', type: 'url' }
  ],
  validation: {
    resume: { maxSize: '5MB', formats: ['pdf', 'docx'] }
  },
  styling: {
    theme: 'professional',
    primaryColor: '#2563eb'
  }
});
```

### 2. Hook-Based Customization

```typescript
// Module with customization hooks
class ModuleWithHooks {
  private hooks = new Map<string, Function[]>();

  registerHook(name: string, fn: Function) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }
    this.hooks.get(name)!.push(fn);
  }

  async executeHook(name: string, ...args: any[]) {
    const hookFns = this.hooks.get(name) || [];
    let result = args[0];

    for (const fn of hookFns) {
      result = await fn(result, ...args.slice(1)) || result;
    }

    return result;
  }

  async processData(data: any) {
    // Pre-processing hook
    data = await this.executeHook('beforeProcess', data);

    // Core processing
    const result = await this.coreProcess(data);

    // Post-processing hook
    return this.executeHook('afterProcess', result);
  }
}

// App-specific customization
talentExcelModule.registerHook('beforeProcess', async (data) => {
  // Add talent score
  data.talentScore = await calculateTalentScore(data);
  return data;
});
```

### 3. Theme and Style Customization

```typescript
// Themeable module
export const ThemedModule = {
  defaultTheme: {
    colors: {
      primary: '#000000',
      secondary: '#666666',
      background: '#ffffff'
    },
    spacing: {
      small: '8px',
      medium: '16px',
      large: '24px'
    },
    typography: {
      fontFamily: 'system-ui',
      fontSize: '16px'
    }
  },

  createWithTheme(theme: Partial<Theme>) {
    const mergedTheme = deepMerge(this.defaultTheme, theme);

    return {
      theme: mergedTheme,

      getStyles(component: string) {
        return generateStyles(component, this.theme);
      }
    };
  }
};

// App-specific themes
const talentExcelTheme = ThemedModule.createWithTheme({
  colors: {
    primary: '#2563eb',
    secondary: '#7c3aed'
  }
});
```

## Communication Patterns

### 1. Event Bus Pattern

```typescript
// Shared event bus
class ModuleEventBus {
  private listeners = new Map<string, Set<Function>>();

  on(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  emit(event: string, data: any) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
}

// Cross-module communication
const eventBus = new ModuleEventBus();

// Job module emits event
jobModule.onJobPosted((job) => {
  eventBus.emit('job:posted', job);
});

// Notification module listens
eventBus.on('job:posted', (job) => {
  notificationModule.notifyMatchingCandidates(job);
});

// Analytics module also listens
eventBus.on('job:posted', (job) => {
  analyticsModule.trackJobPosting(job);
});
```

### 2. Service Locator Pattern

```typescript
// Central service registry
class ServiceRegistry {
  private services = new Map<string, any>();

  register(name: string, service: any) {
    this.services.set(name, service);
  }

  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service as T;
  }
}

// Module registration
const registry = new ServiceRegistry();
registry.register('auth', authModule);
registry.register('profile', profileModule);
registry.register('messaging', messagingModule);

// Module usage
class JobApplicationModule {
  async submitApplication(jobId: string, applicationData: any) {
    // Get required services
    const auth = registry.get<AuthModule>('auth');
    const profile = registry.get<ProfileModule>('profile');
    const messaging = registry.get<MessagingModule>('messaging');

    // Use services
    const user = await auth.getCurrentUser();
    const userProfile = await profile.getProfile(user.id);

    // Process application
    const application = await this.createApplication({
      ...applicationData,
      userId: user.id,
      profile: userProfile
    });

    // Notify employer
    await messaging.sendMessage(
      application.employerId,
      `New application from ${userProfile.name}`
    );

    return application;
  }
}
```

### 3. Mediator Pattern

```typescript
// Module mediator for complex interactions
class ModuleMediator {
  private modules = new Map<string, Module>();

  register(name: string, module: Module) {
    this.modules.set(name, module);
    module.setMediator(this);
  }

  async request(from: string, to: string, action: string, data: any) {
    const targetModule = this.modules.get(to);
    if (!targetModule) {
      throw new Error(`Module ${to} not found`);
    }

    // Check permissions
    if (!this.canCommunicate(from, to, action)) {
      throw new Error(`Module ${from} cannot ${action} on ${to}`);
    }

    // Log interaction
    this.logInteraction(from, to, action);

    // Execute request
    return targetModule.handleRequest(action, data);
  }
}

// Module implementation
class ProfileModule {
  private mediator: ModuleMediator;

  setMediator(mediator: ModuleMediator) {
    this.mediator = mediator;
  }

  async getEnrichedProfile(userId: string) {
    // Get basic profile
    const profile = await this.getProfile(userId);

    // Request additional data from other modules
    const [jobs, volunteer] = await Promise.all([
      this.mediator.request('profile', 'jobs', 'getUserJobs', userId),
      this.mediator.request('profile', 'volunteer', 'getUserHours', userId)
    ]);

    return {
      ...profile,
      jobHistory: jobs,
      volunteerHours: volunteer
    };
  }
}
```

## Data Sharing Patterns

### 1. Shared Data Store

```typescript
// Centralized data store for cross-module data
class SharedDataStore {
  private stores = new Map<string, Map<string, any>>();

  getStore(namespace: string) {
    if (!this.stores.has(namespace)) {
      this.stores.set(namespace, new Map());
    }
    return this.stores.get(namespace)!;
  }

  set(namespace: string, key: string, value: any) {
    this.getStore(namespace).set(key, value);
    this.emit('data:changed', { namespace, key, value });
  }

  get(namespace: string, key: string) {
    return this.getStore(namespace).get(key);
  }

  subscribe(namespace: string, key: string, callback: Function) {
    this.on('data:changed', (event) => {
      if (event.namespace === namespace && event.key === key) {
        callback(event.value);
      }
    });
  }
}

// Module usage
const dataStore = new SharedDataStore();

// Profile module stores user data
profileModule.onProfileUpdate((userId, profile) => {
  dataStore.set('users', userId, profile);
});

// Job module subscribes to profile changes
dataStore.subscribe('users', userId, (profile) => {
  jobModule.updateCandidateProfile(userId, profile);
});
```

### 2. Data Transformation Pipeline

```typescript
// Data transformation for module compatibility
class DataTransformationPipeline {
  private transformers = new Map<string, Transformer>();

  registerTransformer(from: string, to: string, transformer: Transformer) {
    const key = `${from}->${to}`;
    this.transformers.set(key, transformer);
  }

  transform(data: any, from: string, to: string) {
    const key = `${from}->${to}`;
    const transformer = this.transformers.get(key);

    if (!transformer) {
      throw new Error(`No transformer found for ${key}`);
    }

    return transformer.transform(data);
  }
}

// Define transformers
const pipeline = new DataTransformationPipeline();

// Transform job data from TalentExcel to 10xGrowth format
pipeline.registerTransformer('talentexcel', '10xgrowth', {
  transform(job) {
    return {
      ...job,
      // TalentExcel has salary_range, 10xGrowth wants compensation
      compensation: {
        base: job.salary_range,
        equity: job.equity_offered || 'Not specified'
      },
      // Different field names
      requirements: job.qualifications,
      culture: job.company_culture || 'Startup environment'
    };
  }
});
```

### 3. Data Synchronization

```typescript
// Sync data between modules
class DataSynchronizer {
  private syncRules = new Map<string, SyncRule>();

  addSyncRule(name: string, rule: SyncRule) {
    this.syncRules.set(name, rule);
  }

  async sync() {
    for (const [name, rule] of this.syncRules) {
      try {
        const sourceData = await rule.source.getData();
        const transformedData = rule.transformer ?
          rule.transformer(sourceData) : sourceData;
        await rule.target.setData(transformedData);

        this.log(`Synced ${name}: ${sourceData.length} records`);
      } catch (error) {
        this.handleSyncError(name, error);
      }
    }
  }
}

// Define sync rules
const synchronizer = new DataSynchronizer();

// Sync volunteer hours to profile
synchronizer.addSyncRule('volunteer-to-profile', {
  source: volunteerModule,
  target: profileModule,
  transformer: (volunteerData) => ({
    totalHours: volunteerData.reduce((sum, v) => sum + v.hours, 0),
    projects: volunteerData.map(v => v.projectName)
  })
});
```

## Security Considerations

### 1. Module Isolation

```typescript
// Sandbox for module execution
class ModuleSandbox {
  async executeModule(module: Module, method: string, args: any[]) {
    // Check permissions
    if (!this.hasPermission(module, method)) {
      throw new Error('Permission denied');
    }

    // Create isolated context
    const context = this.createIsolatedContext(module);

    // Execute with timeout
    return this.executeWithTimeout(
      () => module[method].apply(context, args),
      module.timeout || 5000
    );
  }

  createIsolatedContext(module: Module) {
    return {
      // Limited API access
      api: this.createRestrictedAPI(module.permissions),
      // Scoped data access
      data: this.createScopedDataAccess(module.dataScope),
      // Rate limiting
      rateLimiter: this.createRateLimiter(module.rateLimit)
    };
  }
}
```

### 2. Permission Management

```typescript
// Fine-grained permissions
class ModulePermissionManager {
  private permissions = new Map<string, Set<string>>();

  grantPermission(moduleId: string, permission: string) {
    if (!this.permissions.has(moduleId)) {
      this.permissions.set(moduleId, new Set());
    }
    this.permissions.get(moduleId)!.add(permission);
  }

  checkPermission(moduleId: string, resource: string, action: string) {
    const permission = `${resource}:${action}`;
    const modulePerms = this.permissions.get(moduleId);

    return modulePerms?.has(permission) ||
           modulePerms?.has(`${resource}:*`) ||
           modulePerms?.has('*:*');
  }

  // Decorator for permission checking
  requiresPermission(resource: string, action: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;

      descriptor.value = async function(...args: any[]) {
        const moduleId = this.moduleId;

        if (!permissionManager.checkPermission(moduleId, resource, action)) {
          throw new Error(`Permission denied: ${resource}:${action}`);
        }

        return originalMethod.apply(this, args);
      };
    };
  }
}

// Usage in module
class UserDataModule {
  @requiresPermission('user', 'read')
  async getUserData(userId: string) {
    // Method implementation
  }

  @requiresPermission('user', 'write')
  async updateUserData(userId: string, data: any) {
    // Method implementation
  }
}
```

### 3. Data Access Control

```typescript
// Row-level security for shared data
class DataAccessControl {
  async canAccess(
    moduleId: string,
    resource: string,
    recordId: string,
    userId: string
  ) {
    // Check module permissions
    if (!this.hasModuleAccess(moduleId, resource)) {
      return false;
    }

    // Check user permissions
    if (!this.hasUserAccess(userId, resource, recordId)) {
      return false;
    }

    // Check data-specific rules
    return this.checkDataRules(resource, recordId, userId);
  }

  createSecureQuery(moduleId: string, userId: string) {
    return {
      where: (conditions: any) => ({
        ...conditions,
        // Automatically add access filters
        _access: {
          modules: { has: moduleId },
          users: { has: userId }
        }
      })
    };
  }
}
```

## Performance Optimization

### 1. Lazy Loading Modules

```typescript
// Lazy module loader
class LazyModuleLoader {
  private modules = new Map<string, Promise<Module>>();
  private loaded = new Map<string, Module>();

  register(name: string, loader: () => Promise<Module>) {
    this.modules.set(name, null);

    // Create lazy loader
    Object.defineProperty(this, name, {
      get: () => this.load(name, loader)
    });
  }

  async load(name: string, loader: () => Promise<Module>) {
    // Return if already loaded
    if (this.loaded.has(name)) {
      return this.loaded.get(name);
    }

    // Return existing promise if loading
    if (this.modules.get(name)) {
      return this.modules.get(name);
    }

    // Start loading
    const promise = loader();
    this.modules.set(name, promise);

    // Cache when loaded
    const module = await promise;
    this.loaded.set(name, module);

    return module;
  }
}

// Usage
const modules = new LazyModuleLoader();

modules.register('heavyAnalytics', () =>
  import('./modules/analytics').then(m => m.default)
);

// Module loads only when accessed
const analytics = await modules.heavyAnalytics;
```

### 2. Module Caching

```typescript
// Intelligent module caching
class ModuleCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;
  private ttl = 3600000; // 1 hour

  async get(key: string, factory: () => Promise<any>) {
    const entry = this.cache.get(key);

    // Check if cached and not expired
    if (entry && Date.now() - entry.timestamp < this.ttl) {
      entry.hits++;
      return entry.value;
    }

    // Generate new value
    const value = await factory();

    // Add to cache
    this.set(key, value);

    return value;
  }

  set(key: string, value: any) {
    // Evict least recently used if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0
    });
  }

  evictLRU() {
    let lruKey = null;
    let minHits = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
}
```

### 3. Batch Operations

```typescript
// Batch module operations for efficiency
class BatchOperationManager {
  private queues = new Map<string, any[]>();
  private timers = new Map<string, NodeJS.Timeout>();
  private batchSize = 100;
  private batchDelay = 100; // ms

  async add(operation: string, item: any) {
    if (!this.queues.has(operation)) {
      this.queues.set(operation, []);
    }

    this.queues.get(operation)!.push(item);

    // Process if batch size reached
    if (this.queues.get(operation)!.length >= this.batchSize) {
      return this.processBatch(operation);
    }

    // Schedule batch processing
    this.scheduleBatch(operation);
  }

  scheduleBatch(operation: string) {
    // Clear existing timer
    if (this.timers.has(operation)) {
      clearTimeout(this.timers.get(operation)!);
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.processBatch(operation);
    }, this.batchDelay);

    this.timers.set(operation, timer);
  }

  async processBatch(operation: string) {
    const items = this.queues.get(operation) || [];
    if (items.length === 0) return;

    // Clear queue
    this.queues.set(operation, []);

    // Process batch
    return this.executeBatch(operation, items);
  }
}
```

## Real-World Examples

### Example 1: Job Posting Module Sharing

```typescript
// Base job posting module used by TalentExcel
const BaseJobPostingModule = {
  schema: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    company: { type: 'string', required: true },
    location: { type: 'string' },
    salary_range: { type: 'object' },
    requirements: { type: 'array' }
  },

  async createJob(data: JobData) {
    // Validate against schema
    const validated = await this.validate(data);

    // Create job
    const job = await db.jobs.create(validated);

    // Index for search
    await searchIndex.index('jobs', job);

    // Emit event
    eventBus.emit('job:created', job);

    return job;
  }
};

// 10xGrowth clones and extends for startups
const StartupJobModule = {
  ...BaseJobPostingModule,

  schema: {
    ...BaseJobPostingModule.schema,
    // Add startup-specific fields
    equity_range: { type: 'object' },
    startup_stage: { type: 'string', enum: ['seed', 'seriesA', 'seriesB'] },
    remote_policy: { type: 'string' },
    culture_values: { type: 'array' }
  },

  async createJob(data: StartupJobData) {
    // Add startup defaults
    const enriched = {
      ...data,
      perks: data.perks || ['equity', 'flexible hours', 'remote'],
      growth_opportunity: true
    };

    // Use base creation
    const job = await BaseJobPostingModule.createJob.call(this, enriched);

    // Additional startup processing
    await this.calculateEquityValue(job);
    await this.matchWithFounders(job);

    return job;
  }
};
```

### Example 2: Impact Tracking Module Cloning

```typescript
// SevaPremi's impact tracking module
const VolunteerImpactModule = {
  metrics: {
    hours_contributed: 'number',
    people_helped: 'number',
    projects_completed: 'number',
    skills_shared: 'array'
  },

  async trackImpact(volunteerId: string, activity: Activity) {
    const impact = {
      volunteer_id: volunteerId,
      activity_type: activity.type,
      hours: activity.duration,
      beneficiaries: activity.beneficiaryCount,
      location: activity.location,
      date: new Date()
    };

    await db.impacts.create(impact);
    await this.updateVolunteerStats(volunteerId, impact);

    return impact;
  }
};

// TalentExcel adapts for CSR tracking
const CSRImpactModule = {
  ...VolunteerImpactModule,

  metrics: {
    ...VolunteerImpactModule.metrics,
    // Add corporate-specific metrics
    employee_participation: 'percentage',
    business_hours_contributed: 'number',
    sdg_alignment: 'array',
    cost_savings: 'number'
  },

  async trackImpact(employeeId: string, activity: CSRActivity) {
    // Track as volunteer impact
    const impact = await VolunteerImpactModule.trackImpact.call(
      this,
      employeeId,
      activity
    );

    // Add corporate tracking
    await this.updateCompanyCSR(activity.companyId, impact);
    await this.generateCSRReport(activity.companyId);

    // Link to employee profile
    await this.linkToEmployeeRecord(employeeId, impact);

    return impact;
  }
};
```

### Example 3: Messaging Module Variations

```typescript
// Shared messaging core
class BaseMessagingModule {
  async sendMessage(from: string, to: string, content: string) {
    const message = {
      id: generateId(),
      from,
      to,
      content,
      timestamp: new Date(),
      read: false
    };

    await db.messages.create(message);
    await this.notifyRecipient(to, message);

    return message;
  }

  async getConversation(user1: string, user2: string) {
    return db.messages.find({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 }
      ]
    }).sort({ timestamp: -1 });
  }
}

// TalentExcel adds interview scheduling
class TalentMessagingModule extends BaseMessagingModule {
  async sendInterviewInvite(
    recruiterId: string,
    candidateId: string,
    details: InterviewDetails
  ) {
    // Create structured message
    const content = this.formatInterviewInvite(details);

    // Send message
    const message = await this.sendMessage(recruiterId, candidateId, content);

    // Create calendar event
    await this.createCalendarEvent(details);

    // Set reminder
    await this.scheduleReminder(message.id, details.datetime);

    return message;
  }
}

// SevaPremi adds volunteer coordination
class SevaMessagingModule extends BaseMessagingModule {
  async broadcastToVolunteers(
    coordinatorId: string,
    projectId: string,
    announcement: string
  ) {
    // Get project volunteers
    const volunteers = await this.getProjectVolunteers(projectId);

    // Send to all with rate limiting
    const messages = await this.batchSend(
      volunteers.map(v => ({
        from: coordinatorId,
        to: v.id,
        content: announcement,
        metadata: { project_id: projectId, type: 'broadcast' }
      }))
    );

    // Track engagement
    await this.trackBroadcastEngagement(messages);

    return messages;
  }
}
```

## Anti-Patterns to Avoid

### 1. ❌ Tight Coupling Between Modules

```typescript
// BAD: Direct module dependencies
class JobModule {
  constructor() {
    // Directly importing other modules
    this.profileModule = new ProfileModule();
    this.messagingModule = new MessagingModule();
  }

  async applyForJob(jobId: string) {
    // Tight coupling to specific implementations
    const profile = this.profileModule.getProfile();
    this.messagingModule.sendMessage(...);
  }
}

// GOOD: Use dependency injection
class JobModule {
  constructor(
    private profileService: ProfileService,
    private messagingService: MessagingService
  ) {}

  async applyForJob(jobId: string) {
    // Work with interfaces, not implementations
    const profile = await this.profileService.getProfile();
    await this.messagingService.sendMessage(...);
  }
}
```

### 2. ❌ Modifying Core Modules Directly

```typescript
// BAD: Modifying shared module
ProfileModule.prototype.addCustomField = function() {
  // This affects all apps!
  this.fields.push('customField');
};

// GOOD: Extend or configure
const ExtendedProfileModule = {
  ...ProfileModule,
  fields: [...ProfileModule.fields, 'customField']
};
```

### 3. ❌ Assuming Module Availability

```typescript
// BAD: Assuming module exists
const result = await SomeModule.doSomething();

// GOOD: Check availability
if (moduleRegistry.has('SomeModule')) {
  const module = moduleRegistry.get('SomeModule');
  const result = await module.doSomething();
} else {
  // Graceful fallback
  const result = await this.handleMissingModule();
}
```

### 4. ❌ Circular Dependencies

```typescript
// BAD: Modules depend on each other
// ProfileModule → JobModule → ProfileModule

// GOOD: Use events or mediator
eventBus.on('profile:updated', (profile) => {
  jobModule.updateCandidateProfile(profile);
});

eventBus.on('job:applied', (application) => {
  profileModule.addApplication(application);
});
```

### 5. ❌ Global State Pollution

```typescript
// BAD: Modules modify global state
window.appState.userData = userData;

// GOOD: Use scoped state management
class ModuleStateManager {
  private state = new Map();

  setState(moduleId: string, key: string, value: any) {
    const moduleState = this.state.get(moduleId) || {};
    moduleState[key] = value;
    this.state.set(moduleId, moduleState);
  }
}
```

## Best Practices Summary

1. **Design for Reusability** - Think beyond single app use
2. **Use Composition** - Prefer composition over inheritance
3. **Follow Conventions** - Consistent naming and structure
4. **Document Interfaces** - Clear API documentation
5. **Version Carefully** - Semantic versioning for modules
6. **Test Integrations** - Test module combinations
7. **Monitor Performance** - Track module impact
8. **Secure by Default** - Assume zero trust between modules
9. **Graceful Degradation** - Handle missing modules
10. **Measure Success** - Track module usage and value

---

**Next Steps**:

- Review [Multi-App Development Plan](../plan/multi-app-development-plan.md)
- Check [Module Architecture](./Modular_Apps_Architecture.md)
- Join developer community for support
