export * from './base-profile';
export * from './profile-types';

export interface ProfileCloneOptions {
  sourceProfileId: string;
  targetAppId: string;
  profileType: 'freelancer' | 'entrepreneur' | 'volunteer' | 'company';
  customizations?: Record<string, any>;
  syncEnabled?: boolean;
}

export interface ProfileSyncConfig {
  profileId: string;
  syncFields: string[];
  syncDirection: 'one-way' | 'two-way';
  syncFrequency: 'realtime' | 'daily' | 'manual';
}

export interface MultiProfileUser {
  userId: string;
  primaryProfileId: string;
  profiles: {
    [appId: string]: {
      [profileType: string]: string[];
    };
  };
}