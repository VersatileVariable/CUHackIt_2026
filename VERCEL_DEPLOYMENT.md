# ClearPath AR - Vercel Deployment Guide

## Why Vercel?

**Meta Quest 3 requires HTTPS for microphone permissions!**

- **Automatic HTTPS** - No SSL certificate setup required
- **Instant deployment** - Live in seconds
- **Free tier** - Perfect for hackathons and demos
- **Quest compatible** - Proper headers for WebXR and microphone access
- **Fast CDN** - Global edge network for low latency

---

## Quick Deployment (3 Steps)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser - sign in with GitHub, GitLab, or email.

### Step 3: Deploy

```bash
vercel
```

**That's it!** Vercel will:
- Detect your project
- Upload all files
- Configure HTTPS automatically
- Give you a live URL like `https://clearpath-ar.vercel.app`

---

## Deployment Options

### Option A: One-Command Deploy (Recommended)

```bash
vercel --prod
```

- Deploys directly to production
- Gets your final URL immediately
- Perfect for demos and hackathon presentations

### Option B: Preview Deploy First

```bash
vercel          # Deploy to preview URL first
vercel --prod   # Promote to production when ready
```

---

## What Happens After Deploy?

You'll get a URL like:
```
Production: https://clearpath-ar-xyz123.vercel.app
```

### Access on Quest 3:

1. Open Quest Browser
2. Go to your Vercel URL
3. Click "Start Speech Recognition"
4. **Browser will prompt for microphone permission**
5. Allow microphone access
6. Enjoy live captions and AR features!

---

## Updating Your Deployment

After making changes:

```bash
vercel --prod
```

Vercel automatically:
- Detects changes
- Redeploys in seconds
- Updates your production URL

---

## Troubleshooting

### "Command not found: vercel"

Install Node.js first:
```bash
# macOS
brew install node

# Or download from https://nodejs.org/
```

Then install Vercel CLI:
```bash
npm install -g vercel
```

### "Build failed" or "No outputs"

Your project is static HTML/JS, so this shouldn't happen. If it does:
```bash
vercel --debug
```

### Microphone still not working?

1. **Check browser console** - Look for permission errors
2. **Try incognito mode** - Sometimes cached permissions cause issues
3. **Check Quest Settings** → Browser → Site Settings → Permissions
4. **Make sure you're using HTTPS URL** - Not HTTP

---

## Custom Domain (Optional)

Want `clearpath.yourdomain.com` instead of `.vercel.app`?

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Settings" → "Domains"
4. Add your custom domain
5. Update DNS as instructed

---

## Environment Variables (If Needed Later)

For API keys or configs:

```bash
vercel env add OPENAI_API_KEY
```

Then access in code:
```javascript
const apiKey = process.env.OPENAI_API_KEY;
```

---

## CI/CD with GitHub (Optional)

For automatic deployments:

1. Push your code to GitHub
2. Import project on https://vercel.com/new
3. Every git push = automatic deployment!

---

## Vercel CLI Commands Cheat Sheet

```bash
vercel                    # Deploy to preview
vercel --prod            # Deploy to production
vercel ls                # List deployments
vercel inspect <url>     # Get deployment details
vercel logs <url>        # View logs
vercel rm <url>          # Remove deployment
vercel domains ls        # List domains
```

---

## Cost

**Free tier includes:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Perfect for hackathons!

---

## Support

- Vercel Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Status: https://vercel-status.com

---

## Quick Tips for Hackathon Demo

1. **Deploy early** - Don't wait until last minute
2. **Test on Quest** - After deploying, immediately test on Quest 3
3. **Share preview URLs** - Send judges/teammates the Vercel URL
4. **Keep local backup** - Keep `./deploy.sh` for offline testing
5. **Use custom domain** - Looks more professional to judges

---

## Your Production URL

After running `vercel --prod`, your ClearPath AR app will be live at:

```
https://your-project-name.vercel.app
```

Share this URL with:
- Judges
- Teammates
- Your Quest 3 browser
- Anyone who wants to try ClearPath!

**No more permission issues - HTTPS automatically enables microphone access!**
