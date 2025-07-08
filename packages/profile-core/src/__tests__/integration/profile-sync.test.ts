import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProfileSyncService } from '../../api/profile-sync';
import { ProfileCRUD } from '../../api/profile-crud';
import { mockFreelancerProfile } from '../fixtures/profileData';

describe('ProfileSyncService Integration', () => {
  let syncService: ProfileSyncService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = (globalThis as any).createMockSupabaseClient();
    syncService = new ProfileSyncService(mockSupabase);
  });

  describe('syncProfiles', () => {
    it('should sync allowed fields from source to target profiles', async () => {
      const updatedProfile = {
        ...mockFreelancerProfile,
        name: 'Updated Name',
        bio: 'Updated Bio'
      };

      vi.spyOn(ProfileCRUD.prototype, 'getProfile').mockResolvedValue(updatedProfile);

      const syncConfigs = [
        {
          target_profile_id: 'target-1',
          sync_config: {
            fields: ['name', 'bio', 'email'],
            direction: 'one-way',
            frequency: 'realtime'
          }
        },
        {
          target_profile_id: 'target-2',
          sync_config: {
            fields: ['name', 'email'],
            direction: 'one-way',
            frequency: 'daily'
          }
        }
      ];

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'profile_sync_relationships') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                in: vi.fn().mockResolvedValue({
                  data: syncConfigs,
                  error: null
                })
              }))
            }))
          };
        } else if (table === 'profile_sync_logs') {
          return {
            insert: vi.fn().mockResolvedValue({
              error: null
            })
          };
        }
      });

      let updateCallCount = 0;
      vi.spyOn(ProfileCRUD.prototype, 'updateProfile').mockImplementation(async (id, updates) => {
        updateCallCount++;
        if (id === 'target-1') {
          expect(updates).toHaveProperty('name', 'Updated Name');
          expect(updates).toHaveProperty('bio', 'Updated Bio');
          expect(updates).toHaveProperty('email');
        } else if (id === 'target-2') {
          expect(updates).toHaveProperty('name', 'Updated Name');
          expect(updates).toHaveProperty('email');
          expect(updates).not.toHaveProperty('bio');
        }
        return updatedProfile;
      });

      await syncService.syncProfiles('source-1', ['target-1', 'target-2']);

      expect(updateCallCount).toBe(2);
    });

    it('should handle sync failures gracefully', async () => {
      vi.spyOn(ProfileCRUD.prototype, 'getProfile').mockResolvedValue(null);

      await expect(
        syncService.syncProfiles('non-existent', ['target-1'])
      ).rejects.toThrow('Source profile not found');
    });

    it('should record sync events', async () => {
      vi.spyOn(ProfileCRUD.prototype, 'getProfile').mockResolvedValue(mockFreelancerProfile);

      const syncConfigs = [
        {
          target_profile_id: 'target-1',
          sync_config: { fields: ['name'] }
        }
      ];

      let syncLogCreated = false;

      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'profile_sync_relationships') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                in: vi.fn().mockResolvedValue({
                  data: syncConfigs,
                  error: null
                })
              }))
            }))
          };
        } else if (table === 'profile_sync_logs') {
          syncLogCreated = true;
          return {
            insert: vi.fn().mockResolvedValue({
              error: null
            })
          };
        }
      });

      vi.spyOn(ProfileCRUD.prototype, 'updateProfile').mockResolvedValue(mockFreelancerProfile);

      await syncService.syncProfiles('source-1', ['target-1']);

      expect(syncLogCreated).toBe(true);
    });
  });

  describe('setupRealtimeSync', () => {
    it('should set up real-time sync subscription', async () => {
      let channelCreated = false;
      let subscriptionSetup = false;

      mockSupabase.channel = vi.fn((channelName: string) => {
        expect(channelName).toBe('profile-sync-source-1');
        channelCreated = true;
        
        return {
          on: vi.fn((event: string, config: any, callback: Function) => {
            expect(event).toBe('postgres_changes');
            expect(config.table).toBe('profiles');
            subscriptionSetup = true;
            
            return {
              subscribe: vi.fn()
            };
          })
        };
      });

      const unsubscribe = await syncService.setupRealtimeSync('source-1');

      expect(channelCreated).toBe(true);
      expect(subscriptionSetup).toBe(true);
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('updateSyncConfig', () => {
    it('should update sync configuration for profile relationship', async () => {
      const newConfig = {
        profileId: 'source-1',
        syncFields: ['name', 'email', 'bio'],
        syncDirection: 'two-way' as const,
        syncFrequency: 'daily' as const
      };

      mockSupabase.from = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              error: null
            })
          }))
        }))
      }));

      await expect(
        syncService.updateSyncConfig('source-1', 'target-1', newConfig)
      ).resolves.not.toThrow();
    });
  });

  describe('removeSyncRelationship', () => {
    it('should remove sync relationship between profiles', async () => {
      mockSupabase.from = vi.fn(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              error: null
            })
          }))
        }))
      }));

      await expect(
        syncService.removeSyncRelationship('source-1', 'target-1')
      ).resolves.not.toThrow();
    });
  });

  describe('getSyncHistory', () => {
    it('should retrieve sync history for a profile', async () => {
      const syncLogs = [
        {
          source_profile_id: 'source-1',
          target_profile_ids: ['target-1', 'target-2'],
          status: 'success',
          synced_at: new Date().toISOString()
        },
        {
          source_profile_id: 'source-1',
          target_profile_ids: ['target-1'],
          status: 'failure',
          synced_at: new Date().toISOString()
        }
      ];

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue({
                data: syncLogs,
                error: null
              })
            }))
          }))
        }))
      }));

      const result = await syncService.getSyncHistory('source-1', 10);

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('success');
      expect(result[0].targetProfiles).toEqual(['target-1', 'target-2']);
      expect(result[1].status).toBe('failure');
    });

    it('should handle empty sync history', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            }))
          }))
        }))
      }));

      const result = await syncService.getSyncHistory('profile-with-no-history');

      expect(result).toHaveLength(0);
    });
  });
});