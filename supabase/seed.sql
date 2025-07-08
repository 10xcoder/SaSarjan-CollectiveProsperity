-- SaSarjan App Store Seed Data
-- Created: 06-Jul-2025, Sunday 16:38 IST

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core Apps
INSERT INTO apps (id, name, slug, tagline, description, category, status, created_at) VALUES
(uuid_generate_v4(), 'TalentExcel', 'talentexcel', 'Excel in Life, Excel in Career', 'Lifelong Learning & Earning Platform', 'Career', 'active', NOW()),
(uuid_generate_v4(), '10xGrowth', '10xgrowth', 'Multiply Your Business Impact', 'Business Growth Accelerator', 'Business', 'active', NOW()),
(uuid_generate_v4(), 'SevaPremi', 'sevapremi', 'Together We Transform Communities', 'Local Area Improvement Network', 'Community', 'active', NOW()),
(uuid_generate_v4(), 'Incubator.in', 'incubator', 'From Idea to Impact', 'Startup Success Platform', 'Startup', 'active', NOW()),
(uuid_generate_v4(), 'NanhaSitara', 'nanhasitara', 'Every Child is a Star', 'Child Development Platform', 'Education', 'active', NOW()),
(uuid_generate_v4(), 'Happy247', 'happy247', 'Your Journey to Complete Wellbeing', 'Holistic Happiness Platform', 'Wellness', 'active', NOW()),
(uuid_generate_v4(), 'Premi.world', 'premi', 'Connect with Your Tribe', 'Spiritual Community & Marketplace', 'Spiritual', 'active', NOW());

-- Sample Users with different profiles
INSERT INTO users (id, email, full_name, avatar_url, location, age_group, profession, created_at) VALUES
(uuid_generate_v4(), 'vikram.malhotra@email.com', 'Vikram Malhotra', 'https://api.dicebear.com/7.x/personas/svg?seed=vikram', 'Gurgaon', '31-40', 'Software Engineer', NOW()),
(uuid_generate_v4(), 'kavitha.nair@email.com', 'Kavitha Nair', 'https://api.dicebear.com/7.x/personas/svg?seed=kavitha', 'Kochi', '41-50', 'Business Owner', NOW()),
(uuid_generate_v4(), 'arjun.patel@email.com', 'Arjun Patel', 'https://api.dicebear.com/7.x/personas/svg?seed=arjun', 'Ahmedabad', '18-25', 'Student', NOW()),
(uuid_generate_v4(), 'meera.krishnan@email.com', 'Dr. Meera Krishnan', 'https://api.dicebear.com/7.x/personas/svg?seed=meera', 'Chennai', '41-50', 'Healthcare', NOW()),
(uuid_generate_v4(), 'rohit.agarwal@email.com', 'Rohit Agarwal', 'https://api.dicebear.com/7.x/personas/svg?seed=rohit', 'Mumbai', '41-50', 'Corporate Executive', NOW());

-- Micro-Apps for TalentExcel
INSERT INTO micro_apps (id, app_id, name, slug, description, category, status, created_at) VALUES
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = 'talentexcel'), 'InternshipHub', 'internship-hub', 'Find internships across India', 'Internship', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = 'talentexcel'), 'FellowshipFinder', 'fellowship-finder', 'Research and social impact fellowships', 'Fellowship', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = 'talentexcel'), 'SkillMentor', 'skill-mentor', '1-on-1 mentorship with industry experts', 'Mentorship', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = 'talentexcel'), 'ProjectLab', 'project-lab', 'Real-world projects and collaborations', 'Project', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = 'talentexcel'), 'CertifyMe', 'certify-me', 'Industry certifications and skill assessments', 'Certification', 'active', NOW());

-- Micro-Apps for 10xGrowth
INSERT INTO micro_apps (id, app_id, name, slug, description, category, status, created_at) VALUES
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = '10xgrowth'), 'GrowthAudit', 'growth-audit', 'Business health check and analysis', 'Audit', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = '10xgrowth'), 'ExpertConnect', 'expert-connect', 'Connect with growth consultants', 'Consulting', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = '10xgrowth'), 'GrowthTools', 'growth-tools', 'CRM templates and automation tools', 'Tools', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = '10xgrowth'), 'DealFlow', 'deal-flow', 'B2B marketplace and partnerships', 'Marketplace', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = '10xgrowth'), 'GrowthAcademy', 'growth-academy', 'Business courses and workshops', 'Education', 'active', NOW());

