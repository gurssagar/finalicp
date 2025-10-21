#!/bin/bash

# Start.sh - Complete ICP Application Startup Script
# This script starts the backend canisters, updates environment variables, and starts the frontend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
DFX_NETWORK="pocket-ic"
DFX_PORT="40713"
FRONTEND_PORT="3002"
CHAT_SERVER_PORT="4000"

# PID files
DFX_PID_FILE="$SCRIPT_DIR/.dfx.pid"
FRONTEND_PID_FILE="$SCRIPT_DIR/.frontend.pid"
CHAT_PID_FILE="$SCRIPT_DIR/.chat.pid"

# Log files
LOG_DIR="$SCRIPT_DIR/logs"
MAIN_LOG="$LOG_DIR/startup.log"

# Logging function
log_status() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac

    echo "[$timestamp] [$level] $message" >> "$MAIN_LOG"
}

# Check if a port is in use
is_port_in_use() {
    local port=$1
    # Try multiple methods to check port usage
    if command -v ss >/dev/null 2>&1; then
        if ss -tlnp | grep -q ":$port "; then
            return 0
        fi
    elif command -v lsof >/dev/null 2>&1; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            return 0
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            return 0
        fi
    fi
    return 1
}

# Wait for a service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    log_status "INFO" "Waiting for $service_name to be ready on port $port..."

    while [ $attempt -le $max_attempts ]; do
        if is_port_in_use $port; then
            log_status "SUCCESS" "$service_name is ready on port $port"
            return 0
        fi

        sleep 2
        attempt=$((attempt + 1))
    done

    log_status "ERROR" "$service_name failed to start on port $port after $max_attempts attempts"
    return 1
}

# Check if required tools are installed
check_dependencies() {
    log_status "INFO" "Checking dependencies..."

    if ! command -v dfx &> /dev/null; then
        log_status "ERROR" "dfx is not installed or not in PATH"
        exit 1
    fi

    if ! command -v node &> /dev/null; then
        log_status "ERROR" "node is not installed or not in PATH"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        log_status "ERROR" "npm is not installed or not in PATH"
        exit 1
    fi

    log_status "SUCCESS" "All dependencies are available"
}

# Create necessary directories
create_directories() {
    mkdir -p "$LOG_DIR"
    mkdir -p "$FRONTEND_DIR/logs"

    log_status "INFO" "Created necessary directories"
}

# Cleanup function for graceful shutdown
cleanup_on_exit() {
    log_status "INFO" "Cleaning up on exit..."

    # Stop frontend if running
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 $pid 2>/dev/null; then
            log_status "INFO" "Stopping frontend (PID: $pid)"
            kill $pid
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi

    # Stop chat server if running
    if [ -f "$CHAT_PID_FILE" ]; then
        local pid=$(cat "$CHAT_PID_FILE")
        if kill -0 $pid 2>/dev/null; then
            log_status "INFO" "Stopping chat server (PID: $pid)"
            kill $pid
        fi
        rm -f "$CHAT_PID_FILE"
    fi

    log_status "INFO" "Cleanup completed"
}

# Set up signal handlers
trap cleanup_on_exit SIGINT SIGTERM

# Export functions for use in other functions
export -f log_status
export -f is_port_in_use
export -f wait_for_service

# Canister Management Functions
start_dfx() {
    log_status "INFO" "Starting dfx on network: $DFX_NETWORK (port: $DFX_PORT)"

    # Check if dfx is already running on the required port
    if is_port_in_use $DFX_PORT; then
        log_status "INFO" "dfx is already running on port $DFX_PORT"
        return 0
    fi

    cd "$BACKEND_DIR"

    # Start dfx with pocket-ic
    if ! dfx start --host 127.0.0.1:$DFX_PORT --background --clean > "$LOG_DIR/dfx-start.log" 2>&1; then
        log_status "ERROR" "Failed to start dfx"
        return 1
    fi

    # Wait for dfx to be ready
    if ! wait_for_service $DFX_PORT "dfx"; then
        log_status "ERROR" "dfx failed to start on port $DFX_PORT"
        return 1
    fi

    log_status "SUCCESS" "dfx started successfully on port $DFX_PORT"
    return 0
}

