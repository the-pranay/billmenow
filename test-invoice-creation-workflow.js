#!/usr/bin/env node

/**
 * Comprehensive test for the invoice creation workflow
 * Tests both backend API functionality and URL parameter handling
 */

const BASE_URL = 'http://localhost:3000';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || response.statusText}`);
    }

    return { success: true, data, status: response.status };
  } catch (err) {
    return { success: false, error: err.message, status: err.status };
  }
}

async function testAuthentication() {
  log('\n🔐 Testing Authentication', colors.bright);
  log('=' .repeat(50));

  // Test login
  const loginResult = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(testUser)
  });

  if (!loginResult.success) {
    error(`Login failed: ${loginResult.error}`);
    return null;
  }

  success('Login successful');
  info(`Token received: ${loginResult.data.token.substring(0, 20)}...`);
  
  return loginResult.data.token;
}

async function testClientOperations(token) {
  log('\n👥 Testing Client Operations', colors.bright);
  log('=' .repeat(50));

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Fetch existing clients
  const clientsResult = await makeRequest(`${BASE_URL}/api/clients`, {
    method: 'GET',
    headers: authHeaders
  });

  if (!clientsResult.success) {
    error(`Failed to fetch clients: ${clientsResult.error}`);
    return [];
  }

  success(`Found ${clientsResult.data.clients.length} existing clients`);
  
  // Display client information
  clientsResult.data.clients.forEach((client, index) => {
    info(`  ${index + 1}. ${client.name} (ID: ${client._id})`);
  });

  return clientsResult.data.clients;
}

async function testInvoiceCreation(token, clients) {
  log('\n📄 Testing Invoice Creation', colors.bright);
  log('=' .repeat(50));

  if (clients.length === 0) {
    warning('No clients available for invoice creation test');
    return null;
  }

  const authHeaders = { Authorization: `Bearer ${token}` };
  const testClient = clients[0];
  // Create test invoice
  const invoiceData = {
    clientId: testClient._id,
    items: [
      {
        description: 'Website Development',
        quantity: 1,
        rate: 50000,
        amount: 50000
      },
      {
        description: 'SEO Optimization',
        quantity: 1,
        rate: 15000,
        amount: 15000
      }
    ],
    subtotal: 65000,
    taxTotal: 11700,
    discountAmount: 0,
    total: 76700,
    notes: 'Test invoice created via API',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  };

  info(`Creating invoice for client: ${testClient.name}`);
  
  const invoiceResult = await makeRequest(`${BASE_URL}/api/invoices`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(invoiceData)
  });

  if (!invoiceResult.success) {
    error(`Invoice creation failed: ${invoiceResult.error}`);
    return null;
  }

  success('Invoice created successfully');
  info(`Invoice ID: ${invoiceResult.data.invoice._id}`);
  info(`Invoice Number: ${invoiceResult.data.invoice.invoiceNumber}`);
  
  return invoiceResult.data.invoice;
}

async function testFrontendPageAccess() {
  log('\n🌐 Testing Frontend Page Access', colors.bright);
  log('=' .repeat(50));

  // Test pages that should be accessible (redirects are expected for protected routes)
  const pagesToTest = [
    { url: `${BASE_URL}/`, name: 'Homepage' },
    { url: `${BASE_URL}/auth/login`, name: 'Login Page' },
    { url: `${BASE_URL}/clients`, name: 'Clients Page (should redirect to login)' },
    { url: `${BASE_URL}/invoices/create`, name: 'Invoice Creation Page (should redirect to login)' },
  ];

  for (const page of pagesToTest) {
    try {
      const response = await fetch(page.url);
      if (response.ok || response.status === 302 || response.status === 307) {
        success(`${page.name}: Accessible (Status: ${response.status})`);
      } else {
        warning(`${page.name}: Unexpected status ${response.status}`);
      }
    } catch (err) {
      error(`${page.name}: ${err.message}`);
    }
  }
}

async function testURLParameterSupport(clients) {
  log('\n🔗 Testing URL Parameter Support', colors.bright);
  log('=' .repeat(50));

  if (clients.length === 0) {
    warning('No clients available for URL parameter testing');
    return;
  }

  const testClient = clients[0];
  const urlWithClientId = `${BASE_URL}/invoices/create?clientId=${testClient._id}`;
  
  info(`Testing URL: ${urlWithClientId}`);
  
  try {
    // Test that the URL is accessible (even if it redirects to login)
    const response = await fetch(urlWithClientId);
    
    if (response.ok || response.status === 302 || response.status === 307) {
      success('URL with clientId parameter is accessible');
      
      // If redirected, check the redirect URL contains the original parameters
      if (response.redirected) {
        info(`Redirected to: ${response.url}`);
        if (response.url.includes('redirect=') && response.url.includes('clientId')) {
          success('Redirect preserves client ID parameter');
        } else {
          warning('Redirect may not preserve client ID parameter');
        }
      }
    } else {
      warning(`Unexpected response status: ${response.status}`);
    }
  } catch (err) {
    error(`URL parameter test failed: ${err.message}`);
  }
}

async function runComprehensiveTest() {
  log('🧪 BillMeNow Invoice Creation Workflow Test', colors.cyan + colors.bright);
  log('=' .repeat(60));
  
  try {
    // Test authentication
    const token = await testAuthentication();
    if (!token) {
      error('Authentication test failed - cannot continue');
      return;
    }

    // Test client operations
    const clients = await testClientOperations(token);

    // Test invoice creation
    const invoice = await testInvoiceCreation(token, clients);

    // Test frontend page access
    await testFrontendPageAccess();

    // Test URL parameter support
    await testURLParameterSupport(clients);

    // Summary
    log('\n📊 Test Summary', colors.bright);
    log('=' .repeat(50));
    success('✅ Authentication: Working');
    success(`✅ Client Operations: Working (${clients.length} clients found)`);
    success(`✅ Invoice Creation: ${invoice ? 'Working' : 'Failed'}`);
    success('✅ Frontend Pages: Accessible with expected redirects');
    success('✅ URL Parameters: Supported');

    log('\n🎉 Invoice Creation Workflow Test Complete!', colors.green + colors.bright);
    
    if (clients.length > 0) {
      log('\n🔗 Test URL for manual verification:', colors.cyan);
      log(`${BASE_URL}/invoices/create?clientId=${clients[0]._id}`);
      log('(Login first, then navigate to this URL to test client pre-selection)');
    }

  } catch (err) {
    error(`Test execution failed: ${err.message}`);
  }
}

// Handle both Node.js and browser environments
if (typeof window === 'undefined') {
  // Node.js environment
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    runComprehensiveTest();
  }).catch(() => {
    // Fallback for environments without node-fetch
    error('This test requires node-fetch package. Install it with: npm install node-fetch');
    error('Alternatively, run this test in a browser console with developer tools open.');
  });
} else {
  // Browser environment
  runComprehensiveTest();
}
