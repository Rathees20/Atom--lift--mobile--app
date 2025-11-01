# Vercel Deployment Guide for Atom App

This guide will help you deploy your Expo React Native app to Vercel for web hosting.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **Node.js**: Version 16 or higher

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to Git repository**
   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Vercel will automatically detect it's an Expo project

3. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at the provided URL

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts**
   - Link to existing project or create new
   - Confirm build settings
   - Deploy

## Build Configuration

The following files have been configured for Vercel deployment:

### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### `package.json` Scripts
- `"build": "expo export --platform web"` - Builds the web version

### `app.json` Web Configuration
```json
"web": {
  "favicon": "./src/assets/favicon.png",
  "bundler": "metro",
  "output": "static"
}
```

## Testing Locally

Before deploying, test your web build locally:

```bash
# Install dependencies
npm install

# Build for web
npm run build

# The build output will be in the 'dist' folder
```

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Ensure no native-only modules are used in web code
   - Check the build logs in Vercel dashboard

2. **App Doesn't Load**
   - Verify the `dist` folder contains the built files
   - Check that `index.html` exists in the output
   - Ensure all assets are properly referenced

3. **Routing Issues**
   - The `vercel.json` includes a catch-all route for SPA routing
   - Make sure your React Navigation is configured for web

### Environment Variables

If you need environment variables:

1. **In Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add your variables

2. **In Code**:
   ```javascript
   const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
   ```

## Features Included

✅ **Static Export**: Optimized for Vercel's static hosting
✅ **SPA Routing**: Proper routing configuration for single-page app
✅ **Asset Optimization**: Images and icons properly configured
✅ **PWA Ready**: Manifest file included for Progressive Web App features
✅ **Responsive**: Works on desktop and mobile browsers

## Post-Deployment

After successful deployment:

1. **Custom Domain** (Optional):
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Analytics** (Optional):
   - Enable Vercel Analytics in Project Settings

3. **Performance**:
   - Check the Performance tab for optimization suggestions

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Expo Web Documentation](https://docs.expo.dev/workflow/web/)
- [React Native Web](https://necolas.github.io/react-native-web/)

---

**Note**: This configuration is optimized for web deployment. For mobile app deployment, use Expo Application Services (EAS) or other mobile-specific deployment methods.
