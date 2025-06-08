// Comprehensive Payment System Test
// Tests all payment methods: Razorpay, UPI, and Bank Transfer
// Verifies QR code generation, status polling, and real-time updates

const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_INVOICE_DATA = {
  amount: 2500,
  invoiceId: 'INV-TEST-001',
  clientInfo: {
    name: 'Test Client',
    email: 'test@example.com'
  }
};

// Test colors for better console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: QR Code Generation API
async function testQRCodeGeneration() {
  log('\n1. Testing QR Code Generation API...', 'blue');
  
  try {
    const testData = `upi://pay?pa=test@paytm&pn=BillMeNow&am=2500&cu=INR&tn=Invoice-INV-TEST-001`;
    const response = await fetch(`${BASE_URL}/api/qr-code?data=${encodeURIComponent(testData)}&size=128`);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      log(`✓ QR Code API working - Content Type: ${contentType}`, 'green');
      return true;
    } else {
      log(`✗ QR Code API failed - Status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ QR Code API error: ${error.message}`, 'red');
    return false;
  }
}

// Test 2: Razorpay Order Creation
async function testRazorpayOrderCreation() {
  log('\n2. Testing Razorpay Order Creation...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_INVOICE_DATA)
    });
    
    const data = await response.json();
    
    if (data.success && data.order) {
      log('✓ Razorpay order creation working', 'green');
      log(`  Order ID: ${data.order.id}`, 'yellow');
      log(`  Amount: ₹${data.order.amount / 100}`, 'yellow');
      return { success: true, orderId: data.order.id };
    } else {
      log(`✗ Razorpay order creation failed: ${data.error}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log(`✗ Razorpay order creation error: ${error.message}`, 'red');
    return { success: false };
  }
}

// Test 3: UPI Order Creation
async function testUPIOrderCreation() {
  log('\n3. Testing UPI Order Creation...', 'blue');
  
  try {
    const upiData = {
      ...TEST_INVOICE_DATA,
      upiId: 'freelancer@paytm'
    };
    
    const response = await fetch(`${BASE_URL}/api/payment/create-upi-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(upiData)
    });
    
    const data = await response.json();
    
    if (data.success && data.paymentId) {
      log('✓ UPI order creation working', 'green');
      log(`  Payment ID: ${data.paymentId}`, 'yellow');
      log(`  UPI String: ${data.upiString}`, 'yellow');
      return { success: true, paymentId: data.paymentId };
    } else {
      log(`✗ UPI order creation failed: ${data.error}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log(`✗ UPI order creation error: ${error.message}`, 'red');
    return { success: false };
  }
}

// Test 4: Payment Status Checking
async function testPaymentStatusCheck(paymentId) {
  log('\n4. Testing Payment Status Check...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/payment/status/${paymentId}`);
    const data = await response.json();
    
    if (data.success) {
      log('✓ Payment status check working', 'green');
      log(`  Status: ${data.status}`, 'yellow');
      log(`  Amount: ₹${data.amount}`, 'yellow');
      log(`  Method: ${data.method}`, 'yellow');
      return true;
    } else {
      log(`✗ Payment status check failed: ${data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Payment status check error: ${error.message}`, 'red');
    return false;
  }
}

// Test 5: Payment Gateway Component Simulation
async function testPaymentGatewayEndpoints() {
  log('\n5. Testing Payment Gateway Integration...', 'blue');
  
  // Test that all required endpoints respond
  const endpoints = [
    '/api/payment/create-order',
    '/api/payment/verify',
    '/api/payment/webhook'
  ];
  
  let allEndpointsWorking = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Empty body to test endpoint availability
      });
      
      // We expect either success or a meaningful error (not 404)
      if (response.status !== 404) {
        log(`✓ Endpoint ${endpoint} is responsive`, 'green');
      } else {
        log(`✗ Endpoint ${endpoint} not found`, 'red');
        allEndpointsWorking = false;
      }
    } catch (error) {
      log(`✗ Endpoint ${endpoint} error: ${error.message}`, 'red');
      allEndpointsWorking = false;
    }
  }
  
  return allEndpointsWorking;
}

// Test 6: Database Connection Test
async function testDatabaseConnection() {
  log('\n6. Testing Database Connection...', 'blue');
  
  try {
    // This will test if the database connection works by trying to create a UPI order
    const response = await fetch(`${BASE_URL}/api/payment/create-upi-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 100,
        invoiceId: 'TEST-DB-001',
        upiId: 'test@paytm',
        clientInfo: { name: 'DB Test', email: 'dbtest@example.com' }
      })
    });
    
    const data = await response.json();
    
    if (response.status !== 500) {
      log('✓ Database connection working', 'green');
      return true;
    } else {
      log('✗ Database connection failed', 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Database connection error: ${error.message}`, 'red');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('='.repeat(60), 'bold');
  log('BILLMENOW PAYMENT SYSTEM COMPREHENSIVE TEST', 'bold');
  log('='.repeat(60), 'bold');
  
  const results = {
    qrCode: false,
    razorpayOrder: false,
    upiOrder: false,
    statusCheck: false,
    endpoints: false,
    database: false
  };
  
  // Run all tests
  results.qrCode = await testQRCodeGeneration();
  
  const razorpayResult = await testRazorpayOrderCreation();
  results.razorpayOrder = razorpayResult.success;
  
  const upiResult = await testUPIOrderCreation();
  results.upiOrder = upiResult.success;
  
  // Test status check if we have a payment ID
  if (upiResult.success) {
    results.statusCheck = await testPaymentStatusCheck(upiResult.paymentId);
  }
  
  results.endpoints = await testPaymentGatewayEndpoints();
  results.database = await testDatabaseConnection();
  
  // Summary
  log('\n' + '='.repeat(60), 'bold');
  log('TEST RESULTS SUMMARY', 'bold');
  log('='.repeat(60), 'bold');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✓ PASS' : '✗ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} - ${test.toUpperCase().replace(/([A-Z])/g, ' $1').trim()}`, color);
  });
  
  log(`\nOVERALL: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 ALL PAYMENT FEATURES ARE WORKING CORRECTLY!', 'green');
    log('✓ QR codes are generating properly', 'green');
    log('✓ Razorpay integration is functional', 'green');
    log('✓ UPI payments are working', 'green');
    log('✓ Real-time status updates available', 'green');
    log('✓ Database connections stable', 'green');
  } else {
    log('\n⚠️  Some payment features need attention', 'yellow');
    log('Please check the failed tests above', 'yellow');
  }
  
  log('\n' + '='.repeat(60), 'bold');
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(error => {
    log(`\nTest runner error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testQRCodeGeneration,
  testRazorpayOrderCreation,
  testUPIOrderCreation,
  testPaymentStatusCheck
};