-- Micro-Apps for SevaPremi
INSERT INTO micro_apps (id, app_id, name, slug, description, category, status, created_at) VALUES
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = 'sevapremi'), 'LocalIssues', 'local-issues', 'Report and track civic problems', 'Civic', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = 'sevapremi'), 'VolunteerMatch', 'volunteer-match', 'Find local volunteering opportunities', 'Volunteer', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = 'sevapremi'), 'NGOConnect', 'ngo-connect', 'Discover and support local NGOs', 'NGO', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = 'sevapremi'), 'CSRBridge', 'csr-bridge', 'Corporate social responsibility platform', 'CSR', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM apps WHERE slug = 'sevapremi'), 'ResearchHub', 'research-hub', 'Community data and impact studies', 'Research', 'active', NOW());

-- Tags for better discovery
INSERT INTO tags (id, name, slug, color, description, created_at) VALUES
(uuid_generate_v4(), 'Career Development', 'career-development', '#3B82F6', 'Professional growth and career advancement', NOW()),
(uuid_generate_v4(), 'Business Growth', 'business-growth', '#10B981', 'Scaling and growing businesses', NOW()),
(uuid_generate_v4(), 'Community Service', 'community-service', '#F59E0B', 'Giving back to society', NOW()),
(uuid_generate_v4(), 'Wellness', 'wellness', '#EF4444', 'Mental and physical health', NOW()),
(uuid_generate_v4(), 'Spiritual Growth', 'spiritual-growth', '#8B5CF6', 'Inner development and peace', NOW()),
(uuid_generate_v4(), 'Education', 'education', '#06B6D4', 'Learning and skill development', NOW()),
(uuid_generate_v4(), 'Technology', 'technology', '#6B7280', 'Tech innovation and digital tools', NOW());

-- Sample prosperity categories
INSERT INTO prosperity_categories (id, name, slug, description, icon, color, created_at) VALUES
(uuid_generate_v4(), 'Personal Transformation', 'personal-transformation', 'Individual growth and self-improvement', '🌱', '#10B981', NOW()),
(uuid_generate_v4(), 'Organizational Excellence', 'organizational-excellence', 'Building better organizations', '🏢', '#3B82F6', NOW()),
(uuid_generate_v4(), 'Community Resilience', 'community-resilience', 'Strengthening communities', '🤝', '#F59E0B', NOW()),
(uuid_generate_v4(), 'Ecological Regeneration', 'ecological-regeneration', 'Environmental sustainability', '🌍', '#10B981', NOW()),
(uuid_generate_v4(), 'Economic Empowerment', 'economic-empowerment', 'Financial growth and stability', '💰', '#EF4444', NOW()),
(uuid_generate_v4(), 'Knowledge Commons', 'knowledge-commons', 'Shared learning and wisdom', '📚', '#8B5CF6', NOW()),
(uuid_generate_v4(), 'Social Innovation', 'social-innovation', 'Creative solutions for society', '💡', '#06B6D4', NOW()),
(uuid_generate_v4(), 'Cultural Expression', 'cultural-expression', 'Arts, culture, and creativity', '🎨', '#EC4899', NOW());

-- Sample wallets for users
INSERT INTO wallets (id, user_id, balance, currency, status, created_at) VALUES
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'vikram.malhotra@email.com'), 1000.00, 'INR', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'kavitha.nair@email.com'), 2500.00, 'INR', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'arjun.patel@email.com'), 500.00, 'INR', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'meera.krishnan@email.com'), 1500.00, 'INR', 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'rohit.agarwal@email.com'), 5000.00, 'INR', 'active', NOW());

-- Sample transactions
INSERT INTO transactions (id, user_id, wallet_id, amount, currency, type, status, description, created_at) VALUES
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'vikram.malhotra@email.com'), (SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'vikram.malhotra@email.com')), 1000.00, 'INR', 'credit', 'completed', 'Initial wallet funding', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'kavitha.nair@email.com'), (SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'kavitha.nair@email.com')), 2500.00, 'INR', 'credit', 'completed', 'Initial wallet funding', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'arjun.patel@email.com'), (SELECT id FROM wallets WHERE user_id = (SELECT id FROM users WHERE email = 'arjun.patel@email.com')), 500.00, 'INR', 'credit', 'completed', 'Initial wallet funding', NOW());

