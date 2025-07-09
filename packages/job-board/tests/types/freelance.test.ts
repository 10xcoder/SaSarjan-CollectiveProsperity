import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  ProjectType,
  ProjectTypeType,
  ProjectStatus,
  ProjectStatusType,
  ProjectDuration,
  ProjectDurationType,
  RequiredExperience,
  RequiredExperienceType,
  ProposalStatus,
  ProposalStatusType,
  ContractStatus,
  ContractStatusType,
  MilestoneStatus,
  MilestoneStatusType,
  PaymentStatus,
  PaymentStatusType,
  ProjectBudget,
  ProjectBudgetType,
  ProjectMilestone,
  ProjectMilestoneType,
  SkillRequirement,
  SkillRequirementType,
  ProjectAttachment,
  ProjectAttachmentType,
  ClientInfo,
  ClientInfoType,
  ProjectPosting,
  ProjectPostingType,
  ProjectProposal,
  ProjectProposalType,
  ProjectContract,
  ProjectContractType,
  TimeEntry,
  TimeEntryType,
  PaymentTransaction,
  PaymentTransactionType,
} from '../../src/types/freelance'

describe('Freelance Types', () => {
  describe('ProjectType', () => {
    it('should accept valid project types', () => {
      const validTypes = [
        'fixed_price',
        'hourly',
        'retainer',
        'milestone',
        'contest',
        'equity',
        'revenue_share',
      ]

      validTypes.forEach(type => {
        expect(() => ProjectType.parse(type)).not.toThrow()
      })
    })

    it('should reject invalid project types', () => {
      const invalidTypes = ['fixed', 'per_hour', 'monthly', '']

      invalidTypes.forEach(type => {
        expect(() => ProjectType.parse(type)).toThrow()
      })
    })
  })

  describe('ProjectStatus', () => {
    it('should accept valid project statuses', () => {
      const validStatuses = [
        'draft',
        'open',
        'in_progress',
        'review',
        'revision',
        'completed',
        'cancelled',
        'disputed',
        'closed',
      ]

      validStatuses.forEach(status => {
        expect(() => ProjectStatus.parse(status)).not.toThrow()
      })
    })

    it('should reject invalid project statuses', () => {
      const invalidStatuses = ['active', 'pending', 'finished', '']

      invalidStatuses.forEach(status => {
        expect(() => ProjectStatus.parse(status)).toThrow()
      })
    })
  })

  describe('ProjectDuration', () => {
    it('should accept valid project durations', () => {
      const validDurations = [
        'less_than_week',
        'one_to_four_weeks',
        'one_to_three_months',
        'three_to_six_months',
        'six_months_plus',
        'ongoing',
      ]

      validDurations.forEach(duration => {
        expect(() => ProjectDuration.parse(duration)).not.toThrow()
      })
    })

    it('should reject invalid project durations', () => {
      const invalidDurations = ['short', 'long', 'medium', '']

      invalidDurations.forEach(duration => {
        expect(() => ProjectDuration.parse(duration)).toThrow()
      })
    })
  })

  describe('RequiredExperience', () => {
    it('should accept valid experience levels', () => {
      const validLevels = ['entry', 'intermediate', 'expert', 'any']

      validLevels.forEach(level => {
        expect(() => RequiredExperience.parse(level)).not.toThrow()
      })
    })

    it('should reject invalid experience levels', () => {
      const invalidLevels = ['beginner', 'advanced', 'senior', '']

      invalidLevels.forEach(level => {
        expect(() => RequiredExperience.parse(level)).toThrow()
      })
    })
  })

  describe('ProposalStatus', () => {
    it('should accept valid proposal statuses', () => {
      const validStatuses = [
        'draft',
        'submitted',
        'shortlisted',
        'interviewed',
        'accepted',
        'rejected',
        'withdrawn',
      ]

      validStatuses.forEach(status => {
        expect(() => ProposalStatus.parse(status)).not.toThrow()
      })
    })

    it('should reject invalid proposal statuses', () => {
      const invalidStatuses = ['pending', 'approved', 'declined', '']

      invalidStatuses.forEach(status => {
        expect(() => ProposalStatus.parse(status)).toThrow()
      })
    })
  })

  describe('ContractStatus', () => {
    it('should accept valid contract statuses', () => {
      const validStatuses = [
        'pending',
        'active',
        'paused',
        'completed',
        'cancelled',
        'disputed',
      ]

      validStatuses.forEach(status => {
        expect(() => ContractStatus.parse(status)).not.toThrow()
      })
    })

    it('should reject invalid contract statuses', () => {
      const invalidStatuses = ['draft', 'open', 'closed', '']

      invalidStatuses.forEach(status => {
        expect(() => ContractStatus.parse(status)).toThrow()
      })
    })
  })

  describe('MilestoneStatus', () => {
    it('should accept valid milestone statuses', () => {
      const validStatuses = [
        'pending',
        'in_progress',
        'submitted',
        'approved',
        'revision_requested',
        'disputed',
        'paid',
      ]

      validStatuses.forEach(status => {
        expect(() => MilestoneStatus.parse(status)).not.toThrow()
      })
    })

    it('should reject invalid milestone statuses', () => {
      const invalidStatuses = ['draft', 'completed', 'cancelled', '']

      invalidStatuses.forEach(status => {
        expect(() => MilestoneStatus.parse(status)).toThrow()
      })
    })
  })

  describe('PaymentStatus', () => {
    it('should accept valid payment statuses', () => {
      const validStatuses = [
        'pending',
        'processing',
        'completed',
        'failed',
        'refunded',
        'disputed',
      ]

      validStatuses.forEach(status => {
        expect(() => PaymentStatus.parse(status)).not.toThrow()
      })
    })

    it('should reject invalid payment statuses', () => {
      const invalidStatuses = ['success', 'error', 'cancelled', '']

      invalidStatuses.forEach(status => {
        expect(() => PaymentStatus.parse(status)).toThrow()
      })
    })
  })

  describe('ProjectBudget', () => {
    it('should create valid fixed price budget', () => {
      const fixedBudget = {
        type: 'fixed_price',
        currency: 'USD',
        fixedAmount: 5000,
        isNegotiable: false,
      }

      expect(() => ProjectBudget.parse(fixedBudget)).not.toThrow()
      const parsed = ProjectBudget.parse(fixedBudget)
      expect(parsed.type).toBe('fixed_price')
      expect(parsed.fixedAmount).toBe(5000)
      expect(parsed.isNegotiable).toBe(false)
    })

    it('should create valid hourly budget', () => {
      const hourlyBudget = {
        type: 'hourly',
        hourlyRate: {
          min: 25,
          max: 50,
          preferred: 35,
        },
        estimatedHours: 40,
      }

      expect(() => ProjectBudget.parse(hourlyBudget)).not.toThrow()
      const parsed = ProjectBudget.parse(hourlyBudget)
      expect(parsed.type).toBe('hourly')
      expect(parsed.hourlyRate?.preferred).toBe(35)
      expect(parsed.estimatedHours).toBe(40)
    })

    it('should create valid retainer budget', () => {
      const retainerBudget = {
        type: 'retainer',
        retainerAmount: 3000,
        retainerPeriod: 'monthly',
      }

      expect(() => ProjectBudget.parse(retainerBudget)).not.toThrow()
      const parsed = ProjectBudget.parse(retainerBudget)
      expect(parsed.type).toBe('retainer')
      expect(parsed.retainerAmount).toBe(3000)
      expect(parsed.retainerPeriod).toBe('monthly')
    })

    it('should use default values for optional fields', () => {
      const minimalBudget = {
        type: 'fixed_price',
        fixedAmount: 1000,
      }

      const parsed = ProjectBudget.parse(minimalBudget)
      expect(parsed.currency).toBe('USD') // default
      expect(parsed.isNegotiable).toBe(true) // default
      expect(parsed.includesPlatformFee).toBe(false) // default
    })
  })

  describe('ProjectMilestone', () => {
    it('should create valid milestone', () => {
      const validMilestone = {
        id: 'milestone-1',
        title: 'Design Phase',
        description: 'Complete the UI/UX design',
        amount: 1500,
        status: 'pending',
        order: 1,
        deliverables: ['Wireframes', 'Mockups', 'Style Guide'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      expect(() => ProjectMilestone.parse(validMilestone)).not.toThrow()
      const parsed = ProjectMilestone.parse(validMilestone)
      expect(parsed.title).toBe('Design Phase')
      expect(parsed.amount).toBe(1500)
      expect(parsed.deliverables).toHaveLength(3)
    })

    it('should accept milestone with submitted work', () => {
      const milestoneWithWork = {
        id: 'milestone-2',
        title: 'Development Phase',
        description: 'Implement the features',
        amount: 2500,
        status: 'submitted',
        order: 2,
        deliverables: ['Frontend', 'Backend', 'API'],
        submittedWork: [
          {
            url: 'https://github.com/user/project',
            description: 'Source code repository',
            submittedAt: new Date('2024-01-15'),
          },
          {
            url: 'https://demo.example.com',
            description: 'Live demo',
            submittedAt: new Date('2024-01-15'),
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      }

      expect(() => ProjectMilestone.parse(milestoneWithWork)).not.toThrow()
      const parsed = ProjectMilestone.parse(milestoneWithWork)
      expect(parsed.status).toBe('submitted')
      expect(parsed.submittedWork).toHaveLength(2)
    })

    it('should accept milestone with approval data', () => {
      const approvedMilestone = {
        id: 'milestone-3',
        title: 'Testing Phase',
        description: 'QA and testing',
        amount: 1000,
        status: 'approved',
        order: 3,
        deliverables: ['Test Results', 'Bug Fixes'],
        feedback: 'Great work, all tests passed!',
        approvedAt: new Date('2024-01-20'),
        paidAt: new Date('2024-01-21'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-20'),
      }

      expect(() => ProjectMilestone.parse(approvedMilestone)).not.toThrow()
      const parsed = ProjectMilestone.parse(approvedMilestone)
      expect(parsed.status).toBe('approved')
      expect(parsed.feedback).toBe('Great work, all tests passed!')
    })
  })

  describe('SkillRequirement', () => {
    it('should create valid skill requirement', () => {
      const validSkill = {
        skill: 'React',
        level: 'advanced',
        required: true,
        yearsExperience: 3,
      }

      expect(() => SkillRequirement.parse(validSkill)).not.toThrow()
      const parsed = SkillRequirement.parse(validSkill)
      expect(parsed.skill).toBe('React')
      expect(parsed.level).toBe('advanced')
      expect(parsed.required).toBe(true)
    })

    it('should use default values for optional fields', () => {
      const minimalSkill = {
        skill: 'JavaScript',
        level: 'intermediate',
      }

      const parsed = SkillRequirement.parse(minimalSkill)
      expect(parsed.required).toBe(true) // default
    })

    it('should accept all valid skill levels', () => {
      const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert']

      skillLevels.forEach(level => {
        const skill = {
          skill: `Test-${level}`,
          level,
        }

        expect(() => SkillRequirement.parse(skill)).not.toThrow()
      })
    })
  })

  describe('ProjectAttachment', () => {
    it('should create valid project attachment', () => {
      const validAttachment = {
        id: 'attachment-1',
        name: 'project-brief.pdf',
        url: 'https://example.com/brief.pdf',
        type: 'brief',
        mimeType: 'application/pdf',
        size: 102400,
        uploadedAt: new Date('2024-01-01'),
        description: 'Detailed project requirements',
      }

      expect(() => ProjectAttachment.parse(validAttachment)).not.toThrow()
      const parsed = ProjectAttachment.parse(validAttachment)
      expect(parsed.type).toBe('brief')
      expect(parsed.size).toBe(102400)
    })

    it('should accept all valid attachment types', () => {
      const attachmentTypes = [
        'reference',
        'brief',
        'asset',
        'example',
        'specification',
      ]

      attachmentTypes.forEach(type => {
        const attachment = {
          id: `attachment-${type}`,
          name: `${type}.pdf`,
          url: 'https://example.com/file.pdf',
          type,
          mimeType: 'application/pdf',
          size: 1024,
          uploadedAt: new Date('2024-01-01'),
        }

        expect(() => ProjectAttachment.parse(attachment)).not.toThrow()
      })
    })
  })

  describe('ClientInfo', () => {
    it('should create valid client info', () => {
      const validClient = {
        id: 'client-123',
        name: 'John Client',
        company: 'Tech Startup Inc',
        avatar: 'https://example.com/avatar.jpg',
        location: 'San Francisco, CA',
        timezone: 'America/Los_Angeles',
        isVerified: true,
        paymentVerified: true,
        totalSpent: 15000,
        projectsPosted: 5,
        hireRate: 80,
        averageRating: 4.5,
        preferredCommunication: ['email', 'video'],
        workingHours: '9 AM - 6 PM PST',
        responseTime: 'within_hour',
      }

      expect(() => ClientInfo.parse(validClient)).not.toThrow()
      const parsed = ClientInfo.parse(validClient)
      expect(parsed.name).toBe('John Client')
      expect(parsed.isVerified).toBe(true)
      expect(parsed.totalSpent).toBe(15000)
      expect(parsed.preferredCommunication).toEqual(['email', 'video'])
    })

    it('should use default values for optional fields', () => {
      const minimalClient = {
        id: 'client-minimal',
        name: 'Minimal Client',
      }

      const parsed = ClientInfo.parse(minimalClient)
      expect(parsed.isVerified).toBe(false) // default
      expect(parsed.paymentVerified).toBe(false) // default
      expect(parsed.totalSpent).toBe(0) // default
      expect(parsed.projectsPosted).toBe(0) // default
      expect(parsed.hireRate).toBe(0) // default
      expect(parsed.averageRating).toBe(0) // default
    })

    it('should accept all valid communication preferences', () => {
      const validCommunications = ['email', 'chat', 'video', 'phone']

      const client = {
        id: 'client-comm',
        name: 'Communication Client',
        preferredCommunication: validCommunications,
      }

      expect(() => ClientInfo.parse(client)).not.toThrow()
      const parsed = ClientInfo.parse(client)
      expect(parsed.preferredCommunication).toEqual(validCommunications)
    })

    it('should accept all valid response times', () => {
      const responseTimes = ['immediate', 'within_hour', 'within_day', 'flexible']

      responseTimes.forEach(responseTime => {
        const client = {
          id: `client-${responseTime}`,
          name: 'Test Client',
          responseTime,
        }

        expect(() => ClientInfo.parse(client)).not.toThrow()
      })
    })
  })

  describe('ProjectPosting', () => {
    it('should create valid complete project posting', () => {
      const validPosting = {
        id: 'project-123',
        title: 'Build React Dashboard',
        slug: 'build-react-dashboard',
        description: 'Need a React dashboard with charts and analytics',
        type: 'fixed_price',
        duration: 'one_to_three_months',
        requiredExperience: 'intermediate',
        category: 'web_development',
        budget: {
          type: 'fixed_price',
          fixedAmount: 5000,
          currency: 'USD',
        },
        skillsRequired: [
          {
            skill: 'React',
            level: 'advanced',
            required: true,
          },
        ],
        responsibilities: ['Design UI components', 'Implement dashboard'],
        deliverables: ['Source code', 'Documentation'],
        client: {
          id: 'client-123',
          name: 'Tech Company',
          isVerified: true,
          paymentVerified: true,
        },
        status: 'open',
        tags: ['react', 'dashboard', 'frontend'],
        appId: 'app-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      expect(() => ProjectPosting.parse(validPosting)).not.toThrow()
      const parsed = ProjectPosting.parse(validPosting)
      expect(parsed.title).toBe('Build React Dashboard')
      expect(parsed.type).toBe('fixed_price')
      expect(parsed.budget.fixedAmount).toBe(5000)
      expect(parsed.skillsRequired).toHaveLength(1)
    })

    it('should use default values for optional fields', () => {
      const minimalPosting = {
        id: 'project-minimal',
        title: 'Minimal Project',
        slug: 'minimal-project',
        description: 'Simple project',
        type: 'fixed_price',
        duration: 'one_to_four_weeks',
        requiredExperience: 'any',
        category: 'other',
        budget: {
          type: 'fixed_price',
          fixedAmount: 1000,
        },
        skillsRequired: [],
        responsibilities: [],
        deliverables: [],
        client: {
          id: 'client-minimal',
          name: 'Minimal Client',
        },
        status: 'draft',
        tags: [],
        appId: 'app-minimal',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      const parsed = ProjectPosting.parse(minimalPosting)
      expect(parsed.isRemote).toBe(true) // default
      expect(parsed.isVisible).toBe(true) // default
      expect(parsed.isFeatured).toBe(false) // default
      expect(parsed.isUrgent).toBe(false) // default
      expect(parsed.connectsRequired).toBe(1) // default
      expect(parsed.views).toBe(0) // default
      expect(parsed.proposals).toBe(0) // default
      expect(parsed.hired).toBe(0) // default
    })

    it('should accept project with screening questions', () => {
      const projectWithScreening = {
        id: 'project-screening',
        title: 'Project with Screening',
        slug: 'project-with-screening',
        description: 'Project that requires screening',
        type: 'hourly',
        duration: 'ongoing',
        requiredExperience: 'expert',
        category: 'development',
        budget: {
          type: 'hourly',
          hourlyRate: {
            min: 50,
            max: 100,
          },
        },
        skillsRequired: [],
        responsibilities: [],
        deliverables: [],
        client: {
          id: 'client-screening',
          name: 'Screening Client',
        },
        screeningQuestions: [
          {
            id: 'q1',
            question: 'How many years of experience do you have?',
            required: true,
          },
          {
            id: 'q2',
            question: 'Can you work in EST timezone?',
            required: false,
          },
        ],
        status: 'open',
        tags: [],
        appId: 'app-screening',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      expect(() => ProjectPosting.parse(projectWithScreening)).not.toThrow()
      const parsed = ProjectPosting.parse(projectWithScreening)
      expect(parsed.screeningQuestions).toHaveLength(2)
    })

    it('should accept project with milestones', () => {
      const projectWithMilestones = {
        id: 'project-milestones',
        title: 'Project with Milestones',
        slug: 'project-with-milestones',
        description: 'Project with defined milestones',
        type: 'milestone',
        duration: 'three_to_six_months',
        requiredExperience: 'intermediate',
        category: 'design',
        budget: {
          type: 'milestone',
          fixedAmount: 8000,
        },
        skillsRequired: [],
        responsibilities: [],
        deliverables: [],
        client: {
          id: 'client-milestones',
          name: 'Milestone Client',
        },
        milestones: [
          {
            id: 'milestone-1',
            title: 'Research Phase',
            description: 'Market research and analysis',
            amount: 2000,
            status: 'pending',
            order: 1,
            deliverables: ['Research Report'],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
          {
            id: 'milestone-2',
            title: 'Design Phase',
            description: 'Create designs and prototypes',
            amount: 3000,
            status: 'pending',
            order: 2,
            deliverables: ['Designs', 'Prototype'],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ],
        status: 'open',
        tags: [],
        appId: 'app-milestones',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      expect(() => ProjectPosting.parse(projectWithMilestones)).not.toThrow()
      const parsed = ProjectPosting.parse(projectWithMilestones)
      expect(parsed.milestones).toHaveLength(2)
    })
  })

  describe('ProjectProposal', () => {
    it('should create valid project proposal', () => {
      const validProposal = {
        id: 'proposal-123',
        projectId: 'project-123',
        freelancerId: 'freelancer-123',
        coverLetter: 'I am interested in working on this project...',
        proposedBudget: {
          amount: 4500,
          currency: 'USD',
          type: 'fixed_price',
          justification: 'Based on similar projects I have completed',
        },
        estimatedDelivery: new Date('2024-03-01'),
        status: 'submitted',
        freelancerSnapshot: {
          name: 'John Freelancer',
          title: 'Full Stack Developer',
          hourlyRate: 75,
          rating: 4.8,
          completedProjects: 25,
          successRate: 96,
          responseTime: 'within 2 hours',
          skills: ['React', 'Node.js', 'PostgreSQL'],
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        submittedAt: new Date('2024-01-01'),
      }

      expect(() => ProjectProposal.parse(validProposal)).not.toThrow()
      const parsed = ProjectProposal.parse(validProposal)
      expect(parsed.proposedBudget.amount).toBe(4500)
      expect(parsed.freelancerSnapshot.name).toBe('John Freelancer')
      expect(parsed.status).toBe('submitted')
    })

    it('should use default values for optional fields', () => {
      const minimalProposal = {
        id: 'proposal-minimal',
        projectId: 'project-minimal',
        freelancerId: 'freelancer-minimal',
        coverLetter: 'Minimal proposal',
        proposedBudget: {
          amount: 1000,
          type: 'fixed_price',
        },
        estimatedDelivery: new Date('2024-02-01'),
        status: 'draft',
        freelancerSnapshot: {
          name: 'Minimal Freelancer',
          title: 'Developer',
          completedProjects: 0,
          successRate: 0,
          responseTime: 'TBD',
          skills: [],
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        submittedAt: new Date('2024-01-01'),
      }

      const parsed = ProjectProposal.parse(minimalProposal)
      expect(parsed.proposedBudget.currency).toBe('USD') // default
      expect(parsed.clientViewed).toBe(false) // default
      expect(parsed.connectsSpent).toBe(1) // default
    })

    it('should accept proposal with milestones', () => {
      const proposalWithMilestones = {
        id: 'proposal-milestones',
        projectId: 'project-milestones',
        freelancerId: 'freelancer-milestones',
        coverLetter: 'I propose breaking this into milestones...',
        proposedBudget: {
          amount: 6000,
          type: 'milestone',
        },
        estimatedDelivery: new Date('2024-04-01'),
        proposedMilestones: [
          {
            title: 'Phase 1: Setup',
            description: 'Project setup and initial implementation',
            amount: 2000,
            dueDate: new Date('2024-02-15'),
            deliverables: ['Initial Setup', 'Basic Structure'],
          },
          {
            title: 'Phase 2: Development',
            description: 'Main development phase',
            amount: 3000,
            dueDate: new Date('2024-03-15'),
            deliverables: ['Core Features', 'Testing'],
          },
        ],
        status: 'submitted',
        freelancerSnapshot: {
          name: 'Milestone Freelancer',
          title: 'Project Manager',
          completedProjects: 10,
          successRate: 100,
          responseTime: 'within 1 hour',
          skills: ['Project Management', 'Development'],
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        submittedAt: new Date('2024-01-01'),
      }

      expect(() => ProjectProposal.parse(proposalWithMilestones)).not.toThrow()
      const parsed = ProjectProposal.parse(proposalWithMilestones)
      expect(parsed.proposedMilestones).toHaveLength(2)
    })

    it('should accept proposal with portfolio items', () => {
      const proposalWithPortfolio = {
        id: 'proposal-portfolio',
        projectId: 'project-portfolio',
        freelancerId: 'freelancer-portfolio',
        coverLetter: 'Please check out my relevant work...',
        proposedBudget: {
          amount: 3500,
          type: 'fixed_price',
        },
        estimatedDelivery: new Date('2024-03-01'),
        portfolioItems: [
          {
            title: 'E-commerce Dashboard',
            url: 'https://example.com/dashboard',
            description: 'React dashboard for e-commerce analytics',
            thumbnail: 'https://example.com/dashboard-thumb.jpg',
          },
          {
            title: 'Mobile App Backend',
            url: 'https://github.com/user/mobile-backend',
            description: 'Node.js backend for mobile application',
          },
        ],
        status: 'submitted',
        freelancerSnapshot: {
          name: 'Portfolio Freelancer',
          title: 'Full Stack Developer',
          completedProjects: 15,
          successRate: 90,
          responseTime: 'within 4 hours',
          skills: ['React', 'Node.js'],
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        submittedAt: new Date('2024-01-01'),
      }

      expect(() => ProjectProposal.parse(proposalWithPortfolio)).not.toThrow()
      const parsed = ProjectProposal.parse(proposalWithPortfolio)
      expect(parsed.portfolioItems).toHaveLength(2)
    })
  })

  describe('ProjectContract', () => {
    it('should create valid project contract', () => {
      const validContract = {
        id: 'contract-123',
        projectId: 'project-123',
        proposalId: 'proposal-123',
        clientId: 'client-123',
        freelancerId: 'freelancer-123',
        title: 'React Dashboard Development Contract',
        description: 'Contract for developing a React dashboard',
        agreedBudget: {
          amount: 5000,
          currency: 'USD',
          type: 'fixed_price',
        },
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-01'),
        milestones: [
          {
            id: 'milestone-1',
            title: 'Setup',
            description: 'Project setup',
            amount: 1000,
            status: 'pending',
            order: 1,
            deliverables: ['Initial Setup'],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ],
        paymentTerms: {
          method: 'milestone',
          escrowRequired: true,
        },
        workTerms: {
          hoursPerWeek: 40,
          workingHours: '9 AM - 5 PM EST',
          timezone: 'America/New_York',
        },
        status: 'pending',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      expect(() => ProjectContract.parse(validContract)).not.toThrow()
      const parsed = ProjectContract.parse(validContract)
      expect(parsed.title).toBe('React Dashboard Development Contract')
      expect(parsed.agreedBudget.amount).toBe(5000)
      expect(parsed.paymentTerms.method).toBe('milestone')
      expect(parsed.workTerms.hoursPerWeek).toBe(40)
    })

    it('should use default values for optional fields', () => {
      const minimalContract = {
        id: 'contract-minimal',
        projectId: 'project-minimal',
        proposalId: 'proposal-minimal',
        clientId: 'client-minimal',
        freelancerId: 'freelancer-minimal',
        title: 'Minimal Contract',
        description: 'Simple contract',
        agreedBudget: {
          amount: 1000,
          type: 'fixed_price',
        },
        startDate: new Date('2024-02-01'),
        milestones: [],
        paymentTerms: {
          method: 'milestone',
        },
        workTerms: {},
        status: 'pending',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }

      const parsed = ProjectContract.parse(minimalContract)
      expect(parsed.agreedBudget.currency).toBe('USD') // default
      expect(parsed.paymentTerms.escrowRequired).toBe(true) // default
      expect(parsed.clientSigned).toBe(false) // default
      expect(parsed.freelancerSigned).toBe(false) // default
      expect(parsed.hoursWorked).toBe(0) // default
      expect(parsed.amountPaid).toBe(0) // default
      expect(parsed.progressPercentage).toBe(0) // default
      expect(parsed.confidentialityClause).toBe(false) // default
    })

    it('should accept contract with reviews', () => {
      const contractWithReviews = {
        id: 'contract-reviews',
        projectId: 'project-reviews',
        proposalId: 'proposal-reviews',
        clientId: 'client-reviews',
        freelancerId: 'freelancer-reviews',
        title: 'Completed Contract',
        description: 'Contract with reviews',
        agreedBudget: {
          amount: 3000,
          type: 'fixed_price',
        },
        startDate: new Date('2024-01-01'),
        milestones: [],
        paymentTerms: {
          method: 'milestone',
        },
        workTerms: {},
        status: 'completed',
        clientReview: {
          rating: 5,
          feedback: 'Excellent work, delivered on time!',
          isPublic: true,
          createdAt: new Date('2024-01-30'),
        },
        freelancerReview: {
          rating: 4,
          feedback: 'Great client, clear requirements',
          isPublic: true,
          createdAt: new Date('2024-01-30'),
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-30'),
        completedAt: new Date('2024-01-30'),
      }

      expect(() => ProjectContract.parse(contractWithReviews)).not.toThrow()
      const parsed = ProjectContract.parse(contractWithReviews)
      expect(parsed.clientReview?.rating).toBe(5)
      expect(parsed.freelancerReview?.rating).toBe(4)
    })
  })

  describe('TimeEntry', () => {
    it('should create valid time entry', () => {
      const validTimeEntry = {
        id: 'time-123',
        contractId: 'contract-123',
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T09:00:00Z'),
        endTime: new Date('2024-01-15T17:00:00Z'),
        duration: 480, // 8 hours in minutes
        description: 'Worked on dashboard components',
        hourlyRate: 50,
        amount: 400,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      }

      expect(() => TimeEntry.parse(validTimeEntry)).not.toThrow()
      const parsed = TimeEntry.parse(validTimeEntry)
      expect(parsed.duration).toBe(480)
      expect(parsed.hourlyRate).toBe(50)
      expect(parsed.amount).toBe(400)
    })

    it('should use default values for optional fields', () => {
      const minimalTimeEntry = {
        id: 'time-minimal',
        contractId: 'contract-minimal',
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T09:00:00Z'),
        duration: 240,
        description: 'Work session',
        hourlyRate: 25,
        amount: 100,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      }

      const parsed = TimeEntry.parse(minimalTimeEntry)
      expect(parsed.isApproved).toBe(false) // default
      expect(parsed.isBilled).toBe(false) // default
    })

    it('should accept time entry with screenshots', () => {
      const timeEntryWithScreenshots = {
        id: 'time-screenshots',
        contractId: 'contract-screenshots',
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T09:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        duration: 120,
        description: 'Development work with screenshots',
        screenshots: [
          {
            url: 'https://example.com/screenshot1.jpg',
            timestamp: new Date('2024-01-15T09:30:00Z'),
          },
          {
            url: 'https://example.com/screenshot2.jpg',
            timestamp: new Date('2024-01-15T10:30:00Z'),
          },
        ],
        activityLevel: 85,
        hourlyRate: 60,
        amount: 120,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      }

      expect(() => TimeEntry.parse(timeEntryWithScreenshots)).not.toThrow()
      const parsed = TimeEntry.parse(timeEntryWithScreenshots)
      expect(parsed.screenshots).toHaveLength(2)
      expect(parsed.activityLevel).toBe(85)
    })
  })

  describe('PaymentTransaction', () => {
    it('should create valid payment transaction', () => {
      const validTransaction = {
        id: 'payment-123',
        contractId: 'contract-123',
        milestoneId: 'milestone-123',
        type: 'milestone',
        amount: 1000,
        currency: 'USD',
        platformFeePercentage: 10,
        platformFeeAmount: 100,
        freelancerAmount: 900,
        paymentMethod: 'escrow',
        status: 'completed',
        createdAt: new Date('2024-01-15'),
        processedAt: new Date('2024-01-15'),
        completedAt: new Date('2024-01-15'),
      }

      expect(() => PaymentTransaction.parse(validTransaction)).not.toThrow()
      const parsed = PaymentTransaction.parse(validTransaction)
      expect(parsed.type).toBe('milestone')
      expect(parsed.amount).toBe(1000)
      expect(parsed.platformFeeAmount).toBe(100)
      expect(parsed.freelancerAmount).toBe(900)
    })

    it('should use default currency', () => {
      const minimalTransaction = {
        id: 'payment-minimal',
        contractId: 'contract-minimal',
        type: 'hourly',
        amount: 500,
        platformFeePercentage: 5,
        platformFeeAmount: 25,
        freelancerAmount: 475,
        paymentMethod: 'direct',
        status: 'pending',
        createdAt: new Date('2024-01-15'),
      }

      const parsed = PaymentTransaction.parse(minimalTransaction)
      expect(parsed.currency).toBe('USD') // default
    })

    it('should accept all valid transaction types', () => {
      const transactionTypes = [
        'milestone',
        'hourly',
        'bonus',
        'refund',
        'dispute_settlement',
      ]

      transactionTypes.forEach(type => {
        const transaction = {
          id: `payment-${type}`,
          contractId: 'contract-test',
          type,
          amount: 100,
          platformFeePercentage: 5,
          platformFeeAmount: 5,
          freelancerAmount: 95,
          paymentMethod: 'escrow',
          status: 'completed',
          createdAt: new Date('2024-01-15'),
        }

        expect(() => PaymentTransaction.parse(transaction)).not.toThrow()
      })
    })

    it('should accept all valid payment methods', () => {
      const paymentMethods = [
        'escrow',
        'direct',
        'bank_transfer',
        'paypal',
        'stripe',
      ]

      paymentMethods.forEach(method => {
        const transaction = {
          id: `payment-${method}`,
          contractId: 'contract-test',
          type: 'milestone',
          amount: 100,
          platformFeePercentage: 5,
          platformFeeAmount: 5,
          freelancerAmount: 95,
          paymentMethod: method,
          status: 'completed',
          createdAt: new Date('2024-01-15'),
        }

        expect(() => PaymentTransaction.parse(transaction)).not.toThrow()
      })
    })
  })

  describe('Type inference', () => {
    it('should properly infer TypeScript types', () => {
      const projectType: ProjectTypeType = 'fixed_price'
      const projectStatus: ProjectStatusType = 'open'
      const projectDuration: ProjectDurationType = 'one_to_three_months'
      const requiredExperience: RequiredExperienceType = 'intermediate'
      const proposalStatus: ProposalStatusType = 'submitted'
      const contractStatus: ContractStatusType = 'active'
      const milestoneStatus: MilestoneStatusType = 'in_progress'
      const paymentStatus: PaymentStatusType = 'completed'

      // These should compile without errors
      expect(projectType).toBe('fixed_price')
      expect(projectStatus).toBe('open')
      expect(projectDuration).toBe('one_to_three_months')
      expect(requiredExperience).toBe('intermediate')
      expect(proposalStatus).toBe('submitted')
      expect(contractStatus).toBe('active')
      expect(milestoneStatus).toBe('in_progress')
      expect(paymentStatus).toBe('completed')
    })

    it('should infer complex object types', () => {
      const budget: ProjectBudgetType = {
        type: 'fixed_price',
        currency: 'USD',
        fixedAmount: 5000,
        isNegotiable: true,
        includesPlatformFee: false,
      }

      const skill: SkillRequirementType = {
        skill: 'React',
        level: 'advanced',
        required: true,
        yearsExperience: 3,
      }

      const attachment: ProjectAttachmentType = {
        id: 'attachment-1',
        name: 'brief.pdf',
        url: 'https://example.com/brief.pdf',
        type: 'brief',
        mimeType: 'application/pdf',
        size: 1024,
        uploadedAt: new Date(),
      }

      expect(budget.type).toBe('fixed_price')
      expect(skill.level).toBe('advanced')
      expect(attachment.type).toBe('brief')
    })
  })
})