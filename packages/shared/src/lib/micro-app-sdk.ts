// Micro-App SDK Implementation
import { 
  BrandContext,
  MicroAppSDK,
  BrandAPI,
  ProfileAPI,
  ConnectionAPI,
  MessagingAPI,
  PaymentAPI,
  AnalyticsAPI,
  NotificationAPI,
  UserBrandProfile,
  MarketplaceConnection,
  ProfileSearchFilters,
  ConnectionFilters,
  Message,
  Payment,
  PaymentFilters,
  NotificationRequest,
  Notification,
  NotificationFilters,
  ProfileType,
  ProfileSchema,
  Brand,
  BrandTheme,
  BrandFeatures,
  BrandConfig
} from '../types/brand';

// SDK Configuration
export interface SDKConfig {
  apiBaseUrl: string;
  apiKey: string;
  brandId: string;
  userId?: string;
  debug?: boolean;
}

// Main SDK Class
export class MicroAppSDKImpl implements MicroAppSDK {
  private config: SDKConfig;
  private context: BrandContext;
  
  public brand: BrandAPI;
  public profiles: ProfileAPI;
  public connections: ConnectionAPI;
  public messaging: MessagingAPI;
  public payments: PaymentAPI;
  public analytics: AnalyticsAPI;
  public notifications: NotificationAPI;

  constructor(config: SDKConfig, context: BrandContext) {
    this.config = config;
    this.context = context;
    
    // Initialize API modules
    this.brand = new BrandAPIImpl(config, context);
    this.profiles = new ProfileAPIImpl(config, context);
    this.connections = new ConnectionAPIImpl(config, context);
    this.messaging = new MessagingAPIImpl(config, context);
    this.payments = new PaymentAPIImpl(config, context);
    this.analytics = new AnalyticsAPIImpl(config, context);
    this.notifications = new NotificationAPIImpl(config, context);
  }

