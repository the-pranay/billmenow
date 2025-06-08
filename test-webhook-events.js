// Test script for Razorpay webhook events
import fetch from 'node-fetch';
import crypto from 'crypto';

const WEBHOOK_URL = 'http://localhost:3000/api/payment/webhook'; // Change to your actual URL
const WEBHOOK_SECRET = 'u"peTNx*^S\'9;ng';

// Test event payloads for all configured events
const testEvents = {
  'payment.authorized': {
    event: 'payment.authorized',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_auth_123456789',
          amount: 50000, // ₹500 in paise
          currency: 'INR',
          status: 'authorized',
          order_id: 'order_test_123456789',
          method: 'card',
          description: 'Test payment authorization',
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  },

  'payment.captured': {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_captured_123456789',
          amount: 50000, // ₹500 in paise
          currency: 'INR',
          status: 'captured',
          order_id: 'order_test_123456789',
          method: 'card',
          description: 'Test payment capture',
          created_at: Math.floor(Date.now() / 1000),
          captured_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  },

  'payment.failed': {
    event: 'payment.failed',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_failed_123456789',
          amount: 50000,
          currency: 'INR',
          status: 'failed',
          order_id: 'order_test_123456789',
          method: 'card',
          description: 'Test payment failure',
          error_code: 'BAD_REQUEST_ERROR',
          error_description: 'Payment processing failed',
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  },

  'order.paid': {
    event: 'order.paid',
    payload: {
      order: {
        entity: {
          id: 'order_test_paid_123456789',
          amount: 50000,
          amount_paid: 50000,
          currency: 'INR',
          status: 'paid',
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  },

  'refund.created': {
    event: 'refund.created',
    payload: {
      refund: {
        entity: {
          id: 'rfnd_test_created_123456789',
          payment_id: 'pay_test_captured_123456789',
          amount: 25000, // ₹250 partial refund
          currency: 'INR',
          status: 'created',
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  },

  'refund.processed': {
    event: 'refund.processed',
    payload: {
      refund: {
        entity: {
          id: 'rfnd_test_processed_123456789',
          payment_id: 'pay_test_captured_123456789',
          amount: 25000,
          currency: 'INR',
          status: 'processed',
          created_at: Math.floor(Date.now() / 1000),
          processed_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  },

  'refund.failed': {
    event: 'refund.failed',
    payload: {
      refund: {
        entity: {
          id: 'rfnd_test_failed_123456789',
          payment_id: 'pay_test_captured_123456789',
          amount: 25000,
          currency: 'INR',
          status: 'failed',
          error_code: 'GATEWAY_ERROR',
          error_description: 'Refund processing failed at gateway',
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  }
};

function generateSignature(body, secret) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

async function testWebhookEvent(eventName, eventData) {
  try {
    console.log(`\n🧪 Testing webhook event: ${eventName}`);
    
    const body = JSON.stringify(eventData);
    const signature = generateSignature(body, WEBHOOK_SECRET);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': signature
      },
      body: body
    });

    const result = await response.text();

    if (response.ok) {
      console.log(`✅ ${eventName}: SUCCESS`);
      console.log(`   Response: ${result}`);
    } else {
      console.log(`❌ ${eventName}: FAILED`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${result}`);
    }

  } catch (error) {
    console.log(`❌ ${eventName}: ERROR`);
    console.log(`   Error: ${error.message}`);
  }
}

async function testAllWebhookEvents() {
  console.log('🚀 Starting Razorpay Webhook Event Testing');
  console.log(`📡 Webhook URL: ${WEBHOOK_URL}`);
  console.log(`🔐 Webhook Secret: ${WEBHOOK_SECRET}`);
  
  for (const [eventName, eventData] of Object.entries(testEvents)) {
    await testWebhookEvent(eventName, eventData);
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🏁 Webhook testing completed!');
}

// Test signature verification
function testSignatureGeneration() {
  console.log('\n🔐 Testing signature generation:');
  const testBody = '{"test": "data"}';
  const signature = generateSignature(testBody, WEBHOOK_SECRET);
  console.log(`   Body: ${testBody}`);
  console.log(`   Secret: ${WEBHOOK_SECRET}`);
  console.log(`   Generated Signature: ${signature}`);
}

// Run tests
testSignatureGeneration();
testAllWebhookEvents().catch(console.error);

export { testEvents, generateSignature };
