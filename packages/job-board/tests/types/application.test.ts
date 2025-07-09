import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  ApplicationStatus,
  ApplicationStatusType,
  ApplicationSource,
  ApplicationSourceType,
  InterviewType,
  InterviewTypeType,
  InterviewStatus,
  InterviewStatusType,
  AssessmentType,
  AssessmentTypeType,
  ScreeningResponse,
  ScreeningResponseType,
  ApplicationDocument,
  ApplicationDocumentType,
  ReferenceContact,
  ReferenceContactType,
  Interview,
  InterviewDetailsType,
  Assessment,
  AssessmentDetailsType,
  TimelineEvent,
  TimelineEventType,
  ApplicationNote,
  ApplicationNoteType,
  JobOffer,
  JobOfferType,
  JobApplication,
  JobApplicationType,
} from '../../src/types/application'

describe('Application Types', () => {
  describe('ApplicationStatus', () => {
    it('should accept valid application statuses', () => {
      const validStatuses = [
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
      ]

      validStatuses.forEach(status => {
        expect(() => ApplicationStatus.parse(status)).not.toThrow()
      })
    })

    it('should reject invalid application statuses', () => {
      const invalidStatuses = ['pending', 'approved', 'declined', '']

      invalidStatuses.forEach(status => {
        expect(() => ApplicationStatus.parse(status)).toThrow()
      })
    })
  })

  describe('ApplicationSource', () => {
    it('should accept valid application sources', () => {
      const validSources = [
        'direct',
        'referral',
        'job_board',
        'social_media',
        'company_website',
        'recruiter',
        'event',
        'university',
        'other',
      ]

      validSources.forEach(source => {
        expect(() => ApplicationSource.parse(source)).not.toThrow()
      })
    })

    it('should reject invalid application sources', () => {
      const invalidSources = ['linkedin', 'facebook', 'indeed', '']

      invalidSources.forEach(source => {
        expect(() => ApplicationSource.parse(source)).toThrow()
      })
    })
  })

  describe('InterviewType', () => {
    it('should accept valid interview types', () => {
      const validTypes = [
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
      ]

      validTypes.forEach(type => {
        expect(() => InterviewType.parse(type)).not.toThrow()
      })
    })

    it('should reject invalid interview types', () => {
      const invalidTypes = ['online', 'face_to_face', 'screening', '']

      invalidTypes.forEach(type => {
        expect(() => InterviewType.parse(type)).toThrow()
      })
    })
  })

  describe('InterviewStatus', () => {
    it('should accept valid interview statuses', () => {
      const validStatuses = [
        'scheduled',
        'confirmed',
        'rescheduled',
        'completed',
        'cancelled',
        'no_show',
      ]

      validStatuses.forEach(status => {
        expect(() => InterviewStatus.parse(status)).not.toThrow()
      })
    })

    it('should reject invalid interview statuses', () => {
      const invalidStatuses = ['pending', 'active', 'finished', '']

      invalidStatuses.forEach(status => {
        expect(() => InterviewStatus.parse(status)).toThrow()
      })
    })
  })

  describe('AssessmentType', () => {
    it('should accept valid assessment types', () => {
      const validTypes = [
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
      ]

      validTypes.forEach(type => {
        expect(() => AssessmentType.parse(type)).not.toThrow()
      })
    })

    it('should reject invalid assessment types', () => {
      const invalidTypes = ['quiz', 'exam', 'homework', '']

      invalidTypes.forEach(type => {
        expect(() => AssessmentType.parse(type)).toThrow()
      })
    })
  })

  describe('ScreeningResponse', () => {
    it('should create valid screening response', () => {
      const validResponse = {
        questionId: 'q1',
        question: 'Do you have experience with React?',
        response: 'Yes',
        responseType: 'yes_no',
      }

      expect(() => ScreeningResponse.parse(validResponse)).not.toThrow()
      const parsed = ScreeningResponse.parse(validResponse)
      expect(parsed.questionId).toBe('q1')
      expect(parsed.response).toBe('Yes')
    })

    it('should accept different response types', () => {
      const responses = [
        {
          questionId: 'q1',
          question: 'Experience level?',
          response: 'Senior',
          responseType: 'multiple_choice',
        },
        {
          questionId: 'q2',
          question: 'Rate your skills',
          response: 8,
          responseType: 'scale',
        },
        {
          questionId: 'q3',
          question: 'Upload portfolio',
          response: 'https://example.com/portfolio.pdf',
          responseType: 'file',
        },
      ]

      responses.forEach(response => {
        expect(() => ScreeningResponse.parse(response)).not.toThrow()
      })
    })
  })

  describe('ApplicationDocument', () => {
    it('should create valid application document', () => {
      const validDocument = {
        id: 'doc-123',
        type: 'resume',
        name: 'John_Doe_Resume.pdf',
        url: 'https://example.com/resume.pdf',
        mimeType: 'application/pdf',
        size: 102400,
        uploadedAt: new Date('2024-01-01'),
        isRequired: true,
      }

      expect(() => ApplicationDocument.parse(validDocument)).not.toThrow()
      const parsed = ApplicationDocument.parse(validDocument)
      expect(parsed.type).toBe('resume')
      expect(parsed.isRequired).toBe(true)
    })

    it('should accept all valid document types', () => {
      const validDocumentTypes = [
        'resume',
        'cover_letter',
        'portfolio',
        'transcript',
        'certificate',
        'reference',
        'other',
      ]

      validDocumentTypes.forEach(type => {
        const document = {
          id: `doc-${type}`,
          type,
          name: `${type}.pdf`,
          url: 'https://example.com/document.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          uploadedAt: new Date(),
        }

        expect(() => ApplicationDocument.parse(document)).not.toThrow()
      })
    })

    it('should use default values for optional fields', () => {
      const minimalDocument = {
        id: 'doc-minimal',
        type: 'resume',
        name: 'resume.pdf',
        url: 'https://example.com/resume.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        uploadedAt: new Date(),
      }

      const parsed = ApplicationDocument.parse(minimalDocument)
      expect(parsed.isRequired).toBe(false) // default value
    })
  })

  describe('ReferenceContact', () => {
    it('should create valid reference contact', () => {
      const validReference = {
        id: 'ref-123',
        name: 'Jane Smith',
        title: 'Senior Manager',
        company: 'Tech Corp',
        email: 'jane.smith@techcorp.com',
        phone: '+1-555-0123',
        relationship: 'manager',
        yearsKnown: 3,
        canContact: true,
        contacted: false,
        rating: 5,
      }

      expect(() => ReferenceContact.parse(validReference)).not.toThrow()
      const parsed = ReferenceContact.parse(validReference)
      expect(parsed.relationship).toBe('manager')
      expect(parsed.rating).toBe(5)
    })

    it('should accept all valid relationship types', () => {
      const validRelationships = [
        'manager',
        'colleague',
        'client',
        'professor',
        'mentor',
        'other',
      ]

      validRelationships.forEach(relationship => {
        const reference = {
          id: `ref-${relationship}`,
          name: 'Test Person',
          title: 'Test Title',
          company: 'Test Company',
          email: 'test@example.com',
          relationship,
        }

        expect(() => ReferenceContact.parse(reference)).not.toThrow()
      })
    })

    it('should use default values for optional fields', () => {
      const minimalReference = {
        id: 'ref-minimal',
        name: 'Test Person',
        title: 'Test Title',
        company: 'Test Company',
        email: 'test@example.com',
        relationship: 'colleague',
      }

      const parsed = ReferenceContact.parse(minimalReference)
      expect(parsed.canContact).toBe(true) // default
      expect(parsed.contacted).toBe(false) // default
    })

    it('should validate email format', () => {
      const invalidReference = {
        id: 'ref-invalid',
        name: 'Test Person',
        title: 'Test Title',
        company: 'Test Company',
        email: 'invalid-email',
        relationship: 'colleague',
      }

      expect(() => ReferenceContact.parse(invalidReference)).toThrow()
    })

    it('should validate rating range', () => {
      const invalidRating = {
        id: 'ref-rating',
        name: 'Test Person',
        title: 'Test Title',
        company: 'Test Company',
        email: 'test@example.com',
        relationship: 'colleague',
        rating: 6, // Invalid: should be 1-5
      }

      expect(() => ReferenceContact.parse(invalidRating)).toThrow()
    })
  })

  describe('Interview', () => {
    it('should create valid interview', () => {
      const validInterview = {
        id: 'interview-123',
        applicationId: 'app-123',
        type: 'video',
        status: 'scheduled',
        round: 1,
        scheduledAt: new Date('2024-01-15T10:00:00Z'),
        duration: 60,
        timezone: 'America/New_York',
        interviewers: [
          {
            id: 'interviewer-1',
            name: 'John Interviewer',
            title: 'Senior Engineer',
            email: 'john@company.com',
          },
        ],
        meetingLink: 'https://zoom.us/j/123456789',
        agenda: 'Technical discussion about React experience',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      expect(() => Interview.parse(validInterview)).not.toThrow()
      const parsed = Interview.parse(validInterview)
      expect(parsed.type).toBe('video')
      expect(parsed.round).toBe(1)
      expect(parsed.duration).toBe(60)
    })

    it('should use default values for optional fields', () => {
      const minimalInterview = {
        id: 'interview-minimal',
        applicationId: 'app-minimal',
        type: 'phone',
        status: 'scheduled',
        scheduledAt: new Date('2024-01-15T10:00:00Z'),
        duration: 30,
        timezone: 'UTC',
        interviewers: [
          {
            id: 'interviewer-1',
            name: 'Jane Interviewer',
            title: 'HR Manager',
            email: 'jane@company.com',
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      const parsed = Interview.parse(minimalInterview)
      expect(parsed.round).toBe(1) // default value
    })

    it('should validate interviewer email format', () => {
      const invalidInterview = {
        id: 'interview-invalid',
        applicationId: 'app-invalid',
        type: 'video',
        status: 'scheduled',
        scheduledAt: new Date('2024-01-15T10:00:00Z'),
        duration: 60,
        timezone: 'UTC',
        interviewers: [
          {
            id: 'interviewer-1',
            name: 'John Interviewer',
            title: 'Senior Engineer',
            email: 'invalid-email', // Invalid email format
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      expect(() => Interview.parse(invalidInterview)).toThrow()
    })

    it('should validate rating range', () => {
      const interviewWithInvalidRating = {
        id: 'interview-rating',
        applicationId: 'app-rating',
        type: 'video',
        status: 'completed',
        scheduledAt: new Date('2024-01-15T10:00:00Z'),
        duration: 60,
        timezone: 'UTC',
        interviewers: [
          {
            id: 'interviewer-1',
            name: 'John Interviewer',
            title: 'Senior Engineer',
            email: 'john@company.com',
          },
        ],
        rating: 6, // Invalid: should be 1-5
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      expect(() => Interview.parse(interviewWithInvalidRating)).toThrow()
    })
  })

  describe('Assessment', () => {
    it('should create valid assessment', () => {
      const validAssessment = {
        id: 'assessment-123',
        applicationId: 'app-123',
        type: 'coding_challenge',
        title: 'React Component Challenge',
        description: 'Build a React component with specific requirements',
        assignedAt: new Date('2024-01-01'),
        dueAt: new Date('2024-01-08'),
        instructions: 'Create a reusable component following the provided specifications',
        timeLimit: 180,
        status: 'assigned',
      }

      expect(() => Assessment.parse(validAssessment)).not.toThrow()
      const parsed = Assessment.parse(validAssessment)
      expect(parsed.type).toBe('coding_challenge')
      expect(parsed.timeLimit).toBe(180)
    })

    it('should use default values for optional fields', () => {
      const minimalAssessment = {
        id: 'assessment-minimal',
        applicationId: 'app-minimal',
        type: 'skills_assessment',
        title: 'Skills Test',
        assignedAt: new Date('2024-01-01'),
        instructions: 'Complete the skills assessment',
        status: 'assigned',
      }

      const parsed = Assessment.parse(minimalAssessment)
      expect(parsed.allowedAttempts).toBe(1) // default
      expect(parsed.currentAttempts).toBe(0) // default
    })

    it('should accept assessment with submission', () => {
      const completedAssessment = {
        id: 'assessment-completed',
        applicationId: 'app-completed',
        type: 'coding_challenge',
        title: 'Algorithm Challenge',
        assignedAt: new Date('2024-01-01'),
        submittedAt: new Date('2024-01-05'),
        instructions: 'Solve the algorithm problem',
        submissionUrl: 'https://github.com/user/solution',
        submissionText: 'Here is my solution explanation...',
        score: 85,
        maxScore: 100,
        feedback: 'Good solution, minor optimization opportunities',
        status: 'reviewed',
      }

      expect(() => Assessment.parse(completedAssessment)).not.toThrow()
      const parsed = Assessment.parse(completedAssessment)
      expect(parsed.score).toBe(85)
      expect(parsed.status).toBe('reviewed')
    })
  })

  describe('TimelineEvent', () => {
    it('should create valid timeline event', () => {
      const validEvent = {
        id: 'event-123',
        type: 'application_submitted',
        title: 'Application Submitted',
        description: 'Candidate submitted their application',
        performedBy: 'user-123',
        performerName: 'John Doe',
        performerRole: 'applicant',
        createdAt: new Date('2024-01-01'),
      }

      expect(() => TimelineEvent.parse(validEvent)).not.toThrow()
      const parsed = TimelineEvent.parse(validEvent)
      expect(parsed.type).toBe('application_submitted')
      expect(parsed.performerRole).toBe('applicant')
    })

    it('should accept all valid event types', () => {
      const validEventTypes = [
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
      ]

      validEventTypes.forEach(type => {
        const event = {
          id: `event-${type}`,
          type,
          title: `Event ${type}`,
          createdAt: new Date('2024-01-01'),
        }

        expect(() => TimelineEvent.parse(event)).not.toThrow()
      })
    })

    it('should use default values for optional fields', () => {
      const minimalEvent = {
        id: 'event-minimal',
        type: 'note_added',
        title: 'Note Added',
        createdAt: new Date('2024-01-01'),
      }

      const parsed = TimelineEvent.parse(minimalEvent)
      expect(parsed.isVisible).toBe(true) // default
      expect(parsed.visibleTo).toEqual(['all']) // default
    })

    it('should accept event with data', () => {
      const eventWithData = {
        id: 'event-data',
        type: 'status_changed',
        title: 'Status Changed',
        relatedId: 'app-123',
        data: {
          oldStatus: 'screening',
          newStatus: 'interview',
          reason: 'Candidate passed initial screening',
        },
        createdAt: new Date('2024-01-01'),
      }

      expect(() => TimelineEvent.parse(eventWithData)).not.toThrow()
      const parsed = TimelineEvent.parse(eventWithData)
      expect(parsed.data).toEqual({
        oldStatus: 'screening',
        newStatus: 'interview',
        reason: 'Candidate passed initial screening',
      })
    })
  })

  describe('ApplicationNote', () => {
    it('should create valid application note', () => {
      const validNote = {
        id: 'note-123',
        content: 'Candidate shows strong technical skills',
        createdBy: 'user-123',
        createdByName: 'Jane Interviewer',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isPrivate: false,
        tags: ['technical', 'positive'],
      }

      expect(() => ApplicationNote.parse(validNote)).not.toThrow()
      const parsed = ApplicationNote.parse(validNote)
      expect(parsed.content).toBe('Candidate shows strong technical skills')
      expect(parsed.isPrivate).toBe(false)
    })

    it('should use default values for optional fields', () => {
      const minimalNote = {
        id: 'note-minimal',
        content: 'Basic note content',
        createdBy: 'user-minimal',
        createdByName: 'Test User',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      const parsed = ApplicationNote.parse(minimalNote)
      expect(parsed.isPrivate).toBe(false) // default
    })

    it('should accept note with attachments', () => {
      const noteWithAttachments = {
        id: 'note-attachments',
        content: 'Please review the attached documents',
        createdBy: 'user-attachments',
        createdByName: 'HR Manager',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        attachments: [
          {
            id: 'doc-attach',
            type: 'other',
            name: 'evaluation.pdf',
            url: 'https://example.com/evaluation.pdf',
            mimeType: 'application/pdf',
            size: 1024,
            uploadedAt: new Date('2024-01-01'),
          },
        ],
      }

      expect(() => ApplicationNote.parse(noteWithAttachments)).not.toThrow()
      const parsed = ApplicationNote.parse(noteWithAttachments)
      expect(parsed.attachments).toHaveLength(1)
    })
  })

  describe('JobOffer', () => {
    it('should create valid job offer', () => {
      const validOffer = {
        id: 'offer-123',
        applicationId: 'app-123',
        title: 'Senior Software Engineer',
        startDate: new Date('2024-02-01'),
        salary: {
          amount: 120000,
          currency: 'USD',
          period: 'annually',
        },
        benefits: ['Health Insurance', 'Dental Insurance', 'Retirement Plan'],
        employmentType: 'full_time',
        status: 'extended',
        extendedAt: new Date('2024-01-15'),
        expiresAt: new Date('2024-01-30'),
      }

      expect(() => JobOffer.parse(validOffer)).not.toThrow()
      const parsed = JobOffer.parse(validOffer)
      expect(parsed.salary.amount).toBe(120000)
      expect(parsed.employmentType).toBe('full_time')
      expect(parsed.status).toBe('extended')
    })

    it('should accept offer with bonus and equity', () => {
      const offerWithExtras = {
        id: 'offer-extras',
        applicationId: 'app-extras',
        title: 'Principal Engineer',
        startDate: new Date('2024-02-01'),
        salary: {
          amount: 180000,
          currency: 'USD',
          period: 'annually',
        },
        bonus: {
          amount: 25000,
          type: 'signing',
          description: 'One-time signing bonus',
        },
        equity: {
          percentage: 0.5,
          vestingPeriod: '4 years',
          description: 'Stock options with 1-year cliff',
        },
        benefits: ['Comprehensive package'],
        employmentType: 'full_time',
        status: 'extended',
        extendedAt: new Date('2024-01-15'),
        expiresAt: new Date('2024-01-30'),
      }

      expect(() => JobOffer.parse(offerWithExtras)).not.toThrow()
      const parsed = JobOffer.parse(offerWithExtras)
      expect(parsed.bonus?.amount).toBe(25000)
      expect(parsed.equity?.percentage).toBe(0.5)
    })

    it('should accept offer with negotiation requests', () => {
      const offerWithNegotiation = {
        id: 'offer-negotiation',
        applicationId: 'app-negotiation',
        title: 'Software Engineer',
        startDate: new Date('2024-02-01'),
        salary: {
          amount: 100000,
          currency: 'USD',
          period: 'annually',
        },
        benefits: ['Health Insurance'],
        employmentType: 'full_time',
        status: 'extended',
        extendedAt: new Date('2024-01-15'),
        expiresAt: new Date('2024-01-30'),
        response: 'negotiating',
        negotiationRequests: [
          {
            item: 'salary',
            currentValue: '100000',
            requestedValue: '110000',
            justification: 'Market rate for similar roles',
            status: 'pending',
          },
        ],
      }

      expect(() => JobOffer.parse(offerWithNegotiation)).not.toThrow()
      const parsed = JobOffer.parse(offerWithNegotiation)
      expect(parsed.response).toBe('negotiating')
      expect(parsed.negotiationRequests).toHaveLength(1)
    })

    it('should use default currency', () => {
      const minimalOffer = {
        id: 'offer-minimal',
        applicationId: 'app-minimal',
        title: 'Developer',
        startDate: new Date('2024-02-01'),
        salary: {
          amount: 80000,
          period: 'annually',
        },
        benefits: [],
        employmentType: 'full_time',
        status: 'extended',
        extendedAt: new Date('2024-01-15'),
        expiresAt: new Date('2024-01-30'),
      }

      const parsed = JobOffer.parse(minimalOffer)
      expect(parsed.salary.currency).toBe('USD') // default
    })
  })

  describe('JobApplication', () => {
    it('should create valid complete job application', () => {
      const validApplication = {
        id: 'app-123',
        jobId: 'job-123',
        applicantId: 'user-123',
        status: 'submitted',
        source: 'direct',
        coverLetter: 'I am excited to apply for this position...',
        expectedSalary: 100000,
        availableStartDate: new Date('2024-02-01'),
        willingToRelocate: false,
        requiresSponsorship: false,
        documents: [
          {
            id: 'doc-resume',
            type: 'resume',
            name: 'resume.pdf',
            url: 'https://example.com/resume.pdf',
            mimeType: 'application/pdf',
            size: 1024,
            uploadedAt: new Date('2024-01-01'),
          },
        ],
        timeline: [
          {
            id: 'timeline-1',
            type: 'application_submitted',
            title: 'Application Submitted',
            createdAt: new Date('2024-01-01'),
          },
        ],
        appId: 'app-platform',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        submittedAt: new Date('2024-01-01'),
      }

      expect(() => JobApplication.parse(validApplication)).not.toThrow()
      const parsed = JobApplication.parse(validApplication)
      expect(parsed.status).toBe('submitted')
      expect(parsed.expectedSalary).toBe(100000)
      expect(parsed.documents).toHaveLength(1)
      expect(parsed.timeline).toHaveLength(1)
    })

    it('should use default values for optional fields', () => {
      const minimalApplication = {
        id: 'app-minimal',
        jobId: 'job-minimal',
        applicantId: 'user-minimal',
        status: 'draft',
        source: 'direct',
        documents: [],
        timeline: [],
        appId: 'app-platform',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        submittedAt: new Date('2024-01-01'),
      }

      const parsed = JobApplication.parse(minimalApplication)
      expect(parsed.willingToRelocate).toBe(false) // default
      expect(parsed.requiresSponsorship).toBe(false) // default
      expect(parsed.isShortlisted).toBe(false) // default
      expect(parsed.isFlagged).toBe(false) // default
      expect(parsed.viewCount).toBe(0) // default
      expect(parsed.communicationPreference).toBe('email') // default
    })

    it('should accept application with screening responses', () => {
      const applicationWithScreening = {
        id: 'app-screening',
        jobId: 'job-screening',
        applicantId: 'user-screening',
        status: 'submitted',
        source: 'job_board',
        screeningResponses: [
          {
            questionId: 'q1',
            question: 'Years of experience?',
            response: '5',
            responseType: 'text',
          },
          {
            questionId: 'q2',
            question: 'Available for remote work?',
            response: 'Yes',
            responseType: 'yes_no',
          },
        ],
        documents: [],
        timeline: [],
        appId: 'app-platform',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        submittedAt: new Date('2024-01-01'),
      }

      expect(() => JobApplication.parse(applicationWithScreening)).not.toThrow()
      const parsed = JobApplication.parse(applicationWithScreening)
      expect(parsed.screeningResponses).toHaveLength(2)
    })

    it('should accept application with references', () => {
      const applicationWithReferences = {
        id: 'app-references',
        jobId: 'job-references',
        applicantId: 'user-references',
        status: 'submitted',
        source: 'referral',
        referredBy: 'user-referrer',
        references: [
          {
            id: 'ref-1',
            name: 'Jane Manager',
            title: 'Engineering Manager',
            company: 'Previous Company',
            email: 'jane@previous.com',
            relationship: 'manager',
          },
        ],
        documents: [],
        timeline: [],
        appId: 'app-platform',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        submittedAt: new Date('2024-01-01'),
      }

      expect(() => JobApplication.parse(applicationWithReferences)).not.toThrow()
      const parsed = JobApplication.parse(applicationWithReferences)
      expect(parsed.referredBy).toBe('user-referrer')
      expect(parsed.references).toHaveLength(1)
    })

    it('should accept application with ratings and flags', () => {
      const applicationWithRatings = {
        id: 'app-ratings',
        jobId: 'job-ratings',
        applicantId: 'user-ratings',
        status: 'screening',
        source: 'direct',
        overallRating: 4,
        cultureFit: 5,
        technicalSkills: 4,
        communicationSkills: 5,
        isShortlisted: true,
        isFlagged: false,
        documents: [],
        timeline: [],
        appId: 'app-platform',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        submittedAt: new Date('2024-01-01'),
      }

      expect(() => JobApplication.parse(applicationWithRatings)).not.toThrow()
      const parsed = JobApplication.parse(applicationWithRatings)
      expect(parsed.overallRating).toBe(4)
      expect(parsed.isShortlisted).toBe(true)
    })

    it('should accept application with diversity data', () => {
      const applicationWithDiversity = {
        id: 'app-diversity',
        jobId: 'job-diversity',
        applicantId: 'user-diversity',
        status: 'submitted',
        source: 'direct',
        diversityData: {
          gender: 'Female',
          ethnicity: 'Asian',
          veteranStatus: false,
          disabilityStatus: false,
          age: 28,
          providedVoluntarily: true,
        },
        documents: [],
        timeline: [],
        appId: 'app-platform',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        submittedAt: new Date('2024-01-01'),
      }

      expect(() => JobApplication.parse(applicationWithDiversity)).not.toThrow()
      const parsed = JobApplication.parse(applicationWithDiversity)
      expect(parsed.diversityData?.gender).toBe('Female')
      expect(parsed.diversityData?.providedVoluntarily).toBe(true)
    })

    it('should validate rating ranges', () => {
      const applicationWithInvalidRating = {
        id: 'app-invalid-rating',
        jobId: 'job-invalid-rating',
        applicantId: 'user-invalid-rating',
        status: 'submitted',
        source: 'direct',
        overallRating: 6, // Invalid: should be 1-5
        documents: [],
        timeline: [],
        appId: 'app-platform',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        submittedAt: new Date('2024-01-01'),
      }

      expect(() => JobApplication.parse(applicationWithInvalidRating)).toThrow()
    })

    it('should require all mandatory fields', () => {
      const incompleteApplication = {
        id: 'app-incomplete',
        jobId: 'job-incomplete',
        // Missing applicantId and other required fields
      }

      expect(() => JobApplication.parse(incompleteApplication)).toThrow()
    })
  })

  describe('Type inference', () => {
    it('should properly infer TypeScript types', () => {
      const applicationStatus: ApplicationStatusType = 'submitted'
      const applicationSource: ApplicationSourceType = 'job_board'
      const interviewType: InterviewTypeType = 'video'
      const interviewStatus: InterviewStatusType = 'scheduled'
      const assessmentType: AssessmentTypeType = 'coding_challenge'

      // These should compile without errors
      expect(applicationStatus).toBe('submitted')
      expect(applicationSource).toBe('job_board')
      expect(interviewType).toBe('video')
      expect(interviewStatus).toBe('scheduled')
      expect(assessmentType).toBe('coding_challenge')
    })

    it('should infer complex object types', () => {
      const document: ApplicationDocumentType = {
        id: 'doc-test',
        type: 'resume',
        name: 'test.pdf',
        url: 'https://example.com/test.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        uploadedAt: new Date(),
        isRequired: false,
      }

      const reference: ReferenceContactType = {
        id: 'ref-test',
        name: 'Test Reference',
        title: 'Manager',
        company: 'Test Company',
        email: 'test@example.com',
        relationship: 'manager',
        canContact: true,
        contacted: false,
      }

      expect(document.type).toBe('resume')
      expect(reference.relationship).toBe('manager')
    })
  })
})