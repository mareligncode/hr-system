#!/bin/bash
set -e

echo "🚀 Starting HR System Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
npx wait-for-it db:5432 --timeout=60 --strict

# Run migrations
echo "📊 Running database migrations..."
npm run migrate

# Start the server
echo "🌟 Starting the application..."
exec npm start