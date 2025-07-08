import { SupabaseClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { ProfileType, ProfileTypeSchema } from '../types/profile-types';
import { ProfileMetadata } from '../types/base-profile';

export class ProfileCRUD {
  constructor(private supabase: SupabaseClient) {}

  async createProfile(
    userId: string,
    profileData: Omit<ProfileType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    metadata: ProfileMetadata
  ): Promise<ProfileType> {
    const profile = {
      ...profileData,
      id: nanoid(),
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const validatedProfile = ProfileTypeSchema.parse(profile);

    const { data, error } = await this.supabase
      .from('profiles')
      .insert({
        ...validatedProfile,
        metadata
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProfile(profileId: string): Promise<ProfileType | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return ProfileTypeSchema.parse(data);
  }

  async getUserProfiles(userId: string, appId?: string): Promise<ProfileType[]> {
    let query = this.supabase
      .from('profiles')
      .select('*')
      .eq('userId', userId)
      .eq('isActive', true);

    if (appId) {
      query = query.eq('metadata->>originalAppId', appId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(profile => ProfileTypeSchema.parse(profile));
  }

  async updateProfile(
    profileId: string,
    updates: Partial<ProfileType>
  ): Promise<ProfileType> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        ...updates,
        updatedAt: new Date()
      })
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return ProfileTypeSchema.parse(data);
  }

  async deleteProfile(profileId: string): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update({ isActive: false })
      .eq('id', profileId);

    if (error) throw error;
  }

  async searchProfiles(
    filters: {
      type?: ProfileType['type'];
      category?: string;
      location?: {
        city?: string;
        state?: string;
      };
      skills?: string[];
    },
    limit = 20,
    offset = 0
  ): Promise<{ profiles: ProfileType[]; total: number }> {
    let query = this.supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('isActive', true)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.location?.city) {
      query = query.eq('location->>city', filters.location.city);
    }

    if (filters.location?.state) {
      query = query.eq('location->>state', filters.location.state);
    }

    if (filters.skills && filters.skills.length > 0) {
      query = query.contains('skills', filters.skills.map(skill => ({ name: skill })));
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      profiles: data.map(profile => ProfileTypeSchema.parse(profile)),
      total: count || 0
    };
  }
}