  // SDK-wide utilities
  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Brand-ID': this.config.brandId,
      ...options.headers
    };

    if (this.config.debug) {
      console.log(`SDK Request: ${options.method || 'GET'} ${url}`, options.body);
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API Error: ${error.message}`);
    }

    const data = await response.json();
    
    if (this.config.debug) {
      console.log(`SDK Response:`, data);
    }

    return data;
  }

  // Event management
  private eventListeners: Map<string, Set<Function>> = new Map();

  addEventListener(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  removeEventListener(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
}

// Brand API Implementation
class BrandAPIImpl implements BrandAPI {
  constructor(private config: SDKConfig, private context: BrandContext) {}

  getBrand(): Brand {
    return this.context.brand;
  }

  getTheme(): BrandTheme {
    return this.context.theme;
  }

  getFeatures(): BrandFeatures {
    return this.context.features;
  }

  async updateConfig(config: Partial<BrandConfig>): Promise<void> {
    await this.request(`/api/v1/brands/${this.config.brandId}/config`, {
      method: 'PATCH',
      body: JSON.stringify(config)
    });
    
    // Update local context
    this.context.config = { ...this.context.config, ...config };
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const sdk = new MicroAppSDKImpl(this.config, this.context);
    return sdk.request(endpoint, options);
  }
}

// Profile API Implementation
class ProfileAPIImpl implements ProfileAPI {
  constructor(private config: SDKConfig, private context: BrandContext) {}

  async getCurrentProfile(type?: ProfileType): Promise<UserBrandProfile | null> {
    if (!this.config.userId) {
      return null;
    }

    const profiles = await this.request(`/api/v1/brands/${this.config.brandId}/profiles/me`);
    
    if (type) {
      return profiles.find((p: UserBrandProfile) => p.profileType === type) || null;
    }
    
    return profiles[0] || null;
  }

  async updateProfile(profileId: string, data: Record<string, any>): Promise<UserBrandProfile> {
    return this.request(`/api/v1/profiles/${profileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ profileData: data })
    });
  }

  async searchProfiles(filters: ProfileSearchFilters): Promise<UserBrandProfile[]> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          queryParams.append(key, JSON.stringify(value));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    return this.request(`/api/v1/brands/${this.config.brandId}/profiles/search?${queryParams}`);
  }

  getProfileSchema(type: ProfileType): ProfileSchema {
    const config = this.context.config;
    const schema = config.business?.profileSchemas?.[type];
    
    if (!schema) {
      // Return default schema based on type
      return this.getDefaultProfileSchema(type);
    }
    
    return schema;
  }

  async createProfile(type: ProfileType, data: Record<string, any>): Promise<UserBrandProfile> {
    return this.request(`/api/v1/brands/${this.config.brandId}/profiles`, {
      method: 'POST',
      body: JSON.stringify({
        profileType: type,
        profileData: data
      })
    });
  }

  async deleteProfile(profileId: string): Promise<void> {
    await this.request(`/api/v1/profiles/${profileId}`, {
      method: 'DELETE'
    });
  }

  async verifyProfile(profileId: string, verificationData: Record<string, any>): Promise<UserBrandProfile> {
    return this.request(`/api/v1/profiles/${profileId}/verify`, {
      method: 'POST',
      body: JSON.stringify(verificationData)
    });
  }

  private getDefaultProfileSchema(type: ProfileType): ProfileSchema {
    const baseSchema = {
      required: ['name', 'email'],
      optional: ['bio', 'location', 'avatar'],
      validation: {
        name: { type: 'string' as const, min: 2, max: 100 },
        email: { type: 'email' as const },
        bio: { type: 'string' as const, max: 500 }
      },
      display: {
        order: ['name', 'email', 'bio', 'location'],
        groups: {
          basic: ['name', 'email'],
          details: ['bio', 'location']
        },
        labels: {
          name: 'Full Name',
          email: 'Email Address',
          bio: 'About You',
          location: 'Location'
        },
        placeholders: {
          name: 'Enter your full name',
          email: 'Enter your email address',
          bio: 'Tell us about yourself',
          location: 'City, Country'
        },
        help: {
          bio: 'A brief description about yourself',
          location: 'Your current location'
        }
      }
    };

    switch (type) {
      case 'seeker':
        return {
          ...baseSchema,
          required: [...baseSchema.required, 'interests', 'experience'],
          optional: [...baseSchema.optional, 'skills', 'portfolio', 'availability'],
          validation: {
            ...baseSchema.validation,
            interests: { type: 'array' as const },
            experience: { type: 'string' as const },
            skills: { type: 'array' as const }
          }
        };

      case 'provider':
        return {
          ...baseSchema,
          required: [...baseSchema.required, 'services', 'experience'],
          optional: [...baseSchema.optional, 'portfolio', 'pricing', 'availability'],
          validation: {
            ...baseSchema.validation,
            services: { type: 'array' as const },
            experience: { type: 'string' as const },
            pricing: { type: 'object' as const }
          }
        };

      default:
        return baseSchema;
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const sdk = new MicroAppSDKImpl(this.config, this.context);
    return sdk.request(endpoint, options);
  }
}

// Connection API Implementation
class ConnectionAPIImpl implements ConnectionAPI {
  constructor(private config: SDKConfig, private context: BrandContext) {}

  async createConnection(
    providerId: string,
    connectionType: string,
    data: Record<string, any>
  ): Promise<MarketplaceConnection> {
    return this.request(`/api/v1/brands/${this.config.brandId}/connections`, {
      method: 'POST',
      body: JSON.stringify({
        providerProfileId: providerId,
        connectionType,
        connectionData: data
      })
    });
  }

  async getConnections(filters?: ConnectionFilters): Promise<MarketplaceConnection[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            queryParams.append(key, JSON.stringify(value));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    return this.request(`/api/v1/brands/${this.config.brandId}/connections?${queryParams}`);
  }

