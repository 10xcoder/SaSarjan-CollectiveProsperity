-- Demo Profile Data (without auth constraints for testing)
-- This temporarily disables foreign key constraints to insert sample data

-- Temporarily disable foreign key constraints
ALTER TABLE profiles DISABLE TRIGGER ALL;
ALTER TABLE profile_sync_relationships DISABLE TRIGGER ALL;
ALTER TABLE profile_sync_logs DISABLE TRIGGER ALL;

-- Sample Freelancer Profile
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location, 
  category, skills, hourly_rate, availability, metadata, created_at, updated_at
) VALUES (
  'freelancer-demo-1',
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'freelancer',
  'Priya Sharma',
  'priya.sharma@example.com',
  '9876543210',
  'Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies.',
  '{"country": "India", "state": "Maharashtra", "city": "Mumbai", "pincode": "400001"}'::jsonb,
  'tech',
  '[
    {"name": "React", "level": "expert", "yearsOfExperience": 5, "verified": true},
    {"name": "Node.js", "level": "expert", "yearsOfExperience": 5, "verified": true},
    {"name": "AWS", "level": "advanced", "yearsOfExperience": 3, "verified": false}
  ]'::jsonb,
  '{"min": 2000, "max": 4000, "currency": "INR"}'::jsonb,
  'full-time',
  '{"originalAppId": "sasarjan", "syncEnabled": true, "visibility": "public"}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Sample Volunteer Profile
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location,
  category, causes, metadata, created_at, updated_at
) VALUES (
  'volunteer-demo-1',
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'volunteer',
  'Rajesh Kumar',
  'rajesh.kumar@example.com',
  '9876543211',
  'Passionate educator committed to improving literacy in rural areas.',
  '{"country": "India", "state": "Karnataka", "city": "Bangalore", "district": "Bangalore Urban"}'::jsonb,
  'education',
  ARRAY['Rural Education', 'Adult Literacy', 'Digital Education'],
  '{"originalAppId": "sevapremi", "syncEnabled": true, "visibility": "public"}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Sample Entrepreneur Profile
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location,
  business_name, business_category, founding_year, stage, looking_for,
  metadata, created_at, updated_at
) VALUES (
  'entrepreneur-demo-1',
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'entrepreneur',
  'Amit Patel',
  'amit.patel@startup.com',
  '9876543212',
  'Serial entrepreneur building solutions for sustainable agriculture.',
  '{"country": "India", "state": "Gujarat", "city": "Ahmedabad"}'::jsonb,
  'AgriTech Solutions',
  'Agriculture Technology',
  2021,
  'growth',
  ARRAY['funding', 'mentorship', 'partners'],
  '{"originalAppId": "10x-growth", "syncEnabled": true, "visibility": "public"}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Sample Company Profile
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location,
  company_name, industry, size, founded, website, description,
  hiring_for, tech_stack, metadata, created_at, updated_at
) VALUES (
  'company-demo-1',
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'company',
  'TechCorp India',
  'hr@techcorp.com',
  '9876543213',
  'Leading software development company focused on AI and ML solutions.',
  '{"country": "India", "state": "Maharashtra", "city": "Pune"}'::jsonb,
  'TechCorp India Pvt Ltd',
  'Software Development',
  '51-200',
  2015,
  'https://techcorp.in',
  'We build AI-powered solutions for enterprises.',
  ARRAY['Machine Learning Engineer', 'Full Stack Developer', 'Product Manager'],
  ARRAY['Python', 'TensorFlow', 'React', 'AWS', 'Kubernetes'],
  '{"originalAppId": "talentexcel", "syncEnabled": false, "visibility": "public"}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Sample Multi-Profile User (Freelancer)
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location,
  category, skills, hourly_rate, availability, metadata, created_at, updated_at
) VALUES (
  'freelancer-multi-1',
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'freelancer',
  'Demo User',
  'demo.user@example.com',
  '9876543214',
  'Versatile professional working as both freelancer and volunteer.',
  '{"country": "India", "state": "Delhi", "city": "New Delhi"}'::jsonb,
  'design',
  '[
    {"name": "Figma", "level": "expert", "yearsOfExperience": 4, "verified": true},
    {"name": "Adobe Creative Suite", "level": "advanced", "yearsOfExperience": 5, "verified": true}
  ]'::jsonb,
  '{"min": 1500, "max": 3000, "currency": "INR"}'::jsonb,
  'part-time',
  '{"originalAppId": "10x-growth", "syncEnabled": true, "visibility": "app-only"}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Sample Multi-Profile User (Volunteer)
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location,
  category, causes, metadata, created_at, updated_at
) VALUES (
  'volunteer-multi-1',
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  'volunteer',
  'Demo User',
  'demo.user@example.com',
  '9876543214',
  'Passionate about environmental conservation and community service.',
  '{"country": "India", "state": "Delhi", "city": "New Delhi"}'::jsonb,
  'environment',
  ARRAY['Climate Change', 'Tree Plantation', 'Waste Management'],
  '{"originalAppId": "sevapremi", "clonedFrom": "freelancer-multi-1", "syncEnabled": true, "visibility": "public"}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Bulk freelancer profiles for testing
DO $$
DECLARE
    i INTEGER;
    cities TEXT[] := ARRAY['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
    states TEXT[] := ARRAY['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Maharashtra', 'Telangana', 'Gujarat'];
    categories TEXT[] := ARRAY['tech', 'design', 'marketing', 'content'];
BEGIN
    FOR i IN 1..20 LOOP
        INSERT INTO profiles (
            id, user_id, type, name, email, phone, bio, location,
            category, hourly_rate, availability, metadata,
            created_at, updated_at
        ) VALUES (
            'bulk-freelancer-' || i,
            gen_random_uuid(),
            'freelancer',
            'Freelancer ' || i,
            'freelancer' || i || '@example.com',
            '98765' || LPAD(i::text, 5, '0'),
            'Professional freelancer with expertise in ' || categories[((i-1) % 4) + 1],
            ('{"country": "India", "state": "' || states[((i-1) % 8) + 1] || '", "city": "' || cities[((i-1) % 8) + 1] || '"}')::jsonb,
            categories[((i-1) % 4) + 1],
            ('{"min": ' || (1000 + i * 100) || ', "max": ' || (2000 + i * 200) || ', "currency": "INR"}')::jsonb,
            CASE WHEN i % 3 = 0 THEN 'full-time' WHEN i % 3 = 1 THEN 'part-time' ELSE 'project-based' END,
            '{"originalAppId": "bulk-test", "syncEnabled": false, "visibility": "public"}'::jsonb,
            NOW() - (RANDOM() * INTERVAL '30 days'),
            NOW() - (RANDOM() * INTERVAL '7 days')
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- Sample Profile Sync Relationships
INSERT INTO profile_sync_relationships (
  source_profile_id,
  target_profile_id,
  sync_config,
  created_at,
  updated_at
) VALUES 
  (
    'freelancer-demo-1',
    'freelancer-multi-1',
    '{"fields": ["name", "email", "phone", "location"], "direction": "one-way", "frequency": "realtime"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'freelancer-multi-1',
    'volunteer-multi-1',
    '{"fields": ["name", "email", "phone", "location"], "direction": "two-way", "frequency": "daily"}'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Sample Profile Sync Logs
INSERT INTO profile_sync_logs (
  source_profile_id,
  target_profile_ids,
  status,
  synced_at
) VALUES 
  (
    'freelancer-demo-1',
    ARRAY['freelancer-multi-1'],
    'success',
    NOW() - INTERVAL '1 hour'
  ),
  (
    'freelancer-multi-1',
    ARRAY['volunteer-multi-1'],
    'success',
    NOW() - INTERVAL '30 minutes'
  ),
  (
    'freelancer-demo-1',
    ARRAY['freelancer-multi-1'],
    'success',
    NOW() - INTERVAL '5 minutes'
  )
ON CONFLICT DO NOTHING;

-- Re-enable foreign key constraints
ALTER TABLE profiles ENABLE TRIGGER ALL;
ALTER TABLE profile_sync_relationships ENABLE TRIGGER ALL;
ALTER TABLE profile_sync_logs ENABLE TRIGGER ALL;