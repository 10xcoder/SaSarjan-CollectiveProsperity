#!/bin/bash

# Interactive Production Admin Setup Script
# This script helps create admin users with secure passwords

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}👤 Production Admin User Setup${NC}"
echo "=============================="

# Function to generate secure password
generate_password() {
    # Generate a secure 16-character password
    openssl rand -base64 16 | tr -d "=/" | cut -c1-16
}

# Function to validate email
validate_email() {
    local email=$1
    if [[ ! "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        echo -e "${RED}Invalid email format${NC}"
        return 1
    fi
    return 0
}

# Collect admin information
echo -e "\n${GREEN}Step 1: Admin User Information${NC}"
echo "------------------------------"

# Get email
while true; do
    read -p "Admin Email: " ADMIN_EMAIL
    if validate_email "$ADMIN_EMAIL"; then
        break
    fi
done

# Get name
read -p "Admin Name: " ADMIN_NAME
if [ -z "$ADMIN_NAME" ]; then
    ADMIN_NAME="Admin User"
fi

# Password options
echo -e "\n${GREEN}Step 2: Password Setup${NC}"
echo "---------------------"
echo "1. Generate secure password (recommended)"
echo "2. Enter custom password"
read -p "Choose option (1 or 2): " PASS_OPTION

if [ "$PASS_OPTION" == "1" ]; then
    ADMIN_PASSWORD=$(generate_password)
    echo -e "\n${YELLOW}Generated Password: $ADMIN_PASSWORD${NC}"
    echo -e "${RED}⚠️  SAVE THIS PASSWORD NOW! It won't be shown again.${NC}"
else
    while true; do
        read -s -p "Enter password (min 8 chars): " ADMIN_PASSWORD
        echo
        if [ ${#ADMIN_PASSWORD} -lt 8 ]; then
            echo -e "${RED}Password must be at least 8 characters${NC}"
            continue
        fi
        read -s -p "Confirm password: " CONFIRM_PASSWORD
        echo
        if [ "$ADMIN_PASSWORD" == "$CONFIRM_PASSWORD" ]; then
            break
        else
            echo -e "${RED}Passwords don't match${NC}"
        fi
    done
fi

# Generate SQL file
echo -e "\n${GREEN}Step 3: Generating SQL script...${NC}"

SQL_FILE="create-admin-$(date +%Y%m%d-%H%M%S).sql"

cat > "$SQL_FILE" << EOF
-- Production Admin User Creation
-- Generated: $(date)
-- Email: $ADMIN_EMAIL

DO \$\$
DECLARE
    admin_email TEXT := '$ADMIN_EMAIL';
    admin_password TEXT := '$ADMIN_PASSWORD';
    admin_name TEXT := '$ADMIN_NAME';
    user_id UUID;
BEGIN
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        RAISE EXCEPTION 'User with email % already exists', admin_email;
    END IF;

    -- Create auth user
    user_id := gen_random_uuid();
    
    -- Insert into auth.users
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

    RAISE NOTICE 'Admin user created successfully';
    RAISE NOTICE 'ID: %', user_id;
    RAISE NOTICE 'Email: %', admin_email;
    RAISE NOTICE 'Name: %', admin_name;
END \$\$;

-- Verify the admin was created
SELECT 
    au.id,
    au.email,
    au.role,
    u.name,
    au.created_at
FROM admin_users au
JOIN users u ON au.id = u.id
WHERE au.email = '$ADMIN_EMAIL';
EOF

echo -e "${GREEN}✅ SQL script generated: $SQL_FILE${NC}"

# Create credentials file
CREDS_FILE="admin-credentials-$(date +%Y%m%d-%H%M%S).txt"

cat > "$CREDS_FILE" << EOF
SaSarjan AppStore - Admin Credentials
=====================================
Generated: $(date)

Admin Email: $ADMIN_EMAIL
Admin Name: $ADMIN_NAME
Password: $ADMIN_PASSWORD

Admin Panel URL: https://admin.sasarjan.com

IMPORTANT:
- Store these credentials securely
- Delete this file after saving credentials
- Enable 2FA as soon as possible
- Change password on first login
EOF

# Set restrictive permissions
chmod 600 "$CREDS_FILE"

echo -e "\n${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Copy the SQL from $SQL_FILE"
echo "2. Go to your Supabase dashboard"
echo "3. Navigate to SQL Editor"
echo "4. Paste and run the SQL"
echo "5. Save credentials from $CREDS_FILE"
echo "6. Delete both files after use"
echo ""
echo -e "${YELLOW}Files created:${NC}"
echo "- SQL Script: $SQL_FILE"
echo "- Credentials: $CREDS_FILE"
echo ""
echo -e "${RED}⚠️  Security Reminder:${NC}"
echo "Delete these files after creating the admin user!"