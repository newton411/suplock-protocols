#!/bin/bash

echo "🚀 Deploying SUPLOCK Protocol..."

# Build and deploy frontend
echo "📦 Building frontend..."
cd frontend/suplock-dapp
npm install
npm run build

echo "✅ Frontend built successfully"

# Build backend
echo "📦 Building backend..."
cd ../../backend/suplock-api
npm install
npm run build

echo "✅ Backend built successfully"

echo "🎉 SUPLOCK Protocol ready for deployment!"
echo ""
echo "Frontend: Deploy the 'out' folder to Vercel/Netlify"
echo "Backend: Deploy to Vercel using vercel.json config"
echo ""
echo "Environment variables needed:"
echo "- CORS origins configured for production domains"
echo "- API endpoints updated in frontend"