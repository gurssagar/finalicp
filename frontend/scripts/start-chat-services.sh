#!/bin/bash

# Chat Services Startup Script
# This script starts all necessary chat services including Socket.IO server

echo "🚀 Starting Chat Services..."

# Function to check if a process is running on a specific port
is_port_in_use() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start Socket.IO server if not running
start_socket_server() {
    local port=4000
    echo "🔍 Checking Socket.IO server on port $port..."

    if is_port_in_use $port; then
        echo "✅ Socket.IO server is already running on port $port"
        return 0
    else
        echo "🚀 Starting Socket.IO server..."
        cd "$(dirname "$0")/.."
        nohup node lib/socket-server.js > logs/socket-server.log 2>&1 &
        local pid=$!
        echo "📝 Socket.IO server started with PID: $pid"
        echo "$pid" > .socket-server.pid

        # Wait a moment and check if it started successfully
        sleep 3
        if is_port_in_use $port; then
            echo "✅ Socket.IO server started successfully on port $port"
            return 0
        else
            echo "❌ Failed to start Socket.IO server on port $port"
            return 1
        fi
    fi
}

# Function to stop Socket.IO server
stop_socket_server() {
    if [ -f ".socket-server.pid" ]; then
        local pid=$(cat .socket-server.pid)
        echo "🛑 Stopping Socket.IO server (PID: $pid)..."
        kill $pid 2>/dev/null
        rm -f .socket-server.pid
        sleep 2

        # Force kill if still running
        if is_port_in_use 4000; then
            echo "⚡ Force stopping Socket.IO server..."
            pkill -f "node lib/socket-server.js"
        fi
        echo "✅ Socket.IO server stopped"
    else
        echo "ℹ️ No Socket.IO server PID file found"
    fi
}

# Create logs directory if it doesn't exist
mkdir -p logs

# Handle command line arguments
case "${1:-start}" in
    start)
        echo "🔧 Starting chat services..."
        start_socket_server
        echo "✅ Chat services started successfully!"
        echo "📊 Socket.IO Health: http://localhost:4000/health"
        echo "🔗 WebSocket: ws://localhost:4000/socket.io/"
        ;;
    stop)
        echo "🛑 Stopping chat services..."
        stop_socket_server
        echo "✅ Chat services stopped!"
        ;;
    restart)
        echo "🔄 Restarting chat services..."
        stop_socket_server
        sleep 2
        start_socket_server
        echo "✅ Chat services restarted successfully!"
        ;;
    status)
        echo "📊 Checking chat services status..."
        if is_port_in_use 4000; then
            echo "✅ Socket.IO server is running on port 4000"
            echo "📊 Health check: http://localhost:4000/health"
        else
            echo "❌ Socket.IO server is not running"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all chat services"
        echo "  stop    - Stop all chat services"
        echo "  restart - Restart all chat services"
        echo "  status  - Check status of chat services"
        exit 1
        ;;
esac