#!/bin/bash

# =============================================================================
# Agents OS Environment Setup
# =============================================================================
# This script sets up environment variables for MCP servers.
# After running this, you can start Claude Code with: claude
# =============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_LOCAL_FILE="$PROJECT_DIR/.env.local"
ENV_EXAMPLE_FILE="$PROJECT_DIR/.env.example"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Agents OS Environment Setup ===${NC}"

# Create .env.local from template if it doesn't exist
if [ ! -f "$ENV_LOCAL_FILE" ]; then
    echo -e "${YELLOW}Creating .env.local from template...${NC}"
    cp "$ENV_EXAMPLE_FILE" "$ENV_LOCAL_FILE"
    echo -e "${GREEN}✅ Created $ENV_LOCAL_FILE${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env.local and add your actual API keys, then run: source ./start.sh${NC}"
    exit 0
fi

# Check if API keys have been updated from template values
if grep -q "pat123.abc123_example_token_here" "$ENV_LOCAL_FILE"; then
    echo -e "${YELLOW}⚠️  Please edit .env.local and replace example values with your actual API keys${NC}"
    exit 0
fi

# Load and export environment variables
echo -e "${BLUE}Loading environment variables...${NC}"
set -a  # Automatically export all variables
source "$ENV_LOCAL_FILE"
set +a  # Stop auto-exporting

echo -e "${GREEN}✅ Environment variables loaded and exported${NC}"
echo -e "${BLUE}Now you can start Claude Code with:${NC} ${GREEN}claude${NC}"
echo -e "${YELLOW}Your Airtable and Asana MCP servers will be available via /mcp${NC}"