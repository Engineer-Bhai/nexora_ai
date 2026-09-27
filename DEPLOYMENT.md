# Nexora AI - Deployment Guide

This guide explains how to deploy the Nexora AI platform with **separate frontend and backend deployments**.

---

## 📋 Architecture Overview

- **Frontend**: React + Vite → Deploy to Vercel
- **Backend**: Express + MongoDB → Deploy separately (Render, Railway, Heroku, or local with ngrok)
- **Communication**: Frontend calls backend API via `VITE_API_URL` environment variable

---

## 🎨 Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Backend deployed and accessible via HTTPS URL

### Deployment Steps

#### 1. Import Repository to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Click **"Import Git Repository"**
4. Select or import: `https://github.com/Engineer-Bhai/nexora_ai`

#### 2. Configure Project Settings

Set the following in Vercel project configuration:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**IMPORTANT**: Set **Root Directory** to `frontend` - this is critical!

#### 3. Add Environment Variable

In Vercel Dashboard → **Settings** → **Environment Variables**, add:

```env
VITE_API_URL=<your-backend-url>
```

**Example values:**
- Production backend: `https://nexora-backend.onrender.com`
- Local with ngrok: `https://abc123.ngrok.io`
- Local network: `http://192.168.1.100:5000`

**Note**: Do NOT include trailing slash. Include `/api` routes in the backend, not in this URL.

#### 4. Deploy

Click **"Deploy"** and wait for the build to complete.

Your frontend will be live at: `https://your-project-name.vercel.app`

### Frontend Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `https://backend.example.com` | Full URL to your deployed backend (no trailing slash) |

---

## 🔧 Backend Deployment

The backend is a Node.js Express application that connects to MongoDB. Deploy it to any Node.js hosting platform.

### Recommended Platforms

#### Option A: Render (Recommended - Free Tier Available)

