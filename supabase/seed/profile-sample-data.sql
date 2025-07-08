-- Profile System Sample Data
-- This script populates the database with sample profiles for testing

-- First, let's create some sample users in auth.users (if they don't exist)
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  aud,
  role
) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'priya.sharma@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'rajesh.kumar@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    'amit.patel@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004'::uuid,
    'hr@techcorp.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005'::uuid,
    'demo.user@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  )
ON CONFLICT (email) DO NOTHING;

-- Sample Freelancer Profile
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location, 
  category, sub_categories, skills, experience, portfolio, 
  hourly_rate, availability, preferred_project_duration, 
  languages, certifications, metadata, created_at, updated_at
) VALUES (
  'freelancer-demo-1',
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'freelancer',
  'Priya Sharma',
  'priya.sharma@example.com',
  '9876543210',
  'Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies. Passionate about building scalable web applications.',
  '{"country": "India", "state": "Maharashtra", "city": "Mumbai", "pincode": "400001"}'::jsonb,
  'tech',
  ARRAY['web-development', 'cloud-architecture'],
  '[
    {"name": "React", "level": "expert", "yearsOfExperience": 5, "verified": true},
    {"name": "Node.js", "level": "expert", "yearsOfExperience": 5, "verified": true},
    {"name": "AWS", "level": "advanced", "yearsOfExperience": 3, "verified": false},
    {"name": "TypeScript", "level": "advanced", "yearsOfExperience": 4, "verified": true},
    {"name": "MongoDB", "level": "intermediate", "yearsOfExperience": 3, "verified": false}
  ]'::jsonb,
  '[
    {
      "title": "Senior Full Stack Developer",
      "company": "Tech Solutions Ltd",
      "location": "Mumbai",
      "startDate": "2020-01-01T00:00:00.000Z",
      "endDate": "2023-12-31T00:00:00.000Z",
      "description": "Led development of multiple web applications serving 50k+ users",
      "technologies": ["React", "Node.js", "AWS", "MongoDB"]
    },
    {
      "title": "Frontend Developer",
      "company": "Digital Innovations",
      "location": "Mumbai",
      "startDate": "2018-06-01T00:00:00.000Z",
      "endDate": "2019-12-31T00:00:00.000Z",
      "description": "Built responsive web interfaces and improved user experience",
      "technologies": ["React", "JavaScript", "CSS3", "HTML5"]
    }
  ]'::jsonb,
  '[
    {
      "id": "portfolio-1",
      "title": "E-commerce Platform",
      "description": "Built a scalable e-commerce platform handling 10k+ daily users",
      "url": "https://example-store.com",
      "category": "Web Application",
      "tags": ["React", "Node.js", "MongoDB", "Stripe"]
    },
    {
      "id": "portfolio-2",
      "title": "Real-time Chat Application",
      "description": "WebSocket-based chat app with file sharing capabilities",
      "url": "https://example-chat.com",
      "category": "Web Application",
      "tags": ["React", "Socket.io", "Express", "Redis"]
    }
  ]'::jsonb,
  '{"min": 2000, "max": 4000, "currency": "INR"}'::jsonb,
  'full-time',
  'long-term',
  ARRAY['Hindi', 'English', 'Marathi'],
  '[
    {
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "date": "2022-06-15T00:00:00.000Z",
      "url": "https://aws.amazon.com/certification/"
    }
  ]'::jsonb,
  '{"originalAppId": "sasarjan", "syncEnabled": true, "visibility": "public"}'::jsonb,
  NOW(),
  NOW()
);

