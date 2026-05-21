# Contact Form Setup Guide

## Overview
The contact form has been integrated with:
- **Email sending** via Gmail SMTP
- **Database storage** using MongoDB
- **Form validation** on both frontend and backend
- **User confirmations** sent to submitter's email

## System Components

### Frontend (Angular)
- Reactive form with real-time validation
- Error messages for each field
- Success/error feedback after submission
- Disabled submit button while processing

### Backend (Node.js/Express)
- API endpoint: `POST /api/contact`
- Email sending service (Nodemailer)
- MongoDB storage for contact data
- Input validation on server-side
- Automatic confirmation emails

## Quick Start

### 1. Backend Setup

Navigate to the backend folder:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Configure your `.env` with:
```
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
RECIPIENT_EMAIL=your_email@example.com
MONGODB_URI=mongodb://localhost:27017/portfolio-contacts
PORT=3000
NODE_ENV=development
```

### 2. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Windows: Download and install from https://www.mongodb.com/try/download/community

# Mac (with Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Visit https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

### 3. Gmail Configuration

1. Enable 2-Factor Authentication: https://myaccount.google.com/security
2. Generate app password: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password
5. Add to `.env` as `EMAIL_PASSWORD`

### 4. Start the Backend

From the `backend` folder:
```bash
npm run dev
```

You should see:
```
Server running on port 3000
```

### 5. Start the Frontend

From the root folder (in a new terminal):
```bash
npm start
```

The app will open at `http://localhost:4200` with API proxy to backend.

## Form Validation Rules

### Frontend Validation
- **Name**: Required, minimum 2 characters
- **Email**: Required, valid email format
- **Subject**: Required, minimum 5 characters
- **Message**: Required, minimum 10 characters

### Backend Validation
- All fields required
- Email format validated with regex
- Message length minimum 10 characters
- Duplicate submission check (optional)

## Email Flow

### When user submits the form:

1. **Frontend validation** - Real-time error checking
2. **Submit to backend** - POST to `/api/contact`
3. **Backend validation** - Server-side checks
4. **Database save** - Contact stored in MongoDB
5. **Admin email** - You receive the contact info
6. **User confirmation** - Sender receives confirmation email
7. **Frontend feedback** - Success message displayed

## File Structure

```
portfolio/
├── src/
│   ├── app/
│   │   └── pages/
│   │       └── home/
│   │           ├── home.ts (updated with form logic)
│   │           └── home.html (updated with form template)
│   └── shared/
│       └── services/
│           └── contact.service.ts (new)
├── backend/
│   ├── server.js (API server)
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── proxy.conf.json (API proxy config)
└── angular.json (updated with proxy)
```

## Testing the Form

1. Navigate to http://localhost:4200
2. Scroll to Contact section
3. Fill in the form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Subject: "Test Subject"
   - Message: "This is a test message"
4. Click "Send Message"
5. Check for success message
6. Check your email (both admin email and test email)

## Database Collections

### Contact Collection
```json
{
  "_id": ObjectId,
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry",
  "message": "Your message here",
  "createdAt": ISODate,
  "status": "new" | "read" | "replied"
}
```

## Troubleshooting

### Email not sending
- Check 2FA is enabled on Gmail
- Verify app password (not regular password)
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Try allowing "Less secure apps" (if not using app password)

### MongoDB connection failed
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access (for Atlas)
- Check database name spelling

### Form not submitting
- Check backend is running on port 3000
- Open browser console (F12) for errors
- Verify proxy.conf.json is correct
- Restart `ng serve` to apply proxy config

### CORS errors
- Backend should automatically handle with `cors` package
- Check backend is using `app.use(cors())`

## Production Deployment

### Frontend (Vercel/Netlify)
```bash
ng build --configuration production
```

### Backend Options

**Option 1: Heroku**
```bash
git push heroku main
```

**Option 2: AWS Lambda**
- Convert to serverless format
- Deploy with AWS API Gateway

**Option 3: DigitalOcean/linode**
- Deploy as Node.js app
- Use MongoDB Atlas for database

### Environment Variables for Production
Set these in your hosting platform:
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `RECIPIENT_EMAIL`
- `MONGODB_URI`
- `NODE_ENV=production`

## Next Steps

1. ✅ Backend setup complete
2. ✅ Frontend form integrated
3. ⬜ Deploy backend to production
4. ⬜ Deploy frontend to production
5. ⬜ Add admin dashboard to view submissions
6. ⬜ Implement rate limiting
7. ⬜ Add email templates

## Security Checklist

- [ ] Store `.env` securely (never in git)
- [ ] Use environment variables in production
- [ ] Implement rate limiting for form submissions
- [ ] Validate all inputs on backend
- [ ] Use HTTPS for all communications
- [ ] Consider CAPTCHA for spam prevention
- [ ] Sanitize email content to prevent injection
- [ ] Add authentication for admin endpoints

## Support

For issues or questions, check:
- Backend logs in terminal
- Browser console (F12)
- Network tab in DevTools
- MongoDB logs

---

**Backend Ready!** 🚀
The contact form is now fully functional with email sending and database storage.