stop_dfx() {
    log_status "INFO" "Stopping dfx..."

    cd "$BACKEND_DIR"

    if dfx stop > "$LOG_DIR/dfx-stop.log" 2>&1; then
        log_status "SUCCESS" "dfx stopped successfully"
    else
        log_status "WARNING" "dfx was not running or failed to stop gracefully"
    fi
}

deploy_canisters() {
    log_status "INFO" "Deploying canisters..."

    cd "$BACKEND_DIR"

    # Set the network
    export DFX_NETWORK=$DFX_NETWORK
    export POCKET_IC_URL=http://localhost:$DFX_PORT

    # Deploy canisters
    if ! dfx deploy --network $DFX_NETWORK > "$LOG_DIR/deploy.log" 2>&1; then
        log_status "ERROR" "Failed to deploy canisters"
        log_status "ERROR" "Check logs at: $LOG_DIR/deploy.log"
        return 1
    fi

    log_status "SUCCESS" "Canisters deployed successfully"
    return 0
}

get_canister_ids() {
    log_status "INFO" "Extracting canister IDs..."

    cd "$BACKEND_DIR"
    export DFX_NETWORK=$DFX_NETWORK
    export POCKET_IC_URL=http://localhost:$DFX_PORT

    # Method 1: Try dfx canister list first
    log_status "INFO" "Attempting to extract canister IDs from dfx canister list..."
    local canisters_output=$(dfx canister list --network $DFX_NETWORK 2>/dev/null)

    if [ $? -eq 0 ] && [ -n "$canisters_output" ]; then
        log_status "INFO" "Parsing dfx canister list output..."

        # Extract canister IDs - handle different output formats
        BASIC_BACKEND_CANISTER_ID=$(echo "$canisters_output" | grep -E "basic_backend.*[a-z0-9-]{27}" | grep -oE "[a-z0-9-]{27}" | head -1)
        USER_CANISTER_ID=$(echo "$canisters_output" | grep -E "user[^_].*[a-z0-9-]{27}" | grep -oE "[a-z0-9-]{27}" | head -1)
        USER_V2_CANISTER_ID=$(echo "$canisters_output" | grep -E "user_v2.*[a-z0-9-]{27}" | grep -oE "[a-z0-9-]{27}" | head -1)
        HACKATHON_CANISTER_ID=$(echo "$canisters_output" | grep -E "hackathon.*[a-z0-9-]{27}" | grep -oE "[a-z0-9-]{27}" | head -1)
        MARKETPLACE_CANISTER_ID=$(echo "$canisters_output" | grep -E "marketplace.*[a-z0-9-]{27}" | grep -oE "[a-z0-9-]{27}" | head -1)
        CHAT_STORAGE_CANISTER_ID=$(echo "$canisters_output" | grep -E "chat_storage.*[a-z0-9-]{27}" | grep -oE "[a-z0-9-]{27}" | head -1)

        # If we got all canister IDs, skip fallback methods
        if [ -n "$BASIC_BACKEND_CANISTER_ID" ] && [ -n "$USER_CANISTER_ID" ] && [ -n "$USER_V2_CANISTER_ID" ] && [ -n "$HACKATHON_CANISTER_ID" ] && [ -n "$MARKETPLACE_CANISTER_ID" ] && [ -n "$CHAT_STORAGE_CANISTER_ID" ]; then
            log_status "SUCCESS" "Extracted all canister IDs from dfx canister list"
            display_canister_ids
            return 0
        fi
    fi

    # Method 2: Fallback to parsing deploy log
    log_status "INFO" "Falling back to parsing deploy log..."
    if [ -f "$LOG_DIR/deploy.log" ]; then
        parse_deploy_log_for_canister_ids
        if [ $? -eq 0 ]; then
            return 0
        fi
    fi

    # Method 3: Try dfx canister info for each canister individually
    log_status "INFO" "Attempting individual canister lookups..."
    extract_canister_ids_individually

    # Final validation
    if [ -z "$BASIC_BACKEND_CANISTER_ID" ] || [ -z "$USER_CANISTER_ID" ] || [ -z "$USER_V2_CANISTER_ID" ] || [ -z "$HACKATHON_CANISTER_ID" ] || [ -z "$MARKETPLACE_CANISTER_ID" ] || [ -z "$CHAT_STORAGE_CANISTER_ID" ]; then
        log_status "ERROR" "Failed to extract all required canister IDs using all available methods"
        log_status "ERROR" "Please check the deploy log and ensure canisters were deployed successfully"
        return 1
    fi

    log_status "SUCCESS" "Extracted all canister IDs using fallback methods"
    display_canister_ids
    return 0
}

