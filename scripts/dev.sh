#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

# Check Docker
if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check Supabase CLI
if ! command_exists supabase; then
    echo "❌ Supabase CLI is not installed. Installing..."
    npm install -g supabase
fi

# Function to start Supabase
start_supabase() {
    echo "🚀 Starting Supabase..."
    supabase start
    echo "✅ Supabase is running!"
    echo "📊 API URL: http://localhost:54321"
    echo "🎨 Studio URL: http://localhost:54323"
    echo "💾 Database URL: postgresql://postgres:postgres@localhost:54322/postgres"
}

# Function to stop Supabase
stop_supabase() {
    echo "🛑 Stopping Supabase..."
    supabase stop
    echo "✅ Supabase stopped!"
}

# Function to reset Supabase
reset_supabase() {
    echo "🔄 Resetting Supabase..."
    supabase stop
    supabase start --reset
    echo "✅ Supabase reset complete!"
}

# Function to deploy Edge Function
deploy_edge_function() {
    echo "🚀 Deploying Edge Function..."
    supabase functions deploy extract-product
    echo "✅ Edge Function deployed!"
}

# Function to run database migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    supabase db push
    echo "✅ Migrations complete!"
}

# Main menu
while true; do
    echo -e "\n📱 Supabase Development Menu"
    echo "1) Start Supabase"
    echo "2) Stop Supabase"
    echo "3) Reset Supabase"
    echo "4) Deploy Edge Function"
    echo "5) Run Migrations"
    echo "6) Exit"
    read -p "Select an option (1-6): " choice

    case $choice in
        1) start_supabase ;;
        2) stop_supabase ;;
        3) reset_supabase ;;
        4) deploy_edge_function ;;
        5) run_migrations ;;
        6) echo "👋 Goodbye!"; exit 0 ;;
        *) echo "❌ Invalid option. Please try again." ;;
    esac
done 