-- Sample Volunteer Profile
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location,
  category, causes, skills, experience, impact_metrics,
  metadata, created_at, updated_at
) VALUES (
  'volunteer-demo-1',
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'volunteer',
  'Rajesh Kumar',
  'rajesh.kumar@example.com',
  '9876543211',
  'Passionate educator committed to improving literacy in rural areas. Experienced in curriculum development and community outreach.',
  '{"country": "India", "state": "Karnataka", "city": "Bangalore", "district": "Bangalore Urban"}'::jsonb,
  'education',
  ARRAY['Rural Education', 'Adult Literacy', 'Digital Education'],
  ARRAY['Teaching', 'Curriculum Development', 'Community Outreach', 'Public Speaking'],
  '[
    {
      "organization": "Teach for India",
      "role": "Volunteer Teacher",
      "duration": "2 years",
      "impact": "Taught 200+ students in rural Karnataka"
    },
    {
      "organization": "Digital India Foundation",
      "role": "Digital Literacy Trainer",
      "duration": "1 year",
      "impact": "Trained 150+ adults in basic computer skills"
    }
  ]'::jsonb,
  '[
    {
      "metric": "Students Taught",
      "value": 200,
      "unit": "students",
      "description": "Directly taught and mentored students in rural schools"
    },
    {
      "metric": "Literacy Improvement",
      "value": 85,
      "unit": "percent",
      "description": "Students showing improvement in reading skills"
    },
    {
      "metric": "Adult Learners",
      "value": 150,
      "unit": "adults",
      "description": "Adults trained in digital literacy programs"
    }
  ]'::jsonb,
  '{"originalAppId": "sevapremi", "syncEnabled": true, "visibility": "public"}'::jsonb,
  NOW(),
  NOW()
);

-- Sample Entrepreneur Profile
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location,
  business_name, business_category, founding_year, stage, looking_for,
  achievements, social_links, metadata, created_at, updated_at
) VALUES (
  'entrepreneur-demo-1',
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  'entrepreneur',
  'Amit Patel',
  'amit.patel@startup.com',
  '9876543212',
  'Serial entrepreneur building solutions for sustainable agriculture. Focused on leveraging technology to improve farmer productivity.',
  '{"country": "India", "state": "Gujarat", "city": "Ahmedabad"}'::jsonb,
  'AgriTech Solutions',
  'Agriculture Technology',
  2021,
  'growth',
  ARRAY['funding', 'mentorship', 'partners'],
  '[
    {
      "title": "Best AgriTech Startup 2023",
      "description": "Awarded by Gujarat Startup Summit for innovative farming solutions",
      "date": "2023-11-15T00:00:00.000Z"
    },
    {
      "title": "Raised Seed Funding",
      "description": "Successfully raised ₹2 Cr in seed funding from angel investors",
      "date": "2022-08-20T00:00:00.000Z"
    }
  ]'::jsonb,
  '{"linkedin": "https://linkedin.com/in/amitpatel", "twitter": "https://twitter.com/amitpatel", "website": "https://agritechsolutions.in"}'::jsonb,
  '{"originalAppId": "10x-growth", "syncEnabled": true, "visibility": "public"}'::jsonb,
  NOW(),
  NOW()
);

-- Sample Company Profile
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location,
  company_name, industry, size, founded, website, description,
  culture, benefits, hiring_for, tech_stack, metadata, created_at, updated_at
) VALUES (
  'company-demo-1',
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  'company',
  'TechCorp India',
  'hr@techcorp.com',
  '9876543213',
  'Leading software development company focused on AI and ML solutions for enterprise clients.',
  '{"country": "India", "state": "Maharashtra", "city": "Pune"}'::jsonb,
  'TechCorp India Pvt Ltd',
  'Software Development',
  '51-200',
  2015,
  'https://techcorp.in',
  'We build AI-powered solutions that help enterprises automate processes and gain insights from their data.',
  ARRAY['Innovation', 'Work-Life Balance', 'Learning & Development', 'Diversity & Inclusion'],
  ARRAY['Health Insurance', 'Flexible Hours', 'Remote Work', 'Learning Budget', 'Stock Options'],
  ARRAY['Machine Learning Engineer', 'Full Stack Developer', 'Product Manager', 'DevOps Engineer'],
  ARRAY['Python', 'TensorFlow', 'React', 'AWS', 'Kubernetes', 'Docker'],
  '{"originalAppId": "talentexcel", "syncEnabled": false, "visibility": "public"}'::jsonb,
  NOW(),
  NOW()
);

