// Simple test to create an invoice for payment testing
const BASE_URL = 'http://localhost:3000';

async function createTestInvoice() {
  console.log('🚀 Creating test invoice for payment testing...\n');
  
  try {
    // Step 1: Register a test user
    const testEmail = `payment.test.${Date.now()}@billmenow.com`;
    const testPassword = 'TestPass123!';
    
    console.log('📝 Step 1: Creating test user...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Payment',
        lastName: 'Tester',
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        businessName: 'Payment Test Business',
        businessType: 'freelancer',
        phone: '+1234567890',
        country: 'IN',
        terms: true,
        privacy: true,
        marketing: false
      })
    });
    
    if (!registerResponse.ok) {
      console.log('❌ Registration failed:', registerResponse.status, await registerResponse.text());
      return;
    }
    
    const registerResult = await registerResponse.json();
    console.log('✅ User registered successfully!');
    
    // Step 2: Login to get token
    console.log('\n🔑 Step 2: Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status, await loginResponse.text());
      return;
    }
    
    const loginResult = await loginResponse.json();
    if (!loginResult.success) {
      console.log('❌ Login failed:', loginResult.error);
      return;
    }
    
    const token = loginResult.token;
    console.log('✅ Login successful!');
    
    // Step 3: Create a client
    console.log('\n👥 Step 3: Creating test client...');
    const clientResponse = await fetch(`${BASE_URL}/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Payment Client',
        email: 'client@paymenttest.com',
        company: 'Payment Test Company',
        phone: '+91-9876543210',
        address: '123 Payment Test Street, Test City, TC 12345'
      })
    });
    
    if (!clientResponse.ok) {
      console.log('❌ Client creation failed:', clientResponse.status, await clientResponse.text());
      return;
    }
    
    const clientResult = await clientResponse.json();
    if (!clientResult.success) {
      console.log('❌ Client creation failed:', clientResult.error);
      return;
    }
    
    const clientId = clientResult.client._id || clientResult.client.id;
    console.log('✅ Client created successfully!');
    
    // Step 4: Create an invoice
    console.log('\n📄 Step 4: Creating test invoice...');
    const invoiceData = {
      client: clientId,
      items: [
        {
          description: 'Payment Test Service',
          quantity: 1,
          rate: 1000,
          amount: 1000
        },
        {
          description: 'Additional Test Item',
          quantity: 2,
          rate: 500,
          amount: 1000
        }
      ],
      subtotal: 2000,
      taxTotal: 360, // 18% tax
      total: 2360,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Test invoice for payment functionality verification'
    };
    
    const invoiceResponse = await fetch(`${BASE_URL}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(invoiceData)
    });
    
    if (!invoiceResponse.ok) {
      console.log('❌ Invoice creation failed:', invoiceResponse.status, await invoiceResponse.text());
      return;
    }
    
    const invoiceResult = await invoiceResponse.json();
    if (!invoiceResult.success) {
      console.log('❌ Invoice creation failed:', invoiceResult.error);
      return;
    }
    
    const invoice = invoiceResult.invoice;
    console.log('✅ Invoice created successfully!');
    console.log(`   Invoice ID: ${invoice._id}`);
    console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
    console.log(`   Total Amount: ₹${invoice.total}`);
    console.log(`   Payment Status: ${invoice.paymentStatus || 'pending'}`);
    
    // Step 5: Generate payment link and test it
    const paymentLink = `${BASE_URL}/payment/${invoice._id}`;
    console.log(`\n🔗 Payment Link: ${paymentLink}`);
    
    // Test if the payment link is accessible
    console.log('\n🧪 Step 5: Testing payment link accessibility...');
    const paymentPageResponse = await fetch(paymentLink);
    
    if (paymentPageResponse.ok) {
      console.log('✅ Payment page is accessible!');
      console.log('\n🎉 SUCCESS! Test invoice created and ready for payment testing!');
      console.log('\n📋 Next steps:');
      console.log(`   1. Open payment link in browser: ${paymentLink}`);
      console.log('   2. Use Razorpay test cards to complete payment');
      console.log('   3. Verify payment completion updates invoice status');
      console.log('\n💳 Razorpay Test Cards:');
      console.log('   Success: 4111 1111 1111 1111 | CVV: Any 3 digits | Expiry: Any future date');
      console.log('   Failure: 4000 0000 0000 0002 | CVV: Any 3 digits | Expiry: Any future date');
      
      return {
        success: true,
        invoiceId: invoice._id,
        paymentLink: paymentLink,
        userEmail: testEmail,
        userPassword: testPassword
      };
    } else {
      console.log('❌ Payment page is not accessible');
      console.log('Response status:', paymentPageResponse.status);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    return null;
  }
}

// Run the test
createTestInvoice().then(result => {
  if (result) {
    console.log('\n✅ Test completed successfully!');
  } else {
    console.log('\n❌ Test failed!');
  }
});
