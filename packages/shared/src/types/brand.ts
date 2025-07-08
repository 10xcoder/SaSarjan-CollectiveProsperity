// Brand Management Types
export interface Brand {
  id: string;
  name: string;
  slug: string;
  domain: string;
  displayName: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;
  ownerId: string;
  brandConfig: BrandConfig;
  commissionRate: number;
  status: BrandStatus;
  contactEmail: string;
  supportUrl?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  totalRevenue: number;
  totalMicroApps: number;
  totalUsers: number;
  createdAt: string;
  updatedAt: string;
}

export type BrandStatus = 'pending' | 'approved' | 'suspended' | 'inactive';

export interface BrandConfig {
  theme: BrandTheme;
  features: BrandFeatures;
  permissions?: BrandPermissions;
  business?: BusinessConfig;
  integrations?: IntegrationConfig;
}

export interface BrandTheme {
  primary: string;
  secondary: string;
  accent?: string;
  background?: string;
  text?: string;
  fonts?: {
    heading?: string;
    body?: string;
  };
  logo?: {
    light?: string;
    dark?: string;
  };
}

export interface BrandFeatures {
  matching?: boolean;
  analytics?: boolean;
  community?: boolean;
  wellness?: boolean;
  coaching?: boolean;
  courses?: boolean;
  service?: boolean;
  messaging?: boolean;
  payments?: boolean;
  reviews?: boolean;
  notifications?: boolean;
}

export interface BrandPermissions {
  allowedMicroAppTypes: MicroAppType[];
  maxMicroAppsPerDeveloper?: number;
  requiresApproval: boolean;
  allowedIntegrations: string[];
}

export interface BusinessConfig {
  currency: string;
  timeZone: string;
  locale: string;
  businessModel: 'commission' | 'subscription' | 'freemium';
  pricingTiers?: PricingTier[];
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: Record<string, number>;
}