-- Create a Multi-Profile User (same user with different profile types)
INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location,
  category, sub_categories, skills, hourly_rate, availability,
  metadata, created_at, updated_at
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
  ARRAY['ui-design', 'graphic-design'],
  '[
    {"name": "Figma", "level": "expert", "yearsOfExperience": 4, "verified": true},
    {"name": "Adobe Creative Suite", "level": "advanced", "yearsOfExperience": 5, "verified": true}
  ]'::jsonb,
  '{"min": 1500, "max": 3000, "currency": "INR"}'::jsonb,
  'part-time',
  '{"originalAppId": "10x-growth", "syncEnabled": true, "visibility": "app-only"}'::jsonb,
  NOW(),
  NOW()
);

INSERT INTO profiles (
  id, user_id, type, name, email, phone, bio, location,
  category, causes, skills, experience, metadata, created_at, updated_at
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
  ARRAY['Environmental Awareness', 'Community Organizing'],
  '[
    {
      "organization": "Green Delhi Initiative",
      "role": "Community Coordinator",
      "duration": "6 months",
      "impact": "Organized 5 tree plantation drives"
    }
  ]'::jsonb,
  '{"originalAppId": "sevapremi", "clonedFrom": "freelancer-multi-1", "syncEnabled": true, "visibility": "public"}'::jsonb,
  NOW(),
  NOW()
);

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
  );

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
  );

-- Additional bulk sample data for testing search and pagination
DO $$
DECLARE
    i INTEGER;
    user_uuid UUID;
    cities TEXT[] := ARRAY['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad'];
    states TEXT[] := ARRAY['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Maharashtra', 'Telangana', 'Gujarat'];
    categories TEXT[] := ARRAY['tech', 'design', 'marketing', 'content'];
    skills_list TEXT[][] := ARRAY[
        ARRAY['React', 'JavaScript', 'CSS'],
        ARRAY['Python', 'Django', 'PostgreSQL'],
        ARRAY['Figma', 'Adobe XD', 'Sketch'],
        ARRAY['SEO', 'Content Writing', 'Social Media']
    ];
BEGIN
    FOR i IN 1..20 LOOP
        -- Generate a UUID for each bulk user
        user_uuid := gen_random_uuid();
        
        -- Insert auth user
        INSERT INTO auth.users (
            id, email, encrypted_password, email_confirmed_at, 
            created_at, updated_at, aud, role
        ) VALUES (
            user_uuid,
            'bulk.user' || i || '@example.com',
            crypt('password123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        ) ON CONFLICT (email) DO NOTHING;
        
        -- Insert freelancer profile
        INSERT INTO profiles (
            id, user_id, type, name, email, phone, bio, location,
            category, skills, hourly_rate, availability, metadata,
            created_at, updated_at
        ) VALUES (
            'bulk-freelancer-' || i,
            user_uuid,
            'freelancer',
            'Freelancer ' || i,
            'bulk.user' || i || '@example.com',
            '98765' || LPAD(i::text, 5, '0'),
            'Professional freelancer with expertise in ' || categories[((i-1) % 4) + 1],
            ('{"country": "India", "state": "' || states[((i-1) % 8) + 1] || '", "city": "' || cities[((i-1) % 8) + 1] || '"}')::jsonb,
            categories[((i-1) % 4) + 1],
            ('["' || array_to_string(skills_list[((i-1) % 4) + 1], '", "') || '"]')::jsonb,
            ('{"min": ' || (1000 + i * 100) || ', "max": ' || (2000 + i * 200) || ', "currency": "INR"}')::jsonb,
            CASE WHEN i % 3 = 0 THEN 'full-time' WHEN i % 3 = 1 THEN 'part-time' ELSE 'project-based' END,
            '{"originalAppId": "bulk-test", "syncEnabled": false, "visibility": "public"}'::jsonb,
            NOW(),
            NOW()
        );
    END LOOP;
END $$;

-- Update created_at for variety in sorting
UPDATE profiles 
SET created_at = created_at - (RANDOM() * INTERVAL '30 days')
WHERE id LIKE 'bulk-freelancer-%';

-- Add some updated_at variety
UPDATE profiles 
SET updated_at = updated_at - (RANDOM() * INTERVAL '7 days')
WHERE id LIKE 'bulk-freelancer-%';

COMMIT;