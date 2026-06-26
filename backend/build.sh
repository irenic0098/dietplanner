#!/bin/bash
# Build script for Render deployment

set -e

echo "Upgrading pip, setuptools and wheel..."
python -m pip install --upgrade pip setuptools wheel

echo "Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

echo "Collecting static files (no database required)..."
ENVIRONMENT=development python manage.py collectstatic --no-input

echo "Build complete!"
