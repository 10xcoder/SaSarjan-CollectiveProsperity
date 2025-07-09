// Core Job Board Types
export * from './job';
export * from './application';
export * from './freelance';

// Import types for local use
import type {
  JobPostingType,
  EmploymentTypeType,
  ExperienceLevelType,
  JobCategoryType,
  WorkArrangementType,
} from './job';

import type {
  JobApplicationType,
} from './application';

import type {
  ProjectProposalType,
  ProjectTypeType,
  ProjectDurationType,
  RequiredExperienceType,
} from './freelance';

// Re-export commonly used types
export type {
  JobPostingType,
  EmploymentTypeType,
  ExperienceLevelType,
  JobStatusType,
  SalaryPeriodType,
  WorkArrangementType,
  JobCategoryType,
  ApplicationMethodType,
  JobRequirementType,
  JobBenefitType,
  SalaryInfoType,
  CompanyInfoType,
  JobLocationType,
  ApplicationDeadlineType,
  JobMetricsType,
  ScreeningQuestionType,
} from './job';

export type {
  JobApplicationType,
  ApplicationStatusType,
  ApplicationSourceType,
  InterviewTypeType,
  InterviewStatusType,
  AssessmentTypeType,
  ScreeningResponseType,
  ApplicationDocumentType,
  ReferenceContactType,
  InterviewDetailsType,
  AssessmentDetailsType,
  TimelineEventType,
  ApplicationNoteType,
  JobOfferType,
} from './application';

export type {
  ProjectPostingType,
  ProjectProposalType,
  ProjectContractType,
  TimeEntryType,
  PaymentTransactionType,
  ProjectTypeType,
  ProjectStatusType,
  ProjectDurationType,
  RequiredExperienceType,
  ProposalStatusType,
  ContractStatusType,
  MilestoneStatusType,
  PaymentStatusType,
  ProjectBudgetType,
  ProjectMilestoneType,
  SkillRequirementType,
  ProjectAttachmentType,
  ClientInfoType,
} from './freelance';

// Utility types for job board configuration
export type JobBoardConfig = {
  // Database configuration
  database: {
    url: string;
    apiKey: string;
    schema?: string;
  };
  
  // Search and matching configuration
  search: {
    provider: 'internal' | 'algolia' | 'elasticsearch' | 'meilisearch';
    apiKey?: string;
    indexName?: string;
    enableGeoSearch: boolean;
    enableAutoComplete: boolean;
    enableSavedSearches: boolean;
  };
  
  // Matching algorithm configuration
  matching: {
    enableAIMatching: boolean;
    skillWeighting: number;
    locationWeighting: number;
    experienceWeighting: number;
    salaryWeighting: number;
    cultureWeighting: number;
    refreshInterval: number; // in minutes
  };
  
  // Storage configuration for resumes/portfolios
  storage: {
    provider: 'supabase' | 'aws' | 'gcs' | 'azure';
    bucket: string;
    region?: string;
    maxFileSize: number;
    allowedFileTypes: string[];
    virusScanning: boolean;
    resumeParsing: boolean;
  };
  
  // Email configuration for notifications
  email: {
    provider: 'sendgrid' | 'mailgun' | 'ses' | 'smtp';
    apiKey?: string;
    from: string;
    templates: {
      applicationReceived?: string;
      statusUpdate?: string;
      interviewScheduled?: string;
      offerExtended?: string;
      jobAlert?: string;
      freelanceProposal?: string;
      milestoneCompleted?: string;
    };
  };
  
  // Payment configuration for freelance marketplace
  payment: {
    provider: 'stripe' | 'paypal' | 'razorpay';
    apiKey: string;
    webhookSecret: string;
    escrowEnabled: boolean;
    platformFeePercentage: number;
    processingFeePercentage: number;
    enableDisputes: boolean;
  };
  
  // Video interview configuration
  videoInterview: {
    provider: 'zoom' | 'teams' | 'jitsi' | 'webrtc';
    apiKey?: string;
    enableRecording: boolean;
    enableScreenSharing: boolean;
    maxDuration: number; // in minutes
  };
  
  // Time tracking configuration
  timeTracking: {
    enabled: boolean;
    screenshotInterval: number; // in minutes
    activityTracking: boolean;
    enableManualEntry: boolean;
    requireApproval: boolean;
  };
  
  // Analytics configuration
  analytics: {
    enabled: boolean;
    provider?: 'internal' | 'google' | 'mixpanel' | 'segment';
    trackingId?: string;
    enableHeatmaps: boolean;
    enableConversionTracking: boolean;
  };
  
  // Security configuration
  security: {
    rateLimit: {
      enabled: boolean;
      applicationsPerDay: number;
      proposalsPerDay: number;
      messagesPerHour: number;
    };
    
    verification: {
      requireEmailVerification: boolean;
      requirePhoneVerification: boolean;
      requireIdentityVerification: boolean;
      enableBackgroundChecks: boolean;
    };
    
    privacy: {
      enableGDPR: boolean;
      dataRetentionDays: number;
      enableRightToDelete: boolean;
      enableDataExport: boolean;
    };
  };
  
  // Features configuration
  features: {
    jobBoard: {
      enabled: boolean;
      enableSalaryTransparency: boolean;
      enableApplicationTracking: boolean;
      enableVideoInterviews: boolean;
      enableAssessments: boolean;
      enableReferrals: boolean;
    };
    
    freelanceMarketplace: {
      enabled: boolean;
      enableProposals: boolean;
      enableContracts: boolean;
      enableTimeTracking: boolean;
      enableMilestones: boolean;
      enableDisputes: boolean;
    };
    
    matching: {
      enableAIRecommendations: boolean;
      enableJobAlerts: boolean;
      enableTalentPipeline: boolean;
      enableSkillAssessments: boolean;
    };
    
    social: {
      enableRatings: boolean;
      enableReviews: boolean;
      enablePortfolios: boolean;
      enableNetworking: boolean;
      enableReferrals: boolean;
    };
  };
  
  // Localization configuration
  localization: {
    defaultLanguage: string;
    supportedLanguages: string[];
    defaultCurrency: string;
    supportedCurrencies: string[];
    enableLocationBasedPricing: boolean;
    timezoneHandling: 'user' | 'server' | 'auto';
  };
  
  // Integration configuration
  integrations: {
    ats: {
      enabled: boolean;
      providers: string[];
    };
    
    hrms: {
      enabled: boolean;
      providers: string[];
    };
    
    accounting: {
      enabled: boolean;
      providers: string[];
    };
    
    socialMedia: {
      enableLinkedInImport: boolean;
      enableGitHubImport: boolean;
      enableAutoPosting: boolean;
    };
    
    apis: {
      enabled: boolean;
      rateLimit: number;
      requireAuthentication: boolean;
      enableWebhooks: boolean;
    };
  };
  
  // Performance configuration
  performance: {
    caching: {
      enabled: boolean;
      provider: 'memory' | 'redis' | 'memcached';
      ttl: number;
    };
    
    cdn: {
      enabled: boolean;
      provider?: string;
      domain?: string;
    };
    
    optimization: {
      enableLazyLoading: boolean;
      enableImageOptimization: boolean;
      enableBundleSplitting: boolean;
    };
  };
  
  // Moderation configuration
  moderation: {
    enableAutoModeration: boolean;
    flaggedContentAction: 'hide' | 'review' | 'delete';
    enableSpamFilter: boolean;
    enableDuplicateDetection: boolean;
    moderators: string[];
  };
  
  // Custom configuration
  custom?: Record<string, any>;
};

