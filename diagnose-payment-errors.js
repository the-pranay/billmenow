// Simple test to understand payment API 404/500 errors
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function diagnosePaymentErrors() {
  console.log('🔍 DIAGNOSING PAYMENT API ERRORS');
  console.log('==================================\n');

  // Test 1: Basic API accessibility
  console.log('📡 Test 1: API Endpoint Accessibility');
  console.log('-------------------------------------');
  
  try {
    const response = await fetch(`${BASE_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 1000,
        currency: 'INR',
        invoiceId: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId format
        clientInfo: {
          name: 'Test Client',
          email: 'test@example.com'
        }
      })
    });

    console.log(`Response Status: ${response.status}`);
    console.log(`Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    
    const responseText = await response.text();
    console.log(`Response Body: ${responseText}`);
    
    let responseData = null;
    try {
      responseData = JSON.parse(responseText);
      console.log(`Parsed JSON:`, responseData);
    } catch (e) {
      console.log('Response is not JSON');
    }
    
    // Analyze the response
    if (response.status === 404) {
      if (responseData?.error === 'Invoice not found') {
        console.log('✅ EXPECTED: 404 - Invoice not found (API working correctly)');
        console.log('   This means the API is working, but the test invoice ID doesn\'t exist in database');
      } else {
        console.log('❌ UNEXPECTED: 404 - API endpoint not found');
      }
    } else if (response.status === 500) {
      console.log('❌ SERVER ERROR: 500 - Internal server error');
      console.log('   This indicates a problem with the API implementation or database connection');
    } else if (response.status === 200) {
      console.log('✅ SUCCESS: API working perfectly');
    } else {
      console.log(`⚠️  UNEXPECTED: Status ${response.status}`);
    }

  } catch (error) {
    console.log(`❌ CONNECTION ERROR: ${error.message}`);
    console.log('   This means the server is not running or not accessible');
  }

  // Test 2: Check if Next.js is compiling the API route
  console.log('\n🏗️  Test 2: API Route Compilation');
  console.log('----------------------------------');
  
  try {
    // Make a simple GET request to see if the server responds
    const healthResponse = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET'
    });
    
    console.log(`Health check status: ${healthResponse.status}`);
    
    if (healthResponse.status === 404) {
      console.log('⚠️  Health API not found (expected)');
      console.log('   This confirms the server is running but API routes need to be compiled');
    }
    
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
  }

  // Test 3: Environment Check (Client-side perspective)
  console.log('\n🔧 Test 3: Client Environment Analysis');
  console.log('-------------------------------------');
  
  console.log('Expected API behavior:');
  console.log('  404 + "Invoice not found" = API working, invalid invoice ID');
  console.log('  500 = Server error (database connection, code error, etc.)');
  console.log('  Network error = Server not running');
  
  console.log('\n💡 Next Steps:');
  console.log('1. If getting 404 "Invoice not found" - API is working, need valid invoice');
  console.log('2. If getting 500 - Check server logs for errors');
  console.log('3. If getting network errors - Check if dev server is running');
}

diagnosePaymentErrors();
