#!/bin/bash

set -e  # Stop immediately if anything fails

echo ""
echo "🔹 Checking frontend (Next.js)..."

cd frontend

echo "▶️ Running npm run lint..."
npm run lint

echo "▶️ Running prettier format check..."
npx prettier --check .

echo "▶️ Running full Next.js build..."
npm run build

cd ..
