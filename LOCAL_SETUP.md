# Local Development Setup

Instructions for setting up the project locally for development.

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (or use SQLite for local dev)
- Git

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Create .env file
```bash
cp .env.example .env
```

Edit `.env`:
- Set `ENVIRONMENT=development`
- Set `DEBUG=True`
- For local SQLite: Leave DB settings as is
- For local PostgreSQL: Update DB settings

### 5. Run migrations
```bash
python manage.py migrate
```

### 6. Create superuser
```bash
python manage.py createsuperuser
```

### 7. Start development server
```bash
python manage.py runserver
```

Backend will run at: `http://localhost:8000`

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env.local file
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_API_URL=http://localhost:8000
```

### 4. Start development server
```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`

## Running Frontend & Backend Concurrently (Recommended)

To run both the Django backend and the Vite frontend simultaneously with a single command, you can use one of the following methods from the project root directory:

### Method 1: Native Windows Script (Double-click or terminal)
Double-click `run-dev.bat` or execute it in Cmd/PowerShell:
```bash
./run-dev.bat
```
*This will open two separate command prompt windows: one running the Django backend, and the other running the Vite frontend.*

### Method 2: Bash Shell Script (Git Bash/WSL/macOS/Linux)
Execute `run-dev.sh` in a Bash terminal:
```bash
./run-dev.sh
```

### Method 3: Unified npm command (Runs in one terminal)
First, install the root developer dependencies:
```bash
npm install
```
Then, start both servers concurrently:
```bash
npm run dev
```

## Common Development Commands

### Backend
```bash
# Run tests
python manage.py test

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Create superuser
python manage.py createsuperuser

# Shell
python manage.py shell
```

### Frontend
```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

## Troubleshooting

### Module not found errors
```bash
# Reinstall dependencies
pip install -r requirements.txt
npm install
```

### Database errors
```bash
# Reset database
rm db.sqlite3
python manage.py migrate
```

### Port already in use
```bash
# Backend (change port)
python manage.py runserver 8001

# Frontend (Vite automatically tries other ports)
```

## Testing

### Backend Tests
```bash
python manage.py test
```

### Frontend Tests
```bash
# Add test runner if using React Testing Library
npm run test
```

## Code Style

### Backend
```bash
# Install linting tools
pip install flake8 black

# Format code
black backend/

# Lint
flake8 backend/
```

### Frontend
```bash
# Lint and fix
npm run lint -- --fix
```
