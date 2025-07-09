import { z } from 'zod';

/**
 * Application Status
 */
export const ApplicationStatus = z.enum([
  'draft',
  'submitted',
  'received',
  'screening',
  'phone_interview',
  'technical_assessment',
  'video_interview',
  'on_site_interview',
  'reference_check',
  'background_check',
  'offer_extended',
  'offer_accepted',
  'offer_declined',
  'hired',
  'rejected',
  'withdrawn',
  'on_hold',
]);

export type ApplicationStatusType = z.infer<typeof ApplicationStatus>;

/**
 * Application Source
 */
export const ApplicationSource = z.enum([
  'direct',
  'referral',
  'job_board',
  'social_media',
  'company_website',
  'recruiter',
  'event',
  'university',
  'other',
]);

export type ApplicationSourceType = z.infer<typeof ApplicationSource>;

/**
 * Interview Type
 */
export const InterviewType = z.enum([
  'phone',
  'video',
  'in_person',
  'technical',
  'behavioral',
  'panel',
  'group',
  'presentation',
  'case_study',
  'portfolio_review',
]);

export type InterviewTypeType = z.infer<typeof InterviewType>;

/**
 * Interview Status
 */
export const InterviewStatus = z.enum([
  'scheduled',
  'confirmed',
  'rescheduled',
  'completed',
  'cancelled',
  'no_show',
]);

export type InterviewStatusType = z.infer<typeof InterviewStatus>;

/**
 * Assessment Type
 */
export const AssessmentType = z.enum([
  'coding_challenge',
  'technical_test',
  'personality_test',
  'cognitive_test',
  'skills_assessment',
  'case_study',
  'portfolio_review',
  'writing_sample',
  'presentation',
  'work_sample',
]);

export type AssessmentTypeType = z.infer<typeof AssessmentType>;

/**
 * Screening Question Response
 */
export const ScreeningResponse = z.object({
  questionId: z.string(),
  question: z.string(),
  response: z.any(), // Can be string, number, array, or file URL
  responseType: z.enum(['text', 'multiple_choice', 'yes_no', 'scale', 'file']),
});

export type ScreeningResponseType = z.infer<typeof ScreeningResponse>;

/**
 * Application Document
 */
