FROM python:3.11-slim

# Install system dependencies required for Pillow and other packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    libblas-dev \
    liblapack-dev \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
# Set working directory
WORKDIR /app

# Copy requirements from backend folder
COPY requirements.txt /app/requirements.txt

# Upgrade pip and install dependencies
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r /app/requirements.txt

# Copy the entire repository into the image
COPY . /app

# Collect static files (run from backend directory)
RUN python backend/manage.py collectstatic --no-input || true

# Expose port
EXPOSE 8000

# Start command
CMD ["gunicorn", "backend.config.wsgi:application", "--bind", "0.0.0.0:8000"]
