import { SupabaseClient } from '@supabase/supabase-js';
import { ProfileType } from '../types/profile-types';
import { ProfileSyncConfig } from '../types';
import { ProfileCRUD } from './profile-crud';

export class ProfileSyncService {
  private profileCrud: ProfileCRUD;

  constructor(private supabase: SupabaseClient) {
    this.profileCrud = new ProfileCRUD(supabase);
  }

  async syncProfiles(sourceProfileId: string, targetProfileIds: string[]): Promise<void> {
    const sourceProfile = await this.profileCrud.getProfile(sourceProfileId);
    if (!sourceProfile) {
      throw new Error('Source profile not found');
    }

    const { data: syncConfigs, error: configError } = await this.supabase
      .from('profile_sync_relationships')
      .select('target_profile_id, sync_config')
      .eq('source_profile_id', sourceProfileId)
      .in('target_profile_id', targetProfileIds);

    if (configError) throw configError;

    const syncPromises = syncConfigs.map(async (config) => {
      const fieldsToSync = this.getFieldsToSync(
        sourceProfile,
        config.sync_config.fields
      );

      await this.profileCrud.updateProfile(
        config.target_profile_id,
        {
          ...fieldsToSync,
          lastSyncAt: new Date()
        }
      );
    });

    await Promise.all(syncPromises);

    await this.recordSyncEvent(sourceProfileId, targetProfileIds, 'success');
  }

  async setupRealtimeSync(profileId: string): Promise<() => void> {
    const channel = this.supabase
      .channel(`profile-sync-${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profileId}`
        },
        async (payload) => {
          const { data: relationships } = await this.supabase
            .from('profile_sync_relationships')
            .select('target_profile_id')
            .eq('source_profile_id', profileId)
            .eq('sync_config->>frequency', 'realtime');

          if (relationships && relationships.length > 0) {
            const targetIds = relationships.map(r => r.target_profile_id);
            await this.syncProfiles(profileId, targetIds);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  private getFieldsToSync(
    sourceProfile: ProfileType,
    allowedFields: string[]
  ): Partial<ProfileType> {
    const fieldsToSync: Partial<ProfileType> = {};

    allowedFields.forEach(field => {
      if (field in sourceProfile) {
        (fieldsToSync as any)[field] = (sourceProfile as any)[field];
      }
    });

    return fieldsToSync;
  }

  async updateSyncConfig(
    sourceProfileId: string,
    targetProfileId: string,
    config: Partial<ProfileSyncConfig>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('profile_sync_relationships')
      .update({
        sync_config: config,
        updated_at: new Date()
      })
      .eq('source_profile_id', sourceProfileId)
      .eq('target_profile_id', targetProfileId);

    if (error) throw error;
  }

  async removeSyncRelationship(
    sourceProfileId: string,
    targetProfileId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('profile_sync_relationships')
      .delete()
      .eq('source_profile_id', sourceProfileId)
      .eq('target_profile_id', targetProfileId);

    if (error) throw error;
  }

  private async recordSyncEvent(
    sourceProfileId: string,
    targetProfileIds: string[],
    status: 'success' | 'failure',
    error?: string
  ): Promise<void> {
    const { error: insertError } = await this.supabase
      .from('profile_sync_logs')
      .insert({
        source_profile_id: sourceProfileId,
        target_profile_ids: targetProfileIds,
        status,
        error_message: error,
        synced_at: new Date()
      });

    if (insertError) {
      console.error('Failed to record sync event:', insertError);
    }
  }

  async getSyncHistory(
    profileId: string,
    limit = 50
  ): Promise<Array<{
    syncedAt: Date;
    status: string;
    targetProfiles: string[];
  }>> {
    const { data, error } = await this.supabase
      .from('profile_sync_logs')
      .select('*')
      .or(`source_profile_id.eq.${profileId},target_profile_ids.cs.{${profileId}}`)
      .order('synced_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(log => ({
      syncedAt: new Date(log.synced_at),
      status: log.status,
      targetProfiles: log.target_profile_ids
    }));
  }
}