export const ApplicationDocument = z.object({
  id: z.string(),
  type: z.enum(['resume', 'cover_letter', 'portfolio', 'transcript', 'certificate', 'reference', 'other']),
  name: z.string(),
  url: z.string().url(),
  mimeType: z.string(),
  size: z.number(),
  uploadedAt: z.date(),
  isRequired: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

export type ApplicationDocumentType = z.infer<typeof ApplicationDocument>;

/**
 * Reference Contact
 */
export const ReferenceContact = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  company: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  relationship: z.enum(['manager', 'colleague', 'client', 'professor', 'mentor', 'other']),
  yearsKnown: z.number().optional(),
  canContact: z.boolean().default(true),
  contacted: z.boolean().default(false),
  contactedAt: z.date().optional(),
  response: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export type ReferenceContactType = z.infer<typeof ReferenceContact>;

/**
 * Interview Details
 */
export const Interview = z.object({
  id: z.string(),
  applicationId: z.string(),
  type: InterviewType,
  status: InterviewStatus,
  round: z.number().default(1),
  
  // Scheduling
  scheduledAt: z.date(),
  duration: z.number(), // in minutes
  timezone: z.string(),
  
  // Participants
  interviewers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    title: z.string(),
    email: z.string().email(),
  })),
  
  // Location/Platform
  location: z.string().optional(), // Physical address or video platform
  meetingLink: z.string().url().optional(),
  meetingId: z.string().optional(),
  dialInNumber: z.string().optional(),
  
  // Preparation
  agenda: z.string().optional(),
  preparationInstructions: z.string().optional(),
  documentsToReview: z.array(z.string()).optional(),
  
  // Follow-up
  feedback: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  recommendation: z.enum(['hire', 'maybe', 'no_hire']).optional(),
  nextSteps: z.string().optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type InterviewDetailsType = z.infer<typeof Interview>;

/**
 * Assessment Details
 */
export const Assessment = z.object({
  id: z.string(),
  applicationId: z.string(),
  type: AssessmentType,
  title: z.string(),
  description: z.string().optional(),
  
  // Timing
  assignedAt: z.date(),
  dueAt: z.date().optional(),
  submittedAt: z.date().optional(),
  reviewedAt: z.date().optional(),
  
  // Instructions
  instructions: z.string(),
  timeLimit: z.number().optional(), // in minutes
  allowedAttempts: z.number().default(1),
  currentAttempts: z.number().default(0),
  
  // Submission
  submissionUrl: z.string().url().optional(),
  submissionText: z.string().optional(),
  submissionFiles: z.array(ApplicationDocument).optional(),
  
  // Evaluation
  score: z.number().optional(),
  maxScore: z.number().optional(),
  feedback: z.string().optional(),
  reviewedBy: z.string().optional(),
  
  // Status
  status: z.enum(['assigned', 'in_progress', 'submitted', 'reviewed', 'passed', 'failed']),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type AssessmentDetailsType = z.infer<typeof Assessment>;

/**
 * Application Timeline Event
 */
export const TimelineEvent = z.object({
  id: z.string(),
  type: z.enum([
    'application_submitted',
    'status_changed',
    'interview_scheduled',
    'interview_completed',
    'assessment_assigned',
    'assessment_completed',
    'note_added',
    'email_sent',
    'document_uploaded',
    'reference_contacted',
    'offer_extended',
    'offer_response',
    'hired',
    'rejected',
  ]),
  title: z.string(),
  description: z.string().optional(),
  performedBy: z.string().optional(), // User ID of who performed the action
  performerName: z.string().optional(),
  performerRole: z.enum(['applicant', 'recruiter', 'hiring_manager', 'interviewer', 'system']).optional(),
  
  // Related entities
  relatedId: z.string().optional(), // ID of related entity (interview, assessment, etc.)
  
  // Data
  data: z.record(z.any()).optional(),
  
  // Timestamps
  createdAt: z.date(),
  
  // Visibility
  isVisible: z.boolean().default(true),
  visibleTo: z.array(z.enum(['applicant', 'recruiter', 'hiring_manager', 'all'])).default(['all']),
});

export type TimelineEventType = z.infer<typeof TimelineEvent>;

/**
 * Application Note
 */
export const ApplicationNote = z.object({
  id: z.string(),
  content: z.string(),
  createdBy: z.string(),
  createdByName: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isPrivate: z.boolean().default(false), // Not visible to applicant
  attachments: z.array(ApplicationDocument).optional(),
  tags: z.array(z.string()).optional(),
});

export type ApplicationNoteType = z.infer<typeof ApplicationNote>;

/**
 * Offer Details
 */
export const JobOffer = z.object({
  id: z.string(),
  applicationId: z.string(),
  
  // Position Details
  title: z.string(),
  department: z.string().optional(),
  startDate: z.date(),
  
  // Compensation
  salary: z.object({
    amount: z.number(),
    currency: z.string().default('USD'),
    period: z.enum(['hourly', 'monthly', 'annually']),
  }),
  bonus: z.object({
    amount: z.number().optional(),
    type: z.enum(['signing', 'performance', 'annual']).optional(),
    description: z.string().optional(),
  }).optional(),
  equity: z.object({
    percentage: z.number().optional(),
    shares: z.number().optional(),
    vestingPeriod: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  
  // Benefits
  benefits: z.array(z.string()),
  
  // Terms
  employmentType: z.enum(['full_time', 'part_time', 'contract']),
  probationPeriod: z.number().optional(), // in months
  noticePeriod: z.number().optional(), // in days
  
  // Documents
  offerLetterUrl: z.string().url().optional(),
  contractUrl: z.string().url().optional(),
  
  // Status and Timing
  status: z.enum(['draft', 'extended', 'accepted', 'declined', 'expired', 'withdrawn']),
  extendedAt: z.date(),
  expiresAt: z.date(),
  respondedAt: z.date().optional(),
  
  // Response
  response: z.enum(['accepted', 'declined', 'negotiating']).optional(),
  responseNotes: z.string().optional(),
  negotiationRequests: z.array(z.object({
    item: z.string(),
    currentValue: z.string(),
    requestedValue: z.string(),
    justification: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']),
  })).optional(),
  
  // Approval
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type JobOfferType = z.infer<typeof JobOffer>;

/**
 * Main Job Application Schema
 */
export const JobApplication = z.object({
  id: z.string(),
  jobId: z.string(),
  applicantId: z.string(),
  
  // Application Details
  status: ApplicationStatus,
  source: ApplicationSource,
  referredBy: z.string().optional(), // User ID of referrer
  
  // Application Content
  coverLetter: z.string().optional(),
  expectedSalary: z.number().optional(),
  availableStartDate: z.date().optional(),
  willingToRelocate: z.boolean().default(false),
  requiresSponsorship: z.boolean().default(false),
  
  // Screening Responses
  screeningResponses: z.array(ScreeningResponse).optional(),
  
  // Documents
  documents: z.array(ApplicationDocument),
  
  // References
  references: z.array(ReferenceContact).optional(),
  
  // Process Tracking
  currentStage: z.string().optional(),
  interviews: z.array(Interview).optional(),
  assessments: z.array(Assessment).optional(),
  timeline: z.array(TimelineEvent),
  notes: z.array(ApplicationNote).optional(),
  
  // Offer
  offer: JobOffer.optional(),
  
  // Ratings and Scores
  overallRating: z.number().min(1).max(5).optional(),
  cultureFit: z.number().min(1).max(5).optional(),
  technicalSkills: z.number().min(1).max(5).optional(),
  communicationSkills: z.number().min(1).max(5).optional(),
  
  // Flags
  isShortlisted: z.boolean().default(false),
  isFlagged: z.boolean().default(false),
  flagReason: z.string().optional(),
  
  // Communication
  lastContactDate: z.date().optional(),
  nextFollowUpDate: z.date().optional(),
  communicationPreference: z.enum(['email', 'phone', 'text']).default('email'),
  
  // Privacy
  gdprConsent: z.boolean().default(false),
  dataRetentionConsent: z.boolean().default(false),
  marketingConsent: z.boolean().default(false),
  
  // Diversity Data (optional, anonymized)
  diversityData: z.object({
    gender: z.string().optional(),
    ethnicity: z.string().optional(),
    veteranStatus: z.boolean().optional(),
    disabilityStatus: z.boolean().optional(),
    age: z.number().optional(),
    providedVoluntarily: z.boolean().default(true),
  }).optional(),
  
  // Platform Context
  appId: z.string(),
  organizationId: z.string().optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  submittedAt: z.date(),
  withdrawnAt: z.date().optional(),
  
  // Analytics
  viewCount: z.number().default(0),
  lastViewedAt: z.date().optional(),
  
  // Custom Fields
  customFields: z.record(z.any()).optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type JobApplicationType = z.infer<typeof JobApplication>;