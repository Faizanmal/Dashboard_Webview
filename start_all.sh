#!/bin/bash

echo "🚀 Starting Dashboard Application"
echo "================================="

# Start Redis if not running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "Starting Redis..."
    redis-server --daemonize yes
fi

# Start Django backend
echo "Starting Django backend on port 8000..."
cd dashboard_backend
python manage.py runserver 0.0.0.0:8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start Next.js frontend
echo "Starting Next.js frontend on port 3000..."
cd ../dashboard_frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Application started successfully!"
echo "================================="
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Backend logs:  tail -f backend.log"
echo "Frontend logs: tail -f frontend.log"
echo ""
echo "To stop: kill $BACKEND_PID $FRONTEND_PID"