1. Sign up at [https://render.com](https://render.com)
2. Create new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables (see below)
6. Deploy

#### Option B: Railway

1. Sign up at [https://railway.app](https://railway.app)
2. Create new project from GitHub
3. Select `backend` directory
4. Add environment variables
5. Deploy

#### Option C: Local with ngrok (Development/Testing)

```bash
# Terminal 1: Start backend
cd backend
npm install
npm run dev

# Terminal 2: Expose with ngrok
ngrok http 5000
# Copy the https URL (e.g., https://abc123.ngrok.io)
# Use this as VITE_API_URL in Vercel
```

### Backend Environment Variables

Create a `.env` file in the `backend` directory (or add to your hosting platform):

```env
# Server Configuration
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app

# Database (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexora

# Authentication (REQUIRED)
JWT_SECRET=your-super-secret-random-string-here
JWT_EXPIRES_IN=7d

# AI Provider (At least ONE required for full functionality)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Vector/RAG Settings
VECTOR_DIMENSIONS=1536

# SMTP (Optional - for email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

#### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### MongoDB Atlas Setup (Free)

1. Create account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Create database user
4. In **Network Access**, add IP: `0.0.0.0/0` (allow all)
5. Get connection string from **Connect** → **Connect your application**
6. Replace `<password>` with your actual password

#### Get API Keys (Optional but Recommended)

- **Gemini (Free)**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- **OpenAI (Paid)**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic (Paid)**: [https://console.anthropic.com/](https://console.anthropic.com/)

### Backend CORS Configuration

The backend is configured to automatically allow:
- `CLIENT_URL` from environment variable
- All `*.vercel.app` domains (for Vercel preview deployments)
- `localhost:3000` and `localhost:5173` (for local development)

**Important**: Set `CLIENT_URL` in backend environment variables to your production Vercel URL.

---

## 🖥️ Local Development

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas connection

### Setup Steps

#### 1. Clone Repository

```bash
git clone https://github.com/Engineer-Bhai/nexora_ai.git
cd nexora_ai
```

#### 2. Setup Backend

```bash
cd backend
npm install
```

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/nexora
JWT_SECRET=development_secret_key_change_in_production
GEMINI_API_KEY=your_key_here
```

Start backend:

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

#### 3. Setup Frontend

Open new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start frontend:

```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

### Development Workflow

1. Backend runs on port 5000
2. Frontend runs on port 3000 with Vite proxy
3. API calls go to `/api/*` which Vite proxies to `http://localhost:5000`
4. Changes to frontend hot-reload automatically
5. Backend restarts on file changes with ts-node-dev

---

## 🔍 Verification

### Frontend Build Test

```bash
cd frontend
npm install
npm run build
```

Should complete without errors.

### Backend Health Check

After deploying backend, visit:

```
https://your-backend-url/api/health
```

Should return:

```json
{
  "status": "ok",
  "service": "Nexora AI API",
  "environment": "production",
  "database": {
    "status": "connected",
    "connected": true
  }
}
```

### Full Integration Test

1. Visit your Vercel frontend URL
2. Try to register a new account
3. If successful, frontend → backend → database connection is working

---

## 🐛 Troubleshooting

### Frontend Build Fails on Vercel

**Check:**
- Root Directory is set to `frontend`
- Build command is `npm run build` (not `cd frontend && npm run build`)
- Output directory is `dist`

### API Calls Fail (CORS Errors)

**Solution:**
1. Verify `CLIENT_URL` in backend environment matches your Vercel frontend URL
2. Ensure backend allows `*.vercel.app` domains (already configured)
3. Check browser console for exact CORS error

### API Calls Return 404

**Check:**
1. `VITE_API_URL` is set correctly in Vercel environment variables
2. Backend is running and accessible
3. Backend URL includes protocol (`https://` or `http://`)
4. Backend URL does NOT have trailing slash

### Database Connection Fails

**Check:**
1. MongoDB Atlas allows connections from `0.0.0.0/0`
2. Connection string has correct password
3. Database user has read/write permissions
4. Connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

### Authentication Not Working

**Check:**
1. `JWT_SECRET` is set in backend environment
2. `JWT_SECRET` is at least 32 characters long
3. Browser allows cookies (credentials: true in CORS)
4. Frontend and backend are both using HTTPS in production

---

## 📊 Monitoring

### Frontend (Vercel)
- View deployment logs in Vercel Dashboard
- Monitor performance with Vercel Analytics (optional)
- Check function logs for any runtime errors

### Backend
- Use platform's logging (Render Logs, Railway Logs, etc.)
- Monitor MongoDB Atlas for database performance
- Check API health endpoint regularly

---

## 🔄 Continuous Deployment

### Frontend
- Every push to `main` branch automatically deploys to Vercel
- Preview deployments created for pull requests

### Backend
- Configure automatic deploys from GitHub on your hosting platform
- Or manually deploy when backend changes are made

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - already in `.gitignore`
2. **Use strong JWT_SECRET** - generate with crypto.randomBytes(64)
3. **Rotate API keys regularly**
4. **Keep dependencies updated** - run `npm audit` periodically
5. **Use HTTPS only in production**
6. **Restrict MongoDB Atlas IP access** in production if possible
7. **Enable rate limiting** on backend (consider adding express-rate-limit)

---

## 📝 Environment Variables Checklist

### Frontend (Vercel)
- [ ] `VITE_API_URL` - Backend URL

### Backend (Render/Railway/etc.)
- [ ] `PORT` - 5000 or platform default
- [ ] `NODE_ENV` - production
- [ ] `CLIENT_URL` - Your Vercel frontend URL
- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Strong random secret
- [ ] `GEMINI_API_KEY` or `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - At least one

---

## 🎉 You're Ready!

After following this guide:
- ✅ Frontend deployed on Vercel
- ✅ Backend deployed separately
- ✅ Environment variables configured
- ✅ CORS configured correctly
- ✅ Database connected
- ✅ Application fully functional

Visit your Vercel URL and start using Nexora AI! 🚀

---

## 📧 Support

For issues:
1. Check browser console for frontend errors
2. Check backend logs for API errors
3. Verify all environment variables are set correctly
4. Review this guide's troubleshooting section
