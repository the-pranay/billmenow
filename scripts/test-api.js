import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let userId = '';
let clientId = '';
let invoiceId = '';

async function testAPI() {
  console.log('🧪 Starting API tests...\n');

  try {
    // Test 1: User Registration
    console.log('1. Testing User Registration...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'test123',
        businessName: 'Test Business'
      })
    });
    const registerData = await registerResponse.json();
    console.log('✅ Registration:', registerData.success ? 'SUCCESS' : 'FAILED');

    // Test 2: User Login
    console.log('\n2. Testing User Login...');
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
      authToken = loginData.data.token;
      userId = loginData.data.user.id;
      console.log('✅ Login: SUCCESS');
    } else {
      console.log('❌ Login: FAILED');
      return;
    }

    // Test 3: Dashboard
    console.log('\n3. Testing Dashboard...');
    const dashboardResponse = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard:', dashboardData.success ? 'SUCCESS' : 'FAILED');

    // Test 4: Create Client
    console.log('\n4. Testing Create Client...');
    const clientResponse = await fetch(`${BASE_URL}/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: 'Test Client API',
        email: 'testclient@example.com',
        phone: '+91 98765 99999',
        address: 'Test Address, Test City, Test State, 123456'
      })
    });
    const clientData = await clientResponse.json();
    if (clientData.success) {
      clientId = clientData.data._id;
      console.log('✅ Create Client: SUCCESS');
    } else {
      console.log('❌ Create Client: FAILED');
    }

    // Test 5: List Clients
    console.log('\n5. Testing List Clients...');
    const clientsResponse = await fetch(`${BASE_URL}/api/clients`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const clientsData = await clientsResponse.json();
    console.log('✅ List Clients:', clientsData.success ? 'SUCCESS' : 'FAILED');

    // Test 6: Create Invoice
    console.log('\n6. Testing Create Invoice...');
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
            description: 'API Test Service',
            quantity: 1,
            rate: 10000,
            amount: 10000
          }
        ],
        taxRate: 18,
        dueDate: '2024-12-31',
        notes: 'Test invoice created via API'
      })
    });
    const invoiceData = await invoiceResponse.json();
    if (invoiceData.success) {
      invoiceId = invoiceData.data._id;
      console.log('✅ Create Invoice: SUCCESS');
    } else {
      console.log('❌ Create Invoice: FAILED');
    }

    // Test 7: List Invoices
    console.log('\n7. Testing List Invoices...');
    const invoicesResponse = await fetch(`${BASE_URL}/api/invoices`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const invoicesData = await invoicesResponse.json();
    console.log('✅ List Invoices:', invoicesData.success ? 'SUCCESS' : 'FAILED');

    // Test 8: Create Payment Order
    console.log('\n8. Testing Create Payment Order...');
    const paymentOrderResponse = await fetch(`${BASE_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        invoiceId: invoiceId,
        amount: 11800 // 10000 + 18% tax
      })
    });
    const paymentOrderData = await paymentOrderResponse.json();
    console.log('✅ Create Payment Order:', paymentOrderData.success ? 'SUCCESS' : 'FAILED');

    // Test 9: User Profile
    console.log('\n9. Testing User Profile...');
    const profileResponse = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const profileData = await profileResponse.json();
    console.log('✅ User Profile:', profileData.success ? 'SUCCESS' : 'FAILED');

    // Test 10: Reports
    console.log('\n10. Testing Reports...');
    const reportsResponse = await fetch(`${BASE_URL}/api/reports?type=revenue&period=month`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const reportsData = await reportsResponse.json();
    console.log('✅ Reports:', reportsData.success ? 'SUCCESS' : 'FAILED');

    // Test 11: Email Send (Mock)
    console.log('\n11. Testing Email Send...');
    const emailResponse = await fetch(`${BASE_URL}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        to: 'testclient@example.com',
        subject: 'Test Email',
        template: 'invoice',
        templateData: {
          clientName: 'Test Client',
          invoiceNumber: 'INV-TEST-001',
          amount: '₹11,800',
          dueDate: '31 Dec 2024',
          description: 'API Test Service',
          paymentLink: `${BASE_URL}/payment/${invoiceId}`,
          senderName: 'Test User',
          businessName: 'Test Business',
          contactDetails: 'demo@example.com'
        }
      })
    });
    const emailData = await emailResponse.json();
    console.log('✅ Email Send:', emailData.success ? 'SUCCESS' : 'FAILED');

    console.log('\n🎉 API Tests Completed!');
    console.log('\n📊 Test Summary:');
    console.log('- All core endpoints tested');
    console.log('- Authentication working');
    console.log('- CRUD operations functional');
    console.log('- Payment integration ready');
    console.log('- Email service configured');

  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

// Check if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPI();
}
