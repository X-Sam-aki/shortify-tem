#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate proxy configuration
validate_proxy() {
    local host=$1
    local port=$2
    local username=$3
    local password=$4

    echo "Testing proxy: $host:$port"
    
    # Test proxy with curl
    if curl -x "http://$username:$password@$host:$port" \
        -o /dev/null \
        -s -w "%{http_code}" \
        https://www.temu.com \
        | grep -q "200"; then
        echo "✅ Proxy is working!"
        return 0
    else
        echo "❌ Proxy is not working"
        return 1
    fi
}

# Function to add a new proxy
add_proxy() {
    echo "Adding new proxy..."
    read -p "Enter proxy host: " host
    read -p "Enter proxy port: " port
    read -p "Enter proxy username (optional): " username
    read -p "Enter proxy password (optional): " password

    # Create proxy configuration
    local proxy_config="{\"host\":\"$host\",\"port\":$port"
    if [ ! -z "$username" ] && [ ! -z "$password" ]; then
        proxy_config="$proxy_config,\"username\":\"$username\",\"password\":\"$password\""
    fi
    proxy_config="$proxy_config}"

    # Read existing proxies
    local env_file=".env.local"
    local proxy_configs=$(grep "PROXY_CONFIGS=" "$env_file" | cut -d'=' -f2- | tr -d '"')
    
    # Add new proxy to the list
    if [ -z "$proxy_configs" ]; then
        proxy_configs="[$proxy_config]"
    else
        proxy_configs=$(echo "$proxy_configs" | sed "s/]/,$proxy_config]/")
    fi

    # Update .env.local file
    sed -i "s|PROXY_CONFIGS=.*|PROXY_CONFIGS=$proxy_configs|" "$env_file"
    
    echo "✅ Proxy added successfully!"
}

# Function to test all proxies
test_proxies() {
    echo "Testing all proxies..."
    
    # Read proxy configurations from .env.local
    local env_file=".env.local"
    local proxy_configs=$(grep "PROXY_CONFIGS=" "$env_file" | cut -d'=' -f2- | tr -d '"')
    
    # Parse and test each proxy
    echo "$proxy_configs" | jq -c '.[]' | while read -r proxy; do
        host=$(echo "$proxy" | jq -r '.host')
        port=$(echo "$proxy" | jq -r '.port')
        username=$(echo "$proxy" | jq -r '.username // empty')
        password=$(echo "$proxy" | jq -r '.password // empty')
        
        if [ ! -z "$username" ] && [ ! -z "$password" ]; then
            validate_proxy "$host" "$port" "$username" "$password"
        else
            validate_proxy "$host" "$port" "" ""
        fi
    done
}

# Function to remove a proxy
remove_proxy() {
    echo "Removing proxy..."
    read -p "Enter proxy host to remove: " host
    
    # Read existing proxies
    local env_file=".env.local"
    local proxy_configs=$(grep "PROXY_CONFIGS=" "$env_file" | cut -d'=' -f2- | tr -d '"')
    
    # Remove the specified proxy
    local new_configs=$(echo "$proxy_configs" | jq -c "[.[] | select(.host != \"$host\")]")
    
    # Update .env.local file
    sed -i "s|PROXY_CONFIGS=.*|PROXY_CONFIGS=$new_configs|" "$env_file"
    
    echo "✅ Proxy removed successfully!"
}

# Function to list all proxies
list_proxies() {
    echo "Current proxy configurations:"
    
    # Read proxy configurations from .env.local
    local env_file=".env.local"
    local proxy_configs=$(grep "PROXY_CONFIGS=" "$env_file" | cut -d'=' -f2- | tr -d '"')
    
    # Parse and display each proxy
    echo "$proxy_configs" | jq -c '.[]' | while read -r proxy; do
        echo "Host: $(echo "$proxy" | jq -r '.host')"
        echo "Port: $(echo "$proxy" | jq -r '.port')"
        if [ ! -z "$(echo "$proxy" | jq -r '.username // empty')" ]; then
            echo "Username: $(echo "$proxy" | jq -r '.username')"
            echo "Password: $(echo "$proxy" | jq -r '.password')"
        fi
        echo "---"
    done
}

# Main menu
while true; do
    echo -e "\n🔒 Proxy Management Menu"
    echo "1) Add new proxy"
    echo "2) Test all proxies"
    echo "3) Remove proxy"
    echo "4) List all proxies"
    echo "5) Exit"
    read -p "Select an option (1-5): " choice

    case $choice in
        1) add_proxy ;;
        2) test_proxies ;;
        3) remove_proxy ;;
        4) list_proxies ;;
        5) echo "👋 Goodbye!"; exit 0 ;;
        *) echo "❌ Invalid option. Please try again." ;;
    esac
done 