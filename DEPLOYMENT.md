# Water Treatment Designer - Render Deployment Guide

This guide will help you deploy the Water Treatment Designer to Render.com for free hosting.

## Prerequisites
- GitHub account
- Render account (free at render.com)

## Deployment Steps

### 1. Push to GitHub
1. Create a new repository on GitHub
2. Push your code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Water Treatment Designer v3"
   git branch -M main
   git remote add origin https://github.com/yourusername/water-treatment-designer.git
   git push -u origin main
   ```

### 2. Deploy to Render

#### Option A: Using render.yaml (Recommended)
1. Go to [render.com](https://render.com) and sign in
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file and create both services

#### Option B: Manual Setup
If the Blueprint doesn't work, create services manually:

**Backend Service:**
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `water-treatment-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

**Frontend Service:**
1. Click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `water-treatment-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

### 3. Environment Variables
Set these environment variables in the backend service:
- `CORS_ORIGINS`: `*` (for development, restrict in production)

Set these environment variables in the frontend service:
- `VITE_API_URL`: The URL of your backend service (e.g., `https://water-treatment-api.onrender.com`)

### 4. Access Your Application
After deployment (5-10 minutes):
- Backend API: `https://your-backend-service.onrender.com`
- Frontend App: `https://your-frontend-service.onrender.com`

## Features Available
✅ Interactive process flowsheet designer
✅ Real-time engineering calculations
✅ Water quality analysis with FOG parameters
✅ Animated stream visualization
✅ Equipment property panels
✅ Mass balance calculations
✅ Professional engineering interface

## Technical Stack
- **Backend**: FastAPI (Python) with engineering calculations
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Visualization**: ReactFlow
- **Deployment**: Render.com (Free tier)

## Notes
- Free tier services may spin down after inactivity
- First request after inactivity may take 30-60 seconds
- All calculations run client-side after initial load
- No database required - pure calculation engine

## Support
For deployment issues, check:
- Render service logs for error messages
- Ensure all environment variables are set correctly
- Verify GitHub repository is properly connected