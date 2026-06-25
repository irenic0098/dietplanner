# DietPlannar Deployment Guide

Complete guide for deploying DietPlannar to production with:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase PostgreSQL

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase PostgreSQL Setup](#supabase-postgresql-setup)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

You'll need accounts for:
- [Vercel](https://vercel.com) - Frontend hosting
- [Render](https://render.com) - Backend hosting  
- [Supabase](https://supabase.com) - PostgreSQL database
- GitHub (for source control)

---

## Supabase PostgreSQL Setup

### Step 1: Create a Supabase Project
1. Go to [Supabase](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in the project details:
   - **Name**: `dietplanner`
   - **Password**: Generate a strong password (save it!)
   - **Region**: Select closest to your users
   - **Pricing Plan**: Free plan is sufficient to start
4. Wait for the project to initialize

### Step 2: Get Database Credentials
1. Go to **Project Settings** → **Database**
2. Note down:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: Your generated password
   - **Port**: `5432`

### Step 3: Create Database (Optional)
If you want a separate database:
1. Go to **SQL Editor**
2. Create a new database:
   ```sql
   CREATE DATABASE dietplanner;
   ```

---

## Backend Deployment (Render)

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dietplanner.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [Render](https://render.com) and sign up/login
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Fill in deployment settings:
   - **Name**: `dietplanner-backend`
   - **Environment**: `Python 3.11`
   - **Build Command**: See `render.yaml`
   - **Start Command**: `gunicorn config.wsgi:application`
   - **Plan**: Free (for testing)

### Step 3: Set Environment Variables on Render
In Render dashboard, go to your service → **Environment**

Add these variables:
```
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<generate-a-random-key>
ALLOWED_HOSTS=your-service.onrender.com,localhost
DB_ENGINE=postgresql
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<your-supabase-password>
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
FRONTEND_URL=https://your-domain.vercel.app
```

### Step 4: Generate Django Secret Key
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Step 5: Run Migrations
After initial deployment, run:
```bash
python manage.py migrate
```

You can do this via Render's shell or create a management command.

---

## Frontend Deployment (Vercel)

### Step 1: Connect GitHub Repository
1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click **New Project**
3. Import your GitHub repository
4. Select `frontend` as the root directory (if monorepo)

### Step 2: Configure Build Settings
Vercel should auto-detect Vite, but verify:
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: `18.x` or `20.x`

### Step 3: Set Environment Variables
In Vercel dashboard → **Settings** → **Environment Variables**

Add:
```
VITE_API_URL=https://your-service.onrender.com
```

**Note**: Frontend env variables must start with `VITE_` to be accessible in the browser.

### Step 4: Deploy
Click **Deploy** - Vercel will automatically build and deploy

---

## Environment Variables

### Backend (.env file)
Create `backend/.env` with:
```
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=your-generated-secret-key
DB_ENGINE=postgresql
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
FRONTEND_URL=https://your-vercel-domain.vercel.app
ALLOWED_HOSTS=your-render-url.onrender.com,localhost
```

### Frontend (.env file)
Create `frontend/.env.local` with:
```
VITE_API_URL=https://your-render-url.onrender.com
```

---

## Post-Deployment

### 1. Create Superuser
Run via Render shell or local:
```bash
python manage.py createsuperuser
```

### 2. Run Migrations
```bash
python manage.py migrate
```

### 3. Collect Static Files
```bash
python manage.py collectstatic --no-input
```

### 4. Test API
```bash
curl https://your-render-url.onrender.com/admin/
```

### 5. Test Frontend
Visit `https://your-vercel-domain.vercel.app` in browser

---

## Troubleshooting

### Render Issues

**502 Bad Gateway**
- Check logs: `Render Dashboard → Logs`
- Verify environment variables are set
- Ensure database credentials are correct
- Check that migrations ran successfully

**Static files not loading**
- Run: `python manage.py collectstatic --no-input`
- Verify `STATIC_ROOT` is correct

**CORS errors**
- Check `CORS_ALLOWED_ORIGINS` in settings.py
- Verify frontend URL is whitelisted
- Ensure credentials are handled correctly

### Vercel Issues

**VITE env variables not loading**
- Must start with `VITE_` prefix
- Redeploy after adding/changing
- Check browser console for actual values

**API connection errors**
- Verify `VITE_API_URL` matches Render backend URL
- Check browser DevTools Network tab
- Ensure backend allows CORS from your frontend

### Database Issues

**Connection refused**
- Verify IP whitelist in Supabase settings
- Check DB credentials are correct
- Ensure DB host/port are accessible
- For Supabase: May need to enable external connections

**Migrations fail**
- Check database user has proper permissions
- Verify charset is UTF-8
- Try running migrations locally first

---

## Important Notes

1. **First Deploy**: Migrations may fail on first deploy. You can:
   - Run migrations locally, then push
   - Use Render's build script to run migrations
   - SSH into Render and run manually

2. **Database Backups**: 
   - Set up Supabase backups in settings
   - Regular backups are critical

3. **Security**:
   - Never commit `.env` files
   - Rotate `SECRET_KEY` periodically
   - Enable Supabase RLS (Row Level Security)
   - Use HTTPS everywhere

4. **Monitoring**:
   - Set up error logging (Sentry)
   - Monitor database usage
   - Set up alerts for failures

5. **Scaling**:
   - Free tier has limitations
   - Plan for paid tiers as user base grows
   - Consider CDN for static assets

---

## Quick Reference: URLs

After deployment, you'll have:
- **Backend API**: `https://your-service.onrender.com`
- **Frontend**: `https://your-domain.vercel.app`
- **Admin Panel**: `https://your-service.onrender.com/admin/`
- **Database**: `db.xxxxxxxxxxxxx.supabase.co`

---

## Support

For issues:
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Django Docs](https://docs.djangoproject.com)

Last Updated: 2024
