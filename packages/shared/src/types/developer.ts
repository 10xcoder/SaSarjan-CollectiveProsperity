// Developer Integration Types

export interface MicroAppRepository {
  id: string;
  developerId: string;
  name: string;
  repositoryUrl: string;
  repositoryType: 'git' | 'github' | 'gitlab' | 'bitbucket';
  description?: string;
  readmeUrl?: string;
  documentationUrl?: string;
  demoUrl?: string;
  submissionType: 'new_app' | 'app_update' | 'template_submission';
  targetBrandId?: string;
  appCategory: string;
  isPublic: boolean;
  accessTokenEncrypted?: string;
  webhookSecret?: string;
  status: RepositoryStatus;
  reviewNotes: ReviewNote[];
  packageName?: string;
  packageVersion: string;
  packageUrl?: string;
  packageSizeBytes?: number;
  securityScanStatus: SecurityScanStatus;
  securityScanResults: SecurityScanResult;
  vulnerabilityCount: number;
  downloadCount: number;
  starCount: number;
  createdAt: string;
  updatedAt: string;
}

export type RepositoryStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'published';
export type SecurityScanStatus = 'pending' | 'scanning' | 'passed' | 'failed';

export interface ReviewNote {
  id: string;
  reviewer: string;
  type: 'info' | 'warning' | 'error' | 'suggestion';
  message: string;
  category: 'security' | 'performance' | 'ui' | 'functionality' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  createdAt: string;
}

export interface SecurityScanResult {
  vulnerabilities: Vulnerability[];
  dependencies: DependencyCheck[];
  codeQuality: CodeQualityMetrics;
  compliance: ComplianceCheck[];
  recommendations: string[];
  scanDuration: number;
  scannedAt: string;
}

export interface Vulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  file: string;
  line?: number;
  recommendation: string;
  cwe?: string; // Common Weakness Enumeration
  cvss?: number; // Common Vulnerability Scoring System
}

export interface DependencyCheck {
  package: string;
  version: string;
  vulnerabilities: number;
  outdated: boolean;
  license: string;
  recommendation?: string;
}

export interface CodeQualityMetrics {
  maintainabilityIndex: number;
  cyclomaticComplexity: number;
  linesOfCode: number;
  testCoverage: number;
  duplicateCodePercentage: number;
  techDebtMinutes: number;
}

export interface ComplianceCheck {
  rule: string;
  status: 'passed' | 'failed' | 'warning';
  description: string;
  recommendation?: string;
}

