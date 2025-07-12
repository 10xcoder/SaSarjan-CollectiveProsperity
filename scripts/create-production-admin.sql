-- Production Admin User Creation Script
-- Run this in your production Supabase SQL editor

-- ================================================
-- IMPORTANT: Update these values before running!
-- ================================================
-- Replace with your actual admin email and secure password
DO $$
DECLARE
    admin_email TEXT := 'admin@sasarjan.com';  -- CHANGE THIS
    admin_password TEXT := 'your-secure-password-here';  -- CHANGE THIS
    admin_name TEXT := 'Admin User';  -- CHANGE THIS
    user_id UUID;
BEGIN
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        RAISE NOTICE 'User with email % already exists', admin_email;
        RETURN;
    END IF;

    -- Create auth user
    user_id := gen_random_uuid();
    
    -- Insert into auth.users (Supabase auth)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        user_id,
        'authenticated',
        'authenticated',
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );

    -- Create user profile
    INSERT INTO public.users (
        id,
        email,
        name,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        admin_email,
        admin_name,
        NOW(),
        NOW()
    );

    -- Create admin user entry
    INSERT INTO public.admin_users (
        id,
        email,
        role,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        admin_email,
        'admin',
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Admin user created successfully with ID: %', user_id;
    RAISE NOTICE 'Email: %', admin_email;
    RAISE NOTICE 'Please login with the provided credentials';
END $$;

-- ================================================
-- Additional Admin Users (Optional)
-- ================================================
-- Uncomment and modify to create additional admin users

/*
DO $$
DECLARE
    admin_email TEXT := 'team@sasarjan.com';  -- CHANGE THIS
    admin_password TEXT := 'another-secure-password';  -- CHANGE THIS
    admin_name TEXT := 'Team Admin';  -- CHANGE THIS
    user_id UUID;
BEGIN
    -- Same logic as above...
END $$;
*/

-- ================================================
-- Verify Admin Users
-- ================================================
-- Check all admin users
SELECT 
    au.id,
    au.email,
    au.role,
    u.name,
    au.created_at
FROM admin_users au
JOIN users u ON au.id = u.id
ORDER BY au.created_at DESC;

-- ================================================
-- Security Reminders
-- ================================================
-- 1. Use strong, unique passwords
-- 2. Enable 2FA when available
-- 3. Regularly rotate admin passwords
-- 4. Limit admin access to necessary personnel only
-- 5. Monitor admin activity logs