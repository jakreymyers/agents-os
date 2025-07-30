#!/bin/bash
set -e

# Build script for DXT (Docker Extension Toolkit) packaging
# This script builds the Asana MCP server and packages it for distribution

echo "Building Asana MCP server for DXT..."

# Clean previous build
rm -rf dist

# Build TypeScript
npm run build

# Create version placeholder replacement
VERSION=$(node -p "require('./package.json').version")
sed "s/{{VERSION}}/$VERSION/g" manifest.json > dist/manifest.json

echo "Build complete! Version: $VERSION"