-- Profile Sync Relationships and Logs
-- This creates sample sync relationships between profiles

-- Insert sample sync relationships
INSERT INTO profile_sync_relationships (
  source_profile_id,
  target_profile_id,
  sync_config,
  created_at,
  updated_at
) VALUES 
  -- Primary demo user syncing to bulk profile
  (
    'freelancer-demo-1',
    'bulk-freelancer-1',
    '{"fields": ["name", "email", "phone", "location", "bio"], "direction": "one-way", "frequency": "realtime"}'::jsonb,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '1 hour'
  ),
  -- Multi-profile user syncing between freelancer and volunteer profiles
  (
    'freelancer-multi-1',
    'volunteer-multi-1',
    '{"fields": ["name", "email", "phone", "location"], "direction": "two-way", "frequency": "daily"}'::jsonb,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
  ),
  -- Cross-app sync example
  (
    'freelancer-demo-1',
    'bulk-freelancer-3',
    '{"fields": ["name", "email", "phone"], "direction": "one-way", "frequency": "manual"}'::jsonb,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT DO NOTHING;

-- Insert sample sync logs showing history of synchronization
INSERT INTO profile_sync_logs (
  source_profile_id,
  target_profile_ids,
  status,
  synced_at
) VALUES 
  -- Recent successful syncs
  (
    'freelancer-demo-1',
    ARRAY['bulk-freelancer-1'],
    'success',
    NOW() - INTERVAL '1 hour'
  ),
  (
    'freelancer-multi-1',
    ARRAY['volunteer-multi-1'],
    'success',
    NOW() - INTERVAL '1 day'
  ),
  (
    'freelancer-demo-1',
    ARRAY['bulk-freelancer-1', 'bulk-freelancer-3'],
    'success',
    NOW() - INTERVAL '2 hours'
  ),
  -- Historical syncs
  (
    'freelancer-demo-1',
    ARRAY['bulk-freelancer-1'],
    'success',
    NOW() - INTERVAL '1 day'
  ),
  (
    'freelancer-demo-1',
    ARRAY['bulk-freelancer-1'],
    'success',
    NOW() - INTERVAL '2 days'
  ),
  (
    'freelancer-multi-1',
    ARRAY['volunteer-multi-1'],
    'success',
    NOW() - INTERVAL '2 days'
  ),
  (
    'freelancer-multi-1',
    ARRAY['volunteer-multi-1'],
    'success',
    NOW() - INTERVAL '3 days'
  ),
  -- Example of a failed sync
  (
    'freelancer-demo-1',
    ARRAY['bulk-freelancer-3'],
    'failure',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT DO NOTHING;

-- Create some additional sync relationships for bulk profiles
DO $$
DECLARE
    i INTEGER;
    source_id TEXT;
    target_id TEXT;
BEGIN
    FOR i IN 1..5 LOOP
        source_id := 'bulk-freelancer-' || i;
        target_id := 'bulk-freelancer-' || (i + 10);
        
        -- Only create if both profiles exist
        IF EXISTS (SELECT 1 FROM profiles WHERE id = source_id) AND 
           EXISTS (SELECT 1 FROM profiles WHERE id = target_id) THEN
            
            INSERT INTO profile_sync_relationships (
                source_profile_id,
                target_profile_id,
                sync_config,
                created_at,
                updated_at
            ) VALUES (
                source_id,
                target_id,
                ('{"fields": ["location", "hourly_rate"], "direction": "one-way", "frequency": "' || 
                CASE WHEN i % 2 = 0 THEN 'daily' ELSE 'weekly' END || '"}')::jsonb,
                NOW() - (RANDOM() * INTERVAL '30 days'),
                NOW() - (RANDOM() * INTERVAL '7 days')
            ) ON CONFLICT DO NOTHING;
            
            -- Add corresponding sync log
            INSERT INTO profile_sync_logs (
                source_profile_id,
                target_profile_ids,
                status,
                synced_at
            ) VALUES (
                source_id,
                ARRAY[target_id],
                'success',
                NOW() - (RANDOM() * INTERVAL '24 hours')
            );
        END IF;
    END LOOP;
END $$;