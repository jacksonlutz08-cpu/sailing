#!/bin/bash

# BlueHorizon Quick Start Script
# This script sets up the development environment and runs the app

set -e

echo "🚀 BlueHorizon Development Setup"
echo "=================================="

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating .env.local template..."
    cat > .env.local << 'EOF'
# Supabase (get from https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=11e033ec-0bbf-4d0b-a8d8-531bbc61a7c7

# External APIs (optional for now)
NEXT_PUBLIC_STORMGLASS_API_KEY=JF7yNw16veAvcvxaWIqj3Brrf67BFhudjGxTGbPz
NEXT_PUBLIC_EXCHANGERATE_API_KEY=your_api_key
NEXT_PUBLIC_NOAA_APPLICATION_ID=51222fca-27c3-11f1-beac-0242ac120004-51223088-27c3-11f1-beac-0242ac120004

# Server-side secrets (add in .env.local.examples for team)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOF
    echo "   → Created .env.local"
    echo "   → Add your Supabase keys to continue"
fi

# Offer to start dev server
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your Supabase keys to .env.local"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"
echo ""
echo "Or start now with mock data:"
echo "   npm run dev"