parse_deploy_log_for_canister_ids() {
    local deploy_log="$LOG_DIR/deploy.log"

    if [ ! -f "$deploy_log" ]; then
        log_status "WARNING" "Deploy log not found at $deploy_log"
        return 1
    fi

    log_status "INFO" "Parsing deploy log for canister IDs..."

    # Extract canister IDs from deploy log using regex patterns
    BASIC_BACKEND_CANISTER_ID=$(grep -E "basic_backend.*canister id: [a-z0-9-]{27}" "$deploy_log" | grep -oE "[a-z0-9-]{27}" | head -1)
    CHAT_STORAGE_CANISTER_ID=$(grep -E "chat_storage.*canister id: [a-z0-9-]{27}" "$deploy_log" | grep -oE "[a-z0-9-]{27}" | head -1)
    HACKATHON_CANISTER_ID=$(grep -E "hackathon.*canister id: [a-z0-9-]{27}" "$deploy_log" | grep -oE "[a-z0-9-]{27}" | head -1)
    MARKETPLACE_CANISTER_ID=$(grep -E "marketplace.*canister id: [a-z0-9-]{27}" "$deploy_log" | grep -oE "[a-z0-9-]{27}" | head -1)
    USER_CANISTER_ID=$(grep -E "user.*canister id: [a-z0-9-]{27}" "$deploy_log" | grep -oE "[a-z0-9-]{27}" | head -1)
    USER_V2_CANISTER_ID=$(grep -E "user_v2.*canister id: [a-z0-9-]{27}" "$deploy_log" | grep -oE "[a-z0-9-]{27}" | head -1)

    # Validate we got all required canister IDs
    if [ -n "$BASIC_BACKEND_CANISTER_ID" ] && [ -n "$USER_CANISTER_ID" ] && [ -n "$USER_V2_CANISTER_ID" ] && [ -n "$HACKATHON_CANISTER_ID" ] && [ -n "$MARKETPLACE_CANISTER_ID" ] && [ -n "$CHAT_STORAGE_CANISTER_ID" ]; then
        log_status "SUCCESS" "Extracted all canister IDs from deploy log"
        display_canister_ids
        return 0
    fi

    log_status "WARNING" "Could not extract all canister IDs from deploy log"
    return 1
}

extract_canister_ids_individually() {
    local canisters=("basic_backend" "user" "user_v2" "hackathon" "marketplace" "chat_storage")

    for canister in "${canisters[@]}"; do
        log_status "INFO" "Looking up canister ID for $canister..."
        local canister_id=$(dfx canister id $canister --network $DFX_NETWORK 2>/dev/null)
        if [ $? -eq 0 ] && [ -n "$canister_id" ]; then
            case $canister in
                "basic_backend")
                    BASIC_BACKEND_CANISTER_ID="$canister_id"
                    ;;
                "user")
                    USER_CANISTER_ID="$canister_id"
                    ;;
                "user_v2")
                    USER_V2_CANISTER_ID="$canister_id"
                    ;;
                "hackathon")
                    HACKATHON_CANISTER_ID="$canister_id"
                    ;;
                "marketplace")
                    MARKETPLACE_CANISTER_ID="$canister_id"
                    ;;
                "chat_storage")
                    CHAT_STORAGE_CANISTER_ID="$canister_id"
                    ;;
            esac
            log_status "INFO" "Found $canister: $canister_id"
        else
            log_status "WARNING" "Could not find canister ID for $canister"
        fi
    done
}

