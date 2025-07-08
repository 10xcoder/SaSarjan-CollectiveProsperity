-- Bulk Profile Data for Testing Search and Pagination
-- This creates a larger dataset for testing various scenarios

-- Generate bulk freelancer profiles with variety
DO $$
DECLARE
    i INTEGER;
    user_uuid UUID;
    cities TEXT[] := ARRAY['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad', 'Jaipur', 'Lucknow'];
    states TEXT[] := ARRAY['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Maharashtra', 'Telangana', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'];
    categories TEXT[] := ARRAY['tech', 'design', 'marketing', 'content'];
    skills_by_category TEXT[][] := ARRAY[
        ARRAY['React', 'JavaScript', 'Node.js', 'Python', 'AWS'],
        ARRAY['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator'],
        ARRAY['SEO', 'Google Ads', 'Facebook Ads', 'Content Strategy', 'Analytics'],
        ARRAY['Copywriting', 'Blog Writing', 'Technical Writing', 'Social Media', 'Email Marketing']
    ];
    availabilities TEXT[] := ARRAY['full-time', 'part-time', 'project-based'];
BEGIN
    FOR i IN 1..25 LOOP
        -- Get existing user or create new one
        SELECT id INTO user_uuid FROM auth.users WHERE email = 'bulk.user' || i || '@example.com';
        
        IF user_uuid IS NULL THEN
            user_uuid := gen_random_uuid();
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, 
                email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                created_at, updated_at, confirmation_token, email_change, 
                email_change_token_new, recovery_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                user_uuid,
                'authenticated',
                'authenticated',
                'bulk.user' || i || '@example.com',
                crypt('password123', gen_salt('bf')),
                NOW(),
                '{"provider": "email", "providers": ["email"]}',
                ('{"name": "Bulk User ' || i || '"}')::jsonb,
                NOW(), NOW(), '', '', '', ''
            );
        END IF;
        
        -- Insert freelancer profile
        INSERT INTO profiles (
            id, user_id, type, name, email, phone, bio, location,
            category, sub_categories, skills, hourly_rate, availability, 
            preferred_project_duration, languages, metadata,
            created_at, updated_at
        ) VALUES (
            'bulk-freelancer-' || i,
            user_uuid,
            'freelancer',
            'Freelancer ' || i,
            'bulk.user' || i || '@example.com',
            '98765' || LPAD(i::text, 5, '0'),
            'Professional freelancer with ' || (2 + (i % 8)) || ' years of experience in ' || categories[((i-1) % 4) + 1] || ' domain.',
            ('{"country": "India", "state": "' || states[((i-1) % 10) + 1] || '", "city": "' || cities[((i-1) % 10) + 1] || '"}')::jsonb,
            categories[((i-1) % 4) + 1],
            ARRAY[categories[((i-1) % 4) + 1] || '-specialist'],
            ('[' || 
                '"' || skills_by_category[((i-1) % 4) + 1][1] || '": {"name": "' || skills_by_category[((i-1) % 4) + 1][1] || '", "level": "' || 
                CASE WHEN i % 4 = 0 THEN 'expert' WHEN i % 4 = 1 THEN 'advanced' ELSE 'intermediate' END || 
                '", "yearsOfExperience": ' || (2 + (i % 6)) || ', "verified": ' || 
                CASE WHEN i % 3 = 0 THEN 'true' ELSE 'false' END || '}' ||
            ']')::jsonb,
            ('{"min": ' || (800 + i * 150) || ', "max": ' || (1500 + i * 250) || ', "currency": "INR"}')::jsonb,
            availabilities[((i-1) % 3) + 1],
            CASE WHEN i % 2 = 0 THEN 'long-term' ELSE 'both' END,
            ARRAY['Hindi', 'English'],
            ('{"originalAppId": "bulk-test", "syncEnabled": false, "visibility": "public", "experience": "' || (2 + (i % 8)) || ' years"}')::jsonb,
            NOW() - (RANDOM() * INTERVAL '90 days'),
            NOW() - (RANDOM() * INTERVAL '30 days')
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- Generate some volunteer profiles
DO $$
DECLARE
    i INTEGER;
    user_uuid UUID;
    cities TEXT[] := ARRAY['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
    states TEXT[] := ARRAY['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal'];
    volunteer_categories TEXT[] := ARRAY['education', 'environment', 'health', 'community'];
    causes_by_category TEXT[][] := ARRAY[
        ARRAY['Rural Education', 'Adult Literacy', 'Digital Education'],
        ARRAY['Climate Change', 'Tree Plantation', 'Waste Management', 'Clean Energy'],
        ARRAY['Healthcare Access', 'Mental Health', 'Nutrition', 'Medical Camps'],
        ARRAY['Community Development', 'Women Empowerment', 'Youth Programs', 'Senior Care']
    ];
BEGIN
    FOR i IN 1..10 LOOP
        user_uuid := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, email_change, 
            email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            user_uuid,
            'authenticated',
            'authenticated',
            'volunteer' || i || '@example.com',
            crypt('password123', gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            ('{"name": "Volunteer ' || i || '"}')::jsonb,
            NOW(), NOW(), '', '', '', ''
        ) ON CONFLICT (email) DO NOTHING;
        
        INSERT INTO profiles (
            id, user_id, type, name, email, phone, bio, location,
            category, causes, availability, skills, metadata,
            created_at, updated_at
        ) VALUES (
            'bulk-volunteer-' || i,
            user_uuid,
            'volunteer',
            'Volunteer ' || i,
            'volunteer' || i || '@example.com',
            '97865' || LPAD(i::text, 5, '0'),
            'Dedicated volunteer with passion for ' || volunteer_categories[((i-1) % 4) + 1] || ' and community service.',
            ('{"country": "India", "state": "' || states[((i-1) % 5) + 1] || '", "city": "' || cities[((i-1) % 5) + 1] || '"}')::jsonb,
            volunteer_categories[((i-1) % 4) + 1],
            causes_by_category[((i-1) % 4) + 1],
            ('{"hoursPerWeek": ' || (5 + (i % 15)) || ', "preferredDays": ["saturday", "sunday"], "preferredTime": "' || 
            CASE WHEN i % 3 = 0 THEN 'morning' WHEN i % 3 = 1 THEN 'afternoon' ELSE 'evening' END || '"}')::jsonb,
            ARRAY['Communication', 'Leadership', 'Problem Solving'],
            ('{"originalAppId": "sevapremi", "syncEnabled": false, "visibility": "public"}')::jsonb,
            NOW() - (RANDOM() * INTERVAL '60 days'),
            NOW() - (RANDOM() * INTERVAL '20 days')
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- Generate some entrepreneur profiles
DO $$
DECLARE
    i INTEGER;
    user_uuid UUID;
    cities TEXT[] := ARRAY['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad'];
    states TEXT[] := ARRAY['Maharashtra', 'Karnataka', 'Delhi', 'Maharashtra', 'Telangana'];
    business_types TEXT[] := ARRAY['EdTech', 'FinTech', 'HealthTech', 'AgriTech', 'E-commerce'];
    stages TEXT[] := ARRAY['idea', 'mvp', 'growth', 'scale'];
BEGIN
    FOR i IN 1..8 LOOP
        user_uuid := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token, email_change, 
            email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            user_uuid,
            'authenticated',
            'authenticated',
            'entrepreneur' || i || '@example.com',
            crypt('password123', gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            ('{"name": "Entrepreneur ' || i || '"}')::jsonb,
            NOW(), NOW(), '', '', '', ''
        ) ON CONFLICT (email) DO NOTHING;
        
        INSERT INTO profiles (
            id, user_id, type, name, email, phone, bio, location,
            business_name, business_category, founding_year, stage, 
            looking_for, metadata, created_at, updated_at
        ) VALUES (
            'bulk-entrepreneur-' || i,
            user_uuid,
            'entrepreneur',
            'Entrepreneur ' || i,
            'entrepreneur' || i || '@example.com',
            '96765' || LPAD(i::text, 5, '0'),
            'Innovative entrepreneur building solutions in ' || business_types[((i-1) % 5) + 1] || ' space.',
            ('{"country": "India", "state": "' || states[((i-1) % 5) + 1] || '", "city": "' || cities[((i-1) % 5) + 1] || '"}')::jsonb,
            business_types[((i-1) % 5) + 1] || ' Startup ' || i,
            business_types[((i-1) % 5) + 1],
            2018 + (i % 6),
            stages[((i-1) % 4) + 1],
            CASE 
                WHEN i % 3 = 0 THEN ARRAY['funding', 'mentorship']
                WHEN i % 3 = 1 THEN ARRAY['partners', 'team']
                ELSE ARRAY['funding', 'customers']
            END,
            ('{"originalAppId": "10x-growth", "syncEnabled": false, "visibility": "public"}')::jsonb,
            NOW() - (RANDOM() * INTERVAL '180 days'),
            NOW() - (RANDOM() * INTERVAL '45 days')
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;