#!/bin/bash
echo "Starting Django backend on port 8000..."
.venv/Scripts/python backend/manage.py runserver &
BACKEND_PID=$!

echo "Starting Vite frontend..."
npm --prefix frontend run dev &
FRONTEND_PID=$!

# Ensure that background processes are terminated when the script exits
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
