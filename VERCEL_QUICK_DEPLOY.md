# Quick Vercel Deployment Steps

## 🚀 Deploy Backend in 5 Minutes

### Prerequisites
- GitHub account
- Vercel account (free)
- MongoDB Atlas account (free)
- Gmail account with 2FA enabled

---

## Step 1: Prepare Your Code (2 min)

### Push to GitHub

```bash
cd d:\Github\my_portfolio-

# Initialize git (if not already done)
git init
git add .
git commit -m "Add portfolio with contact form backend"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/my_portfolio-.git
git branch -M main
git push -u origin main
```

---

## Step 2: Setup MongoDB (1 min)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create a free cluster:
   - Click "Create Deployment"
   - Select "M0 Free" tier
   - Choose your region (closest to you)
   - Click "Create"
4. Wait for cluster to be created (2-3 minutes)
5. Click "Connect" button:
   - Select "Drivers"
   - Copy the connection string
   - It will look like: `mongodb+srv://username:password@cluster.mongodb.net/...`
6. Keep this string saved for later

---

## Step 3: Setup Gmail App Password (1 min)

1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled
3. Go to: https://myaccount.google.com/apppasswords
4. Select:
   - App: "Mail"
   - Device: "Windows Computer"
5. Google will generate a 16-character password
6. **Copy this password** - use it as EMAIL_PASSWORD later

---

## Step 4: Deploy to Vercel (1 min)

### Option A: Recommended - Separate Backend Project

1. Go to: https://vercel.com
2. Log in with GitHub
3. Click "Add New..." → "Project"
4. Select your GitHub repository
5. Click "Select as Root Directory" and choose `backend`
6. Click "Environment Variables" and add:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/portfolio-contacts
EMAIL_USER = your_gmail@gmail.com
EMAIL_PASSWORD = your_16_char_password
RECIPIENT_EMAIL = your_email@example.com
NODE_ENV = production
```

7. Click "Deploy"
8. Wait for deployment to complete
9. **Copy your Vercel URL** (e.g., `https://my-portfolio-backend.vercel.app`)

### Option B: Combined Frontend + Backend

1. Go to Vercel
2. Create new project from your repository
3. Change root to root directory (not `backend`)
4. Use the `vercel.json` in root directory
5. Add all environment variables
6. Deploy

---

## Step 5: Update Frontend (30 sec)

Edit `src/app/shared/services/contact.service.ts`:

```typescript
private apiUrl = 'https://your-vercel-url.vercel.app/api/contact';
```

Replace `your-vercel-url` with your actual Vercel URL from Step 4.

---

## Step 6: Deploy Frontend (1 min)

1. Go to Vercel
2. Create new project from repository
3. Framework: Angular
4. Build Command: `ng build --configuration production`
5. Output: `dist/portfolio/browser`
6. Deploy

---

## 🎉 Done! Test Your Setup

1. Open your portfolio URL
2. Scroll to Contact section
3. Fill in the form:
   - Name: Your name
   - Email: test@example.com
   - Subject: Test Message
   - Message: This is a test submission
4. Click "Send Message"
5. Check your email for:
   - **Admin email** (your email) - received the contact
   - **User confirmation** (test@example.com) - confirmation of submission

---

## Environment Variables Reference

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas > Connect > Drivers |
| `EMAIL_USER` | `yourname@gmail.com` | Your Gmail address |
| `EMAIL_PASSWORD` | `16-char code` | Gmail > App Passwords |
| `RECIPIENT_EMAIL` | `your@email.com` | Your email to receive forms |
| `NODE_ENV` | `production` | Type manually |

---

## Troubleshooting

### "Connection failed to MongoDB"
- ❌ MongoDB URI is incorrect
- ✅ Check MongoDB Atlas connection string
- ✅ Add `/portfolio-contacts` to end of URI
- ✅ Whitelist all IPs in MongoDB (0.0.0.0/0)

### "Email not sending"
- ❌ Wrong email password
- ✅ Use app-specific password, not Gmail password
- ✅ Ensure 2FA is enabled
- ✅ Check EMAIL_USER matches your Gmail

### "404 API not found"
- ❌ API URL in contact.service.ts is wrong
- ✅ Use your exact Vercel URL
- ✅ Verify URL ends with `/api/contact`

### "Function timeout"
- MongoDB is still connecting
- Wait a bit and try again
- May need to upgrade MongoDB

---

## Commands to Remember

```bash
# Test backend locally
npm run backend:dev

# Build frontend
npm run build

# Deploy from CLI
vercel deploy --prod
```

---

## Next: Advanced Setup

Once working, consider adding:
- Rate limiting (prevent spam)
- reCAPTCHA (additional spam protection)
- Email templates
- Admin dashboard

---

**You did it! 🎉 Your portfolio is now live with a working contact form!**
