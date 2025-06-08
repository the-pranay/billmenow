# 🔗 Razorpay Webhook Configuration Guide

## ✅ **Current Configuration**

### **Webhook Secret**
```bash
RAZORPAY_WEBHOOK_SECRET=u"peTNx*^S'9;ng
```

### **Configured Events**
Your webhook is configured to handle these 7 events:

1. ✅ **payment.authorized** - Payment authorized but not captured
2. ✅ **payment.captured** - Payment successfully captured/completed
3. ✅ **payment.failed** - Payment processing failed
4. ✅ **order.paid** - Order fully paid (all payments received)
5. ✅ **refund.created** - Refund initiated
6. ✅ **refund.processed** - Refund successfully processed
7. ✅ **refund.failed** - Refund processing failed

### **Webhook URL**
```
Production: https://billmenow.vercel.app/api/payment/webhook
Development: http://localhost:3000/api/payment/webhook
```

---

## 🔧 **Razorpay Dashboard Setup**

### **Step 1: Navigate to Webhooks**
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** → **Webhooks**
3. Click **"+ Create Webhook"**

### **Step 2: Configure Webhook**
```
Webhook URL: https://billmenow.vercel.app/api/payment/webhook
Active: ✅ Yes
Secret: u"peTNx*^S'9;ng
```

### **Step 3: Select Events**
Check these events in Razorpay dashboard:
- ✅ payment.authorized
- ✅ payment.captured  
- ✅ payment.failed
- ✅ order.paid
- ✅ refund.created
- ✅ refund.processed
- ✅ refund.failed

---

## 📊 **Event Flow & Handling**

### **Payment Flow**
```
1. payment.authorized → Payment authorized (awaiting capture)
2. payment.captured → Payment completed successfully
3. order.paid → Order fully paid confirmation
```

### **Failure Flow**
```
payment.failed → Payment processing failed
```

### **Refund Flow**
```
1. refund.created → Refund initiated
2. refund.processed → Refund completed successfully
3. refund.failed → Refund processing failed
```

---

## 🔍 **What Each Event Does**

### **payment.authorized**
- Updates payment status to 'authorized'
- Records authorization timestamp
- Saves Razorpay response data

### **payment.captured**
- Updates payment status to 'completed'
- Marks invoice as 'paid'
- Records payment amount and timestamp
- 📧 **Sends payment confirmation email**

### **payment.failed**
- Updates payment status to 'failed'
- Reverts invoice status to 'sent'
- Records failure reason and error details

### **order.paid**
- Confirms order is fully paid
- Updates all associated payments to 'completed'
- Marks invoice as 'paid'

### **refund.created**
- Records refund initiation
- Updates payment record with refund details
- Updates invoice status (full/partial refund)

### **refund.processed**
- Confirms refund completion
- Updates refund status to 'processed'
- 📧 **Sends refund confirmation email**

### **refund.failed**
- Records refund failure
- Updates refund status to 'failed'
- Logs failure reason and error details

---

## 🧪 **Testing Your Webhook**

### **Run Test Script**
```bash
cd d:\billmenow
node test-webhook-events.js
```

### **Manual Testing via Razorpay Dashboard**
1. Go to **Settings** → **Webhooks**
2. Click on your webhook
3. Click **"Test Webhook"**
4. Select event type and send test payload

### **Using ngrok for Local Testing**
```bash
# Install ngrok
npm install -g ngrok

# Start your app
npm run dev

# In another terminal
ngrok http 3000

# Update webhook URL in Razorpay to ngrok URL
https://abc123.ngrok.io/api/payment/webhook
```

---

## 📧 **Email Notifications**

### **Automated Emails Sent**
1. **Payment Confirmation** (on payment.captured)
   - To: Customer email
   - Template: Thank you email
   - Contains: Payment details, transaction ID

2. **Refund Confirmation** (on refund.processed)
   - To: Customer email
   - Template: Custom refund email
   - Contains: Refund amount, refund ID

---

## 🔐 **Security Features**

### **Signature Verification**
- Every webhook request is verified using HMAC SHA256
- Invalid signatures are rejected with 400 status
- Protects against unauthorized webhook calls

### **Error Handling**
- Comprehensive try-catch blocks
- Detailed logging for debugging
- Graceful failure handling

---

## 📝 **Database Updates**

### **Payment Table**
- Status updates (authorized → captured → completed)
- Timestamps for each status change
- Razorpay response data storage
- Refund information tracking

### **Invoice Table**
- Status updates (sent → paid → refunded)
- Payment timestamps
- Paid amount tracking
- Refund status tracking

---

## 🚀 **Production Checklist**

### **Before Going Live**
- [ ] Update webhook URL to production domain
- [ ] Switch Razorpay to Live Mode
- [ ] Update environment variables with live keys
- [ ] Test all webhook events in live mode
- [ ] Verify email notifications work
- [ ] Monitor webhook logs

### **Live Environment Variables**
```bash
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
RAZORPAY_WEBHOOK_SECRET=u"peTNx*^S'9;ng
NEXT_PUBLIC_APP_URL=https://billmenow.vercel.app
```

---

## 🔧 **Troubleshooting**

### **Common Issues**
1. **Invalid Signature Error**
   - Check webhook secret matches exactly
   - Verify signature generation logic

2. **Webhook Not Triggered**
   - Confirm webhook URL is accessible
   - Check Razorpay dashboard webhook logs

3. **Database Not Updated**
   - Verify payment records exist
   - Check MongoDB connection

### **Debug Webhook**
```javascript
// Add to webhook handler for debugging
console.log('Webhook Debug:', {
  event: event.event,
  signature: signature,
  expected: expectedSignature,
  body: body.substring(0, 100)
});
```

---

## 📊 **Monitoring & Logs**

### **What to Monitor**
- Webhook success/failure rates
- Payment completion rates
- Refund processing times
- Email delivery status

### **Log Locations**
- Server logs: Application console
- Razorpay logs: Dashboard → Webhooks → Logs
- Database logs: MongoDB Atlas logs

Your webhook configuration is now complete and ready for production! 🎉
