// Create a test that exactly mimics the frontend call
// to see if we can reproduce the 404 error

async function exactFrontendTest() {
  try {
    console.log('🧪 Exact Frontend Test Starting...');
    
    // Simulate exact frontend environment
    const origin = 'https://billmenow.vercel.app';
    const invoiceId = '6847f01b66e984b6c488677a';
    
    // Test 1: Check if invoice exists first (like frontend does)
    console.log('1️⃣ Testing invoice fetch...');
    const invoiceResponse = await fetch(`${origin}/api/invoices/public/${invoiceId}`);
    console.log('Invoice API Status:', invoiceResponse.status);
    
    if (!invoiceResponse.ok) {
      console.log('❌ Invoice fetch failed');
      return;
    }
    
    const invoiceData = await invoiceResponse.json();
    console.log('Invoice Data:', invoiceData.success ? 'Success' : 'Failed');
    
    if (!invoiceData.success) {
      console.log('❌ Invoice data invalid');
      return;
    }
    
    const invoice = invoiceData.invoice;
    
    // Test 2: Now try payment API (like frontend does)
    console.log('\n2️⃣ Testing payment API...');
    
    const paymentRequestData = {
      amount: invoice.total,
      currency: 'INR',
      invoiceId: invoice._id,
      clientInfo: {
        name: invoice.client?.name,
        email: invoice.client?.email
      }
    };
    
    console.log('Payment Request Data:', paymentRequestData);
    
    // Test with different URL formats
    const urlVariations = [
      `${origin}/api/payment/create-order`,
      `${origin}/api/payment/create-order/`,
      '/api/payment/create-order',
      './api/payment/create-order'
    ];
    
    for (const url of urlVariations) {
      console.log(`\n🔗 Testing URL: ${url}`);
      
      try {
        const paymentResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentRequestData)
        });
        
        console.log(`Status: ${paymentResponse.status}`);
        console.log(`OK: ${paymentResponse.ok}`);
        console.log(`Final URL: ${paymentResponse.url}`);
        
        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          console.log(`Success: ${paymentData.success}`);
          console.log(`Order ID: ${paymentData.order?.id}`);
        } else {
          const errorText = await paymentResponse.text();
          console.log(`Error Response: ${errorText}`);
        }
        
      } catch (error) {
        console.log(`Request Error: ${error.message}`);
      }
    }
    
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

exactFrontendTest();
