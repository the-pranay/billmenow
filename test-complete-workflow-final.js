// Complete workflow test for BillMeNow
const testCompleteWorkflow = async () => {
  const baseUrl = 'http://localhost:3003';
  
  console.log('🧪 Starting complete BillMeNow workflow test...\n');
  
  try {
    // Step 1: Test signup
    console.log('📝 Step 1: Testing user signup...');    const signupData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.user.${Date.now()}@billmenow.com`,
      password: 'TestPassword123!',
      businessName: 'Test Company',
      businessType: 'Software Development',
      phone: '+1234567890',
      country: 'US'
    };
    
    const signupResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
    
    if (!signupResponse.ok) {
      const errorText = await signupResponse.text();
      console.log('❌ Signup failed:', signupResponse.status, errorText);
      return;
    }
    
    const signupResult = await signupResponse.json();
    console.log('✅ Signup successful!');
    
    // Step 2: Test signin to get token
    console.log('\n🔑 Step 2: Testing user signin...');
    const signinResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: signupData.email,
        password: signupData.password
      })
    });
    
    if (!signinResponse.ok) {
      const errorText = await signinResponse.text();
      console.log('❌ Signin failed:', signinResponse.status, errorText);
      return;
    }
    
    const signinResult = await signinResponse.json();
    const token = signinResult.token;
    console.log('✅ Signin successful! Got token.');
    
    // Step 3: Create a client
    console.log('\n👤 Step 3: Creating a test client...');
    const clientData = {
      name: 'Test Client',
      email: 'client@example.com',
      company: 'Client Company',
      phone: '+1234567890',
      address: '123 Test Street, Test City, TC 12345'
    };
    
    const clientResponse = await fetch(`${baseUrl}/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(clientData)
    });
    
    if (!clientResponse.ok) {
      const errorText = await clientResponse.text();
      console.log('❌ Client creation failed:', clientResponse.status, errorText);
      return;
    }
    
    const clientResult = await clientResponse.json();
    const clientId = clientResult.client._id || clientResult.client.id;
    console.log('✅ Client created successfully!', clientId);
    
    // Step 4: Create an invoice
    console.log('\n📄 Step 4: Creating a test invoice...');
    const invoiceData = {
      client: clientId,
      items: [
        {
          description: 'Test Service',
          quantity: 1,
          rate: 100,
          amount: 100
        },
        {
          description: 'Additional Service',
          quantity: 2,
          rate: 50,
          amount: 100
        }
      ],
      subtotal: 200,
      tax: 20,
      total: 220,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      notes: 'Test invoice created by automated test'
    };
    
    const invoiceResponse = await fetch(`${baseUrl}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(invoiceData)
    });
    
    if (!invoiceResponse.ok) {
      const errorText = await invoiceResponse.text();
      console.log('❌ Invoice creation failed:', invoiceResponse.status, errorText);
      return;
    }
    
    const invoiceResult = await invoiceResponse.json();
    console.log('✅ Invoice created successfully!', invoiceResult.invoice.invoiceNumber);
    
    // Step 5: Test invoice listing
    console.log('\n📋 Step 5: Testing invoice listing...');
    const listResponse = await fetch(`${baseUrl}/api/invoices`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.log('❌ Invoice listing failed:', listResponse.status, errorText);
      return;
    }
    
    const listResult = await listResponse.json();
    console.log('✅ Invoice listing successful!');
    console.log('📊 API Response Structure:');
    console.log('- success:', listResult.success);
    console.log('- invoices count:', listResult.invoices?.length || 0);
    console.log('- summary:', listResult.summary);
    console.log('- pagination:', listResult.pagination);
    
    if (listResult.invoices && listResult.invoices.length > 0) {
      console.log('\n📄 First invoice details:');
      const firstInvoice = listResult.invoices[0];
      console.log('- Invoice Number:', firstInvoice.invoiceNumber);
      console.log('- Client Info:', firstInvoice.clientId);
      console.log('- Status:', firstInvoice.status);
      console.log('- Total:', firstInvoice.total);
      console.log('- Created:', firstInvoice.createdAt);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log('✅ User signup working');
    console.log('✅ User signin working');
    console.log('✅ Client creation working');
    console.log('✅ Invoice creation working');
    console.log('✅ Invoice listing working');
    console.log('\n👥 Test credentials for manual testing:');
    console.log('Email:', signupData.email);
    console.log('Password:', signupData.password);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testCompleteWorkflow();
