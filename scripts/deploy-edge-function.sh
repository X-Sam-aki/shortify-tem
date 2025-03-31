#!/bin/bash

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first."
    echo "Visit: https://supabase.com/docs/reference/cli/introduction"
    exit 1
fi

# Check if environment variables are set
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo "SUPABASE_PROJECT_ID is not set. Please set it first."
    exit 1
fi

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "SUPABASE_ACCESS_TOKEN is not set. Please set it first."
    exit 1
fi

# Deploy the Edge Function
echo "Deploying extract-product Edge Function..."
supabase functions deploy extract-product \
    --project-ref $SUPABASE_PROJECT_ID \
    --no-verify-jwt

# Check deployment status
if [ $? -eq 0 ]; then
    echo "Edge Function deployed successfully!"
else
    echo "Failed to deploy Edge Function."
    exit 1
fi 