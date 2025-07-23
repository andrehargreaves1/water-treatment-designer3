#!/bin/bash

# Local development startup script for Water Treatment Designer

echo "🚰 Starting Water Treatment Designer..."

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Start backend in background
echo "🔧 Starting backend API server..."
cd backend
python -m pip install -r requirements.txt > /dev/null 2>&1
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Start frontend
echo "🎨 Starting frontend development server..."
cd frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Water Treatment Designer is running!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait