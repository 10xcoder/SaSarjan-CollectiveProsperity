#!/bin/bash

# Database Schema Verification Script
# Compares local and remote database schemas

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Database Schema Comparison Tool${NC}"
echo "===================================="

# Function to check if Supabase CLI is installed
check_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        echo -e "${RED}Error: Supabase CLI not found${NC}"
        echo "Please install: npm install -g supabase"
        exit 1
    fi
}

# Function to dump schema
dump_schema() {
    local env=$1
    local output_file=$2
    
    echo -e "${GREEN}Dumping $env schema...${NC}"
    
    if [ "$env" == "local" ]; then
        supabase db dump --schema-only > "$output_file" 2>/dev/null
    else
        supabase db dump --schema-only --linked > "$output_file" 2>/dev/null
    fi
    
    # Clean up the dump for better comparison
    # Remove comments and timestamps
    sed -i.bak \
        -e '/^--/d' \
        -e '/^$/d' \
        -e 's/COMMENT ON.*//' \
        -e 's/CREATE EXTENSION/-- CREATE EXTENSION/' \
        "$output_file"
    
    rm -f "$output_file.bak"
}

# Main execution
check_supabase_cli

# Parse arguments
if [ "$1" == "--help" ]; then
    echo "Usage: ./verify-database-schema.sh [project-ref]"
    echo ""
    echo "If project-ref is provided, compares local schema with that project"
    echo "Otherwise, compares with currently linked project"
    exit 0
fi

# Create temporary directory for schema dumps
TEMP_DIR=$(mktemp -d)
echo -e "${GREEN}Created temporary directory: $TEMP_DIR${NC}"

# Dump local schema
dump_schema "local" "$TEMP_DIR/local-schema.sql"

# Check if we need to link to a project
if [ ! -z "$1" ]; then
    echo -e "\n${GREEN}Linking to project: $1${NC}"
    supabase link --project-ref "$1" > /dev/null 2>&1
fi

# Dump remote schema
dump_schema "remote" "$TEMP_DIR/remote-schema.sql"

# Compare schemas
echo -e "\n${BLUE}Comparing schemas...${NC}"
echo "===================================="

# Use diff to compare
if diff -u "$TEMP_DIR/local-schema.sql" "$TEMP_DIR/remote-schema.sql" > "$TEMP_DIR/schema-diff.txt"; then
    echo -e "${GREEN}✅ Schemas are identical!${NC}"
    echo "Local and remote databases have the same schema."
else
    echo -e "${YELLOW}⚠️  Schema differences found:${NC}"
    echo ""
    
    # Show a summary of differences
    ADDITIONS=$(grep "^+" "$TEMP_DIR/schema-diff.txt" | grep -v "^+++" | wc -l)
    DELETIONS=$(grep "^-" "$TEMP_DIR/schema-diff.txt" | grep -v "^---" | wc -l)
    
    echo "Summary:"
    echo "- Lines in local but not in remote: $DELETIONS"
    echo "- Lines in remote but not in local: $ADDITIONS"
    echo ""
    
    # Save full diff report
    REPORT_FILE="schema-comparison-$(date +%Y%m%d-%H%M%S).txt"
    cp "$TEMP_DIR/schema-diff.txt" "$REPORT_FILE"
    
    echo -e "${YELLOW}Full comparison saved to: $REPORT_FILE${NC}"
    echo ""
    echo "To view differences:"
    echo "  cat $REPORT_FILE"
    echo ""
    echo "Key:"
    echo "  - Lines starting with '-' exist in local but not remote"
    echo "  - Lines starting with '+' exist in remote but not local"
fi

# Also run Supabase's built-in diff
echo -e "\n${BLUE}Running Supabase schema diff...${NC}"
echo "===================================="

if [ -z "$1" ]; then
    supabase db diff --schema public
else
    supabase db diff --schema public --linked
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo -e "\n${GREEN}Schema verification complete!${NC}"

# Provide recommendations
echo -e "\n${BLUE}Recommendations:${NC}"
if [ -f "$REPORT_FILE" ]; then
    echo "1. Review the differences in $REPORT_FILE"
    echo "2. If deploying to production, ensure all migrations are applied"
    echo "3. Run 'supabase db push' to sync schemas"
else
    echo "1. Your schemas are in sync"
    echo "2. Safe to proceed with deployment"
fi