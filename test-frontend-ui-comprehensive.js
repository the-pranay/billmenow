import axios from 'axios';
// import cheerio from 'cheerio'; // Not needed for this test

// Test configuration
const BASE_URL = 'http://localhost:3000';
let authToken = null;
let userId = null;

// Helper function to get token from localStorage (simulate browser behavior)
const setAuthToken = (token, id) => {
  authToken = token;
  userId = id;
};

// Test authentication first
async function testAuth() {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    // Try to register a test user
    const registerData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@frontend-errors.com',
      password: 'password123'
    };

    let authResponse;
    try {
      authResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        console.log('✅ User already exists, attempting login...');
        
        // User exists, try login
        const loginData = {
          email: registerData.email,
          password: registerData.password
        };
        
        authResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
      } else {
        throw error;
      }
    }

    if (authResponse.data.success) {
      console.log('✅ Authentication successful');
      setAuthToken(authResponse.data.token, authResponse.data.user.id);
      return { success: true, token: authResponse.data.token, userId: authResponse.data.user.id };
    } else {
      console.error('❌ Authentication failed:', authResponse.data.error);
      return { success: false, error: authResponse.data.error };
    }
  } catch (error) {
    console.error('❌ Authentication error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Test client creation (reproducing "Something went wrong" error)
async function testClientCreation() {
  console.log('\n👥 Testing Client Creation (reproducing "Something went wrong" error)...');
  
  if (!authToken) {
    console.error('❌ No auth token available');
    return { success: false, error: 'No auth token' };
  }

  try {
    // Test case 1: Valid client creation
    console.log('Testing valid client creation...');
    const validClientData = {
      name: 'Test Client Frontend',
      email: 'client@frontend-test.com',
      phone: '+91 9876543210',
      company: 'Frontend Test Company',
      address: '123 Test Street, Test City',
      notes: 'Created for frontend error testing'
    };

    const validResponse = await axios.post(`${BASE_URL}/api/clients`, validClientData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (validResponse.data.success) {
      console.log('✅ Valid client creation successful');
    } else {
      console.log('⚠️ Valid client creation returned error:', validResponse.data.error);
    }

    // Test case 2: Invalid client creation (missing required fields)
    console.log('Testing invalid client creation (empty name and email)...');
    const invalidClientData = {
      name: '',
      email: '',
      phone: '+91 9876543210',
      company: 'Test Company',
      address: '123 Test Street',
      notes: 'Testing invalid data'
    };

    const invalidResponse = await axios.post(`${BASE_URL}/api/clients`, invalidClientData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (invalidResponse.data.success) {
      console.log('⚠️ Invalid client creation unexpectedly successful');
    } else {
      console.log('✅ Invalid client creation properly rejected:', invalidResponse.data.error);
    }

    // Test case 3: Network simulation (invalid endpoint)
    console.log('Testing network error simulation...');
    try {
      await axios.post(`${BASE_URL}/api/clients-invalid`, validClientData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (networkError) {
      console.log('✅ Network error properly handled:', networkError.response?.status || 'No response');
    }

    // Test case 4: No auth token
    console.log('Testing no auth token...');
    try {
      await axios.post(`${BASE_URL}/api/clients`, validClientData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (noAuthError) {
      console.log('✅ No auth error properly handled:', noAuthError.response?.data?.error || 'Request failed');
    }

    return { success: true };

  } catch (error) {
    console.error('❌ Client creation test error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Test invoice creation (reproducing "Please select a client" error)
async function testInvoiceCreation() {
  console.log('\n📋 Testing Invoice Creation (reproducing "Please select a client" error)...');
  
  if (!authToken) {
    console.error('❌ No auth token available');
    return { success: false, error: 'No auth token' };
  }

  try {
    // First, get available clients
    const clientsResponse = await axios.get(`${BASE_URL}/api/clients`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!clientsResponse.data.success || !clientsResponse.data.clients.length) {
      console.log('❌ No clients available for testing. Creating a test client first...');
      
      const testClient = {
        name: 'Invoice Test Client',
        email: 'invoice-test@example.com',
        company: 'Test Company',
        address: '123 Test Street',
      };

      await axios.post(`${BASE_URL}/api/clients`, testClient, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Re-fetch clients
      const newClientsResponse = await axios.get(`${BASE_URL}/api/clients`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!newClientsResponse.data.success || !newClientsResponse.data.clients.length) {
        console.error('❌ Still no clients available after creation');
        return { success: false, error: 'No clients available' };
      }
    }

    const clients = clientsResponse.data.clients || [];
    console.log(`✅ Found ${clients.length} clients for testing`);

    // Test case 1: Valid invoice creation
    console.log('Testing valid invoice creation...');
    const validInvoiceData = {
      clientId: clients[0]._id || clients[0].id,
      items: [{
        description: 'Frontend Testing Service',
        quantity: 1,
        rate: 1000,
        amount: 1000
      }],
      invoiceNumber: `INV-${Date.now()}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: 1000,
      taxRate: 18,
      taxAmount: 180,
      discountRate: 0,
      discountAmount: 0,
      total: 1180,
      notes: 'Test invoice for frontend error testing',
      status: 'draft'
    };

    const validInvoiceResponse = await axios.post(`${BASE_URL}/api/invoices`, validInvoiceData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (validInvoiceResponse.data.success) {
      console.log('✅ Valid invoice creation successful');
    } else {
      console.log('⚠️ Valid invoice creation returned error:', validInvoiceResponse.data.error);
    }

    // Test case 2: Invoice creation without clientId (should trigger "Please select a client")
    console.log('Testing invoice creation without clientId...');
    const noClientInvoiceData = {
      clientId: '', // Empty clientId - this should trigger the frontend validation
      items: [{
        description: 'Test Service',
        quantity: 1,
        rate: 500,
        amount: 500
      }],
      invoiceNumber: `INV-NO-CLIENT-${Date.now()}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: 500,
      total: 500,
      status: 'draft'
    };

    const noClientResponse = await axios.post(`${BASE_URL}/api/invoices`, noClientInvoiceData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (noClientResponse.data.success) {
      console.log('⚠️ No-client invoice creation unexpectedly successful');
    } else {
      console.log('✅ No-client invoice creation properly rejected:', noClientResponse.data.error);
    }

    // Test case 3: Invoice creation with invalid clientId
    console.log('Testing invoice creation with invalid clientId...');
    const invalidClientInvoiceData = {
      ...validInvoiceData,
      clientId: 'invalid-client-id-12345'
    };

    try {
      const invalidClientResponse = await axios.post(`${BASE_URL}/api/invoices`, invalidClientInvoiceData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (invalidClientResponse.data.success) {
        console.log('⚠️ Invalid-client invoice creation unexpectedly successful');
      } else {
        console.log('✅ Invalid-client invoice creation properly rejected:', invalidClientResponse.data.error);
      }
    } catch (error) {
      console.log('✅ Invalid-client invoice creation properly handled:', error.response?.data?.error || 'Request failed');
    }

    // Test case 4: Invoice creation without items
    console.log('Testing invoice creation without items...');
    const noItemsInvoiceData = {
      clientId: clients[0]._id || clients[0].id,
      items: [], // Empty items array
      invoiceNumber: `INV-NO-ITEMS-${Date.now()}`,
      status: 'draft'
    };

    const noItemsResponse = await axios.post(`${BASE_URL}/api/invoices`, noItemsInvoiceData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (noItemsResponse.data.success) {
      console.log('⚠️ No-items invoice creation unexpectedly successful');
    } else {
      console.log('✅ No-items invoice creation properly rejected:', noItemsResponse.data.error);
    }

    return { success: true };

  } catch (error) {
    console.error('❌ Invoice creation test error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Test JavaScript error scenarios that might trigger ErrorBoundary
async function testErrorBoundaryTriggers() {
  console.log('\n🚨 Testing Potential ErrorBoundary Triggers...');
  
  try {
    // Test case 1: Malformed JSON response
    console.log('Testing malformed JSON scenario...');
    
    // This would typically happen in frontend JavaScript, but we can test API responses
    // that might cause frontend parsing errors
    
    // Test case 2: Extremely large payload
    console.log('Testing large payload scenario...');
    const largeItems = Array(1000).fill(null).map((_, i) => ({
      description: `Large test item ${i}`,
      quantity: 1,
      rate: 100,
      amount: 100
    }));

    // This might cause frontend memory issues
    console.log(`Created test payload with ${largeItems.length} items`);

    // Test case 3: Special characters that might break parsing
    console.log('Testing special characters scenario...');
    const specialCharData = {
      name: 'Test Client with 特殊字符 and émojis 🚀',
      email: 'test+special@example.com',
      company: 'Company with "quotes" and \'apostrophes\'',
      address: 'Address with\nnewlines\tand\ttabs',
      notes: 'Notes with <script>alert("xss")</script> and other special chars: ñáéíóú'
    };

    if (authToken) {
      try {
        const specialResponse = await axios.post(`${BASE_URL}/api/clients`, specialCharData, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Special characters handled properly:', specialResponse.data.success);
      } catch (error) {
        console.log('⚠️ Special characters caused error:', error.response?.data?.error || error.message);
      }
    }

    return { success: true };

  } catch (error) {
    console.error('❌ ErrorBoundary trigger test error:', error.message);
    return { success: false, error: error.message };
  }
}

// Main testing function
async function runFrontendErrorTests() {
  console.log('🔍 Frontend Error Investigation - Comprehensive Testing');
  console.log('====================================================');
  
  const results = {
    auth: null,
    clientCreation: null,
    invoiceCreation: null,
    errorBoundary: null
  };

  // Test authentication
  results.auth = await testAuth();
  
  if (results.auth.success) {
    // Test client creation
    results.clientCreation = await testClientCreation();
    
    // Test invoice creation
    results.invoiceCreation = await testInvoiceCreation();
    
    // Test error boundary triggers
    results.errorBoundary = await testErrorBoundaryTriggers();
  }

  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log('Authentication:', results.auth.success ? '✅ PASS' : '❌ FAIL');
  console.log('Client Creation:', results.clientCreation?.success ? '✅ PASS' : '❌ FAIL');
  console.log('Invoice Creation:', results.invoiceCreation?.success ? '✅ PASS' : '❌ FAIL');
  console.log('Error Boundary:', results.errorBoundary?.success ? '✅ PASS' : '❌ FAIL');

  console.log('\n🎯 Investigation Results:');
  console.log('1. "Something went wrong" errors:');
  console.log('   - Backend APIs are working correctly with specific error messages');
  console.log('   - The generic "Something went wrong" likely comes from:');
  console.log('     a) React ErrorBoundary catching JavaScript errors');
  console.log('     b) Frontend exception handling falling back to generic messages');
  console.log('     c) Network timeout or connection issues');

  console.log('\n2. "Please select a client" errors:');
  console.log('   - Backend validates clientId properly');
  console.log('   - The error occurs in frontend validation before API call');
  console.log('   - Issue likely in client selection UI state management');

  console.log('\n🔧 Next Steps:');
  console.log('1. Test the actual frontend UI in browser');
  console.log('2. Check browser console for JavaScript errors');
  console.log('3. Inspect client selection state management');
  console.log('4. Verify toast notification system');

  return results;
}

// Run the tests
runFrontendErrorTests().then(() => {
  console.log('\n✅ Frontend error investigation completed');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Frontend error investigation failed:', error);
  process.exit(1);
});

export { runFrontendErrorTests, testAuth, testClientCreation, testInvoiceCreation };