display_canister_ids() {
    log_status "INFO" "Canister IDs extracted:"
    log_status "INFO" "Basic Backend: $BASIC_BACKEND_CANISTER_ID"
    log_status "INFO" "User: $USER_CANISTER_ID"
    log_status "INFO" "User V2: $USER_V2_CANISTER_ID"
    log_status "INFO" "Hackathon: $HACKATHON_CANISTER_ID"
    log_status "INFO" "Marketplace: $MARKETPLACE_CANISTER_ID"
    log_status "INFO" "Chat Storage: $CHAT_STORAGE_CANISTER_ID"
}

# Environment Variable Management
update_frontend_env() {
    log_status "INFO" "Updating frontend environment variables..."

    local env_file="$FRONTEND_DIR/.env.local"
    local temp_env_file="$FRONTEND_DIR/.env.local.tmp"

    # Backup the original file
    if [ -f "$env_file" ]; then
        cp "$env_file" "$env_file.backup.$(date +%s)"
        log_status "INFO" "Backed up original .env.local file"
    fi

    # Read the existing file and update canister ID variables
    if [ -f "$env_file" ]; then
        # Create new env file with updated canister IDs
        while IFS= read -r line; do
            case "$line" in
                "NEXT_PUBLIC_BASIC_BACKEND_CANISTER_ID="*)
                    echo "NEXT_PUBLIC_BASIC_BACKEND_CANISTER_ID=$BASIC_BACKEND_CANISTER_ID"
                    ;;
                "NEXT_PUBLIC_USER_CANISTER_ID="*)
                    echo "NEXT_PUBLIC_USER_CANISTER_ID=$USER_CANISTER_ID"
                    ;;
                "NEXT_PUBLIC_USER_V2_CANISTER_ID="*)
                    echo "NEXT_PUBLIC_USER_V2_CANISTER_ID=$USER_V2_CANISTER_ID"
                    ;;
                "NEXT_PUBLIC_HACKATHON_CANISTER_ID="*)
                    echo "NEXT_PUBLIC_HACKATHON_CANISTER_ID=$HACKATHON_CANISTER_ID"
                    ;;
                "NEXT_PUBLIC_MARKETPLACE_CANISTER_ID="*)
                    echo "NEXT_PUBLIC_MARKETPLACE_CANISTER_ID=$MARKETPLACE_CANISTER_ID"
                    ;;
                "NEXT_PUBLIC_CHAT_STORAGE_CANISTER_ID="*)
                    echo "NEXT_PUBLIC_CHAT_STORAGE_CANISTER_ID=$CHAT_STORAGE_CANISTER_ID"
                    ;;
                "MARKETPLACE_CANISTER_ID="*)
                    echo "MARKETPLACE_CANISTER_ID=$MARKETPLACE_CANISTER_ID"
                    ;;
                "NEXT_PUBLIC_IC_HOST="*)
                    echo "NEXT_PUBLIC_IC_HOST=http://localhost:$DFX_PORT"
                    ;;
                "IC_HOST="*)
                    echo "IC_HOST=http://localhost:$DFX_PORT"
                    ;;
                *)
                    echo "$line"
                    ;;
            esac
        done < "$env_file" > "$temp_env_file"
    else
        # Create new env file if it doesn't exist
        cat > "$temp_env_file" << EOF
# ICP Configuration
NEXT_PUBLIC_IC_HOST=http://localhost:$DFX_PORT
IC_HOST=http://localhost:$DFX_PORT

# Canister IDs
NEXT_PUBLIC_BASIC_BACKEND_CANISTER_ID=$BASIC_BACKEND_CANISTER_ID
NEXT_PUBLIC_USER_CANISTER_ID=$USER_CANISTER_ID
NEXT_PUBLIC_USER_V2_CANISTER_ID=$USER_V2_CANISTER_ID
NEXT_PUBLIC_HACKATHON_CANISTER_ID=$HACKATHON_CANISTER_ID
NEXT_PUBLIC_MARKETPLACE_CANISTER_ID=$MARKETPLACE_CANISTER_ID
NEXT_PUBLIC_CHAT_STORAGE_CANISTER_ID=$CHAT_STORAGE_CANISTER_ID
MARKETPLACE_CANISTER_ID=$MARKETPLACE_CANISTER_ID