export interface IntegrationConfig {
  payment: {
    enabled: boolean;
    providers: string[];
  };
  analytics: {
    enabled: boolean;
    providers: string[];
  };
  communication: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface BrandDomain {
  id: string;
  brandId: string;
  domain: string;
  isPrimary: boolean;
  sslEnabled: boolean;
  redirectToPrimary: boolean;
  createdAt: string;
}

// Micro-App Types
export type MicroAppType = 'marketplace' | 'content' | 'service' | 'integration' | 'tool';
export type MicroAppCategory = 'two_sided_marketplace' | 'job_board' | 'learning_platform' | 'service_booking' | 'community' | 'analytics';

export interface MicroApp {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  description?: string;
  appType: 'micro_app';
  microAppCategory: MicroAppCategory;
  developerId: string;
  status: AppStatus;
  iconUrl?: string;
  screenshots: string[];
  version: string;
  templateId?: string;
  configuration: MicroAppConfig;
  modules: MicroAppModule[];
  createdAt: string;
  updatedAt: string;
}

export type AppStatus = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'suspended';

export interface MicroAppConfig {
  schema: {
    seeker?: ProfileSchema;
    provider?: ProfileSchema;
    entity?: ProfileSchema;
  };
  components: string[];
  routes: RouteConfig[];
  permissions: string[];
  integrations: string[];
  business: {
    allowPayments: boolean;
    commissionRate?: number;
    subscriptionTiers?: string[];
  };
}

export interface ProfileSchema {
  required: string[];
  optional: string[];
  validation: Record<string, ValidationRule>;
  display: DisplayConfig;
}

export interface ValidationRule {
  type: 'string' | 'number' | 'email' | 'url' | 'date' | 'array' | 'object';
  min?: number;
  max?: number;
  pattern?: string;
  options?: string[];
}

export interface DisplayConfig {
  order: string[];
  groups: Record<string, string[]>;
  labels: Record<string, string>;
  placeholders: Record<string, string>;
  help: Record<string, string>;
}

export interface RouteConfig {
  path: string;
  name: string;
  component: string;
  permissions: string[];
  layout?: string;
}

export interface MicroAppModule {
  id: string;
  appId: string;
  brandId: string;
  name: string;
  slug: string;
  description?: string;
  version: string;
  type: ModuleType;
  moduleCategory: ModuleCategory;
  entryPoint: string;
  dependencies: string[];
  permissions: string[];
  configSchema: any;
  defaultConfig: any;
  status: ModuleStatus;
  requiresSubscription: boolean;
  installCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ModuleType = 'feature' | 'content' | 'service' | 'integration' | 'extension';
export type ModuleCategory = 'seeker' | 'provider' | 'admin' | 'common' | 'integration';
export type ModuleStatus = 'draft' | 'published' | 'deprecated';

// Template Types
export interface MicroAppTemplate {
  id: string;
  name: string;
  slug: string;
  category: MicroAppCategory;
  displayName: string;
  description: string;
  iconUrl?: string;
  templateConfig: TemplateConfig;
  defaultModules: string[];
  requiredPermissions: string[];
  authorId?: string;
  version: string;
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateConfig {
  schema: {
    seeker?: ProfileSchema;
    provider?: ProfileSchema;
    entity?: ProfileSchema;
  };
  components: string[];
  routes: RouteConfig[];
  modules: TemplateModule[];
  integrations: TemplateIntegration[];
}

export interface TemplateModule {
  name: string;
  type: ModuleType;
  category: ModuleCategory;
  required: boolean;
  config: any;
}

export interface TemplateIntegration {
  name: string;
  provider: string;
  required: boolean;
  config: any;
}

// Profile Types
export interface UserBrandProfile {
  id: string;
  userId: string;
  brandId: string;
  profileType: ProfileType;
  profileData: Record<string, any>;
  isActive: boolean;
  isVerified: boolean;
  verificationData: Record<string, any>;
  completionPercentage: number;
  qualityScore: number;
  visibility: ProfileVisibility;
  lastActiveAt?: string;
  totalInteractions: number;
  createdAt: string;
  updatedAt: string;
}

export type ProfileType = 'seeker' | 'provider' | 'admin' | 'both';
export type ProfileVisibility = 'public' | 'private' | 'verified_only';

// Marketplace Connection Types
export interface MarketplaceConnection {
  id: string;
  brandId: string;
  microAppId: string;
  seekerProfileId: string;
  providerProfileId: string;
  connectionType: string;
  status: ConnectionStatus;
  connectionData: Record<string, any>;
  messagesCount: number;
  lastMessageAt?: string;
  outcome?: string;
  feedbackRating?: number;
  feedbackText?: string;
  createdAt: string;
  updatedAt: string;
}

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

// Brand Context for Micro-Apps
export interface BrandContext {
  brand: Brand;
  currentUser?: UserBrandProfile;
  permissions: string[];
  theme: BrandTheme;
  features: BrandFeatures;
  config: BrandConfig;
}

// Micro-App SDK Types
export interface MicroAppSDK {
  brand: BrandAPI;
  profiles: ProfileAPI;
  connections: ConnectionAPI;
  messaging: MessagingAPI;
  payments: PaymentAPI;
  analytics: AnalyticsAPI;
  notifications: NotificationAPI;
}

export interface BrandAPI {
  getBrand(): Brand;
  getTheme(): BrandTheme;
  getFeatures(): BrandFeatures;
  updateConfig(config: Partial<BrandConfig>): Promise<void>;
}

export interface ProfileAPI {
  getCurrentProfile(type?: ProfileType): Promise<UserBrandProfile | null>;
  updateProfile(profileId: string, data: Record<string, any>): Promise<UserBrandProfile>;
  searchProfiles(filters: ProfileSearchFilters): Promise<UserBrandProfile[]>;
  getProfileSchema(type: ProfileType): ProfileSchema;
}

export interface ProfileSearchFilters {
  profileType?: ProfileType;
  skills?: string[];
  location?: {
    city?: string;
    country?: string;
    radius?: number;
  };
  availability?: boolean;
  verified?: boolean;
  qualityScore?: {
    min?: number;
    max?: number;
  };
  query?: string;
  limit?: number;
  offset?: number;
}

export interface ConnectionAPI {
  createConnection(
    providerId: string,
    connectionType: string,
    data: Record<string, any>
  ): Promise<MarketplaceConnection>;
  getConnections(filters?: ConnectionFilters): Promise<MarketplaceConnection[]>;
  updateConnection(
    connectionId: string,
    updates: Partial<MarketplaceConnection>
  ): Promise<MarketplaceConnection>;
  getConnectionById(connectionId: string): Promise<MarketplaceConnection>;
}

export interface ConnectionFilters {
  status?: ConnectionStatus;
  connectionType?: string;
  profileId?: string;
  profileType?: 'seeker' | 'provider';
  dateRange?: {
    start?: string;
    end?: string;
  };
  limit?: number;
  offset?: number;
}

export interface MessagingAPI {
  sendMessage(connectionId: string, message: string, attachments?: File[]): Promise<void>;
  getMessages(connectionId: string, limit?: number, offset?: number): Promise<Message[]>;
  markAsRead(connectionId: string): Promise<void>;
  subscribeToMessages(connectionId: string, callback: (message: Message) => void): () => void;
}

export interface Message {
  id: string;
  connectionId: string;
  senderId: string;
  content: string;
  attachments: Attachment[];
  readAt?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface PaymentAPI {
  createPayment(amount: number, description: string, metadata?: Record<string, any>): Promise<Payment>;
  getPayments(filters?: PaymentFilters): Promise<Payment[]>;
  refundPayment(paymentId: string, amount?: number): Promise<Payment>;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentFilters {
  status?: PaymentStatus;
  dateRange?: {
    start?: string;
    end?: string;
  };
  limit?: number;
  offset?: number;
}

export interface AnalyticsAPI {
  track(event: string, properties?: Record<string, any>): Promise<void>;
  getMetrics(metrics: string[], filters?: AnalyticsFilters): Promise<Record<string, any>>;
  createReport(config: ReportConfig): Promise<Report>;
}

export interface AnalyticsFilters {
  dateRange?: {
    start?: string;
    end?: string;
  };
  groupBy?: string;
  filters?: Record<string, any>;
}

export interface ReportConfig {
  name: string;
  metrics: string[];
  dimensions: string[];
  filters?: AnalyticsFilters;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
}

export interface Report {
  id: string;
  name: string;
  data: Record<string, any>;
  generatedAt: string;
}

export interface NotificationAPI {
  send(notification: NotificationRequest): Promise<void>;
  getNotifications(filters?: NotificationFilters): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  subscribe(callback: (notification: Notification) => void): () => void;
}

export interface NotificationRequest {
  type: string;
  title: string;
  message: string;
  recipients: string[];
  data?: Record<string, any>;
  channels: NotificationChannel[];
  scheduledAt?: string;
}

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  channel: NotificationChannel;
  readAt?: string;
  createdAt: string;
}

export interface NotificationFilters {
  type?: string;
  channel?: NotificationChannel;
  read?: boolean;
  dateRange?: {
    start?: string;
    end?: string;
  };
  limit?: number;
  offset?: number;
}