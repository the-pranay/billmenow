// Test script to verify invoice creation fixes
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';
let authToken = '';
let userId = '';
let clientId = '';

async function testInvoiceFix() {
  console.log('🧪 Testing Invoice Creation Fixes...\n');

  try {
    // Step 1: Login with demo user
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'demo123'
      })
    });
    const loginData = await loginResponse.json();
      if (loginData.success) {
      authToken = loginData.token;
      userId = loginData.user.id;
      console.log('✅ Login: SUCCESS');
    } else {
      console.log('❌ Login: FAILED -', loginData.error);
      console.log('Full response:', JSON.stringify(loginData, null, 2));
      return;
    }

    // Step 2: Test next invoice number generation
    console.log('\n2. Testing invoice number generation...');
    const nextNumberResponse = await fetch(`${BASE_URL}/api/invoices/next-number`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const nextNumberData = await nextNumberResponse.json();
      if (nextNumberData.success) {
      console.log('✅ Next Invoice Number:', nextNumberData.data.invoiceNumber);
    } else {
      console.log('❌ Invoice Number Generation: FAILED -', nextNumberData.error);
    }

    // Step 3: Get or create a client
    console.log('\n3. Getting clients...');
    const clientsResponse = await fetch(`${BASE_URL}/api/clients`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const clientsData = await clientsResponse.json();
    
    if (clientsData.success && clientsData.data.length > 0) {
      clientId = clientsData.data[0]._id;
      console.log('✅ Using existing client:', clientsData.data[0].name);
    } else {
      // Create a new client
      console.log('Creating new client...');
      const newClientResponse = await fetch(`${BASE_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: 'Test Client for Invoice Fix',
          email: 'test-fix@example.com',
          phone: '+91 99999 88888',
          address: 'Test Address for Fix, Test City, 123456'
        })
      });
      const newClientData = await newClientResponse.json();
      
      if (newClientData.success) {
        clientId = newClientData.data._id;
        console.log('✅ Created new client:', newClientData.data.name);
      } else {
        console.log('❌ Client creation: FAILED -', newClientData.message);
        return;
      }
    }

    // Step 4: Test multiple invoice creation to check for duplicates
    console.log('\n4. Testing multiple invoice creation...');
    
    for (let i = 1; i <= 3; i++) {
      console.log(`\nCreating invoice ${i}...`);
      
      const invoiceResponse = await fetch(`${BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          clientId: clientId,
          items: [
            {
              description: `Test Service ${i}`,
              quantity: 1,
              rate: 5000 * i,
              amount: 5000 * i
            }
          ],
          taxRate: 18,
          dueDate: '2024-12-31',
          notes: `Test invoice ${i} created to verify duplicate fix`
        })
      });
      
      const invoiceData = await invoiceResponse.json();
      
      if (invoiceData.success) {
        console.log(`✅ Invoice ${i}: SUCCESS - ${invoiceData.data.invoiceNumber}`);
      } else {
        console.log(`❌ Invoice ${i}: FAILED - ${invoiceData.message}`);
        if (invoiceData.message.includes('duplicate')) {
          console.log('🔥 DUPLICATE KEY ERROR STILL EXISTS!');
        }
      }
    }

    console.log('\n🎉 Invoice creation test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testInvoiceFix();
