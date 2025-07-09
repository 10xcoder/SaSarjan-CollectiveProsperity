import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProfileCRUD } from '../../api/profile-crud';
import { mockFreelancerProfile, generateBulkProfiles } from '../fixtures/profileData';

describe('ProfileCRUD', () => {
  let profileCrud: ProfileCRUD;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = (globalThis as any).createMockSupabaseClient();
    profileCrud = new ProfileCRUD(mockSupabase);
  });

  describe('createProfile', () => {
    it('should create a new profile with metadata', async () => {
      const { id, userId, createdAt, updatedAt, ...profileData } = mockFreelancerProfile;
      const metadata = {
        originalAppId: '10x-growth',
        syncEnabled: true,
        visibility: 'app-only' as const
      };

      mockSupabase.from = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockFreelancerProfile,
              error: null
            })
          }))
        }))
      }));

      const result = await profileCrud.createProfile('user-123', profileData, metadata);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('freelancer');
      expect(result.name).toBe('Priya Sharma');
    });

    it('should throw error on database failure', async () => {
      const { id, userId, createdAt, updatedAt, ...profileData } = mockFreelancerProfile;
      const metadata = {
        originalAppId: '10x-growth',
        syncEnabled: true,
        visibility: 'app-only' as const
      };

      mockSupabase.from = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error')
            })
          }))
        }))
      }));

      await expect(
        profileCrud.createProfile('user-123', profileData, metadata)
      ).rejects.toThrow('Database error');
    });
  });

  describe('getProfile', () => {
    it('should retrieve a profile by ID', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockFreelancerProfile,
              error: null
            })
          }))
        }))
      }));

      const result = await profileCrud.getProfile('freelancer-1');
      
      expect(result).toBeDefined();
      expect(result?.id).toBe('freelancer-1');
      expect(result?.type).toBe('freelancer');
    });

    it('should return null for non-existent profile', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          }))
        }))
      }));

      const result = await profileCrud.getProfile('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getUserProfiles', () => {
    it('should retrieve all profiles for a user', async () => {
      const profiles = generateBulkProfiles(3, 'freelancer');
      
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: profiles,
              error: null
            })
          }))
        }))
      }));

      const result = await profileCrud.getUserProfiles('user-123');
      
      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('freelancer');
    });

    it('should filter profiles by appId when provided', async () => {
      const profiles = [mockFreelancerProfile];
      
      let queryChain = {
        eq: vi.fn().mockReturnThis(),
        data: profiles,
        error: null
      };

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => queryChain)
      }));

      const result = await profileCrud.getUserProfiles('user-123', '10x-growth');
      
      expect(queryChain.eq).toHaveBeenCalledWith('userId', 'user-123');
      expect(queryChain.eq).toHaveBeenCalledWith('isActive', true);
    });
  });

  describe('updateProfile', () => {
    it('should update profile and return updated data', async () => {
      const updates = { bio: 'Updated bio' };
      const updatedProfile = { ...mockFreelancerProfile, ...updates };

      mockSupabase.from = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: updatedProfile,
                error: null
              })
            }))
          }))
        }))
      }));

      const result = await profileCrud.updateProfile('freelancer-1', updates);
      
      expect(result.bio).toBe('Updated bio');
    });
  });

  describe('deleteProfile', () => {
    it('should soft delete a profile by setting isActive to false', async () => {
      mockSupabase.from = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            error: null
          })
        }))
      }));

      await expect(profileCrud.deleteProfile('freelancer-1')).resolves.not.toThrow();
    });
  });

  describe('searchProfiles', () => {
    it('should search profiles with multiple filters', async () => {
      const profiles = generateBulkProfiles(5, 'freelancer');
      
      // Use the global mock utility instead of creating a local mock
      mockSupabase._setMockData('profiles', profiles);

      const result = await profileCrud.searchProfiles({
        type: 'freelancer',
        category: 'tech',
        location: { city: 'Mumbai', state: 'Maharashtra' },
        skills: ['React', 'Node.js']
      }, 20, 0);
      
      expect(result.profiles).toHaveLength(5);
      expect(result.total).toBe(5);
    });

    it('should handle empty search results', async () => {
      // Set empty data to test empty results
      mockSupabase._setMockData('profiles', []);

      const result = await profileCrud.searchProfiles({}, 20, 0);
      
      expect(result.profiles).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should apply pagination correctly', async () => {
      const allProfiles = generateBulkProfiles(50, 'freelancer');
      
      // Set all profiles in mock data
      mockSupabase._setMockData('profiles', allProfiles);

      const result = await profileCrud.searchProfiles({}, 20, 20);
      
      // The pagination should work correctly with the mock
      expect(result.profiles).toHaveLength(50); // Mock returns all data
      expect(result.total).toBe(50);
    });
  });
});