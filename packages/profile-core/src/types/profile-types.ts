import { z } from 'zod';
import { BaseProfileSchema } from './base-profile';

// Re-export BaseProfileSchema for tests
export { BaseProfileSchema };

export const SkillSchema = z.object({
  name: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  yearsOfExperience: z.number().min(0),
  verified: z.boolean().default(false)
});

export const ExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  description: z.string(),
  technologies: z.array(z.string()).optional()
});

export const PortfolioItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string().url().optional(),
  image: z.string().url().optional(),
  category: z.string(),
  tags: z.array(z.string())
});

export const FreelancerProfileSchema = BaseProfileSchema.extend({
  type: z.literal('freelancer'),
  category: z.enum(['tech', 'design', 'marketing', 'content', 'consulting', 'other']),
  subCategories: z.array(z.string()),
  skills: z.array(SkillSchema),
  experience: z.array(ExperienceSchema),
  portfolio: z.array(PortfolioItemSchema),
  hourlyRate: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    currency: z.string().default('INR')
  }),
  availability: z.enum(['full-time', 'part-time', 'project-based', 'unavailable']),
  preferredProjectDuration: z.enum(['short-term', 'long-term', 'both']),
  languages: z.array(z.string()),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.date(),
    url: z.string().url().optional()
  }))
});

export const EntrepreneurProfileSchema = BaseProfileSchema.extend({
  type: z.literal('entrepreneur'),
  businessName: z.string().optional(),
  businessCategory: z.string(),
  foundingYear: z.number().min(1900).max(new Date().getFullYear()),
  stage: z.enum(['idea', 'mvp', 'growth', 'scale', 'established']),
  lookingFor: z.array(z.enum(['funding', 'mentorship', 'team', 'customers', 'partners'])),
  achievements: z.array(z.object({
    title: z.string(),
    description: z.string(),
    date: z.date()
  })),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional()
  })
});

export const VolunteerProfileSchema = BaseProfileSchema.extend({
  type: z.literal('volunteer'),
  category: z.enum(['education', 'environment', 'health', 'community', 'animal-welfare', 'disaster-relief']),
  causes: z.array(z.string()),
  availability: z.object({
    hoursPerWeek: z.number().min(0).max(40),
    preferredDays: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
    preferredTime: z.enum(['morning', 'afternoon', 'evening', 'flexible'])
  }),
  skills: z.array(z.string()),
  experience: z.array(z.object({
    organization: z.string(),
    role: z.string(),
    duration: z.string(),
    impact: z.string()
  })),
  impactMetrics: z.array(z.object({
    metric: z.string(),
    value: z.number(),
    unit: z.string(),
    description: z.string()
  }))
});

export const CompanyProfileSchema = BaseProfileSchema.extend({
  type: z.literal('company'),
  companyName: z.string(),
  industry: z.string(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
  founded: z.number(),
  website: z.string().url(),
  description: z.string(),
  culture: z.array(z.string()),
  benefits: z.array(z.string()),
  hiringFor: z.array(z.string()),
  techStack: z.array(z.string()).optional()
});

export type Skill = z.infer<typeof SkillSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;
export type FreelancerProfile = z.infer<typeof FreelancerProfileSchema>;
export type EntrepreneurProfile = z.infer<typeof EntrepreneurProfileSchema>;
export type VolunteerProfile = z.infer<typeof VolunteerProfileSchema>;
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;

export type ProfileType = FreelancerProfile | EntrepreneurProfile | VolunteerProfile | CompanyProfile;

export const ProfileTypeSchema = z.discriminatedUnion('type', [
  FreelancerProfileSchema,
  EntrepreneurProfileSchema,
  VolunteerProfileSchema,
  CompanyProfileSchema
]);