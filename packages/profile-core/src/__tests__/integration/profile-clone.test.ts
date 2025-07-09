import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProfileCloneService } from '../../api/profile-clone';
import { ProfileCRUD } from '../../api/profile-crud';
import { mockFreelancerProfile, mockVolunteerProfile } from '../fixtures/profileData';

describe('ProfileCloneService Integration', () => {
  let cloneService: ProfileCloneService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = (globalThis as any).createMockSupabaseClient();
    cloneService = new ProfileCloneService(mockSupabase);
  });

  describe('cloneProfile', () => {
    it('should clone a profile from one app to another', async () => {
      // Mock the ProfileCRUD.getProfile method
      vi.spyOn(ProfileCRUD.prototype, 'getProfile').mockResolvedValue(mockFreelancerProfile);

      // Mock the database insert for the cloned profile
      const clonedProfile = {
        ...mockFreelancerProfile,
        id: 'cloned-freelancer-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSyncAt: new Date()
      };

      mockSupabase.from = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: clonedProfile,
              error: null
            })
          }))
        }))
      }));

      const result = await cloneService.cloneProfile({
        sourceProfileId: 'freelancer-1',
        targetAppId: '10x-growth',
        profileType: 'freelancer',
        syncEnabled: true
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('cloned-freelancer-1');
      expect(result.type).toBe('freelancer');
    });

    it('should apply customizations during cloning', async () => {
      vi.spyOn(ProfileCRUD.prototype, 'getProfile').mockResolvedValue(mockFreelancerProfile);

      const customizations = {
        bio: 'Customized bio for 10X Growth',
        hourlyRate: {
          min: 3000,
          max: 5000,
          currency: 'INR'
        }
      };

      const clonedProfile = {
        ...mockFreelancerProfile,
        ...customizations,
        id: 'cloned-freelancer-1'
      };

      mockSupabase.from = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: clonedProfile,
              error: null
            })
          }))
        }))
      }));

      const result = await cloneService.cloneProfile({
        sourceProfileId: 'freelancer-1',
        targetAppId: '10x-growth',
        profileType: 'freelancer',
        customizations,
        syncEnabled: true
      });

      expect(result.bio).toBe('Customized bio for 10X Growth');
      expect((result as any).hourlyRate.min).toBe(3000);
    });

    it('should throw error if source profile not found', async () => {
      vi.spyOn(ProfileCRUD.prototype, 'getProfile').mockResolvedValue(null);

      await expect(
        cloneService.cloneProfile({
          sourceProfileId: 'non-existent',
          targetAppId: '10x-growth',
          profileType: 'freelancer'
        })
      ).rejects.toThrow('Source profile not found');
    });

    it('should create sync relationship when enabled', async () => {
      vi.spyOn(ProfileCRUD.prototype, 'getProfile').mockResolvedValue(mockFreelancerProfile);

      const clonedProfile = {
        ...mockFreelancerProfile,
        id: 'cloned-freelancer-1'
      };

      let syncRelationshipCreated = false;

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'profiles') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: clonedProfile,
                  error: null
                })
              }))
            }))
          };
        } else if (table === 'profile_sync_relationships') {
          syncRelationshipCreated = true;
          return {
            insert: vi.fn().mockResolvedValue({
              error: null
            })
          };
        }
      });

      await cloneService.cloneProfile({
        sourceProfileId: 'freelancer-1',
        targetAppId: '10x-growth',
        profileType: 'freelancer',
        syncEnabled: true
      });

      expect(syncRelationshipCreated).toBe(true);
    });
  });

  describe('cloneMultipleProfiles', () => {
    it('should clone multiple profiles with different mappings', async () => {
      const sourceProfiles = [mockFreelancerProfile, mockVolunteerProfile];
      
      vi.spyOn(ProfileCRUD.prototype, 'getUserProfiles').mockResolvedValue(sourceProfiles);

      let cloneCallCount = 0;
      vi.spyOn(cloneService, 'cloneProfile').mockImplementation(async (options) => {
        cloneCallCount++;
        return {
          ...sourceProfiles[cloneCallCount - 1],
          id: `cloned-${cloneCallCount}`,
          type: options.profileType
        } as any;
      });

      const result = await cloneService.cloneMultipleProfiles(
        'user-123',
        'sasarjan',
        '10x-growth',
        [
          { sourceType: 'freelancer', targetType: 'freelancer' },
          { sourceType: 'volunteer', targetType: 'volunteer' }
        ]
      );

      expect(result).toHaveLength(2);
      expect(cloneCallCount).toBe(2);
    });

    it('should skip profiles that dont exist in source', async () => {
      vi.spyOn(ProfileCRUD.prototype, 'getUserProfiles').mockResolvedValue([mockFreelancerProfile]);

      const cloneProfileSpy = vi.spyOn(cloneService, 'cloneProfile');

      const result = await cloneService.cloneMultipleProfiles(
        'user-123',
        'sasarjan',
        '10x-growth',
        [
          { sourceType: 'freelancer', targetType: 'freelancer' },
          { sourceType: 'entrepreneur', targetType: 'entrepreneur' } // This won't exist
        ]
      );

      expect(cloneProfileSpy).toHaveBeenCalledTimes(1); // Only called for freelancer
    });
  });

  describe('getSyncedProfiles', () => {
    it('should return source and target profiles for syncing', async () => {
      const relationships = [
        {
          source_profile_id: 'source-1',
          target_profile_id: 'target-1',
          sync_config: {}
        },
        {
          source_profile_id: 'target-1',
          target_profile_id: 'target-2',
          sync_config: {}
        }
      ];

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          or: vi.fn().mockResolvedValue({
            data: relationships,
            error: null
          })
        }))
      }));

      vi.spyOn(ProfileCRUD.prototype, 'getProfile')
        .mockResolvedValueOnce(mockFreelancerProfile) // source
        .mockResolvedValueOnce(mockVolunteerProfile); // target

      const result = await cloneService.getSyncedProfiles('target-1');

      expect(result.source).toEqual(mockFreelancerProfile);
      expect(result.targets).toHaveLength(1);
      expect(result.targets[0]).toEqual(mockVolunteerProfile);
    });

    it('should handle profiles with no sync relationships', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          or: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        }))
      }));

      const result = await cloneService.getSyncedProfiles('standalone-profile');

      expect(result.source).toBeNull();
      expect(result.targets).toHaveLength(0);
    });
  });
});