// Search and filter types
export type JobSearchFilters = {
  keywords?: string;
  location?: string;
  radius?: number; // in kilometers
  employmentTypes?: EmploymentTypeType[];
  experienceLevels?: ExperienceLevelType[];
  categories?: JobCategoryType[];
  workArrangements?: WorkArrangementType[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  datePosted?: 'today' | 'week' | 'month' | 'any';
  companySize?: string[];
  benefits?: string[];
  skills?: string[];
  isRemote?: boolean;
  hasVisaSponsorship?: boolean;
  languages?: string[];
};

export type FreelanceSearchFilters = {
  keywords?: string;
  location?: string;
  skills?: string[];
  experienceLevel?: RequiredExperienceType[];
  projectTypes?: ProjectTypeType[];
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  duration?: ProjectDurationType[];
  isRemote?: boolean;
  categories?: string[];
  datePosted?: 'today' | 'week' | 'month' | 'any';
  clientVerified?: boolean;
  paymentVerified?: boolean;
};

// API Response types
export type JobBoardApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  metadata?: Record<string, any>;
};

// Event types for analytics and webhooks
export type JobBoardEvent = {
  type: string;
  entity: 'job' | 'application' | 'project' | 'proposal' | 'contract';
  action: 'create' | 'update' | 'delete' | 'apply' | 'hire' | 'complete';
  entityId: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
  metadata?: Record<string, any>;
};

// Matching algorithm types
export type MatchingScore = {
  overall: number;
  breakdown: {
    skills: number;
    experience: number;
    location: number;
    salary: number;
    culture: number;
    availability: number;
  };
  reasons: string[];
};

export type JobMatch = {
  jobId: string;
  candidateId: string;
  score: MatchingScore;
  confidence: number;
  explanation: string;
  calculatedAt: Date;
};

export type TalentMatch = {
  candidateId: string;
  jobId: string;
  score: MatchingScore;
  confidence: number;
  explanation: string;
  calculatedAt: Date;
};

// Notification types
export type NotificationType = 
  | 'application_received'
  | 'application_status_changed'
  | 'interview_scheduled'
  | 'offer_extended'
  | 'job_alert'
  | 'proposal_received'
  | 'proposal_accepted'
  | 'milestone_completed'
  | 'payment_released'
  | 'contract_completed'
  | 'review_received';

export type JobBoardNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
};

// Error types
export type JobBoardError = {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
};

// Plugin types for extensibility
export type JobBoardPlugin = {
  name: string;
  version: string;
  description?: string;
  author?: string;
  
  // Plugin lifecycle
  install?: (config: JobBoardConfig) => Promise<void>;
  uninstall?: () => Promise<void>;
  
  // Hooks
  beforeJobCreate?: (job: JobPostingType) => Promise<JobPostingType>;
  afterJobCreate?: (job: JobPostingType) => Promise<void>;
  beforeApplicationSubmit?: (application: JobApplicationType) => Promise<JobApplicationType>;
  afterApplicationSubmit?: (application: JobApplicationType) => Promise<void>;
  beforeProposalSubmit?: (proposal: ProjectProposalType) => Promise<ProjectProposalType>;
  afterProposalSubmit?: (proposal: ProjectProposalType) => Promise<void>;
  
  // Matching hooks
  beforeMatch?: (criteria: any) => Promise<any>;
  afterMatch?: (matches: any[]) => Promise<any[]>;
  
  // Custom methods
  [key: string]: any;
};