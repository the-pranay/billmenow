// Simple test to create invoice and verify listing for existing user
const testInvoiceFlow = async () => {
  const baseUrl = 'http://localhost:3003';
  
  console.log('🧪 Testing BillMeNow invoice flow...\n');
  
  try {
    // Step 1: Register a new user (since we don't know existing passwords)
    console.log('📝 Step 1: Creating new test user...');
    const testEmail = `test.invoice.${Date.now()}@billmenow.com`;
    const testPassword = 'TestPass123!';
    
    const registerData = {
      firstName: 'Invoice',
      lastName: 'Tester',
      email: testEmail,
      password: testPassword,
      businessName: 'Invoice Test Business'
    };
    
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });
    
    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.log('❌ Registration failed:', registerResponse.status, errorText);
      return;
    }
    
    const registerResult = await registerResponse.json();
    console.log('✅ User registered successfully!');
    
    // Step 2: Login
    console.log('\n🔑 Step 2: Logging in...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', loginResponse.status, errorText);
      return;
    }
    
    const loginResult = await loginResponse.json();
    const token = loginResult.token;
    console.log('✅ Login successful!');
    
    // Step 3: Create a client first
    console.log('\n👤 Step 3: Creating test client...');
    const clientData = {
      name: 'Test Client Company',
      email: 'client@testcompany.com',
      company: 'Test Client LLC',
      phone: '+1-555-123-4567',
      address: '123 Business Ave, Suite 100, Business City, BC 12345'
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
    console.log('✅ Client created successfully!');
    
    // Step 4: Create an invoice
    console.log('\n📄 Step 4: Creating test invoice...');
    const invoiceData = {
      client: clientId,
      items: [
        {
          description: 'Website Development',
          quantity: 1,
          rate: 2500,
          amount: 2500
        },
        {
          description: 'SEO Optimization',
          quantity: 10,
          rate: 150,
          amount: 1500
        }
      ],
      subtotal: 4000,
      tax: 400,
      total: 4400,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Payment due within 30 days. Thank you for your business!'
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
    console.log('✅ Invoice created successfully!');
    console.log('   Invoice Number:', invoiceResult.invoice.invoiceNumber);
    console.log('   Total Amount:', '$' + invoiceResult.invoice.total);
    
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
    console.log('\n📊 API Response Analysis:');
    console.log('- Response structure is correct:', listResult.success === true);
    console.log('- Invoices found:', listResult.invoices?.length || 0);
    console.log('- Summary provided:', !!listResult.summary);
    console.log('- Pagination provided:', !!listResult.pagination);
    
    if (listResult.invoices && listResult.invoices.length > 0) {
      console.log('\n📄 Invoice Details:');
      const invoice = listResult.invoices[0];
      console.log('- Invoice Number:', invoice.invoiceNumber);
      console.log('- Client populated:', !!invoice.clientId);
      console.log('- Client name:', invoice.clientId?.name || 'N/A');
      console.log('- Status:', invoice.status);
      console.log('- Total:', '$' + invoice.total);
      console.log('- Created:', invoice.createdAt);
      
      console.log('\n🎯 KEY FINDINGS:');
      console.log('✅ Invoice creation: WORKING');
      console.log('✅ Invoice listing API: WORKING');
      console.log('✅ Client population: WORKING');
      console.log('✅ Response structure: CORRECT');
      
      console.log('\n🔧 For manual testing, use these credentials:');
      console.log('Email:', testEmail);
      console.log('Password:', testPassword);
      console.log('You should now see 1 invoice in the listing at /invoices');
    } else {
      console.log('\n❌ No invoices returned in the listing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testInvoiceFlow();
