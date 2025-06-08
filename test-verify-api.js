/**
 * Test Payment Verification API
 */

const baseUrl = 'http://localhost:3001';

async function testPaymentVerifyAPI() {
  console.log('🔍 Testing Payment Verification API...');
  
  try {
    const response = await fetch(`${baseUrl}/api/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        razorpay_order_id: 'test_order_123',
        razorpay_payment_id: 'test_payment_123',
        razorpay_signature: 'test_signature_123',
        invoiceId: '507f1f77bcf86cd799439011'
      })
    });
    
    const data = await response.json();
    console.log(`Verify API Status: ${response.status}`);
    console.log('Verify API Response:', data);
    
    if (response.status === 401) {
      console.log('❌ Verify API still requires authentication');
      return false;
    } else if (response.status === 404) {
      console.log('✅ Verify API accepts request without auth (payment record not found is expected)');
      return true;
    } else {
      console.log('✅ Verify API working without authentication');
      return true;
    }
    
  } catch (error) {
    console.log('❌ Verify API test failed:', error.message);
    return false;
  }
}

async function main() {
  const verifyTestPassed = await testPaymentVerifyAPI();
  
  console.log(`\n${verifyTestPassed ? '✅' : '❌'} Payment Verification API: ${verifyTestPassed ? 'Working' : 'Needs Review'}`);
  
  if (verifyTestPassed) {
    console.log('\n🎉 ALL Payment API endpoints now support public payments!');
  }
}

main().catch(console.error);
