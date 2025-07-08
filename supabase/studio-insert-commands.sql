-- Copy and paste these commands in Supabase Studio SQL Editor
-- These commands will populate your profile system with sample data

-- Insert sample freelancer profile
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location, 
  category, skills, hourly_rate, availability, metadata
) VALUES (
  'freelancer-demo-1',
  '00000000-0000-0000-0000-000000000001'::uuid,
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
  '{"originalAppId": "sasarjan", "syncEnabled": true, "visibility": "public"}'::jsonb
);

-- Insert sample volunteer profile
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location,
  category, causes, metadata
) VALUES (
  'volunteer-demo-1',
  '00000000-0000-0000-0000-000000000002'::uuid,
  'volunteer',
  'Rajesh Kumar',
  'rajesh.kumar@example.com',
  '9876543211',
  'Passionate educator committed to improving literacy in rural areas.',
  '{"country": "India", "state": "Karnataka", "city": "Bangalore", "district": "Bangalore Urban"}'::jsonb,
  'education',
  ARRAY['Rural Education', 'Adult Literacy', 'Digital Education'],
  '{"originalAppId": "sevapremi", "syncEnabled": true, "visibility": "public"}'::jsonb
);

-- Insert sample entrepreneur profile
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location,
  business_name, business_category, founding_year, stage, looking_for, metadata
) VALUES (
  'entrepreneur-demo-1',
  '00000000-0000-0000-0000-000000000003'::uuid,
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
  '{"originalAppId": "10x-growth", "syncEnabled": true, "visibility": "public"}'::jsonb
);

-- Insert sample company profile
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location,
  company_name, industry, size, founded, website, description,
  hiring_for, tech_stack, metadata
) VALUES (
  'company-demo-1',
  '00000000-0000-0000-0000-000000000004'::uuid,
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
  '{"originalAppId": "talentexcel", "syncEnabled": false, "visibility": "public"}'::jsonb
);

-- Insert some bulk freelancer profiles for testing search
DO $$
DECLARE
    i INTEGER;
    cities TEXT[] := ARRAY['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune'];
    states TEXT[] := ARRAY['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Maharashtra'];
    categories TEXT[] := ARRAY['tech', 'design', 'marketing', 'content'];
BEGIN
    FOR i IN 1..10 LOOP
        INSERT INTO profiles (
            id, user_id, type, name, email, phone, bio, location,
            category, hourly_rate, availability, metadata
        ) VALUES (
            'bulk-freelancer-' || i,
            ('00000000-0000-0000-0000-00000000000' || (4 + i))::uuid,
            'freelancer',
            'Freelancer ' || i,
            'freelancer' || i || '@example.com',
            '98765' || LPAD(i::text, 5, '0'),
            'Professional freelancer with expertise in ' || categories[((i-1) % 4) + 1],
            ('{"country": "India", "state": "' || states[((i-1) % 6) + 1] || '", "city": "' || cities[((i-1) % 6) + 1] || '"}')::jsonb,
            categories[((i-1) % 4) + 1],
            ('{"min": ' || (1000 + i * 100) || ', "max": ' || (2000 + i * 200) || ', "currency": "INR"}')::jsonb,
            CASE WHEN i % 3 = 0 THEN 'full-time' WHEN i % 3 = 1 THEN 'part-time' ELSE 'project-based' END,
            '{"originalAppId": "bulk-test", "syncEnabled": false, "visibility": "public"}'::jsonb
        );
    END LOOP;
END $$;

-- Insert sync relationships
INSERT INTO profile_sync_relationships (
  source_profile_id, target_profile_id, sync_config
) VALUES 
(
  'freelancer-demo-1',
  'bulk-freelancer-1',
  '{"fields": ["name", "email", "phone", "location"], "direction": "one-way", "frequency": "realtime"}'::jsonb
);

-- Insert sync logs
INSERT INTO profile_sync_logs (
  source_profile_id, target_profile_ids, status
) VALUES 
(
  'freelancer-demo-1',
  ARRAY['bulk-freelancer-1'],
  'success'
);

-- Query to view all profiles
SELECT 
  id, type, name, email, 
  location->>'city' as city, 
  location->>'state' as state,
  CASE 
    WHEN type = 'freelancer' THEN category
    WHEN type = 'volunteer' THEN category
    WHEN type = 'entrepreneur' THEN business_name
    WHEN type = 'company' THEN company_name
  END as details,
  created_at
FROM profiles 
ORDER BY created_at DESC;