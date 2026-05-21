# Deploy Backend to Vercel - Complete Guide

## Overview

Your backend is now set up for Vercel serverless deployment. The code has been converted to Vercel's serverless function format.

## Option 1: Separate Vercel Projects (Recommended)

This approach deploys frontend and backend as separate Vercel projects.

### Step 1: Deploy Backend Only

1. **Ensure you have a GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Add portfolio with backend"
   git remote add origin https://github.com/YOUR_USERNAME/my_portfolio.git
   git branch -M main
   git push -u origin main
   ```

2. **Create backend directory structure** (Already done):
   - `backend/api/contact.js` ✅
   - `backend/package.json` ✅

3. **Push to GitHub** with both frontend and backend code

4. **Create separate folder for backend-only deployment:**
   ```bash
   mkdir my_portfolio_backend
   cd my_portfolio_backend
   mkdir api
   ```

5. **Copy backend files:**
   ```bash
   cp backend/api/contact.js api/
   cp backend/package.json .
   ```

6. **Create vercel.json in backend directory:**
   ```json
   {
     "buildCommand": "npm install",
     "functions": {
       "api/*.js": {
         "runtime": "nodejs18.x"
       }
     },
     "env": [
       "MONGODB_URI",
       "EMAIL_USER",
       "EMAIL_PASSWORD",
       "RECIPIENT_EMAIL"
     ]
   }
   ```

7. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your repository
   - Select the `my_portfolio_backend` folder as root
   - Add environment variables
   - Deploy

### Step 2: Update Frontend API URL

Once backend is deployed on Vercel, update the API URL in Angular:

**Edit `src/app/shared/services/contact.service.ts`:**
```typescript
private apiUrl = 'https://your-backend.vercel.app/api/contact';
```

Replace `your-backend.vercel.app` with your actual Vercel backend URL.

## Option 2: Monorepo Deployment (Single Vercel Project)

Deploy both frontend and backend from the same repository.

### Step 1: Update Root vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/package.json",
      "use": "@vercel/node"
    },
    {
      "src": "angular.json",
      "use": "@angular-builders/express:build"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/api/$1.js"
    },
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com/import
2. Import your GitHub repository
3. Select root directory
4. Add environment variables
5. Deploy

## Environment Variables Setup

1. **Go to Vercel Dashboard**
2. **Select your project → Settings → Environment Variables**
3. **Add these variables:**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio-contacts
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
RECIPIENT_EMAIL=your_email@example.com
NODE_ENV=production
```

## Getting Gmail App Password

1. Enable 2FA: https://myaccount.google.com/security
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password
5. Use as `EMAIL_PASSWORD` in Vercel

## MongoDB Atlas Setup (Cloud Database)

1. **Visit:** https://www.mongodb.com/cloud/atlas
2. **Create free cluster:**
   - Sign up or login
   - Create a new cluster (M0 free tier)
   - Choose your region
3. **Get connection string:**
   - Click "Connect"
   - Select "Drivers"
   - Copy the connection string
4. **Replace placeholders:**
   ```
   mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/portfolio-contacts
   ```
5. **Add to Vercel environment variables as `MONGODB_URI`**

## Testing Deployment

### Test Backend API

```bash
# Using curl
curl -X POST https://your-backend.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test",
    "message": "This is a test message for deployment"
  }'
```

### Expected Response

```json
{
  "success": true,
  "message": "Message sent successfully! Check your email for confirmation.",
  "contactId": "507f1f77bcf86cd799439011"
}
```

## Frontend Configuration for Production

**Update `src/app/shared/services/contact.service.ts`:**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  contactId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  // Production: Use your Vercel backend URL
  private apiUrl = 'https://your-backend.vercel.app/api/contact';
  
  // Development: Use local proxy
  // private apiUrl = '/api/contact';

  constructor(private http: HttpClient) {
    // Auto-detect environment
    if (this.isProduction()) {
      this.apiUrl = 'https://your-backend.vercel.app/api/contact';
    }
  }

  submitContact(data: ContactFormData): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.apiUrl, data);
  }

  private isProduction(): boolean {
    return !window.location.hostname.includes('localhost');
  }
}
```

## Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**
2. **Click "New Project"**
3. **Import your repository**
4. **Configure:**
   - Framework: Angular
   - Build Command: `ng build --configuration production`
   - Output Directory: `dist/portfolio/browser`
5. **Deploy**

## Troubleshooting

### CORS Errors
- Backend already has CORS enabled
- Check environment variables are set correctly

### Database Connection Failed
- Verify MongoDB URI is correct
- Check network access in MongoDB Atlas
- Ensure IP is whitelisted (use 0.0.0.0/0 for development)

### Email Not Sending
- Verify app password (not regular password)
- Check 2FA is enabled
- Verify email addresses in environment variables

### Function Timeout
- MongoDB connection pooling enabled
- May need to increase timeout in Vercel settings

## Vercel Environment Limits

- **Function timeout:** 10 seconds (Pro) / 60 seconds (Enterprise)
- **Memory:** 3GB
- **File size:** 50MB

These should be sufficient for contact form submissions.

## Cost

- **Vercel:** Free tier includes serverless functions
- **MongoDB Atlas:** Free tier includes up to 512MB storage
- **Email (Gmail):** Free via app password

## Security Checklist

- [ ] Environment variables set in Vercel (not in .env)
- [ ] Email password is app-specific password
- [ ] MongoDB has network access restricted (or allow all for testing)
- [ ] CORS properly configured
- [ ] Input validation on backend
- [ ] Rate limiting recommended for production

## Next Steps

1. ✅ Backend code ready for Vercel
2. ⬜ Set up GitHub repository
3. ⬜ Connect to Vercel
4. ⬜ Add environment variables
5. ⬜ Deploy backend
6. ⬜ Update frontend API URL
7. ⬜ Deploy frontend
8. ⬜ Test contact form end-to-end

## Helpful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Node.js Runtime](https://vercel.com/docs/runtimes/node)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

## Support

For issues:
1. Check Vercel Logs: Dashboard → Project → Deployments → Runtime Logs
2. Check MongoDB Atlas logs
3. Test locally first with `npm run dev`
4. Verify all environment variables are set

---

**Backend Ready for Production! 🚀**
