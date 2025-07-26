#!/bin/bash

echo "🚀 Starting Socialize Application..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   brew services start mongodb-community"
    echo "   or"
    echo "   mongod --dbpath /usr/local/var/mongodb"
    exit 1
fi

# Create required directories
mkdir -p uploads

# Check if node_modules exists, if not inform user
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed. Please run:"
    echo "   npm install"
    echo "   cd client && npm install"
    exit 1
fi

if [ ! -d "client/node_modules" ]; then
    echo "⚠️  Client dependencies not installed. Please run:"
    echo "   cd client && npm install"
    exit 1
fi

echo "✅ Starting backend server on port 5000..."
node server/index.js &
BACKEND_PID=$!

echo "✅ Starting frontend on port 3000..."
cd client && npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Socialize is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   API Health: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Set trap to cleanup on Ctrl+C
trap cleanup INT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID