-- Load Sample Profile Data
-- This script creates sample data for testing the profile system

-- Create a special function to load demo data
CREATE OR REPLACE FUNCTION load_demo_profile_data()
RETURNS TEXT AS $$
BEGIN
  -- Temporarily drop and recreate foreign key constraint
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
  
  -- Insert sample profiles
  INSERT INTO profiles (
    id, user_id, type, name, email, phone, bio, location,
    category, hourly_rate, availability, metadata, created_at, updated_at
  ) VALUES 
  (
    'demo-freelancer-1',
    '00000000-0000-0000-0000-000000000001'::uuid,
    'freelancer',
    'Priya Sharma',
    'priya@example.com',
    '9876543210',
    'Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies',
    '{"country": "India", "state": "Maharashtra", "city": "Mumbai"}'::jsonb,
    'tech',
    '{"min": 2000, "max": 4000, "currency": "INR"}'::jsonb,
    'full-time',
    '{"originalAppId": "sasarjan", "syncEnabled": true, "visibility": "public"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'demo-volunteer-1',
    '00000000-0000-0000-0000-000000000002'::uuid,
    'volunteer',
    'Rajesh Kumar',
    'rajesh@example.com',
    '9876543211',
    'Passionate educator committed to improving literacy in rural areas',
    '{"country": "India", "state": "Karnataka", "city": "Bangalore"}'::jsonb,
    'education',
    NULL,
    NULL,
    '{"originalAppId": "sevapremi", "syncEnabled": true, "visibility": "public"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'demo-entrepreneur-1',
    '00000000-0000-0000-0000-000000000003'::uuid,
    'entrepreneur',
    'Amit Patel',
    'amit@startup.com',
    '9876543212',
    'Serial entrepreneur building solutions for sustainable agriculture',
    '{"country": "India", "state": "Gujarat", "city": "Ahmedabad"}'::jsonb,
    NULL,
    NULL,
    NULL,
    '{"originalAppId": "10x-growth", "syncEnabled": true, "visibility": "public"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'demo-company-1',
    '00000000-0000-0000-0000-000000000004'::uuid,
    'company',
    'TechCorp India',
    'hr@techcorp.com',
    '9876543213',
    'Leading software development company focused on AI and ML solutions',
    '{"country": "India", "state": "Maharashtra", "city": "Pune"}'::jsonb,
    NULL,
    NULL,
    NULL,
    '{"originalAppId": "talentexcel", "syncEnabled": false, "visibility": "public"}'::jsonb,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING;

  -- Update type-specific fields
  UPDATE profiles SET 
    company_name = 'TechCorp India Pvt Ltd',
    industry = 'Software Development',
    size = '51-200',
    founded = 2015,
    website = 'https://techcorp.in',
    hiring_for = ARRAY['Machine Learning Engineer', 'Full Stack Developer'],
    tech_stack = ARRAY['Python', 'React', 'AWS']
  WHERE type = 'company';

  UPDATE profiles SET 
    business_name = 'AgriTech Solutions',
    business_category = 'Agriculture Technology',
    founding_year = 2021,
    stage = 'growth',
    looking_for = ARRAY['funding', 'mentorship']
  WHERE type = 'entrepreneur';

  UPDATE profiles SET 
    causes = ARRAY['Rural Education', 'Adult Literacy', 'Digital Education']
  WHERE type = 'volunteer';

  UPDATE profiles SET 
    skills = '[
      {"name": "React", "level": "expert", "yearsOfExperience": 5, "verified": true},
      {"name": "Node.js", "level": "expert", "yearsOfExperience": 5, "verified": true},
      {"name": "AWS", "level": "advanced", "yearsOfExperience": 3, "verified": false}
    ]'::jsonb,
    sub_categories = ARRAY['web-development', 'full-stack'],
    experience = '[
      {
        "title": "Senior Full Stack Developer",
        "company": "Tech Solutions Ltd",
        "location": "Mumbai",
        "startDate": "2020-01-01T00:00:00.000Z",
        "endDate": "2023-12-31T00:00:00.000Z",
        "description": "Led development of multiple web applications",
        "technologies": ["React", "Node.js", "AWS", "MongoDB"]
      }
    ]'::jsonb,
    portfolio = '[
      {
        "id": "portfolio-1",
        "title": "E-commerce Platform",
        "description": "Built a scalable e-commerce platform handling 10k+ daily users",
        "category": "Web Application",
        "tags": ["React", "Node.js", "MongoDB"]
      }
    ]'::jsonb,
    languages = ARRAY['Hindi', 'English', 'Marathi'],
    preferred_project_duration = 'long-term'
  WHERE type = 'freelancer';

  -- Add bulk freelancer profiles
  INSERT INTO profiles (
    id, user_id, type, name, email, phone, bio, location,
    category, hourly_rate, availability, metadata, created_at, updated_at
  )
  SELECT 
    'bulk-freelancer-' || i,
    ('00000000-0000-0000-0000-00000000' || LPAD((10 + i)::text, 4, '0'))::uuid,
    'freelancer',
    'Freelancer ' || i,
    'freelancer' || i || '@example.com',
    '98765' || LPAD(i::text, 5, '0'),
    'Professional freelancer with expertise in ' || 
      CASE i % 4 
        WHEN 0 THEN 'tech development'
        WHEN 1 THEN 'UI/UX design' 
        WHEN 2 THEN 'digital marketing'
        ELSE 'content creation'
      END,
    ('{"country": "India", "state": "' || 
      CASE i % 6 
        WHEN 0 THEN 'Maharashtra", "city": "Mumbai'
        WHEN 1 THEN 'Karnataka", "city": "Bangalore'
        WHEN 2 THEN 'Delhi", "city": "New Delhi'
        WHEN 3 THEN 'Tamil Nadu", "city": "Chennai'
        WHEN 4 THEN 'West Bengal", "city": "Kolkata'
        ELSE 'Maharashtra", "city": "Pune'
      END || '"}')::jsonb,
    CASE i % 4 
      WHEN 0 THEN 'tech'
      WHEN 1 THEN 'design' 
      WHEN 2 THEN 'marketing'
      ELSE 'content'
    END,
    ('{"min": ' || (1000 + i * 100) || ', "max": ' || (2000 + i * 200) || ', "currency": "INR"}')::jsonb,
    CASE i % 3 
      WHEN 0 THEN 'full-time'
      WHEN 1 THEN 'part-time'
      ELSE 'project-based'
    END,
    '{"originalAppId": "bulk-test", "visibility": "public"}'::jsonb,
    NOW() - (random() * interval '30 days'),
    NOW() - (random() * interval '7 days')
  FROM generate_series(1, 20) as i
  ON CONFLICT (id) DO NOTHING;

  -- Add some volunteers
  INSERT INTO profiles (
    id, user_id, type, name, email, phone, bio, location,
    category, causes, metadata, created_at, updated_at
  )
  SELECT 
    'bulk-volunteer-' || i,
    ('00000000-0000-0000-0000-00000000' || LPAD((50 + i)::text, 4, '0'))::uuid,
    'volunteer',
    'Volunteer ' || i,
    'volunteer' || i || '@example.com',
    '97765' || LPAD(i::text, 5, '0'),
    'Dedicated volunteer passionate about ' || 
      CASE i % 4 
        WHEN 0 THEN 'education and literacy'
        WHEN 1 THEN 'environmental conservation' 
        WHEN 2 THEN 'healthcare access'
        ELSE 'community development'
      END,
    ('{"country": "India", "state": "' || 
      CASE i % 5 
        WHEN 0 THEN 'Maharashtra", "city": "Mumbai'
        WHEN 1 THEN 'Karnataka", "city": "Bangalore'
        WHEN 2 THEN 'Delhi", "city": "New Delhi'
        WHEN 3 THEN 'Tamil Nadu", "city": "Chennai'
        ELSE 'West Bengal", "city": "Kolkata'
      END || '"}')::jsonb,
    CASE i % 4 
      WHEN 0 THEN 'education'
      WHEN 1 THEN 'environment' 
      WHEN 2 THEN 'health'
      ELSE 'community'
    END,
    CASE i % 4 
      WHEN 0 THEN ARRAY['Rural Education', 'Adult Literacy']
      WHEN 1 THEN ARRAY['Climate Change', 'Tree Plantation'] 
      WHEN 2 THEN ARRAY['Healthcare Access', 'Mental Health']
      ELSE ARRAY['Community Development', 'Women Empowerment']
    END,
    '{"originalAppId": "sevapremi", "visibility": "public"}'::jsonb,
    NOW() - (random() * interval '60 days'),
    NOW() - (random() * interval '20 days')
  FROM generate_series(1, 8) as i
  ON CONFLICT (id) DO NOTHING;

  RETURN 'Sample profile data loaded successfully!';
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT load_demo_profile_data();

-- Show summary
SELECT 
  'PROFILE DATA SUMMARY' as summary,
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE type = 'freelancer') as freelancers,
  COUNT(*) FILTER (WHERE type = 'volunteer') as volunteers,
  COUNT(*) FILTER (WHERE type = 'entrepreneur') as entrepreneurs,
  COUNT(*) FILTER (WHERE type = 'company') as companies
FROM profiles;

-- Show sample profiles
SELECT 
  id, type, name, 
  location->>'city' as city,
  location->>'state' as state,
  CASE 
    WHEN type = 'freelancer' THEN category || ' (' || hourly_rate->>'min' || '-' || hourly_rate->>'max' || ' INR/hr)'
    WHEN type = 'volunteer' THEN category || ' (' || array_length(causes, 1) || ' causes)'
    WHEN type = 'entrepreneur' THEN business_name || ' (' || stage || ')'
    WHEN type = 'company' THEN company_name || ' (' || size || ')'
  END as details
FROM profiles 
ORDER BY type, created_at 
LIMIT 15;

-- Clean up function
DROP FUNCTION load_demo_profile_data();