export interface MicroAppPackage {
  id: string;
  repositoryId: string;
  packageName: string;
  displayName: string;
  description: string;
  version: string;
  authorId: string;
  packageConfig: PackageConfig;
  manifest: PackageManifest;
  distUrl: string;
  distTarballUrl?: string;
  distIntegrityHash?: string;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  compatibleBrands: string[];
  minPlatformVersion?: string;
  status: PackageStatus;
  isTemplate: boolean;
  isFeatured: boolean;
  installCount: number;
  weeklyDownloads: number;
  totalDownloads: number;
  qualityScore: number;
  maintenanceScore: number;
  popularityScore: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PackageStatus = 'draft' | 'published' | 'deprecated' | 'archived';

export interface PackageConfig {
  entry: string;
  types?: string;
  exports?: Record<string, string>;
  files?: string[];
  engines?: Record<string, string>;
  os?: string[];
  cpu?: string[];
}

export interface PackageManifest {
  name: string;
  version: string;
  description: string;
  main: string;
  types?: string;
  keywords?: string[];
  license: string;
  author: PackageAuthor;
  repository?: PackageRepository;
  bugs?: PackageIssues;
  homepage?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  bundledDependencies?: string[];
  engines?: Record<string, string>;
  os?: string[];
  cpu?: string[];
  sasarjan?: SasarjanPackageConfig;
}

export interface PackageAuthor {
  name: string;
  email?: string;
  url?: string;
}

export interface PackageRepository {
  type: string;
  url: string;
  directory?: string;
}

export interface PackageIssues {
  url: string;
  email?: string;
}

export interface SasarjanPackageConfig {
  brand?: string[];
  category: string;
  microAppType: string;
  permissions: string[];
  routes?: RouteConfig[];
  components?: ComponentConfig[];
  services?: ServiceConfig[];
  theme?: ThemeConfig;
  i18n?: I18nConfig;
}

export interface RouteConfig {
  path: string;
  component: string;
  permissions?: string[];
  layout?: string;
  meta?: Record<string, any>;
}

export interface ComponentConfig {
  name: string;
  path: string;
  props?: Record<string, any>;
  dependencies?: string[];
}

export interface ServiceConfig {
  name: string;
  type: 'api' | 'worker' | 'webhook';
  endpoint?: string;
  methods?: string[];
  permissions?: string[];
}

export interface ThemeConfig {
  variables?: Record<string, string>;
  components?: Record<string, any>;
  responsive?: Record<string, any>;
}

export interface I18nConfig {
  defaultLocale: string;
  locales: string[];
  namespaces?: string[];
}

export interface PackageVersion {
  id: string;
  packageId: string;
  version: string;
  changelog?: string;
  releaseNotes?: string;
  isPrerelease: boolean;
  isLatest: boolean;
  distUrl: string;
  distTarballUrl?: string;
  distIntegrityHash?: string;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  downloadCount: number;
  publishedAt: string;
  createdAt: string;
}

export interface AppTemplate {
  id: string;
  sourceAppId?: string;
  packageId?: string;
  creatorId: string;
  name: string;
  slug: string;
  displayName: string;
  description: string;
  category: string;
  templateConfig: TemplateConfig;
  customizationOptions: CustomizationOptions;
  brandingConfig: BrandingConfig;
  iconUrl?: string;
  screenshotUrls: string[];
  demoUrl?: string;
  pricingModel: 'free' | 'one_time' | 'subscription';
  basePrice: number;
  licenseType: 'mit' | 'apache' | 'gpl' | 'proprietary' | 'commercial';
  cloneCount: number;
  rating: number;
  reviewCount: number;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  isVerified: boolean;
  tags: string[];
  industries: string[];
  useCases: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateConfig {
  schema: {
    seeker?: any;
    provider?: any;
    entity?: any;
  };
  components: string[];
  modules: TemplateModule[];
  integrations: TemplateIntegration[];
  database?: DatabaseSchema[];
  apis?: APIEndpoint[];
}

export interface TemplateModule {
  name: string;
  type: string;
  required: boolean;
  config: any;
}

export interface TemplateIntegration {
  name: string;
  provider: string;
  required: boolean;
  config: any;
}

export interface DatabaseSchema {
  table: string;
  columns: DatabaseColumn[];
  indexes?: DatabaseIndex[];
  constraints?: DatabaseConstraint[];
}

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  default?: any;
  references?: string;
}

export interface DatabaseIndex {
  name: string;
  columns: string[];
  unique: boolean;
}

export interface DatabaseConstraint {
  name: string;
  type: 'check' | 'foreign_key' | 'unique' | 'primary_key';
  definition: string;
}

export interface APIEndpoint {
  path: string;
  method: string;
  description: string;
  parameters?: APIParameter[];
  responses?: APIResponse[];
}

export interface APIParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface APIResponse {
  status: number;
  description: string;
  schema?: any;
}

export interface CustomizationOptions {
  branding: BrandingCustomization;
  features: FeatureCustomization;
  content: ContentCustomization;
  integrations: IntegrationCustomization;
}

export interface BrandingCustomization {
  logo: boolean;
  colors: boolean;
  fonts: boolean;
  domain: boolean;
  favicon: boolean;
}

export interface FeatureCustomization {
  [feature: string]: boolean;
}

export interface ContentCustomization {
  [content: string]: boolean;
}

export interface IntegrationCustomization {
  [integration: string]: boolean;
}

export interface BrandingConfig {
  logoPlaceholder?: string;
  colorPalette?: string[];
  fontOptions?: string[];
  domainPrefix?: string;
  customFields?: CustomField[];
}

export interface CustomField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'color' | 'image';
  label: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
  validation?: any;
}