# Application Configuration (keep existing values if available)
PORT=$FRONTEND_PORT
NEXT_PUBLIC_APP_URL=http://localhost:$FRONTEND_PORT
NEXT_PUBLIC_API_URL=http://localhost:$FRONTEND_PORT/api
NEXTAUTH_URL=http://localhost:$FRONTEND_PORT

# Add other environment variables as needed
EOF
    fi

    # Replace the original file with the updated one
    mv "$temp_env_file" "$env_file"

    log_status "SUCCESS" "Updated frontend environment variables with new canister IDs"
}

# Service Management Functions
start_chat_server() {
    log_status "INFO" "Starting Socket.IO chat server..."

    # Check if chat server is already running
    if is_port_in_use $CHAT_SERVER_PORT; then
        log_status "INFO" "Chat server is already running on port $CHAT_SERVER_PORT"
        return 0
    fi

    cd "$FRONTEND_DIR"

    # Start chat server in background
    nohup node lib/socket-server.js > "$LOG_DIR/chat-server.log" 2>&1 &
    local chat_pid=$!
    echo $chat_pid > "$CHAT_PID_FILE"

    log_status "INFO" "Chat server started with PID: $chat_pid"

    # Wait for chat server to be ready
    if ! wait_for_service $CHAT_SERVER_PORT "Chat server"; then
        log_status "ERROR" "Chat server failed to start on port $CHAT_SERVER_PORT"
        return 1
    fi

    log_status "SUCCESS" "Chat server started successfully on port $CHAT_SERVER_PORT"
    return 0
}

stop_chat_server() {
    log_status "INFO" "Stopping chat server..."

    if [ -f "$CHAT_PID_FILE" ]; then
        local pid=$(cat "$CHAT_PID_FILE")
        if kill -0 $pid 2>/dev/null; then
            log_status "INFO" "Stopping chat server (PID: $pid)"
            kill $pid
            sleep 2

            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                log_status "WARNING" "Force killing chat server"
                kill -9 $pid
            fi
        fi
        rm -f "$CHAT_PID_FILE"
    fi

    # Kill any remaining chat server processes
    pkill -f "node lib/socket-server.js" 2>/dev/null || true

    log_status "SUCCESS" "Chat server stopped"
}

start_frontend() {
    log_status "INFO" "Starting Next.js frontend..."

    # Check if frontend is already running on any port
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 $pid 2>/dev/null; then
            log_status "INFO" "Frontend is already running with PID: $pid"
            return 0
        fi
    fi

    cd "$FRONTEND_DIR"

    # Install dependencies if needed
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        log_status "INFO" "Installing frontend dependencies..."
        npm install > "$LOG_DIR/npm-install.log" 2>&1
        if [ $? -ne 0 ]; then
            log_status "ERROR" "Failed to install frontend dependencies"
            return 1
        fi
    fi

    # Start frontend in background
    nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
    local frontend_pid=$!
    echo $frontend_pid > "$FRONTEND_PID_FILE"

    log_status "INFO" "Frontend started with PID: $frontend_pid"

    # Wait for frontend to be ready and extract the actual port
    log_status "INFO" "Waiting for frontend to be ready..."
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        # Check if process is still running
        if ! kill -0 $frontend_pid 2>/dev/null; then
            log_status "ERROR" "Frontend process died during startup"
            return 1
        fi

        # Try to extract the port from the log file
        if [ -f "$LOG_DIR/frontend.log" ]; then
            local actual_port=$(grep -o "Local:.*http://localhost:\([0-9]\+\)" "$LOG_DIR/frontend.log" | grep -o "[0-9]\+" | head -1)

            if [ -n "$actual_port" ] && is_port_in_use $actual_port; then
                log_status "SUCCESS" "Frontend started successfully on port $actual_port"
                echo $actual_port > "$FRONTEND_DIR/.frontend.port"

                # Update FRONTEND_PORT variable for this session
                FRONTEND_PORT=$actual_port

                return 0
            fi
        fi

        sleep 2
        attempt=$((attempt + 1))
    done

    log_status "ERROR" "Frontend failed to start within $max_attempts attempts"
    return 1
}

