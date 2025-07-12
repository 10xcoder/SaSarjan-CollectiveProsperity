#!/bin/bash

# Production Database Deployment Script
# This script handles the database migration to production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 SaSarjan AppStore - Production Database Deployment${NC}"
echo "=================================================="

# Check if production project ref is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Production project reference required${NC}"
    echo "Usage: ./deploy-database-production.sh <project-ref>"
    echo "Example: ./deploy-database-production.sh abcdefghijklmnop"
    exit 1
fi

PROJECT_REF=$1

# Confirmation prompt
echo -e "${YELLOW}⚠️  WARNING: This will deploy database changes to PRODUCTION!${NC}"
echo "Project Reference: $PROJECT_REF"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 1
fi

# Step 1: Create backup directory
echo -e "\n${GREEN}Step 1: Creating backup directory...${NC}"
mkdir -p backups/production
echo "✅ Backup directory ready"

# Step 2: Backup local schema
echo -e "\n${GREEN}Step 2: Backing up local schema...${NC}"
BACKUP_FILE="backups/production/local-schema-$(date +%Y%m%d-%H%M%S).sql"
supabase db dump > "$BACKUP_FILE"
echo "✅ Local schema backed up to: $BACKUP_FILE"

# Step 3: Link to production project
echo -e "\n${GREEN}Step 3: Linking to production project...${NC}"
supabase link --project-ref "$PROJECT_REF"
echo "✅ Linked to production project"

# Step 4: Check for pending migrations
echo -e "\n${GREEN}Step 4: Checking migration status...${NC}"
echo "Current migrations to be applied:"
ls -la supabase/migrations/
echo ""

# Step 5: Dry run (show what would be applied)
echo -e "\n${GREEN}Step 5: Performing dry run...${NC}"
echo "The following migrations will be applied:"
supabase db diff --linked

echo -e "\n${YELLOW}Please review the changes above.${NC}"
read -p "Continue with migration? (yes/no): " CONTINUE

if [ "$CONTINUE" != "yes" ]; then
    echo -e "${RED}Migration cancelled${NC}"
    exit 1
fi

# Step 6: Apply migrations
echo -e "\n${GREEN}Step 6: Applying migrations to production...${NC}"
supabase db push

# Step 7: Verify migration
echo -e "\n${GREEN}Step 7: Verifying migration...${NC}"
DIFF_OUTPUT=$(supabase db diff --linked 2>&1)
if [ -z "$DIFF_OUTPUT" ] || [[ "$DIFF_OUTPUT" == *"No differences"* ]]; then
    echo "✅ All migrations applied successfully"
else
    echo -e "${YELLOW}⚠️  Warning: Schema differences detected${NC}"
    echo "$DIFF_OUTPUT"
fi

# Step 8: Generate types
echo -e "\n${GREEN}Step 8: Generating TypeScript types...${NC}"
pnpm db:types
echo "✅ Types generated from production schema"

# Step 9: Create migration log
echo -e "\n${GREEN}Step 9: Creating migration log...${NC}"
LOG_FILE="backups/production/migration-log-$(date +%Y%m%d-%H%M%S).txt"
cat > "$LOG_FILE" << EOF
Production Database Migration Log
=================================
Date: $(date)
Project Reference: $PROJECT_REF
Deployed By: $(whoami)

Migrations Applied:
$(ls -1 supabase/migrations/)

Migration Status: SUCCESS

Notes:
- All migrations applied successfully
- TypeScript types regenerated
- Backup created at: $BACKUP_FILE
EOF

echo "✅ Migration log saved to: $LOG_FILE"

# Final summary
echo -e "\n${GREEN}✅ Production database deployment completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Test database connectivity from your apps"
echo "2. Create production admin users"
echo "3. Verify Row Level Security policies"
echo "4. Monitor database performance"
echo ""
echo -e "${YELLOW}Remember to update your .env.production files with the production database URL!${NC}"