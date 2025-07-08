import { describe, it, expect } from 'vitest';
import {
  BaseProfileSchema,
  FreelancerProfileSchema,
  VolunteerProfileSchema,
  EntrepreneurProfileSchema,
  CompanyProfileSchema,
  ProfileTypeSchema
} from '../../types/profile-types';
import {
  mockFreelancerProfile,
  mockVolunteerProfile,
  mockEntrepreneurProfile,
  mockCompanyProfile
} from '../fixtures/profileData';

describe('Profile Type Validations', () => {
  describe('BaseProfileSchema', () => {
    it('should validate a valid base profile', () => {
      const validProfile = {
        id: 'test-123',
        userId: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        location: {
          country: 'India',
          state: 'Maharashtra',
          city: 'Mumbai'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = BaseProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidProfile = {
        id: 'test-123',
        userId: 'user-123',
        name: 'Test User',
        email: 'invalid-email',
        phone: '9876543210',
        location: {
          country: 'India',
          state: 'Maharashtra',
          city: 'Mumbai'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = BaseProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject invalid Indian phone number', () => {
      const invalidProfile = {
        id: 'test-123',
        userId: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890', // Invalid - doesn't start with 6-9
        location: {
          country: 'India',
          state: 'Maharashtra',
          city: 'Mumbai'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = BaseProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid Indian phone number');
      }
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidProfile = {
        id: 'test-123',
        userId: 'user-123',
        name: 'A',
        email: 'test@example.com',
        phone: '9876543210',
        location: {
          country: 'India',
          state: 'Maharashtra',
          city: 'Mumbai'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = BaseProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should accept optional bio within 500 characters', () => {
      const profileWithBio = {
        id: 'test-123',
        userId: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        bio: 'A'.repeat(500),
        location: {
          country: 'India',
          state: 'Maharashtra',
          city: 'Mumbai'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = BaseProfileSchema.safeParse(profileWithBio);
      expect(result.success).toBe(true);
    });

    it('should reject bio longer than 500 characters', () => {
      const profileWithLongBio = {
        id: 'test-123',
        userId: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        bio: 'A'.repeat(501),
        location: {
          country: 'India',
          state: 'Maharashtra',
          city: 'Mumbai'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = BaseProfileSchema.safeParse(profileWithLongBio);
      expect(result.success).toBe(false);
    });
  });

  describe('FreelancerProfileSchema', () => {
    it('should validate a complete freelancer profile', () => {
      const result = FreelancerProfileSchema.safeParse(mockFreelancerProfile);
      expect(result.success).toBe(true);
    });

    it('should validate skill levels', () => {
      const profileWithInvalidSkill = {
        ...mockFreelancerProfile,
        skills: [
          { name: 'React', level: 'invalid-level', yearsOfExperience: 5, verified: true }
        ]
      };

      const result = FreelancerProfileSchema.safeParse(profileWithInvalidSkill);
      expect(result.success).toBe(false);
    });

    it('should validate hourly rate structure', () => {
      const profileWithInvalidRate = {
        ...mockFreelancerProfile,
        hourlyRate: {
          min: -100,
          max: 4000,
          currency: 'INR'
        }
      };

      const result = FreelancerProfileSchema.safeParse(profileWithInvalidRate);
      expect(result.success).toBe(false);
    });

    it('should validate category enum', () => {
      const profileWithInvalidCategory = {
        ...mockFreelancerProfile,
        category: 'invalid-category'
      };

      const result = FreelancerProfileSchema.safeParse(profileWithInvalidCategory);
      expect(result.success).toBe(false);
    });
  });

  describe('VolunteerProfileSchema', () => {
    it('should validate a complete volunteer profile', () => {
      const result = VolunteerProfileSchema.safeParse(mockVolunteerProfile);
      expect(result.success).toBe(true);
    });

    it('should validate availability hours', () => {
      const profileWithInvalidHours = {
        ...mockVolunteerProfile,
        availability: {
          hoursPerWeek: 50, // More than 40
          preferredDays: ['monday'],
          preferredTime: 'morning'
        }
      };

      const result = VolunteerProfileSchema.safeParse(profileWithInvalidHours);
      expect(result.success).toBe(false);
    });

    it('should validate preferred days enum', () => {
      const profileWithInvalidDay = {
        ...mockVolunteerProfile,
        availability: {
          hoursPerWeek: 10,
          preferredDays: ['invalid-day'],
          preferredTime: 'morning'
        }
      };

      const result = VolunteerProfileSchema.safeParse(profileWithInvalidDay);
      expect(result.success).toBe(false);
    });
  });

  describe('EntrepreneurProfileSchema', () => {
    it('should validate a complete entrepreneur profile', () => {
      const result = EntrepreneurProfileSchema.safeParse(mockEntrepreneurProfile);
      expect(result.success).toBe(true);
    });

    it('should validate founding year range', () => {
      const profileWithInvalidYear = {
        ...mockEntrepreneurProfile,
        foundingYear: 1800 // Too old
      };

      const result = EntrepreneurProfileSchema.safeParse(profileWithInvalidYear);
      expect(result.success).toBe(false);
    });

    it('should validate business stage enum', () => {
      const profileWithInvalidStage = {
        ...mockEntrepreneurProfile,
        stage: 'invalid-stage'
      };

      const result = EntrepreneurProfileSchema.safeParse(profileWithInvalidStage);
      expect(result.success).toBe(false);
    });
  });

  describe('CompanyProfileSchema', () => {
    it('should validate a complete company profile', () => {
      const result = CompanyProfileSchema.safeParse(mockCompanyProfile);
      expect(result.success).toBe(true);
    });

    it('should validate company size enum', () => {
      const profileWithInvalidSize = {
        ...mockCompanyProfile,
        size: 'invalid-size'
      };

      const result = CompanyProfileSchema.safeParse(profileWithInvalidSize);
      expect(result.success).toBe(false);
    });

    it('should validate website URL', () => {
      const profileWithInvalidWebsite = {
        ...mockCompanyProfile,
        website: 'not-a-url'
      };

      const result = CompanyProfileSchema.safeParse(profileWithInvalidWebsite);
      expect(result.success).toBe(false);
    });
  });

  describe('ProfileTypeSchema (Discriminated Union)', () => {
    it('should correctly discriminate between profile types', () => {
      const profiles = [
        mockFreelancerProfile,
        mockVolunteerProfile,
        mockEntrepreneurProfile,
        mockCompanyProfile
      ];

      profiles.forEach(profile => {
        const result = ProfileTypeSchema.safeParse(profile);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe(profile.type);
        }
      });
    });

    it('should reject profiles with invalid type field', () => {
      const invalidProfile = {
        ...mockFreelancerProfile,
        type: 'invalid-type'
      };

      const result = ProfileTypeSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });
  });
});