export interface AppClone {
  id: string;
  templateId: string;
  clonedAppId: string;
  ownerId: string;
  targetBrandId: string;
  cloneName: string;
  cloneDomain?: string;
  customizations: Record<string, any>;
  brandingOverrides: Record<string, any>;
  status: CloneStatus;
  deploymentUrl?: string;
  userCount: number;
  totalInteractions: number;
  revenueGenerated: number;
  subscriptionStatus: SubscriptionStatus;
  lastPaymentAt?: string;
  nextPaymentDue?: string;
  clonedAt: string;
  deployedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CloneStatus = 'created' | 'configuring' | 'deploying' | 'active' | 'paused' | 'archived';
export type SubscriptionStatus = 'trial' | 'active' | 'suspended' | 'cancelled';

export interface PackageDependency {
  id: string;
  packageId: string;
  dependencyPackageId: string;
  dependencyType: 'runtime' | 'peer' | 'dev' | 'optional';
  versionRange: string;
  isOptional: boolean;
  minVersion?: string;
  maxVersion?: string;
  createdAt: string;
}

export interface DeveloperAPIKey {
  id: string;
  developerId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  permissions: string[];
  scopes: string[];
  lastUsedAt?: string;
  usageCount: number;
  rateLimitRemaining: number;
  rateLimitResetAt?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepositoryWebhook {
  id: string;
  repositoryId: string;
  webhookUrl: string;
  secretToken: string;
  events: string[];
  isActive: boolean;
  lastDeliveryAt?: string;
  lastDeliveryStatus?: string;
  deliveryCount: number;
  failedDeliveryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentPipeline {
  id: string;
  repositoryId: string;
  triggerEvent: string;
  pipelineConfig: any;
  environment: 'development' | 'staging' | 'production';
  status: PipelineStatus;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  steps: PipelineStep[];
  logsUrl?: string;
  artifactsUrl?: string;
  buildOutputUrl?: string;
  packageUrl?: string;
  packageSizeBytes?: number;
  errorMessage?: string;
  errorDetails?: any;
  createdAt: string;
  updatedAt: string;
}

export type PipelineStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

export interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: number;
  logs?: string;
  output?: any;
  error?: string;
}

// Developer Portal Types
export interface DeveloperSubmissionForm {
  repository: {
    url: string;
    type: 'github' | 'gitlab' | 'bitbucket';
    branch?: string;
    accessToken?: string;
  };
  appInfo: {
    name: string;
    description: string;
    category: string;
    targetBrands: string[];
    demoUrl?: string;
    documentationUrl?: string;
  };
  technical: {
    packageName: string;
    version: string;
    entryPoint: string;
    dependencies: Record<string, string>;
    permissions: string[];
  };
  legal: {
    license: string;
    termsAccepted: boolean;
    privacyPolicyUrl?: string;
    dataProcessing: string[];
  };
  testing: {
    testResults?: TestResult[];
    coverageReport?: CoverageReport;
    performanceMetrics?: PerformanceMetrics;
  };
}

export interface TestResult {
  suite: string;
  tests: number;
  passes: number;
  failures: number;
  duration: number;
  coverage?: number;
}

export interface CoverageReport {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
}

// Package Manager Types
export interface PackageSearchFilters {
  query?: string;
  category?: string;
  brand?: string;
  author?: string;
  isTemplate?: boolean;
  isFeatured?: boolean;
  minQualityScore?: number;
  license?: string[];
  tags?: string[];
  dependencies?: string[];
  compatibleBrands?: string[];
  sort?: 'relevance' | 'downloads' | 'rating' | 'updated' | 'created';
  limit?: number;
  offset?: number;
}

export interface PackageSearchResult {
  packages: MicroAppPackage[];
  totalCount: number;
  facets: {
    categories: Array<{ name: string; count: number }>;
    authors: Array<{ name: string; count: number }>;
    licenses: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
  suggestions: string[];
}

export interface PackageInstallOptions {
  version?: string;
  environment?: 'development' | 'staging' | 'production';
  customizations?: Record<string, any>;
  enabledModules?: string[];
  configuration?: Record<string, any>;
}

export interface PackageInstallResult {
  success: boolean;
  packageId: string;
  version: string;
  installPath: string;
  dependencies: string[];
  warnings?: string[];
  errors?: string[];
}

// Template System Types
export interface TemplateSearchFilters {
  query?: string;
  category?: string;
  industry?: string[];
  useCase?: string[];
  priceRange?: [number, number];
  rating?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  tags?: string[];
  sort?: 'relevance' | 'popularity' | 'rating' | 'price' | 'updated';
  limit?: number;
  offset?: number;
}

export interface TemplateCloneRequest {
  templateId: string;
  cloneName: string;
  targetBrandId: string;
  customizations: Record<string, any>;
  brandingOverrides: Record<string, any>;
  domainConfig?: {
    subdomain?: string;
    customDomain?: string;
  };
  billingInfo?: {
    paymentMethod: string;
    billingCycle: 'monthly' | 'yearly';
  };
}

export interface TemplateCloneResult {
  cloneId: string;
  appId: string;
  deploymentUrl: string;
  estimatedDeploymentTime: number;
  status: CloneStatus;
  nextSteps: string[];
}

// Developer Dashboard Types
export interface DeveloperDashboardData {
  overview: {
    totalRepositories: number;
    publishedPackages: number;
    totalDownloads: number;
    totalRevenue: number;
    activeClones: number;
  };
  repositories: MicroAppRepository[];
  packages: MicroAppPackage[];
  analytics: {
    downloadTrends: Array<{ date: string; downloads: number }>;
    revenueTrends: Array<{ date: string; revenue: number }>;
    popularPackages: Array<{ name: string; downloads: number }>;
    topBrands: Array<{ brand: string; usage: number }>;
  };
  notifications: DeveloperNotification[];
}

export interface DeveloperNotification {
  id: string;
  type: 'review_complete' | 'package_published' | 'security_alert' | 'revenue_payment' | 'clone_created';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}