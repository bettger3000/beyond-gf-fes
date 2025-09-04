#!/bin/bash

echo "🚀 Beyond GF Festival - Starting Server..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Starting server on port 4000..."
echo "📍 Access your site at: http://localhost:4000"
echo "📝 Admin panel at: http://localhost:4000/admin.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="

# Start the server
npm start