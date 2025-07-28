# Railway Deployment Guide

## Quick Deploy to Railway

1. **Connect your GitHub repository to Railway:**
   - Go to [Railway](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Select this repository

2. **Configure Environment Variables:**
   Set these variables in Railway's dashboard:
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb://[your-mongodb-connection-string]
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=30d
   CLIENT_URL=https://your-app-name.up.railway.app
   ```

3. **Add MongoDB Database:**
   - In Railway dashboard, click "Add Service"
   - Select "Database" > "MongoDB"
   - Copy the connection string to `MONGODB_URI`

## Configuration Files Created

- `railway.json` - Railway service configuration
- `railway.toml` - Railway build configuration  
- `nixpacks.toml` - Nixpacks build configuration
- `Procfile` - Process configuration
- `.env.example` - Environment variables template

## Build Process

Railway will automatically:
1. Install dependencies with `npm ci`
2. Build Next.js app with `npm run build`
3. Start the server with `npm start`

## Port Configuration

The app is configured to:
- Use port 3000 (Railway's default)
- Listen on `0.0.0.0` for Railway's networking
- Serve both API routes and Next.js static files

## Health Check

The app includes a health check endpoint at `/api/health` for Railway's monitoring.

## Deployment Commands

```bash
# Build the application
npm run build

# Start production server
npm start

# Railway-specific commands
npm run railway:build
npm run railway:start
```

## Troubleshooting

- Check Railway logs for deployment issues
- Ensure all environment variables are set
- Verify MongoDB connection string is correct
- Check that port 3000 is available