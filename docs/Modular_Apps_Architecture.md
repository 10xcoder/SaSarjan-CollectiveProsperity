# Modular Apps Architecture

**Created: 04-Jul-25**

## Table of Contents

1. [Overview](#overview)
2. [Architecture Design](#architecture-design)
3. [Module Types](#module-types)
4. [Implementation Framework](#implementation-framework)
5. [Module Development](#module-development)
6. [Module Management](#module-management)
7. [Integration Patterns](#integration-patterns)
8. [Security & Permissions](#security--permissions)
9. [Real-World Examples](#real-world-examples)

## Overview

The Modular Apps Architecture enables developers to create sophisticated, multi-faceted applications within the SaSarjan App Store by composing smaller, focused modules. This approach promotes code reusability, easier maintenance, and flexible customization for different user needs.

### Key Benefits

- **Flexible Composition**: Mix and match modules to create tailored experiences
- **Independent Updates**: Update modules without affecting the entire app
- **User Choice**: Users can enable/disable modules based on their needs
- **Revenue Optimization**: Offer premium modules as paid add-ons
- **Faster Development**: Reuse modules across different apps
- **Better Performance**: Load only necessary modules

### Core Concepts

```typescript
interface ModularApp {
  // Main app container
  core: {
    id: string;
    name: string;
    baseUrl: string;
    configuration: AppConfig;
  };

  // Installable modules
  modules: AppModule[];

  // Module orchestration
  orchestrator: ModuleOrchestrator;

  // Shared services
  services: {
    auth: AuthService;
    data: DataService;
    navigation: NavigationService;
    theme: ThemeService;
  };
}
```

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Main App Shell                        │
│                    (talentexcel.com)                        │
├─────────────────────────────────────────────────────────────┤
│                    Module Orchestrator                       │
│          (Module Loading, Routing, Communication)           │
├────────────────┬────────────────┬────────────────┬─────────┤
│  Core Module   │ Internships    │  Fellowships   │Learning │
│  - Auth        │  Module        │    Module      │Journeys │
│  - Dashboard   │ - Browse       │  - Programs    │ - Paths │
│  - Profile     │ - Apply        │  - Apply       │ - Track │
│  - Settings    │ - Track        │  - Mentorship  │ - Cert  │
├────────────────┴────────────────┴────────────────┴─────────┤
│                     Shared Services Layer                    │
│         (Data, Auth, Notifications, Analytics)              │
├─────────────────────────────────────────────────────────────┤
│                      Platform APIs                           │
│              (App Store APIs, Payment, Storage)             │
└─────────────────────────────────────────────────────────────┘
```

### Module Communication

```typescript
// Event-based communication between modules
interface ModuleCommunication {
  // Module events
  events: {
    emit(event: string, data: any): void;
    on(event: string, handler: EventHandler): void;
    off(event: string, handler: EventHandler): void;
  };

  // Shared state
  state: {
    get(key: string): any;
    set(key: string, value: any): void;
    subscribe(key: string, callback: StateCallback): void;
  };

  // Module messaging
  messaging: {
    send(targetModule: string, message: Message): void;
    receive(handler: MessageHandler): void;
  };
}

// Example usage
class InternshipModule extends BaseModule {
  onApplicationSubmit(applicationData: any) {
    // Notify other modules
    this.events.emit('internship:application:submitted', {
      internshipId: applicationData.id,
      userId: this.currentUser.id
    });

    // Update shared state
    this.state.set('activeApplications',
      [...this.state.get('activeApplications'), applicationData.id]
    );

    // Send message to dashboard
    this.messaging.send('core', {
      type: 'notification',
      title: 'Application Submitted',
      body: `Your application for ${applicationData.title} has been submitted`
    });
  }
}
```

## Module Types

### 1. Feature Modules

```typescript
interface FeatureModule {
  type: 'feature';

  // Module capabilities
  features: {
    routes: RouteDefinition[];
    components: ComponentMap;
    services: ServiceMap;
    stores: StoreMap;
  };

  // Module lifecycle
  lifecycle: {
    onInstall(): Promise<void>;
    onEnable(): Promise<void>;
    onDisable(): Promise<void>;
    onUninstall(): Promise<void>;
  };
}

// Example: Internship module
const internshipModule: FeatureModule = {
  type: 'feature',
  metadata: {
    name: 'Internships',
    version: '2.1.0',
    description: 'Browse and apply for internships'
  },
  features: {
    routes: [
      { path: '/internships', component: 'InternshipList' },
      { path: '/internships/:id', component: 'InternshipDetail' },
      { path: '/internships/apply/:id', component: 'InternshipApply' }
    ],
    components: {
      InternshipList: lazy(() => import('./InternshipList')),
      InternshipDetail: lazy(() => import('./InternshipDetail')),
      InternshipApply: lazy(() => import('./InternshipApply'))
    },
    services: {
      internshipApi: new InternshipApiService(),
      applicationTracker: new ApplicationTracker()
    }
  }
};
```

### 2. Content Modules

```typescript
interface ContentModule {
  type: 'content';

  // Content management
  content: {
    collections: ContentCollection[];
    templates: ContentTemplate[];
    renderers: ContentRenderer[];
  };

  // Content delivery
  delivery: {
    cdn: CDNConfig;
    caching: CacheStrategy;
    personalization: PersonalizationRules;
  };
}

// Example: Learning content module
const learningContentModule: ContentModule = {
  type: 'content',
  metadata: {
    name: 'Learning Resources',
    version: '1.0.0'
  },
  content: {
    collections: [
      {
        name: 'courses',
        schema: courseSchema,
        permissions: ['read:public', 'write:instructor']
      },
      {
        name: 'lessons',
        schema: lessonSchema,
        permissions: ['read:enrolled', 'write:instructor']
      }
    ],
    templates: [
      { name: 'course-card', component: CourseCard },
      { name: 'lesson-player', component: LessonPlayer }
    ]
  }
};
```

### 3. Service Modules

```typescript
interface ServiceModule {
  type: 'service';

  // Service definition
  service: {
    api: APIDefinition;
    handlers: HandlerMap;
    middleware: Middleware[];
  };

  // Service configuration
  config: {
    endpoints: EndpointConfig[];
    rateLimit: RateLimitConfig;
    authentication: AuthConfig;
  };
}

// Example: Analytics service module
const analyticsModule: ServiceModule = {
  type: 'service',
  metadata: {
    name: 'Analytics Service',
    version: '1.2.0'
  },
  service: {
    api: {
      track: (event: AnalyticsEvent) => Promise<void>;
      query: (params: QueryParams) => Promise<AnalyticsData>;
      export: (format: ExportFormat) => Promise<Blob>;
    },
    handlers: {
      '/api/analytics/track': trackHandler,
      '/api/analytics/query': queryHandler,
      '/api/analytics/export': exportHandler
    }
  }
};
```

### 4. Integration Modules

```typescript
interface IntegrationModule {
  type: 'integration';

  // External service integration
  integration: {
    provider: string;
    config: IntegrationConfig;
    methods: IntegrationMethod[];
  };

  // Data mapping
  mapping: {
    incoming: DataTransformer;
    outgoing: DataTransformer;
    sync: SyncStrategy;
  };
}

// Example: Calendar integration module
const calendarIntegration: IntegrationModule = {
  type: 'integration',
  metadata: {
    name: 'Google Calendar Integration',
    version: '1.0.0'
  },
  integration: {
    provider: 'google-calendar',
    config: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      scopes: ['calendar.events.read', 'calendar.events.write']
    },
    methods: [
      {
        name: 'syncEvents',
        handler: async (params) => {
          // Sync internship deadlines to calendar
        }
      }
    ]
  }
};
```

### 5. Extension Modules

```typescript
interface ExtensionModule {
  type: 'extension';

  // Extension points
  extends: {
    target: string; // Module to extend
    hooks: HookDefinition[];
    overrides: OverrideMap;
  };

  // Extension behavior
  behavior: {
    priority: number;
    conflicts: string[]; // Incompatible extensions
  };
}

// Example: Advanced filtering extension
const advancedFilterExtension: ExtensionModule = {
  type: 'extension',
  metadata: {
    name: 'Advanced Filters',
    version: '1.0.0'
  },
  extends: {
    target: 'internships',
    hooks: [
      {
        hook: 'beforeSearch',
        handler: (params) => ({
          ...params,
          enableAdvancedFilters: true
        })
      }
    ],
    overrides: {
      'SearchComponent': EnhancedSearchComponent
    }
  }
};
```

## Implementation Framework

### Module Loader

```typescript
class ModuleLoader {
  private loadedModules = new Map<string, LoadedModule>();
  private moduleGraph = new DependencyGraph();

  async loadModule(moduleId: string): Promise<AppModule> {
    // Check if already loaded
    if (this.loadedModules.has(moduleId)) {
      return this.loadedModules.get(moduleId)!.instance;
    }

    // Load module manifest
    const manifest = await this.fetchManifest(moduleId);

    // Validate dependencies
    await this.validateDependencies(manifest);

    // Load dependencies first
    await this.loadDependencies(manifest.dependencies);

    // Load module code
    const moduleCode = await this.loadModuleCode(manifest);

    // Initialize module
    const instance = await this.initializeModule(moduleCode, manifest);

    // Cache loaded module
    this.loadedModules.set(moduleId, {
      manifest,
      instance,
      status: 'loaded'
    });

    return instance;
  }

  private async loadModuleCode(manifest: ModuleManifest): Promise<any> {
    if (manifest.loadStrategy === 'lazy') {
      // Dynamic import for code splitting
      return import(/* webpackChunkName: "[request]" */ manifest.entryPoint);
    } else if (manifest.loadStrategy === 'prefetch') {
      // Prefetch but don't execute
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = manifest.bundleUrl;
      document.head.appendChild(link);

      // Load when needed
      return import(manifest.entryPoint);
    } else {
      // Eager loading
      return require(manifest.entryPoint);
    }
  }
}
```

### Module Registry

```typescript
class ModuleRegistry {
  private registry = new Map<string, ModuleRegistration>();

  async register(module: AppModule): Promise<void> {
    // Validate module
    const validation = await this.validateModule(module);
    if (!validation.valid) {
      throw new ModuleValidationError(validation.errors);
    }

    // Check for conflicts
    const conflicts = this.checkConflicts(module);
    if (conflicts.length > 0) {
      throw new ModuleConflictError(conflicts);
    }

    // Register module
    this.registry.set(module.id, {
      module,
      registeredAt: new Date(),
      status: 'registered'
    });

    // Register routes
    if (module.routes) {
      await this.registerRoutes(module.id, module.routes);
    }

    // Register services
    if (module.services) {
      await this.registerServices(module.id, module.services);
    }

    // Emit registration event
    this.emit('module:registered', { moduleId: module.id });
  }

  async discover(): Promise<DiscoveredModule[]> {
    // Scan for available modules
    const discovered = await Promise.all([
      this.scanLocalModules(),
      this.scanRemoteModules(),
      this.scanUserModules()
    ]);

    return discovered.flat();
  }
}
```

### Module Orchestrator

```typescript
class ModuleOrchestrator {
  private modules = new Map<string, AppModule>();
  private eventBus = new EventBus();
  private stateManager = new StateManager();

  async initialize(config: OrchestratorConfig): Promise<void> {
    // Load core module first
    const core = await this.loadModule(config.coreModuleId);
    await this.initializeCore(core);

    // Load enabled modules
    const enabledModules = await this.getEnabledModules();
    await this.loadModules(enabledModules);

    // Set up inter-module communication
    this.setupCommunication();

    // Initialize routing
    this.initializeRouting();
  }

  private setupCommunication(): void {
    // Set up event bus
    this.modules.forEach((module, id) => {
      module.events = {
        emit: (event, data) => this.eventBus.emit(`${id}:${event}`, data),
        on: (event, handler) => this.eventBus.on(event, handler),
        off: (event, handler) => this.eventBus.off(event, handler)
      };

      // Set up state management
      module.state = {
        get: (key) => this.stateManager.get(`${id}:${key}`),
        set: (key, value) => this.stateManager.set(`${id}:${key}`, value),
        subscribe: (key, callback) => this.stateManager.subscribe(`${id}:${key}`, callback)
      };
    });
  }

  async enableModule(moduleId: string, userId: string): Promise<void> {
    const module = await this.loadModule(moduleId);

    // Check permissions
    if (!await this.checkPermissions(module, userId)) {
      throw new PermissionError('Insufficient permissions');
    }

    // Enable module
    await module.lifecycle.onEnable();

    // Update user configuration
    await this.updateUserModules(userId, moduleId, 'enabled');

    // Refresh UI
    this.eventBus.emit('module:enabled', { moduleId });
  }
}
```

## Module Development

### Module Structure

```
internship-module/
├── manifest.json          # Module metadata and configuration
├── package.json          # Dependencies
├── src/
│   ├── index.ts         # Module entry point
│   ├── routes/          # Route definitions
│   ├── components/      # React components
│   ├── services/        # Business logic
│   ├── stores/          # State management
│   └── hooks/           # Custom hooks
├── assets/              # Static assets
├── locales/             # Translations
└── tests/               # Module tests
```

### Module Manifest

```json
{
  "id": "internships",
  "name": "Internships Module",
  "version": "2.1.0",
  "description": "Browse and apply for internship opportunities",
  "author": "TalentExcel Team",
  "license": "MIT",

  "type": "feature",
  "category": "career",

  "parent": "talentexcel",
  "dependencies": {
    "core": "^1.0.0",
    "auth": "^1.0.0",
    "notifications": "^1.0.0"
  },

  "permissions": [
    "user.profile.read",
    "application.create",
    "application.read"
  ],

  "configuration": {
    "maxApplications": 10,
    "requireProfile": true,
    "enableNotifications": true
  },

  "routes": [
    {
      "path": "/internships",
      "name": "internships.list",
      "component": "InternshipList",
      "permissions": ["public"]
    },
    {
      "path": "/internships/:id",
      "name": "internships.detail",
      "component": "InternshipDetail",
      "permissions": ["public"]
    },
    {
      "path": "/internships/apply/:id",
      "name": "internships.apply",
      "component": "InternshipApply",
      "permissions": ["authenticated"]
    }
  ],

  "navigation": [
    {
      "id": "internships",
      "label": "Internships",
      "icon": "briefcase",
      "path": "/internships",
      "order": 2
    }
  ],

  "hooks": {
    "install": "hooks/install.js",
    "uninstall": "hooks/uninstall.js",
    "update": "hooks/update.js"
  }
}
```

### Module API

```typescript
// Base module class
abstract class BaseModule implements AppModule {
  protected config: ModuleConfig;
  protected services: ServiceContainer;
  protected eventBus: EventBus;

  constructor(config: ModuleConfig) {
    this.config = config;
    this.services = new ServiceContainer();
    this.eventBus = new EventBus();
  }

  // Lifecycle methods
  abstract async onInstall(): Promise<void>;
  abstract async onEnable(): Promise<void>;
  abstract async onDisable(): Promise<void>;
  abstract async onUninstall(): Promise<void>;

  // Module communication
  protected emit(event: string, data: any): void {
    this.eventBus.emit(event, data);
  }

  protected on(event: string, handler: EventHandler): void {
    this.eventBus.on(event, handler);
  }

  // Service registration
  protected registerService(name: string, service: any): void {
    this.services.register(name, service);
  }

  protected getService<T>(name: string): T {
    return this.services.get<T>(name);
  }
}

// Example implementation
export class InternshipModule extends BaseModule {
  async onInstall(): Promise<void> {
    // Create database tables
    await this.createTables();

    // Register services
    this.registerService('api', new InternshipAPI());
    this.registerService('search', new InternshipSearch());

    // Set up event listeners
    this.on('user:profile:updated', this.onProfileUpdate.bind(this));
  }

  async onEnable(): Promise<void> {
    // Load user preferences
    const prefs = await this.loadUserPreferences();

    // Initialize UI
    await this.initializeUI(prefs);

    // Start background tasks
    this.startBackgroundTasks();
  }

  private async createTables(): Promise<void> {
    await this.db.schema.createTable('internships', (table) => {
      table.uuid('id').primary();
      table.string('title').notNullable();
      table.text('description');
      table.string('company').notNullable();
      table.string('location');
      table.decimal('stipend');
      table.date('deadline');
      table.timestamps(true, true);
    });
  }
}
```

## Module Management

### User Module Management

```typescript
class UserModuleManager {
  async getUserModules(userId: string): Promise<UserModule[]> {
    const modules = await this.db.userAppModules.findMany({
      where: { user_id: userId },
      include: {
        module: {
          include: {
            parent_app: true
          }
        }
      }
    });

    return modules.map(this.mapToUserModule);
  }

  async installModule(userId: string, moduleId: string): Promise<void> {
    // Check if module exists
    const module = await this.getModule(moduleId);
    if (!module) {
      throw new NotFoundError('Module not found');
    }

    // Check permissions
    if (module.requires_subscription) {
      await this.checkSubscription(userId, module.parent_app_id);
    }

    // Check dependencies
    await this.checkDependencies(userId, module.dependencies);

    // Install module
    await this.db.userAppModules.create({
      data: {
        user_id: userId,
        app_module_id: moduleId,
        enabled: true,
        user_config: module.default_config || {}
      }
    });

    // Run installation hook
    await this.runInstallHook(module, userId);
  }

  async configureModule(
    userId: string,
    moduleId: string,
    config: any
  ): Promise<void> {
    // Validate configuration
    const module = await this.getModule(moduleId);
    const validation = await this.validateConfig(config, module.config_schema);

    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    // Update configuration
    await this.db.userAppModules.update({
      where: { user_id_app_module_id: { userId, moduleId } },
      data: { user_config: config }
    });

    // Notify module of config change
    this.eventBus.emit('module:config:updated', {
      userId,
      moduleId,
      config
    });
  }
}
```

### Module Marketplace

```typescript
interface ModuleMarketplace {
  // Browse modules
  browse(filters: ModuleFilters): Promise<ModuleListing[]>;
  search(query: string): Promise<ModuleListing[]>;
  getCategories(): Promise<ModuleCategory[]>;
  getFeatured(): Promise<ModuleListing[]>;

  // Module details
  getDetails(moduleId: string): Promise<ModuleDetail>;
  getReviews(moduleId: string): Promise<Review[]>;
  getScreenshots(moduleId: string): Promise<Screenshot[]>;

  // Installation
  checkCompatibility(moduleId: string, appId: string): Promise<CompatibilityResult>;
  getPrice(moduleId: string, userId: string): Promise<Price>;
  purchase(moduleId: string, userId: string): Promise<PurchaseResult>;
}

class ModuleMarketplaceService implements ModuleMarketplace {
  async browse(filters: ModuleFilters): Promise<ModuleListing[]> {
    const query = this.buildQuery(filters);

    const modules = await this.db.appModules.findMany({
      where: query,
      include: {
        parent_app: true,
        tags: { include: { tag: true } },
        _count: { select: { installations: true } }
      },
      orderBy: this.getOrderBy(filters.sort)
    });

    return modules.map(this.mapToListing);
  }

  async checkCompatibility(
    moduleId: string,
    appId: string
  ): Promise<CompatibilityResult> {
    const module = await this.getModule(moduleId);
    const app = await this.getApp(appId);

    const issues = [];

    // Check version compatibility
    if (!this.isVersionCompatible(module.min_app_version, app.version)) {
      issues.push({
        type: 'version',
        message: `Requires app version ${module.min_app_version} or higher`
      });
    }

    // Check dependency conflicts
    const conflicts = await this.checkDependencyConflicts(module, app);
    issues.push(...conflicts);

    // Check resource requirements
    if (module.resource_requirements) {
      const resourceIssues = this.checkResources(module.resource_requirements);
      issues.push(...resourceIssues);
    }

    return {
      compatible: issues.length === 0,
      issues
    };
  }
}
```

## Integration Patterns

### Module Communication Patterns

```typescript
// 1. Event-driven pattern
class EventDrivenPattern {
  // Publisher module
  class PublisherModule extends BaseModule {
    async processApplication(application: Application) {
      // Process application
      const result = await this.applicationService.process(application);

      // Publish event
      this.emit('application:processed', {
        applicationId: application.id,
        status: result.status,
        metadata: result.metadata
      });
    }
  }

  // Subscriber module
  class SubscriberModule extends BaseModule {
    async onEnable() {
      // Subscribe to events
      this.on('application:processed', async (data) => {
        if (data.status === 'accepted') {
          await this.sendCongratulations(data.applicationId);
        }
      });
    }
  }
}

// 2. Service-oriented pattern
class ServiceOrientedPattern {
  // Service provider module
  class NotificationModule extends BaseModule {
    async onInstall() {
      this.registerService('notifications', {
        send: this.sendNotification.bind(this),
        schedule: this.scheduleNotification.bind(this),
        cancel: this.cancelNotification.bind(this)
      });
    }
  }

  // Service consumer module
  class InternshipModule extends BaseModule {
    async notifyDeadline(internshipId: string) {
      const notifications = this.getService<NotificationService>('notifications');

      await notifications.schedule({
        type: 'deadline_reminder',
        recipient: this.currentUser.id,
        data: { internshipId },
        sendAt: this.getDeadlineDate(internshipId)
      });
    }
  }
}

// 3. Shared state pattern
class SharedStatePattern {
  // State provider module
  class UserProfileModule extends BaseModule {
    async updateProfile(updates: ProfileUpdate) {
      const newProfile = await this.profileService.update(updates);

      // Update shared state
      this.state.set('userProfile', newProfile);

      // Notify subscribers
      this.state.notify('userProfile', newProfile);
    }
  }

  // State consumer module
  class ApplicationModule extends BaseModule {
    async onEnable() {
      // Subscribe to profile changes
      this.state.subscribe('userProfile', (profile) => {
        this.updateApplicationForms(profile);
      });
    }
  }
}
```

### Module Composition Patterns

```typescript
// 1. Hierarchical composition
class HierarchicalComposition {
  // Parent module
  class TalentExcelApp extends BaseModule {
    async onInstall() {
      // Define child modules
      this.childModules = [
        'internships',
        'fellowships',
        'learning-journeys',
        'mentorship'
      ];

      // Install core features
      await this.installCoreFeatures();
    }

    async enableChildModule(moduleId: string) {
      // Ensure parent context
      const childModule = await this.loadModule(moduleId);
      childModule.setParentContext(this.context);

      // Enable with parent services
      await childModule.enable();
    }
  }
}

// 2. Plugin pattern
class PluginPattern {
  interface Plugin {
    name: string;
    version: string;
    hooks: PluginHooks;
  }

  class ExtensibleModule extends BaseModule {
    private plugins: Plugin[] = [];

    async registerPlugin(plugin: Plugin) {
      // Validate plugin
      await this.validatePlugin(plugin);

      // Register hooks
      Object.entries(plugin.hooks).forEach(([hook, handler]) => {
        this.registerHook(hook, handler);
      });

      this.plugins.push(plugin);
    }

    async executeHook(hookName: string, context: any) {
      const handlers = this.getHookHandlers(hookName);

      // Execute in order
      for (const handler of handlers) {
        context = await handler(context) || context;
      }

      return context;
    }
  }
}

// 3. Adapter pattern
class AdapterPattern {
  // Generic interface
  interface DataProvider {
    fetch(query: Query): Promise<Data>;
    save(data: Data): Promise<void>;
  }

  // Adapter for specific data source
  class SupabaseAdapter implements DataProvider {
    async fetch(query: Query): Promise<Data> {
      const supabaseQuery = this.translateQuery(query);
      const result = await supabase.from(query.table).select(supabaseQuery);
      return this.translateResult(result);
    }
  }

  // Module using adapter
  class DataModule extends BaseModule {
    constructor(private dataProvider: DataProvider) {
      super();
    }

    async getData(query: Query) {
      // Works with any data provider
      return this.dataProvider.fetch(query);
    }
  }
}
```

## Security & Permissions

### Module Permissions

```typescript
interface ModulePermissions {
  // Resource permissions
  resources: {
    [resource: string]: Permission[];
  };

  // API permissions
  api: {
    [endpoint: string]: Permission[];
  };

  // UI permissions
  ui: {
    [component: string]: Permission[];
  };

  // Data permissions
  data: {
    read: string[];
    write: string[];
    delete: string[];
  };
}

class ModulePermissionManager {
  async checkPermission(
    moduleId: string,
    userId: string,
    permission: string
  ): Promise<boolean> {
    // Get user's role and permissions
    const userPermissions = await this.getUserPermissions(userId);

    // Get module's required permissions
    const modulePermissions = await this.getModulePermissions(moduleId);

    // Check if user has permission
    return this.hasPermission(userPermissions, permission) ||
           this.hasWildcardPermission(userPermissions, permission);
  }

  async grantModuleAccess(
    userId: string,
    moduleId: string,
    permissions: string[]
  ): Promise<void> {
    // Validate permissions
    const validPermissions = await this.validatePermissions(permissions, moduleId);

    // Grant permissions
    await this.db.userModulePermissions.createMany({
      data: validPermissions.map(permission => ({
        user_id: userId,
        module_id: moduleId,
        permission,
        granted_at: new Date()
      }))
    });
  }
}
```

### Module Isolation

```typescript
class ModuleIsolation {
  // Sandbox for module execution
  class ModuleSandbox {
    private context: SandboxContext;

    async execute(module: AppModule, method: string, ...args: any[]) {
      // Create isolated context
      this.context = this.createContext(module);

      // Apply restrictions
      this.applyRestrictions(module.permissions);

      try {
        // Execute in sandbox
        return await this.runInSandbox(() => {
          return module[method](...args);
        });
      } finally {
        // Cleanup
        this.cleanup();
      }
    }

    private applyRestrictions(permissions: Permission[]) {
      // Network restrictions
      if (!permissions.includes('network:external')) {
        this.context.fetch = this.restrictedFetch;
      }

      // Storage restrictions
      if (!permissions.includes('storage:write')) {
        this.context.localStorage = this.readOnlyStorage;
      }

      // API restrictions
      this.context.api = this.createRestrictedAPI(permissions);
    }
  }
}
```

### Security Best Practices

```typescript
// 1. Input validation
class ModuleInputValidator {
  validateModuleInput(input: any, schema: Schema): ValidationResult {
    // Sanitize input
    const sanitized = this.sanitize(input);

    // Validate against schema
    const validation = this.validate(sanitized, schema);

    // Check for malicious patterns
    const security = this.securityCheck(sanitized);

    return {
      valid: validation.valid && security.safe,
      errors: [...validation.errors, ...security.issues],
      sanitized
    };
  }
}

// 2. Secure communication
class SecureModuleCommunication {
  async sendMessage(
    from: string,
    to: string,
    message: any
  ): Promise<void> {
    // Check permission to communicate
    if (!await this.canCommunicate(from, to)) {
      throw new PermissionError('Module communication not allowed');
    }

    // Encrypt sensitive data
    if (this.containsSensitiveData(message)) {
      message = await this.encrypt(message);
    }

    // Sign message
    const signed = await this.sign(message, from);

    // Send through secure channel
    await this.secureChannel.send(to, signed);
  }
}

// 3. Resource limits
class ModuleResourceLimits {
  limits = {
    memory: 100 * 1024 * 1024, // 100MB
    cpu: 0.5, // 50% of one core
    storage: 50 * 1024 * 1024, // 50MB
    network: {
      requests: 100, // per minute
      bandwidth: 10 * 1024 * 1024 // 10MB per minute
    }
  };

  async enforceLimit(moduleId: string, resource: string, usage: number) {
    const limit = this.limits[resource];

    if (usage > limit) {
      // Log violation
      await this.logViolation(moduleId, resource, usage, limit);

      // Take action
      if (this.isRepeatOffender(moduleId)) {
        await this.suspendModule(moduleId);
      } else {
        await this.throttleModule(moduleId);
      }

      throw new ResourceLimitError(`Exceeded ${resource} limit`);
    }
  }
}
```

## Real-World Examples

### Example 1: TalentExcel Platform

```typescript
// Main app configuration
const talentExcelApp: ModularApp = {
  id: 'talentexcel',
  name: 'TalentExcel',
  domain: 'talentexcel.com',

  modules: [
    {
      id: 'core',
      type: 'feature',
      required: true,
      routes: [
        { path: '/', component: 'Dashboard' },
        { path: '/profile', component: 'Profile' },
        { path: '/settings', component: 'Settings' }
      ]
    },
    {
      id: 'internships',
      type: 'feature',
      required: false,
      routes: [
        { path: '/internships', component: 'InternshipHub' },
        { path: '/internships/:id', component: 'InternshipDetail' },
        { path: '/applications', component: 'MyApplications' }
      ],
      config: {
        maxActiveApplications: 10,
        applicationDeadlineReminder: true,
        autoSaveProgress: true
      }
    },
    {
      id: 'fellowships',
      type: 'feature',
      required: false,
      routes: [
        { path: '/fellowships', component: 'FellowshipPrograms' },
        { path: '/fellowships/:id', component: 'FellowshipDetail' },
        { path: '/mentorship', component: 'MentorshipPortal' }
      ],
      dependencies: ['core', 'profile-verification']
    },
    {
      id: 'learning-journeys',
      type: 'feature',
      required: false,
      routes: [
        { path: '/learn', component: 'LearningPaths' },
        { path: '/learn/:pathId', component: 'PathDetail' },
        { path: '/certificates', component: 'MyCertificates' }
      ],
      integrations: ['google-calendar', 'zoom']
    }
  ]
};

// Module interaction example
class TalentExcelOrchestrator {
  async handleApplicationSubmission(applicationData: any) {
    // Internship module processes application
    const result = await this.modules.internships.submitApplication(applicationData);

    // Notify other modules
    await this.modules.notifications.send({
      type: 'application_submitted',
      recipient: applicationData.userId,
      data: result
    });

    // Update learning progress if related
    if (applicationData.relatedLearningPath) {
      await this.modules.learningJourneys.updateProgress({
        userId: applicationData.userId,
        pathId: applicationData.relatedLearningPath,
        milestone: 'application_submitted'
      });
    }

    // Schedule follow-up
    await this.modules.scheduler.schedule({
      type: 'application_followup',
      date: addDays(new Date(), 7),
      data: { applicationId: result.id }
    });
  }
}
```

### Example 2: E-Learning Platform

```typescript
// Modular e-learning app
const elearningModules = {
  courses: {
    id: 'courses',
    type: 'content',
    provides: ['course-catalog', 'course-player'],
    routes: ['/courses', '/courses/:id', '/my-courses']
  },

  assessments: {
    id: 'assessments',
    type: 'feature',
    dependencies: ['courses'],
    provides: ['quiz-engine', 'assignment-submission'],
    routes: ['/assessments/:id', '/grades']
  },

  discussions: {
    id: 'discussions',
    type: 'feature',
    dependencies: ['courses', 'user-profiles'],
    provides: ['forums', 'chat'],
    routes: ['/discussions', '/discussions/:courseId']
  },

  certificates: {
    id: 'certificates',
    type: 'feature',
    dependencies: ['courses', 'assessments'],
    provides: ['certificate-generation', 'verification'],
    routes: ['/certificates', '/verify/:certificateId']
  },

  analytics: {
    id: 'analytics',
    type: 'service',
    provides: ['learning-analytics', 'progress-tracking'],
    api: ['/api/analytics/*']
  }
};
```

### Example 3: Healthcare App

```typescript
// Modular healthcare platform
const healthcareModules = {
  appointments: {
    id: 'appointments',
    type: 'feature',
    config: {
      slotDuration: 30, // minutes
      advanceBooking: 30, // days
      cancellationWindow: 24 // hours
    }
  },

  telemedicine: {
    id: 'telemedicine',
    type: 'integration',
    dependencies: ['appointments'],
    integrations: ['zoom', 'twilio'],
    permissions: ['camera', 'microphone']
  },

  prescriptions: {
    id: 'prescriptions',
    type: 'feature',
    dependencies: ['appointments', 'patient-records'],
    compliance: ['HIPAA', 'GDPR'],
    encryption: 'AES-256'
  },

  labResults: {
    id: 'lab-results',
    type: 'content',
    dependencies: ['patient-records'],
    integrations: ['lab-api', 'imaging-systems'],
    notifications: ['email', 'sms', 'push']
  }
};
```

---

**Document Version**: 1.0  
**Last Updated**: 04-Jul-25  
**Next Review**: 11-Jul-25
