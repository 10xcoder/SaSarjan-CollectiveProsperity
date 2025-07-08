-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('freelancer', 'entrepreneur', 'volunteer', 'company')),
  
  -- Base profile fields
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  location JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Type-specific fields (stored as JSONB)
  category TEXT,
  sub_categories TEXT[],
  skills JSONB,
  experience JSONB,
  portfolio JSONB,
  hourly_rate JSONB,
  availability TEXT,
  preferred_project_duration TEXT,
  languages TEXT[],
  certifications JSONB,
  
  -- Entrepreneur specific
  business_name TEXT,
  business_category TEXT,
  founding_year INTEGER,
  stage TEXT,
  looking_for TEXT[],
  achievements JSONB,
  social_links JSONB,
  
  -- Volunteer specific
  causes TEXT[],
  impact_metrics JSONB,
  
  -- Company specific
  company_name TEXT,
  industry TEXT,
  size TEXT,
  founded INTEGER,
  website TEXT,
  description TEXT,
  culture TEXT[],
  benefits TEXT[],
  hiring_for TEXT[],
  tech_stack TEXT[],
  
  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  
  -- Indexes
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_type ON profiles(type);
CREATE INDEX idx_profiles_location ON profiles USING GIN(location);
CREATE INDEX idx_profiles_skills ON profiles USING GIN(skills);
CREATE INDEX idx_profiles_metadata ON profiles USING GIN(metadata);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Create profile sync relationships table
CREATE TABLE IF NOT EXISTS profile_sync_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_profile_id TEXT NOT NULL,
  target_profile_id TEXT NOT NULL,
  sync_config JSONB NOT NULL DEFAULT '{
    "fields": ["name", "email", "phone", "location", "avatar", "bio"],
    "direction": "one-way",
    "frequency": "realtime"
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT profile_sync_source_fkey FOREIGN KEY (source_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT profile_sync_target_fkey FOREIGN KEY (target_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT profile_sync_unique UNIQUE (source_profile_id, target_profile_id)
);

-- Create indexes for sync relationships
CREATE INDEX idx_sync_source ON profile_sync_relationships(source_profile_id);
CREATE INDEX idx_sync_target ON profile_sync_relationships(target_profile_id);

-- Create profile sync logs table
CREATE TABLE IF NOT EXISTS profile_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_profile_id TEXT NOT NULL,
  target_profile_ids TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
  error_message TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT sync_logs_source_fkey FOREIGN KEY (source_profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create index for sync logs
CREATE INDEX idx_sync_logs_source ON profile_sync_logs(source_profile_id);
CREATE INDEX idx_sync_logs_synced_at ON profile_sync_logs(synced_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_relationships_updated_at BEFORE UPDATE ON profile_sync_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_sync_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profiles" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profiles" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sync relationships
CREATE POLICY "Users can view sync relationships for their profiles" ON profile_sync_relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id IN (source_profile_id, target_profile_id) 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sync relationships for their profiles" ON profile_sync_relationships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = source_profile_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sync relationships for their profiles" ON profile_sync_relationships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = source_profile_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sync relationships for their profiles" ON profile_sync_relationships
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = source_profile_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for sync logs
CREATE POLICY "Users can view sync logs for their profiles" ON profile_sync_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = source_profile_id 
      AND user_id = auth.uid()
    )
  );