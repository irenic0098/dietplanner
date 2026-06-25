echo "Running database migrations..."
echo "Collecting static files..."
echo "Build complete!"
#!/bin/bash
# Build script for Render deployment

set -e

echo "Upgrading pip, setuptools and wheel..."
python -m pip install --upgrade pip setuptools wheel

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Running database migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Build complete!"
