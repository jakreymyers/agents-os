#!/bin/bash

# Build script for Slack MCP Server
# Usage: ./build-dxt.sh

set -e

echo "🚀 Building Slack MCP Server..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the slack-mcp-server directory?"
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
npm run clean || rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Verify build
if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: Build failed. dist/index.js not found."
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Built files are in the 'dist' directory"
echo ""
echo "🔧 To run the server:"
echo "   npm start"
echo ""
echo "🐳 To build Docker image:"
echo "   docker build -t slack-mcp-server ."
echo ""
echo "📚 For configuration help, see README.md"