  async updateConnection(
    connectionId: string,
    updates: Partial<MarketplaceConnection>
  ): Promise<MarketplaceConnection> {
    return this.request(`/api/v1/connections/${connectionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async getConnectionById(connectionId: string): Promise<MarketplaceConnection> {
    return this.request(`/api/v1/connections/${connectionId}`);
  }

  async acceptConnection(connectionId: string, message?: string): Promise<MarketplaceConnection> {
    return this.updateConnection(connectionId, {
      status: 'accepted',
      connectionData: {
        responseMessage: message,
        acceptedAt: new Date().toISOString()
      }
    });
  }

  async rejectConnection(connectionId: string, reason?: string): Promise<MarketplaceConnection> {
    return this.updateConnection(connectionId, {
      status: 'rejected',
      connectionData: {
        rejectionReason: reason,
        rejectedAt: new Date().toISOString()
      }
    });
  }

  async completeConnection(connectionId: string, outcome?: string): Promise<MarketplaceConnection> {
    return this.updateConnection(connectionId, {
      status: 'completed',
      outcome,
      connectionData: {
        completedAt: new Date().toISOString()
      }
    });
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const sdk = new MicroAppSDKImpl(this.config, this.context);
    return sdk.request(endpoint, options);
  }
}

// Messaging API Implementation
class MessagingAPIImpl implements MessagingAPI {
  private subscriptions: Map<string, Function> = new Map();

  constructor(private config: SDKConfig, private context: BrandContext) {}

  async sendMessage(connectionId: string, message: string, attachments?: File[]): Promise<void> {
    const formData = new FormData();
    formData.append('message', message);
    
    if (attachments) {
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    await this.request(`/api/v1/connections/${connectionId}/messages`, {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }

  async getMessages(connectionId: string, limit = 50, offset = 0): Promise<Message[]> {
    return this.request(`/api/v1/connections/${connectionId}/messages?limit=${limit}&offset=${offset}`);
  }

  async markAsRead(connectionId: string): Promise<void> {
    await this.request(`/api/v1/connections/${connectionId}/messages/read`, {
      method: 'POST'
    });
  }

  subscribeToMessages(connectionId: string, callback: (message: Message) => void): () => void {
    // Implementation would use WebSocket or Server-Sent Events
    const eventSource = new EventSource(
      `${this.config.apiBaseUrl}/api/v1/connections/${connectionId}/messages/stream`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      }
    );

    const handler = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      callback(message);
    };

    eventSource.addEventListener('message', handler);
    
    const unsubscribe = () => {
      eventSource.removeEventListener('message', handler);
      eventSource.close();
      this.subscriptions.delete(connectionId);
    };

    this.subscriptions.set(connectionId, unsubscribe);
    return unsubscribe;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const sdk = new MicroAppSDKImpl(this.config, this.context);
    return sdk.request(endpoint, options);
  }
}

// Payment API Implementation
class PaymentAPIImpl implements PaymentAPI {
  constructor(private config: SDKConfig, private context: BrandContext) {}

  async createPayment(amount: number, description: string, metadata?: Record<string, any>): Promise<Payment> {
    return this.request('/api/v1/payments', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        description,
        metadata,
        brandId: this.config.brandId
      })
    });
  }

  async getPayments(filters?: PaymentFilters): Promise<Payment[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            queryParams.append(key, JSON.stringify(value));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    return this.request(`/api/v1/payments?${queryParams}`);
  }

  async refundPayment(paymentId: string, amount?: number): Promise<Payment> {
    return this.request(`/api/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  }

  async getPaymentById(paymentId: string): Promise<Payment> {
    return this.request(`/api/v1/payments/${paymentId}`);
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const sdk = new MicroAppSDKImpl(this.config, this.context);
    return sdk.request(endpoint, options);
  }
}

// Analytics API Implementation
class AnalyticsAPIImpl implements AnalyticsAPI {
  constructor(private config: SDKConfig, private context: BrandContext) {}

  async track(event: string, properties?: Record<string, any>): Promise<void> {
    await this.request('/api/v1/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        event,
        properties: {
          ...properties,
          brandId: this.config.brandId,
          userId: this.config.userId,
          timestamp: new Date().toISOString()
        }
      })
    });
  }

  async getMetrics(metrics: string[], filters?: any): Promise<Record<string, any>> {
    return this.request('/api/v1/analytics/metrics', {
      method: 'POST',
      body: JSON.stringify({
        metrics,
        filters: {
          ...filters,
          brandId: this.config.brandId
        }
      })
    });
  }

  async createReport(config: any): Promise<any> {
    return this.request('/api/v1/analytics/reports', {
      method: 'POST',
      body: JSON.stringify({
        ...config,
        brandId: this.config.brandId
      })
    });
  }

  async trackPageView(page: string, properties?: Record<string, any>): Promise<void> {
    await this.track('page_view', { page, ...properties });
  }

  async trackUserAction(action: string, target: string, properties?: Record<string, any>): Promise<void> {
    await this.track('user_action', { action, target, ...properties });
  }

  async trackConversion(type: string, value: number, properties?: Record<string, any>): Promise<void> {
    await this.track('conversion', { type, value, ...properties });
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const sdk = new MicroAppSDKImpl(this.config, this.context);
    return sdk.request(endpoint, options);
  }
}

// Notification API Implementation
class NotificationAPIImpl implements NotificationAPI {
  private subscriptions: Set<Function> = new Set();

