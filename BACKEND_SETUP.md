# BillMeNow Backend Setup Guide

## Overview

BillMeNow is a comprehensive invoice management system with database integration, payment processing, email notifications, and admin functionality. This guide will help you set up the complete backend infrastructure.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local installation or MongoDB Atlas account)
3. **Razorpay Account** (for payment processing)
4. **Email Service** (Gmail with App Password or other SMTP provider)

## Installation Steps

### 1. Clone and Install Dependencies

```bash
cd d:\billmenow
npm install
```

### 2. Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your configuration:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/billmenow
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/billmenow

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FROM_EMAIL=your-email@gmail.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# File Upload Configuration
UPLOAD_MAX_SIZE=5242880
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Admin Configuration
ADMIN_EMAIL=admin@billmenow.com
ADMIN_PASSWORD=admin123

# Environment
NODE_ENV=development
```

### 3. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. Create database: `billmenow`

#### Option B: MongoDB Atlas (Recommended for Production)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env.local`

### 4. Email Configuration (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password in `SMTP_PASS`

### 5. Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com)
2. Get API keys from Dashboard
3. Update environment variables
4. Configure webhook URL: `https://yourdomain.com/api/payment/webhook`

### 6. Database Seeding

Seed the database with initial data:

```bash
npm run seed
```

This creates:
- Admin user: `admin@billmenow.com` / `admin123`
- Demo user: `demo@example.com` / `demo123`
- Sample clients, invoices, and payments

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### Client Management
- `GET /api/clients` - List clients (with pagination)
- `POST /api/clients` - Create client
- `GET /api/clients/[id]` - Get client details
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

### Invoice Management
- `GET /api/invoices` - List invoices (with filters)
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice details
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice

### Payment Processing
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
- `POST /api/payment/webhook` - Razorpay webhook handler

### Email Service
- `POST /api/email/send` - Send emails (invoice, reminder, etc.)

### Dashboard & Analytics
- `GET /api/dashboard` - User dashboard data
- `GET /api/reports` - Generate reports

### User Profile
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile

### Admin APIs
- `GET /api/admin/dashboard` - Admin analytics
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/[id]` - Get user details
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

## Database Models

### User Schema
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  businessName: String,
  phone: String,
  address: String,
  gstin: String,
  isEmailVerified: Boolean,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}
```

### Client Schema
```javascript
{
  name: String,
  email: String,
  phone: String,
  address: String,
  gstin: String,
  userId: ObjectId (ref: User)
}
```

### Invoice Schema
```javascript
{
  invoiceNumber: String,
  clientId: ObjectId (ref: Client),
  userId: ObjectId (ref: User),
  items: [{ description, quantity, rate, amount }],
  subtotal: Number,
  taxRate: Number,
  taxAmount: Number,
  totalAmount: Number,
  status: String (draft/pending/paid/overdue/cancelled),
  issueDate: Date,
  dueDate: Date,
  paidAt: Date,
  paidAmount: Number,
  notes: String
}
```

### Payment Schema
```javascript
{
  invoiceId: ObjectId (ref: Invoice),
  userId: ObjectId (ref: User),
  clientId: ObjectId (ref: Client),
  amount: Number,
  status: String (pending/completed/failed),
  paymentMethod: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  transactionDate: Date
}
```

## Features Implemented

### ✅ Core Features
- **User Authentication** - Registration, login, password reset
- **Client Management** - CRUD operations with validation
- **Invoice Management** - Create, edit, delete invoices
- **Payment Integration** - Razorpay payment gateway
- **Email Notifications** - Invoice delivery, reminders, confirmations
- **Dashboard Analytics** - Revenue tracking, client statistics
- **Report Generation** - Revenue, client, invoice reports

### ✅ Advanced Features
- **Admin Panel** - User management, system analytics
- **Webhook Processing** - Automated payment status updates
- **Database Relationships** - Proper foreign key constraints
- **Input Validation** - Comprehensive data validation
- **Error Handling** - Standardized error responses
- **Security** - JWT authentication, password hashing
- **Pagination** - Efficient data loading
- **Search & Filters** - Advanced query capabilities

## Security Features

1. **Password Hashing** - bcryptjs with salt rounds
2. **JWT Tokens** - Secure session management
3. **Input Validation** - Comprehensive request validation
4. **CORS Protection** - Cross-origin request security
5. **Rate Limiting** - API rate limiting preparation
6. **Webhook Verification** - Razorpay signature validation

## Production Deployment

### 1. Environment Variables
Update all environment variables for production:
- Use strong JWT secrets
- Configure MongoDB Atlas
- Set up production email service
- Update Razorpay to live mode

### 2. Database
- Use MongoDB Atlas for production
- Set up database backups
- Configure connection pooling

### 3. Email Service
- Consider using SendGrid, Mailgun, or AWS SES
- Set up email templates
- Configure DKIM/SPF records

### 4. Monitoring
- Set up application monitoring
- Configure error tracking
- Implement logging

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB service is running
   - Verify connection string
   - Check network connectivity

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check Gmail app password
   - Ensure 2FA is enabled

3. **Payment Webhook Issues**
   - Check webhook URL configuration
   - Verify Razorpay webhook secret
   - Test webhook locally with ngrok

4. **JWT Token Issues**
   - Ensure JWT_SECRET is set
   - Check token expiration
   - Verify token format

### Development Tools

- **MongoDB Compass** - Database GUI
- **Postman** - API testing
- **ngrok** - Webhook testing
- **nodemon** - Auto-restart development server

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Test with provided demo data
4. Check browser console for errors

## Next Steps

1. **Frontend Integration** - Connect React components to APIs
2. **File Upload System** - Invoice attachments
3. **Advanced Reporting** - More analytics features
4. **Mobile App** - React Native application
5. **Multi-tenant Support** - Multiple businesses per user

---

**Note**: This backend provides a complete foundation for the BillMeNow application with all major features implemented and tested.
