# Vercel Deployment Guide

## ✅ Issues Fixed for Vercel Deployment

### 1. **Vite Config Updated**
**Problem:** `import.meta.dirname` is Node 20.11+ only
**Fix:** Using `fileURLToPath` for compatibility
```typescript
// OLD (breaks on older Node)
const __dirname = import.meta.dirname;

// NEW (works on Node 18+)
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

### 2. **Node Version Specified**
Added to package.json:
```json
"engines": {
  "node": ">=18.0.0"
}
```

### 3. **Build Verified**
- ✅ Build completes successfully
- ✅ Output directory: `/dist/public`
- ✅ All assets generated correctly
- ✅ index.html created properly

---

## 📦 Vercel Configuration

Your `vercel.json` is already correct:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/:path((?!.*\\.).*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🚀 Deployment Steps

### Option 1: Deploy from Vercel Dashboard
1. Go to https://vercel.com
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect Vite
5. Click "Deploy"

### Option 2: Deploy with Vercel CLI
```bash
npm install -g vercel
cd /path/to/your/project
vercel
```

---

## 🔍 If Blank Page Issues Persist

### Check Browser Console
1. Open your deployed site
2. Press F12 to open DevTools
3. Check Console tab for errors
4. Check Network tab for failed requests

### Common Issues & Fixes

**1. Environment Variables Missing**
If you see wallet connection errors:
- Add `VITE_WALLETCONNECT_PROJECT_ID` to Vercel environment variables
- Get your Project ID from: https://cloud.walletconnect.com
- Set in Vercel: Project Settings → Environment Variables

**2. Base Path Issues**
If assets 404:
- Check that all imports use relative paths
- Verify `base` in vite.config.ts matches your domain

**3. RPC Connection Fails**
- ARC Testnet RPC: `https://rpc.testnet.arc.network`
- Ensure RPC is accessible from browser (not blocked)

---

## ✅ No Emergent Dependencies

Your project is clean and has **ZERO Emergent-specific dependencies**:
- ✅ No Emergent imports
- ✅ No Emergent APIs
- ✅ All packages are standard npm packages
- ✅ Uses public RPCs only
- ✅ Standard Vite + React + Wagmi setup

---

## 📊 Build Stats

```
Build Output: /dist/public
Bundle Size: ~1.4MB (main chunk)
Assets: Properly chunked
HTML: Generated correctly
Favicon: Included
Images: Copied to dist
```

---

## 🔧 Troubleshooting Blank Page

If you still see a blank page after deployment:

### 1. Check Build Logs on Vercel
Look for:
- Build errors
- Missing dependencies
- TypeScript errors

### 2. Check Runtime Errors
In browser console:
- Module not found errors → Check imports
- Syntax errors → Check browser compatibility
- Network errors → Check RPC/API endpoints

### 3. Verify Environment
```bash
# Test build locally
npm run build
npm run start

# Open http://localhost:5000
# If it works locally, deployment should work
```

### 4. Check Vercel Settings
- Build Command: `npm run build` ✅
- Output Directory: `dist/public` ✅
- Install Command: `npm install` ✅
- Node Version: 18.x or 20.x ✅

---

## 🎯 What's Included

**Working Features:**
- ✅ V2 Swap
- ✅ V3 Swap (multi-hop)
- ✅ V2 Add/Remove Liquidity
- ✅ V3 Add/Remove Liquidity
- ✅ V2 → V3 Migration
- ✅ Pools page (V2 + V3)
- ✅ Smart routing
- ✅ Contract verification
- ✅ Wallet connection (RainbowKit)

**All Standard Dependencies:**
- Vite
- React
- Wagmi
- RainbowKit
- Ethers.js
- Radix UI
- Tailwind CSS

---

## 📝 Next Steps

1. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

2. **Add WalletConnect Project ID**
   - Get from: https://cloud.walletconnect.com
   - Add to Vercel environment variables
   - Redeploy

3. **Test Live Site**
   - Connect wallet
   - Try a V2 swap
   - Try a V3 swap
   - Check all pages load

4. **Monitor**
   - Check Vercel Analytics
   - Monitor RPC calls
   - Check error logs

---

## 🆘 Still Having Issues?

If blank page persists:

1. **Share the Vercel deployment URL** - I can check what's wrong
2. **Share browser console errors** - Screenshot the errors
3. **Check Vercel build logs** - Look for any red errors
4. **Verify DNS** - Make sure domain resolves correctly

The app builds successfully and has no Emergent dependencies. Any blank page issue would be from:
- Missing environment variables
- RPC connection issues
- Browser console errors (check DevTools)
- Vercel configuration mismatch

---

*Your app is ready for production deployment!*
