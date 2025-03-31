#!/bin/bash

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first."
    echo "Visit: https://supabase.com/docs/reference/cli/introduction"
    exit 1
fi

# Stop any existing Supabase instance
echo "Stopping any existing Supabase instance..."
supabase stop

# Start Supabase
echo "Starting Supabase..."
supabase start

# Wait for Supabase to be ready
echo "Waiting for Supabase to be ready..."
sleep 10

# Check if Supabase is running
if supabase status | grep -q "Running"; then
    echo "Supabase is running successfully!"
    echo "API URL: http://localhost:54321"
    echo "Studio URL: http://localhost:54323"
    echo "Database URL: postgresql://postgres:postgres@localhost:54322/postgres"
else
    echo "Failed to start Supabase. Please check the logs for more information."
    exit 1
fi 