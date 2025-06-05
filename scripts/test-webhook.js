// Test script for webhook endpoint
import crypto from 'crypto';

const WEBHOOK_URL = 'http://localhost:3000/api/payment/webhook';
const WEBHOOK_SECRET = 'whsec_BillMeNow2024_WebhookSecret_K8mN2pQ5rT9uW3xZ7vB6eF1gH4jL8sM2';

// Sample webhook payload from Razorpay
const samplePayload = {
  "entity": "event",
  "account_id": "acc_test_account",
  "event": "payment.captured",
  "contains": ["payment"],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_test_payment_123",
        "entity": "payment",
        "amount": 50000,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_test_order_123",
        "invoice_id": null,
        "international": false,
        "method": "card",
        "amount_refunded": 0,
        "refund_status": null,
        "captured": true,
        "description": "Test Payment",
        "card_id": "card_test_card_123",
        "bank": null,
        "wallet": null,
        "vpa": null,
        "email": "test@example.com",
        "contact": "+919876543210",
        "notes": [],
        "fee": 1180,
        "tax": 180,
        "error_code": null,
        "error_description": null,
        "error_source": null,
        "error_step": null,
        "error_reason": null,
        "acquirer_data": {
          "auth_code": "123456"
        },
        "created_at": Math.floor(Date.now() / 1000)
      }
    }
  },
  "created_at": Math.floor(Date.now() / 1000)
};

async function testWebhook() {
  try {
    console.log('🧪 Testing Webhook Endpoint...\n');
    
    const body = JSON.stringify(samplePayload);
    
    // Generate signature
    const signature = crypto.createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    console.log('📤 Sending webhook request...');
    console.log('URL:', WEBHOOK_URL);
    console.log('Signature:', signature);
    console.log('Body length:', body.length);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature
      },
      body: body
    });
    
    const responseText = await response.text();
    
    console.log('\n📥 Response received:');
    console.log('Status:', response.status);
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('❌ Webhook test failed!');
    }
    
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your Next.js server is running:');
      console.log('   npm run dev');
    }
  }
}

// Test with invalid JSON
async function testInvalidJSON() {
  try {
    console.log('\n🧪 Testing Invalid JSON...\n');
    
    const invalidBody = '{"invalid": json}'; // Invalid JSON
    
    const signature = crypto.createHmac('sha256', WEBHOOK_SECRET)
      .update(invalidBody)
      .digest('hex');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature
      },
      body: invalidBody
    });
    
    const responseText = await response.text();
    
    console.log('📥 Invalid JSON Response:');
    console.log('Status:', response.status);
    console.log('Response:', responseText);
    
  } catch (error) {
    console.error('Error testing invalid JSON:', error.message);
  }
}

// Run tests
console.log('🚀 Starting Webhook Tests...\n');
await testWebhook();
await testInvalidJSON();
