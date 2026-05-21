# Backend Setup for Contact Form

This is the backend server for the portfolio contact form that handles email sending and database storage.

## Requirements

- Node.js (v16 or higher)
- MongoDB (local or Atlas cloud)
- Gmail account (for email sending)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure your `.env` file with:
   - **EMAIL_USER**: Your Gmail address
   - **EMAIL_PASSWORD**: Your Gmail app-specific password (not your regular password)
   - **RECIPIENT_EMAIL**: Your email to receive contact form submissions
   - **MONGODB_URI**: Your MongoDB connection string (or local)
   - **PORT**: Server port (default 3000)

## Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the generated 16-character password
5. Use this as your `EMAIL_PASSWORD` in `.env`

## MongoDB Setup

### Local MongoDB
```bash
# Windows
mongod

# Linux/Mac
brew services start mongodb-community
```

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Copy connection string and add to `.env.example`
4. Format: `mongodb+srv://username:password@cluster.mongodb.net/database-name`

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### POST `/api/contact`
Submit a contact form

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Hello",
  "message": "Your message here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully! Check your email for confirmation.",
  "contactId": "507f1f77bcf86cd799439011"
}
```

### GET `/api/contacts`
Retrieve all contact form submissions (admin endpoint)

## Deployment

### Vercel with MongoDB Atlas

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. The backend can be deployed as a serverless function

### Heroku

```bash
# Create Procfile
echo "web: node server.js" > Procfile

# Deploy
git push heroku main
```

## Frontend Integration

The frontend (Angular) sends requests to `/api/contact`. During development, the Angular dev server should proxy requests to the backend.

For production, ensure the API URL is correctly configured.

## Troubleshooting

- **Email not sending**: Check Gmail app password and 2FA settings
- **MongoDB connection failed**: Verify connection string and network access
- **CORS errors**: Ensure CORS is properly configured in the backend

## Security Notes

- Never commit `.env` file to version control
- Use app-specific passwords for Gmail, not your actual password
- Implement rate limiting for production
- Add authentication for admin endpoints
- Validate all inputs on both frontend and backend