  constructor(private config: SDKConfig, private context: BrandContext) {}

  async send(notification: NotificationRequest): Promise<void> {
    await this.request('/api/v1/notifications', {
      method: 'POST',
      body: JSON.stringify({
        ...notification,
        brandId: this.config.brandId
      })
    });
  }

  async getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            queryParams.append(key, JSON.stringify(value));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    return this.request(`/api/v1/notifications?${queryParams}`);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.request(`/api/v1/notifications/${notificationId}/read`, {
      method: 'POST'
    });
  }

  subscribe(callback: (notification: Notification) => void): () => void {
    // Implementation would use WebSocket or Server-Sent Events
    const eventSource = new EventSource(
      `${this.config.apiBaseUrl}/api/v1/notifications/stream`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      }
    );

    const handler = (event: MessageEvent) => {
      const notification = JSON.parse(event.data);
      callback(notification);
    };

    eventSource.addEventListener('notification', handler);
    this.subscriptions.add(callback);
    
    const unsubscribe = () => {
      eventSource.removeEventListener('notification', handler);
      eventSource.close();
      this.subscriptions.delete(callback);
    };

    return unsubscribe;
  }

  async sendToUser(userId: string, title: string, message: string, data?: Record<string, any>): Promise<void> {
    await this.send({
      type: 'user_notification',
      title,
      message,
      recipients: [userId],
      channels: ['in_app', 'push'],
      data
    });
  }

  async sendToProfile(profileId: string, title: string, message: string, data?: Record<string, any>): Promise<void> {
    // Get user ID from profile and send notification
    const profile = await this.getProfileById(profileId);
    if (profile) {
      await this.sendToUser(profile.userId, title, message, data);
    }
  }

  private async getProfileById(profileId: string): Promise<UserBrandProfile | null> {
    try {
      return await this.request(`/api/v1/profiles/${profileId}`);
    } catch {
      return null;
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const sdk = new MicroAppSDKImpl(this.config, this.context);
    return sdk.request(endpoint, options);
  }
}

// SDK Factory
export class SDKFactory {
  static create(config: SDKConfig, context: BrandContext): MicroAppSDK {
    return new MicroAppSDKImpl(config, context);
  }

  static async createFromBrand(brandId: string, apiKey: string, userId?: string): Promise<MicroAppSDK> {
    const config: SDKConfig = {
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      apiKey,
      brandId,
      userId,
      debug: process.env.NODE_ENV === 'development'
    };

    // Fetch brand context
    const tempSDK = new MicroAppSDKImpl(config, {} as BrandContext);
    const brand = await tempSDK.request(`/api/v1/brands/${brandId}`);
    
    const context: BrandContext = {
      brand,
      theme: brand.brandConfig.theme,
      features: brand.brandConfig.features,
      config: brand.brandConfig,
      permissions: [], // Would be fetched based on user
      currentUser: userId ? await tempSDK.request(`/api/v1/brands/${brandId}/profiles/me`) : undefined
    };

    return new MicroAppSDKImpl(config, context);
  }
}

// Developer Utilities
export class MicroAppDevUtils {
  static validateProfileSchema(schema: ProfileSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema.required || !Array.isArray(schema.required)) {
      errors.push('Schema must have required fields array');
    }

    if (!schema.validation || typeof schema.validation !== 'object') {
      errors.push('Schema must have validation rules');
    }

    if (!schema.display || typeof schema.display !== 'object') {
      errors.push('Schema must have display configuration');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static generateMicroAppBoilerplate(type: string, config: any): string {
    // Generate boilerplate code for micro-app
    return `
import { BaseMicroApp, BrandContext, MicroAppSDK } from '@sasarjan/sdk';

export class ${type}MicroApp extends BaseMicroApp {
  async onInstall(): Promise<void> {
    // Installation logic here
    console.log('Installing ${type} micro-app');
  }

  async onEnable(): Promise<void> {
    // Enable logic here
    console.log('Enabling ${type} micro-app');
  }

  async onDisable(): Promise<void> {
    // Disable logic here
    console.log('Disabling ${type} micro-app');
  }

  async onUninstall(): Promise<void> {
    // Uninstall logic here
    console.log('Uninstalling ${type} micro-app');
  }

  async onConfigUpdate(newConfig: any): Promise<void> {
    // Config update logic here
    this.config = { ...this.config, ...newConfig };
  }
}
    `.trim();
  }
}