-- Sample app installations
INSERT INTO app_installations (id, user_id, app_id, installed_at, status, created_at) VALUES
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'vikram.malhotra@email.com'), (SELECT id FROM apps WHERE slug = 'talentexcel'), NOW(), 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'vikram.malhotra@email.com'), (SELECT id FROM apps WHERE slug = 'sevapremi'), NOW(), 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'kavitha.nair@email.com'), (SELECT id FROM apps WHERE slug = '10xgrowth'), NOW(), 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'kavitha.nair@email.com'), (SELECT id FROM apps WHERE slug = 'sevapremi'), NOW(), 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'arjun.patel@email.com'), (SELECT id FROM apps WHERE slug = 'talentexcel'), NOW(), 'active', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'arjun.patel@email.com'), (SELECT id FROM apps WHERE slug = 'incubator'), NOW(), 'active', NOW());

-- Sample reviews
INSERT INTO reviews (id, user_id, app_id, rating, comment, status, created_at) VALUES
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'vikram.malhotra@email.com'), (SELECT id FROM apps WHERE slug = 'talentexcel'), 5, 'Excellent platform for career growth. The mentorship feature is outstanding!', 'approved', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'kavitha.nair@email.com'), (SELECT id FROM apps WHERE slug = '10xgrowth'), 4, 'Great tools for business analysis. The expert connect feature helped me scale my business.', 'approved', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'arjun.patel@email.com'), (SELECT id FROM apps WHERE slug = 'talentexcel'), 5, 'Found my dream internship through this platform. Highly recommended for students!', 'approved', NOW());

-- Sample admin users
INSERT INTO admin_users (id, email, full_name, role, permissions, status, created_at) VALUES
(uuid_generate_v4(), 'admin@sasarjan.com', 'System Administrator', 'super_admin', ARRAY['read', 'write', 'delete', 'manage_users', 'manage_apps', 'manage_payments'], 'active', NOW()),
(uuid_generate_v4(), 'operations@sasarjan.com', 'Operations Manager', 'admin', ARRAY['read', 'write', 'manage_apps', 'manage_users'], 'active', NOW()),
(uuid_generate_v4(), 'support@sasarjan.com', 'Support Agent', 'moderator', ARRAY['read', 'write', 'manage_reviews'], 'active', NOW());

-- Sample notifications
INSERT INTO notifications (id, user_id, title, message, type, status, created_at) VALUES
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'vikram.malhotra@email.com'), 'Welcome to SaSarjan!', 'Thank you for joining our collective prosperity platform', 'welcome', 'unread', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'kavitha.nair@email.com'), 'New Growth Opportunity', 'A new business growth consultant has joined your network', 'opportunity', 'unread', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'arjun.patel@email.com'), 'Internship Match Found', 'We found 3 internship opportunities matching your profile', 'match', 'unread', NOW());

-- Sample analytics events
INSERT INTO analytics_events (id, user_id, app_id, event_type, event_data, created_at) VALUES
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'vikram.malhotra@email.com'), (SELECT id FROM apps WHERE slug = 'talentexcel'), 'app_open', '{"source": "home_screen", "duration": 300}', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'kavitha.nair@email.com'), (SELECT id FROM apps WHERE slug = '10xgrowth'), 'feature_use', '{"feature": "growth_audit", "completion": true}', NOW()),
(uuid_generate_v4(), (SELECT id FROM users WHERE email = 'arjun.patel@email.com'), (SELECT id FROM apps WHERE slug = 'talentexcel'), 'profile_update', '{"fields": ["skills", "experience"], "completion": 85}', NOW());

-- Profile System Seed Data
-- Load in correct order due to foreign key dependencies
\i seed/01-auth-users.sql
\i seed/02-sample-profiles.sql  
\i seed/03-bulk-profiles.sql
\i seed/04-sync-relationships.sql

-- Summary query to show what was loaded
SELECT 
  'PROFILE SEED DATA SUMMARY' as summary,
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE type = 'freelancer') as freelancers,
  COUNT(*) FILTER (WHERE type = 'volunteer') as volunteers,
  COUNT(*) FILTER (WHERE type = 'entrepreneur') as entrepreneurs,
  COUNT(*) FILTER (WHERE type = 'company') as companies
FROM profiles;

SELECT 'SYNC RELATIONSHIPS' as summary, COUNT(*) as total_sync_relationships FROM profile_sync_relationships;
SELECT 'SYNC LOGS' as summary, COUNT(*) as total_sync_logs FROM profile_sync_logs;

-- Show sample of the data
SELECT 
  'SAMPLE PROFILES' as info,
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
LIMIT 10;

-- Success message
SELECT 'SaSarjan App Store seed data has been successfully loaded!' as message;