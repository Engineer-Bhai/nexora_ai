# Nexora AI - Vercel Deployment Guide

This guide will help you deploy the Nexora AI platform to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub (already done ✅)
3. **MongoDB Atlas**: You'll need a cloud MongoDB database
4. **API Keys**: Obtain keys for AI providers (Gemini, OpenAI, or Anthropic)

## 🚀 Deployment Steps

### 1. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/nexora`)

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended for first-time)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `https://github.com/Engineer-Bhai/nexora_ai`
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: Leave as `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`

4. Add Environment Variables (click "Environment Variables"):
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_secret_here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://your-app-name.vercel.app
   
   # AI Provider Keys (at least one required)
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   
   # Optional
   VECTOR_DIMENSIONS=1536
   PORT=5000
   ```

5. Click **Deploy**

#### Option B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project root:
   ```bash
   vercel
   ```

4. Follow the prompts and add environment variables when asked

### 3. Configure Environment Variables in Vercel

After deployment, you can manage environment variables:

1. Go to your project dashboard on Vercel
2. Click **Settings** → **Environment Variables**
3. Add all the required variables listed above
4. Click **Save**
5. Redeploy your application for changes to take effect

### 4. Generate Secure JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET` environment variable.

## 🔑 Required Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens | Yes | Generated random string |
| `JWT_EXPIRES_IN` | JWT expiration time | No | `7d` |
| `CLIENT_URL` | Frontend URL | Yes | `https://your-app.vercel.app` |
| `GEMINI_API_KEY` | Google Gemini API key | Optional* | `AIza...` |
| `OPENAI_API_KEY` | OpenAI API key | Optional* | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic API key | Optional* | `sk-ant-...` |

*At least one AI provider key is recommended for full functionality

## 🔍 Getting API Keys

### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy and use it as `GEMINI_API_KEY`

### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy and use it as `OPENAI_API_KEY`

### Anthropic API
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Copy and use it as `ANTHROPIC_API_KEY`

## 📝 Post-Deployment

After successful deployment:

1. **Test the API**: Visit `https://your-app.vercel.app/api/health`
2. **Check Logs**: View deployment logs in Vercel dashboard
3. **Monitor Performance**: Use Vercel Analytics (optional)

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### API Errors
- Check that MongoDB URI is correct and IP whitelist includes 0.0.0.0/0
- Verify at least one AI provider key is valid
- Check function logs in Vercel dashboard

### Database Connection Issues
- Make sure MongoDB Atlas allows connections from all IPs
- Verify the connection string format
- Check if database user has proper permissions

## 🔄 Updating Your Deployment

Every push to your `main` branch will automatically trigger a new deployment on Vercel.

To manually redeploy:
```bash
vercel --prod
```

## 📊 Monitoring

- **Vercel Dashboard**: Monitor deployments, logs, and performance
- **MongoDB Atlas**: Monitor database usage and performance
- **Vercel Analytics**: Track user interactions (requires setup)

## 🎉 Success!

Your Nexora AI platform should now be live at: `https://your-app-name.vercel.app`

For issues or questions, check the [Vercel Documentation](https://vercel.com/docs) or [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/).
