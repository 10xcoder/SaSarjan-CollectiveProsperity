-- Simple Profile System Sample Data
-- This script populates the database with basic sample profiles for testing

-- Sample Freelancer Profile (inserting directly without auth users for now)
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

-- Add some bulk freelancer profiles for testing search/pagination
DO $$
DECLARE
    i INTEGER;
    profile_id TEXT;
    user_uuid UUID;
    cities TEXT[] := ARRAY['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune'];
    states TEXT[] := ARRAY['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Maharashtra'];
    categories TEXT[] := ARRAY['tech', 'design', 'marketing', 'content'];
BEGIN
    FOR i IN 1..15 LOOP
        profile_id := 'bulk-freelancer-' || i;
        user_uuid := gen_random_uuid();
        
        INSERT INTO profiles (
            id, user_id, type, name, email, phone, bio, location,
            category, hourly_rate, availability, metadata,
            created_at, updated_at
        ) VALUES (
            profile_id,
            user_uuid,
            'freelancer',
            'Freelancer ' || i,
            'freelancer' || i || '@example.com',
            '98765' || LPAD(i::text, 5, '0'),
            'Professional freelancer with expertise in ' || categories[((i-1) % 4) + 1],
            ('{"country": "India", "state": "' || states[((i-1) % 6) + 1] || '", "city": "' || cities[((i-1) % 6) + 1] || '"}')::jsonb,
            categories[((i-1) % 4) + 1],
            ('{"min": ' || (1000 + i * 100) || ', "max": ' || (2000 + i * 200) || ', "currency": "INR"}')::jsonb,
            CASE WHEN i % 3 = 0 THEN 'full-time' WHEN i % 3 = 1 THEN 'part-time' ELSE 'project-based' END,
            '{"originalAppId": "bulk-test", "syncEnabled": false, "visibility": "public"}'::jsonb,
            NOW() - (RANDOM() * INTERVAL '30 days'),
            NOW() - (RANDOM() * INTERVAL '7 days')
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- Insert some sync relationships (only for existing profiles)
INSERT INTO profile_sync_relationships (
  source_profile_id,
  target_profile_id,
  sync_config,
  created_at,
  updated_at
) VALUES 
  (
    'freelancer-demo-1',
    'bulk-freelancer-1',
    '{"fields": ["name", "email", "phone", "location"], "direction": "one-way", "frequency": "realtime"}'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Insert some sync logs
INSERT INTO profile_sync_logs (
  source_profile_id,
  target_profile_ids,
  status,
  synced_at
) VALUES 
  (
    'freelancer-demo-1',
    ARRAY['bulk-freelancer-1'],
    'success',
    NOW() - INTERVAL '1 hour'
  ),
  (
    'freelancer-demo-1',
    ARRAY['bulk-freelancer-1'],
    'success',
    NOW() - INTERVAL '5 minutes'
  )
ON CONFLICT DO NOTHING;