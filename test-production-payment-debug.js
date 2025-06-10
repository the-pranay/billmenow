// Test the production payment API with the problematic invoice
async function testProductionPaymentAPI() {
  try {
    console.log('🧪 Testing production payment API...');
    
    // Test the invoice ID from the error logs
    const invoiceId = '6847f01b66e984b6c488677a';
    
    console.log('1️⃣ Testing if create-order route exists...');
    const testResponse = await fetch('https://billmenow.vercel.app/api/payment/create-order', {
      method: 'GET'
    });
    
    console.log('GET Response status:', testResponse.status);
    console.log('GET Response headers:', Object.fromEntries(testResponse.headers.entries()));
    
    if (testResponse.status === 404) {
      console.log('❌ Route not found - checking alternatives...');
      
      // Check if the route exists with different name
      const testRoute2 = await fetch('https://billmenow.vercel.app/api/payment/test');
      console.log('Test route status:', testRoute2.status);
      
      if (testRoute2.ok) {
        const data = await testRoute2.json();
        console.log('Test route data:', data);
      }
    } else {
      const getData = await testResponse.json();
      console.log('GET Response data:', getData);
    }
    
    console.log('\n2️⃣ Testing POST with invoice data...');
    
    const testData = {
      amount: 1.01,
      currency: 'INR',
      invoiceId: invoiceId,
      clientInfo: {
        name: 'Test User',
        email: 'test@example.com'
      }
    };

    const postResponse = await fetch('https://billmenow.vercel.app/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('POST Response status:', postResponse.status);
    console.log('POST Response headers:', Object.fromEntries(postResponse.headers.entries()));

    const postData = await postResponse.text(); // Get as text first
    console.log('POST Response body:', postData);

    try {
      const jsonData = JSON.parse(postData);
      console.log('POST Response JSON:', jsonData);
    } catch (e) {
      console.log('Response is not JSON');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testProductionPaymentAPI();
