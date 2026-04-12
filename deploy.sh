#!/bin/bash

# Agriflow Deployment Script for Firebase Hosting

echo "🚀 Deploying Agriflow to Firebase Hosting..."

# Navigate to project
cd agriflow-web

# Check if firebase is installed
if command -v firebase &> /dev/null; then
    echo "Using global firebase CLI"
    firebase deploy --only hosting
else
    echo "Firebase CLI not found. Please install it:"
    echo "  npm install -g firebase-tools"
    echo ""
    echo "Then run:"
    echo "  cd agriflow-web"
    echo "  firebase deploy --only hosting"
fi