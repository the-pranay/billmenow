// Test the fixed payment API
async function testPaymentAPI() {
  try {
    console.log('🧪 Testing payment API after fix...');
    
    const testData = {
      amount: 1.01,
      currency: 'INR',
      invoiceId: '68473949eaacdb6a3d1c7e9c',
      clientInfo: {
        name: 'Sam',
        email: 'sam@example.com'
      }
    };

    console.log('📝 Sending request with data:', testData);

    const response = await fetch('https://billmenow.vercel.app/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('📋 Response data:', result);

    if (response.ok) {
      console.log('✅ Payment API is working!');
      console.log('🔑 Razorpay Key ID:', result.keyId);
      console.log('📝 Order ID:', result.order?.id);
      console.log('💰 Order Amount:', result.order?.amount);
    } else {
      console.log('❌ Payment API failed:', result.error);
      if (result.details) {
        console.log('📋 Error details:', result.details);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPaymentAPI();
