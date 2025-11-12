#!/bin/bash

# Morphlex AI - Quick Start Script

set -e

echo "🚀 Morphlex AI - Starting..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm not found${NC}"
    echo "Please install pnpm: npm install -g pnpm"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    pnpm install
fi

# Check if .env files exist
if [ ! -f "packages/server/.env" ]; then
    echo -e "${YELLOW}⚙️  Creating server .env file...${NC}"
    cp packages/server/.env.example packages/server/.env
    echo -e "${RED}⚠️  Please edit packages/server/.env and add your GEMINI_API_KEY${NC}"
    echo ""
fi

if [ ! -f "packages/hands/.env" ]; then
    echo -e "${YELLOW}⚙️  Creating VS Code extension .env file...${NC}"
    cp packages/hands/.env.example packages/hands/.env
    echo -e "${RED}⚠️  Please edit packages/hands/.env and add your GEMINI_API_KEY${NC}"
    echo ""
fi

# Ask user which mode to start
echo -e "${BLUE}Select mode:${NC}"
echo "1) Preview Mode (Web UI + Server only)"
echo "2) Full Mode (Web UI + Server + VS Code extension)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo -e "${GREEN}🌐 Starting Preview Mode...${NC}"
        echo ""
        echo -e "${BLUE}Web UI will be available at: http://localhost:5173${NC}"
        echo -e "${BLUE}API Server will be available at: http://localhost:3001${NC}"
        echo ""
        pnpm dev:preview
        ;;
    2)
        echo -e "${GREEN}⚡ Starting Full Mode...${NC}"
        echo ""
        echo -e "${BLUE}Web UI: http://localhost:5173${NC}"
        echo -e "${BLUE}API Server: http://localhost:3001${NC}"
        echo -e "${BLUE}WebSocket: ws://localhost:3030${NC}"
        echo ""
        echo -e "${YELLOW}Remember to press F5 in VS Code to launch the extension!${NC}"
        echo ""
        pnpm dev:full
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac
