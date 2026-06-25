# Deployment Checklist

## Pre-Deployment

- [ ] All code committed to GitHub
- [ ] `.env` file created with all required variables
- [ ] `.env` added to `.gitignore`
- [ ] `requirements.txt` up to date
- [ ] Frontend build tested locally: `npm run build`
- [ ] Backend tested locally with production settings
- [ ] Database migrations tested locally

## Supabase Setup

- [ ] Supabase project created
- [ ] Database credentials copied
- [ ] IP whitelist configured (or allow all for now)
- [ ] Database connection tested

## Backend (Render)

- [ ] GitHub repository connected to Render
- [ ] Web service created on Render
- [ ] Environment variables set on Render:
  - [ ] `ENVIRONMENT=production`
  - [ ] `DEBUG=False`
  - [ ] `SECRET_KEY` (generated)
  - [ ] `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - [ ] `DB_HOST`, `DB_PORT`
  - [ ] `FRONTEND_URL`
  - [ ] `ALLOWED_HOSTS`
- [ ] Initial build triggered
- [ ] Migrations run successfully
- [ ] `/admin/` endpoint responds
- [ ] API endpoints tested with Postman/curl

## Frontend (Vercel)

- [ ] GitHub repository connected to Vercel
- [ ] `vercel.json` configured
- [ ] Environment variables set on Vercel:
  - [ ] `VITE_API_URL`
- [ ] Initial build triggered
- [ ] Frontend loads without errors
- [ ] Frontend can connect to backend API

## Post-Deployment

- [ ] Create Django superuser
- [ ] Test user registration/login flow
- [ ] Test core functionality end-to-end
- [ ] Monitor error logs on both platforms
- [ ] Set up monitoring/alerts
- [ ] Configure backup schedule (Supabase)
- [ ] Document any custom steps taken

## Security

- [ ] HTTPS enabled everywhere
- [ ] CORS properly configured
- [ ] CSRF protection enabled
- [ ] Environment variables not exposed
- [ ] Database credentials rotated (if previously exposed)
- [ ] Admin panel protected

## Monitoring

- [ ] Set up error logging (optional: Sentry)
- [ ] Set up performance monitoring
- [ ] Create runbooks for common issues
- [ ] Document rollback procedure
