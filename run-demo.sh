#!/bin/bash

echo "🚀 Mutual Fund Manager - Add Users to Portfolio Demo"
echo "=================================================="
echo ""

echo "📦 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🌐 Starting development server..."
    echo "📍 Navigate to: http://localhost:4200"
    echo ""
    echo "🔍 Demo Flow:"
    echo "1. Login as admin user"
    echo "2. Go to Portfolios page"
    echo "3. Click on any portfolio to view details"
    echo "4. Click 'Add User' to add a new investor"
    echo "5. Use the investor menu to withdraw users"
    echo ""
    echo "🎯 Features to test:"
    echo "- User search and selection"
    echo "- Investment amount validation"
    echo "- Fee impact preview"
    echo "- Withdrawal with percentage buttons"
    echo "- Responsive design on mobile"
    echo ""

    # Start the development server
    npm start
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
