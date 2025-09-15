# 🚀 Netlify Deployment Guide

This guide will help you deploy your Angular Mutual Fund Manager application to Netlify.

## 📋 Prerequisites

- Node.js 18+ installed locally
- Git repository (GitHub, GitLab, or Bitbucket)
- Netlify account (free tier available)

## 🔧 Pre-Deployment Setup

### 1. Environment Configuration

Update the API URL in `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-actual-api-domain.com/api', // ⚠️ IMPORTANT: Replace with your API URL
  appName: 'Mutual Fund Manager',
  version: '1.0.0',
  enableLogging: false,
  enableAnalytics: true
};
```

### 2. Test Local Build

Before deploying, test the production build locally:

```bash
# Install dependencies
npm install

# Run production build
npm run build:prod

# Serve the built files locally (optional)
npx http-server dist/mutual-fund-manager-ui -p 8080
```

## 🌐 Netlify Deployment Methods

### Method 1: Git-based Deployment (Recommended)

#### Step 1: Push to Git Repository
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

#### Step 2: Connect to Netlify
1. Go to [Netlify](https://netlify.com) and log in
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, Bitbucket)
4. Select your repository
5. Configure build settings:
   - **Branch to deploy**: `main` (or your default branch)
   - **Build command**: `npm run build:prod`
   - **Publish directory**: `dist/mutual-fund-manager-ui`

#### Step 3: Deploy
- Click "Deploy site"
- Netlify will automatically build and deploy your app
- You'll get a random URL like `https://amazing-app-123456.netlify.app`

### Method 2: Manual Deployment

#### Step 1: Build Locally
```bash
npm run build:prod
```

#### Step 2: Deploy to Netlify
1. Go to [Netlify](https://netlify.com)
2. Drag and drop the `dist/mutual-fund-manager-ui` folder to the deploy area
3. Your site will be deployed instantly

## ⚙️ Configuration Files Included

### `netlify.toml`
- ✅ Build configuration
- ✅ SPA routing redirects
- ✅ Security headers
- ✅ Caching rules
- ✅ Node.js version specification

### `package.json`
- ✅ Production build script added
- ✅ Optimized build settings

## 🔒 Environment Variables (Optional)

If you need to set environment variables in Netlify:

1. Go to your site dashboard
2. Navigate to "Site settings" → "Environment variables"
3. Add variables like:
   - `API_URL`: Your backend API URL
   - `NODE_ENV`: `production`

## 🌍 Custom Domain Setup

### Step 1: Add Custom Domain
1. In your Netlify site dashboard
2. Go to "Domain settings"
3. Click "Add custom domain"
4. Enter your domain name

### Step 2: Configure DNS
- **Option A**: Use Netlify DNS (recommended)
- **Option B**: Configure your DNS provider to point to Netlify

### Step 3: Enable HTTPS
- Netlify automatically provides free SSL certificates
- HTTPS will be enabled automatically

## 🔧 Build Optimization

### Performance Optimizations Included:
- ✅ AOT (Ahead of Time) compilation
- ✅ Build optimizer enabled
- ✅ Tree shaking
- ✅ Minification
- ✅ Gzip compression (Netlify default)

### Bundle Analysis (Optional)
```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Analyze bundle
npm run build:prod -- --stats-json
npx webpack-bundle-analyzer dist/mutual-fund-manager-ui/stats.json
```

## 🚨 Common Issues & Solutions

### Issue 1: 404 on Page Refresh
**Solution**: The `netlify.toml` file includes redirect rules to handle Angular routing.

### Issue 2: API Calls Failing
**Solution**: 
1. Update `environment.prod.ts` with correct API URL
2. Ensure CORS is configured on your backend
3. Check if API supports HTTPS

### Issue 3: Build Fails
**Solution**:
1. Check Node.js version compatibility
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Issue 4: Large Bundle Size
**Solution**:
1. Use lazy loading for feature modules
2. Optimize images and assets
3. Remove unused dependencies

## 📊 Monitoring & Analytics

### Netlify Analytics
- Enable Netlify Analytics in your site dashboard
- Monitor page views, unique visitors, and performance

### Performance Monitoring
- Use Lighthouse CI for continuous performance monitoring
- Monitor Core Web Vitals

## 🔄 Continuous Deployment

### Automatic Deployments
- Every push to your main branch triggers a new deployment
- Preview deployments for pull requests
- Branch deployments for testing

### Deploy Hooks
- Set up webhook URLs for external triggers
- Integrate with your CI/CD pipeline

## 📱 Mobile Optimization

Your app includes:
- ✅ Responsive design
- ✅ Mobile-first approach
- ✅ Touch-friendly interfaces
- ✅ Progressive Web App features

## 🎯 Next Steps After Deployment

1. **Test thoroughly** on the live site
2. **Set up monitoring** and error tracking
3. **Configure analytics** (Google Analytics, etc.)
4. **Set up backups** of your data
5. **Plan for scaling** as your user base grows

## 📞 Support

If you encounter issues:
1. Check Netlify's build logs
2. Review the browser console for errors
3. Verify API connectivity
4. Check environment configuration

---

**🎉 Congratulations!** Your Angular Mutual Fund Manager app is now deployed on Netlify!

**Live URL**: Check your Netlify dashboard for the deployment URL
**Admin Panel**: Access admin features with appropriate credentials
**Mobile App**: Fully responsive and mobile-optimized
