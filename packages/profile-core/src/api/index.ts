export * from './profile-crud';
export * from './profile-clone';
export * from './profile-sync';

import { SupabaseClient } from '@supabase/supabase-js';
import { ProfileCRUD } from './profile-crud';
import { ProfileCloneService } from './profile-clone';
import { ProfileSyncService } from './profile-sync';

export class ProfileAPI {
  public crud: ProfileCRUD;
  public clone: ProfileCloneService;
  public sync: ProfileSyncService;

  constructor(supabase: SupabaseClient) {
    this.crud = new ProfileCRUD(supabase);
    this.clone = new ProfileCloneService(supabase);
    this.sync = new ProfileSyncService(supabase);
  }
}