stop_frontend() {
    log_status "INFO" "Stopping frontend..."

    if [ -f "$FRONTEND_PID_FILE" ]; then
        local pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 $pid 2>/dev/null; then
            log_status "INFO" "Stopping frontend (PID: $pid)"
            kill $pid
            sleep 2

            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                log_status "WARNING" "Force killing frontend"
                kill -9 $pid
            fi
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi

    # Kill any remaining Next.js processes
    pkill -f "next dev" 2>/dev/null || true

    log_status "SUCCESS" "Frontend stopped"
}

# Main startup sequence
start_all() {
    log_status "INFO" "Starting complete application stack..."

    # Check dependencies
    check_dependencies

    # Create directories
    create_directories

    # Check port availability
    if is_port_in_use $DFX_PORT; then
        log_status "WARNING" "Port $DFX_PORT is already in use. dfx might be running."
    fi

    if is_port_in_use $FRONTEND_PORT; then
        log_status "WARNING" "Port $FRONTEND_PORT is already in use. Frontend might be running."
    fi

    if is_port_in_use $CHAT_SERVER_PORT; then
        log_status "WARNING" "Port $CHAT_SERVER_PORT is already in use. Chat server might be running."
    fi

    # Start dfx and deploy canisters
    if ! start_dfx; then
        log_status "ERROR" "Failed to start dfx"
        return 1
    fi

    if ! deploy_canisters; then
        log_status "ERROR" "Failed to deploy canisters"
        return 1
    fi

    # Get canister IDs
    if ! get_canister_ids; then
        log_status "ERROR" "Failed to get canister IDs"
        return 1
    fi

    # Update frontend environment
    update_frontend_env

    # Start chat server
    if ! start_chat_server; then
        log_status "ERROR" "Failed to start chat server"
        return 1
    fi

    # Start frontend
    if ! start_frontend; then
        log_status "ERROR" "Failed to start frontend"
        return 1
    fi

    log_status "SUCCESS" "All services started successfully!"
    echo ""
    echo "🎉 Application is ready!"

    # Show actual frontend port
    local actual_frontend_port=$FRONTEND_PORT
    if [ -f "$FRONTEND_DIR/.frontend.port" ]; then
        actual_frontend_port=$(cat "$FRONTEND_DIR/.frontend.port")
    fi

    echo "📊 Frontend: http://localhost:$actual_frontend_port"
    echo "💬 Chat Server: http://localhost:$CHAT_SERVER_PORT"
    echo "🔗 ICP Replica: http://localhost:$DFX_PORT"
    echo "📝 Logs: $LOG_DIR/"
    echo ""
}

# Stop all services
stop_all() {
    log_status "INFO" "Stopping all services..."

    stop_frontend
    stop_chat_server
    stop_dfx

    # Clean up PID files
    rm -f "$FRONTEND_PID_FILE" "$CHAT_PID_FILE" "$DFX_PID_FILE"

    log_status "SUCCESS" "All services stopped"
}

