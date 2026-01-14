#!/bin/bash

# FlashOrchestrator Frontend Deployment Script
# Domain: vibecode.rtesoftwares.com

echo "========================================="
echo "FlashOrchestrator Frontend Deployment"
echo "========================================="

# Check if running on server or local
if [ "$1" == "production" ]; then
    echo "Building for PRODUCTION..."
    npm run build:prod
    
    echo ""
    echo "Build complete! Files are in ./dist"
    echo ""
    echo "To serve the production build:"
    echo "  npm run start"
    echo ""
    echo "Or with PM2:"
    echo "  pm2 start npm --name 'vibecode-frontend' -- run start"
    
elif [ "$1" == "dev" ]; then
    echo "Starting DEVELOPMENT server..."
    npm run dev
    
else
    echo "Usage:"
    echo "  ./deploy.sh dev         - Start development server"
    echo "  ./deploy.sh production  - Build for production"
    echo ""
    echo "Example:"
    echo "  chmod +x deploy.sh"
    echo "  ./deploy.sh dev"
fi
