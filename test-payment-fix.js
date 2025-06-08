// Test script to verify the payment API fix
import fetch from 'node-fetch';

async function testPaymentAPI() {
  console.log('🧪 Testing Payment API with Receipt Length Fix...\n');

  try {
    // First, let's test if we can create a payment order
    const testPayload = {
      amount: 100.00,
      currency: 'INR',
      invoiceId: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId format
      clientInfo: {
        name: 'Test Client',
        email: 'test@example.com'
      }
    };

    console.log('📤 Sending payment order creation request...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch('http://localhost:3000/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log('\n📥 Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.text();
    console.log('\n📋 Response Body:');
    
    try {
      const jsonData = JSON.parse(responseData);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success) {
        console.log('\n✅ SUCCESS: Payment API is working!');
        console.log('Order ID:', jsonData.order?.id);
        console.log('Payment ID:', jsonData.paymentId);
      } else {
        console.log('\n❌ FAILURE: Payment API returned error');
        console.log('Error:', jsonData.error);
      }
    } catch (parseError) {
      console.log('Raw response (not JSON):', responseData);
    }

  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
  }
}

// Test receipt length generation
function testReceiptLength() {
  console.log('\n🔍 Testing Receipt Length Generation...');
  
  const invoiceId = '507f1f77bcf86cd799439011';
  const timestamp = Date.now().toString().slice(-8);
  const shortInvoiceId = invoiceId.slice(-8);
  const receipt = `rcpt_${shortInvoiceId}_${timestamp}`;
  
  console.log('Full Invoice ID:', invoiceId);
  console.log('Short Invoice ID:', shortInvoiceId);
  console.log('Timestamp:', timestamp);
  console.log('Generated Receipt:', receipt);
  console.log('Receipt Length:', receipt.length);
  console.log('Within 40 char limit:', receipt.length <= 40 ? '✅ YES' : '❌ NO');
}

// Run tests
testReceiptLength();
testPaymentAPI();
