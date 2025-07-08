import { useState, useEffect, useCallback } from 'react';
import { ProfileType } from '../types/profile-types';
import { ProfileAPI } from '../api';
import { createClient } from '@supabase/supabase-js';

interface UseProfileOptions {
  userId?: string;
  profileId?: string;
  appId?: string;
  autoSync?: boolean;
}

export function useProfile(options: UseProfileOptions) {
  const [profiles, setProfiles] = useState<ProfileType[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const profileAPI = new ProfileAPI(supabase);

  const loadProfiles = useCallback(async () => {
    if (!options.userId) return;

    try {
      setLoading(true);
      const userProfiles = await profileAPI.crud.getUserProfiles(
        options.userId,
        options.appId
      );
      setProfiles(userProfiles);

      if (options.profileId) {
        const profile = userProfiles.find(p => p.id === options.profileId);
        setCurrentProfile(profile || null);
      } else if (userProfiles.length > 0) {
        setCurrentProfile(userProfiles[0]);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [options.userId, options.profileId, options.appId]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const createProfile = async (
    profileData: Omit<ProfileType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!options.userId) throw new Error('User ID is required');

    const newProfile = await profileAPI.crud.createProfile(
      options.userId,
      profileData,
      {
        originalAppId: options.appId || 'sasarjan',
        syncEnabled: options.autoSync || false,
        visibility: 'app-only'
      }
    );

    setProfiles([...profiles, newProfile]);
    setCurrentProfile(newProfile);
    return newProfile;
  };

  const updateProfile = async (
    profileId: string,
    updates: Partial<ProfileType>
  ) => {
    const updatedProfile = await profileAPI.crud.updateProfile(profileId, updates);
    
    setProfiles(profiles.map(p => p.id === profileId ? updatedProfile : p));
    if (currentProfile?.id === profileId) {
      setCurrentProfile(updatedProfile);
    }
    
    return updatedProfile;
  };

  const deleteProfile = async (profileId: string) => {
    await profileAPI.crud.deleteProfile(profileId);
    
    setProfiles(profiles.filter(p => p.id !== profileId));
    if (currentProfile?.id === profileId) {
      setCurrentProfile(profiles.find(p => p.id !== profileId) || null);
    }
  };

  const selectProfile = (profile: ProfileType) => {
    setCurrentProfile(profile);
  };

  const importProfile = async (sourceProfileId: string, profileType: ProfileType['type']) => {
    if (!options.appId) throw new Error('App ID is required for importing profiles');

    const clonedProfile = await profileAPI.clone.cloneProfile({
      sourceProfileId,
      targetAppId: options.appId,
      profileType,
      syncEnabled: options.autoSync
    });

    setProfiles([...profiles, clonedProfile]);
    setCurrentProfile(clonedProfile);
    return clonedProfile;
  };

  const syncProfile = async (profileId: string) => {
    const { targets } = await profileAPI.clone.getSyncedProfiles(profileId);
    if (targets.length > 0) {
      await profileAPI.sync.syncProfiles(profileId, targets.map(t => t.id));
    }
  };

  return {
    profiles,
    currentProfile,
    loading,
    error,
    createProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
    importProfile,
    syncProfile,
    reload: loadProfiles
  };
}