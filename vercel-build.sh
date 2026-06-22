#!/bin/bash
echo "🔨 Starting Vercel build..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean previous build
rm -rf dist
rm -rf node_modules/.vite

# Install dependencies
npm install

# Build
npm run build

# Verify build
if [ -d "dist" ]; then
  echo "✅ Build successful!"
  ls -la dist
else
  echo "❌ Build failed - dist directory not found"
  exit 1
fi
