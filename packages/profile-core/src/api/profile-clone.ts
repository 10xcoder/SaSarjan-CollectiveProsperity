import { SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { ProfileType } from '../types/profile-types';
import { ProfileCloneOptions, ProfileMetadata } from '../types';
import { ProfileCRUD } from './profile-crud';

export class ProfileCloneService {
  private profileCrud: ProfileCRUD;

  constructor(private supabase: SupabaseClient) {
    this.profileCrud = new ProfileCRUD(supabase);
  }

  async cloneProfile(options: ProfileCloneOptions): Promise<ProfileType> {
    const sourceProfile = await this.profileCrud.getProfile(options.sourceProfileId);
    if (!sourceProfile) {
      throw new Error('Source profile not found');
    }

    const clonedProfileData = {
      ...sourceProfile,
      id: nanoid(),
      type: options.profileType,
      ...options.customizations,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSyncAt: new Date()
    };

    delete (clonedProfileData as any).metadata;

    const metadata: ProfileMetadata = {
      originalAppId: options.targetAppId,
      clonedFrom: options.sourceProfileId,
      syncEnabled: options.syncEnabled ?? true,
      visibility: 'app-only'
    };

    const { data, error } = await this.supabase
      .from('profiles')
      .insert({
        ...clonedProfileData,
        metadata
      })
      .select()
      .single();

    if (error) throw error;

    if (options.syncEnabled) {
      await this.createSyncRelationship(sourceProfile.id, data.id);
    }

    return data;
  }

  async cloneMultipleProfiles(
    userId: string,
    sourceAppId: string,
    targetAppId: string,
    profileMappings: Array<{
      sourceType: string;
      targetType: ProfileType['type'];
      customizations?: Record<string, any>;
    }>
  ): Promise<ProfileType[]> {
    const sourceProfiles = await this.profileCrud.getUserProfiles(userId, sourceAppId);
    const clonedProfiles: ProfileType[] = [];

    for (const mapping of profileMappings) {
      const sourceProfile = sourceProfiles.find(p => p.type === mapping.sourceType);
      if (!sourceProfile) continue;

      const cloned = await this.cloneProfile({
        sourceProfileId: sourceProfile.id,
        targetAppId,
        profileType: mapping.targetType,
        customizations: mapping.customizations,
        syncEnabled: true
      });

      clonedProfiles.push(cloned);
    }

    return clonedProfiles;
  }

  private async createSyncRelationship(
    sourceProfileId: string,
    targetProfileId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('profile_sync_relationships')
      .insert({
        source_profile_id: sourceProfileId,
        target_profile_id: targetProfileId,
        sync_config: {
          fields: ['name', 'email', 'phone', 'location', 'avatar', 'bio'],
          direction: 'one-way',
          frequency: 'realtime'
        },
        created_at: new Date()
      });

    if (error) throw error;
  }

  async getSyncedProfiles(profileId: string): Promise<{
    source: ProfileType | null;
    targets: ProfileType[];
  }> {
    const { data: relationships, error } = await this.supabase
      .from('profile_sync_relationships')
      .select('*')
      .or(`source_profile_id.eq.${profileId},target_profile_id.eq.${profileId}`);

    if (error) throw error;

    const sourceRelation = relationships.find(r => r.target_profile_id === profileId);
    const targetRelations = relationships.filter(r => r.source_profile_id === profileId);

    const source = sourceRelation
      ? await this.profileCrud.getProfile(sourceRelation.source_profile_id)
      : null;

    const targets = await Promise.all(
      targetRelations.map(r => this.profileCrud.getProfile(r.target_profile_id))
    );

    return {
      source,
      targets: targets.filter(Boolean) as ProfileType[]
    };
  }
}