# Status check function
show_status() {
    echo "🔍 Service Status Check"
    echo "====================="
    echo ""

    # Check dfx
    if is_port_in_use $DFX_PORT; then
        echo "✅ ICP Replica (dfx): Running on port $DFX_PORT"

        # Try to get canister status
        cd "$BACKEND_DIR"
        export DFX_NETWORK=$DFX_NETWORK
        export POCKET_IC_URL=http://localhost:$DFX_PORT

        if dfx canister list --network $DFX_NETWORK >/dev/null 2>&1; then
            local canister_count=$(dfx canister list --network $DFX_NETWORK | wc -l)
            echo "   📦 Canisters: $canister_count deployed"
        else
            echo "   ⚠️  Canisters: Unable to retrieve status"
        fi
    else
        echo "❌ ICP Replica (dfx): Not running"
    fi

    # Check chat server
    if is_port_in_use $CHAT_SERVER_PORT; then
        echo "✅ Chat Server: Running on port $CHAT_SERVER_PORT"
    else
        echo "❌ Chat Server: Not running"
    fi

    # Check frontend
    local frontend_running=false
    local frontend_port=""

    # Check the expected port first
    if is_port_in_use $FRONTEND_PORT; then
        frontend_running=true
        frontend_port=$FRONTEND_PORT
    else
        # Check if we have a saved port file
        if [ -f "$FRONTEND_DIR/.frontend.port" ]; then
            local saved_port=$(cat "$FRONTEND_DIR/.frontend.port")
            if is_port_in_use $saved_port; then
                frontend_running=true
                frontend_port=$saved_port
            fi
        fi

        # If still not found, check common Next.js ports
        if [ "$frontend_running" = false ]; then
            for port in 3000 3001 3002 3003; do
                if is_port_in_use $port; then
                    # Check if it's actually a Next.js process using multiple methods
                    local is_nextjs=false

                    if command -v ss >/dev/null 2>&1; then
                        local process_info=$(ss -tlnp 2>/dev/null | grep ":$port ")
                        if echo "$process_info" | grep -q "next\|npm"; then
                            is_nextjs=true
                        fi
                    elif command -v lsof >/dev/null 2>&1; then
                        local process_info=$(lsof -i :$port 2>/dev/null | grep "LISTEN")
                        if echo "$process_info" | grep -q "next\|npm"; then
                            is_nextjs=true
                        fi
                    fi

                    # Additional check: try to access the port and see if it responds like a web server
                    if [ "$is_nextjs" = false ]; then
                        if curl -s --max-time 2 http://localhost:$port | head -1 | grep -q "DOCTYPE html\|html"; then
                            is_nextjs=true
                        fi
                    fi

                    if [ "$is_nextjs" = true ]; then
                        frontend_running=true
                        frontend_port=$port
                        break
                    fi
                fi
            done
        fi
    fi

    if [ "$frontend_running" = true ]; then
        echo "✅ Frontend: Running on port $frontend_port"
    else
        echo "❌ Frontend: Not running"
    fi

    # Show PIDs if available
    echo ""
    echo "📋 Process Information:"
    if [ -f "$CHAT_PID_FILE" ]; then
        local chat_pid=$(cat "$CHAT_PID_FILE")
        if kill -0 $chat_pid 2>/dev/null; then
            echo "   💬 Chat Server PID: $chat_pid"
        fi
    fi

    if [ -f "$FRONTEND_PID_FILE" ]; then
        local frontend_pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 $frontend_pid 2>/dev/null; then
            echo "   📊 Frontend PID: $frontend_pid"
        fi
    fi

    # Show log locations
    echo ""
    echo "📝 Log Files:"
    echo "   Main log: $MAIN_LOG"
    echo "   dfx log: $LOG_DIR/dfx-start.log"
    echo "   Deploy log: $LOG_DIR/deploy.log"
    echo "   Frontend log: $LOG_DIR/frontend.log"
    echo "   Chat log: $LOG_DIR/chat-server.log"
    echo ""
}

# Restart function
restart_all() {
    log_status "INFO" "Restarting all services..."
    stop_all
    sleep 3
    start_all
}

# Display help information
show_help() {
    echo "ICP Application Startup Script"
    echo "=============================="
    echo ""
    echo "Usage: $0 {start|stop|restart|status|help}"
    echo ""
    echo "Commands:"
    echo "  start   - Start all services (dfx, canisters, chat server, frontend)"
    echo "  stop    - Stop all running services"
    echo "  restart - Restart all services"
    echo "  status  - Show status of all services"
    echo "  help    - Display this help message"
    echo ""
    echo "Service URLs:"
    echo "  Frontend: http://localhost:$FRONTEND_PORT"
    echo "  Chat Server: http://localhost:$CHAT_SERVER_PORT"
    echo "  ICP Replica: http://localhost:$DFX_PORT"
    echo ""
    echo "Configuration:"
    echo "  Network: $DFX_NETWORK"
    echo "  Backend Directory: $BACKEND_DIR"
    echo "  Frontend Directory: $FRONTEND_DIR"
    echo "  Log Directory: $LOG_DIR"
    echo ""
}

# Main script entry point
main() {
    # Create log directory if it doesn't exist
    mkdir -p "$LOG_DIR"

    # Handle command line arguments
    case "${1:-start}" in
        start)
            start_all
            ;;
        stop)
            stop_all
            ;;
        restart)
            restart_all
            ;;
        status)
            show_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

log_status "INFO" "Startup script completed"