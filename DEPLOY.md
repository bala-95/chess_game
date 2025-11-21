# Vercel Deployment Quick Start

Your chess game is configured and ready to deploy!

## 🚀 Deploy Now (3 Steps)

### 1. Go to Vercel
Visit: [vercel.com/new](https://vercel.com/new)

### 2. Upload Project
- Click "Browse" or drag project folder
- Or connect GitHub repository

### 3. Configure & Deploy
**Environment Variables** (add these):
```
VITE_SUPABASE_URL = https://ispqbkclerzqebypaial.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzcHFia2NsZXJ6cWVieXBhaWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODc0OTAsImV4cCI6MjA3OTI2MzQ5MH0.fkv6ioRXkj-SRc2DHTNbHp1fvxns88SWZSjBPZrYyR0
GEMINI_API_KEY = AQ.Ab8RN6LoU4Tgpy178iUGR_8YxkzGGKvFPrul40zzMI5Imhhq3A
```

**Settings**:
- Framework: Vite
- Build: `npm run build`  
- Output: `dist`

Click **Deploy** → Done! 🎉

## ✅ What's Configured

- ✅ Vercel serverless functions in `/api`
- ✅ Production build tested
- ✅ API URLs updated for Vercel
- ✅ Environment variables documented

See `walkthrough.md` for detailed guide.
