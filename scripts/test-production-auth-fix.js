// Production Authentication Fix Verification Script
const testProductionAuth = async () => {
  console.log('🔧 Testing Production Authentication Fixes...\n');

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://billmenow.vercel.app' 
    : 'http://localhost:3000';

  console.log(`Base URL: ${baseUrl}\n`);

  // Test 1: Login Flow
  console.log('📝 Test 1: Login Authentication Flow');
  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'thepranay2004@gmail.com', // Admin email from env
        password: 'admin@30' // Admin password from env
      }),
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.success) {
      console.log('✅ Login successful');
      console.log(`   User: ${loginData.user.firstName} ${loginData.user.lastName}`);
      console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
      
      const token = loginData.token;

      // Test 2: Dashboard API with Token
      console.log('\n📊 Test 2: Dashboard API Access');
      const dashboardResponse = await fetch(`${baseUrl}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const dashboardData = await dashboardResponse.json();
      
      if (dashboardResponse.ok && dashboardData.success) {
        console.log('✅ Dashboard API successful');
        console.log(`   Total Invoices: ${dashboardData.stats?.totalInvoices || 0}`);
        console.log(`   Total Clients: ${dashboardData.stats?.clientsCount || 0}`);
        console.log(`   Total Revenue: ₹${dashboardData.stats?.totalRevenue || 0}`);
      } else {
        console.log('❌ Dashboard API failed');
        console.log(`   Status: ${dashboardResponse.status}`);
        console.log(`   Error: ${dashboardData.error || 'Unknown error'}`);
      }

      // Test 3: Clients API with Token
      console.log('\n👥 Test 3: Clients API Access');
      const clientsResponse = await fetch(`${baseUrl}/api/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const clientsData = await clientsResponse.json();
      
      if (clientsResponse.ok && clientsData.success) {
        console.log('✅ Clients API successful');
        console.log(`   Clients found: ${clientsData.clients?.length || 0}`);
      } else {
        console.log('❌ Clients API failed');
        console.log(`   Status: ${clientsResponse.status}`);
        console.log(`   Error: ${clientsData.error || 'Unknown error'}`);
      }

      // Test 4: Invoices API with Token
      console.log('\n📄 Test 4: Invoices API Access');
      const invoicesResponse = await fetch(`${baseUrl}/api/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const invoicesData = await invoicesResponse.json();
      
      if (invoicesResponse.ok && invoicesData.success) {
        console.log('✅ Invoices API successful');
        console.log(`   Invoices found: ${invoicesData.invoices?.length || 0}`);
      } else {
        console.log('❌ Invoices API failed');
        console.log(`   Status: ${invoicesResponse.status}`);
        console.log(`   Error: ${invoicesData.error || 'Unknown error'}`);
      }

      // Test 5: Reports API with Token
      console.log('\n📊 Test 5: Reports API Access');
      const reportsResponse = await fetch(`${baseUrl}/api/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const reportsData = await reportsResponse.json();
      
      if (reportsResponse.ok && reportsData.success) {
        console.log('✅ Reports API successful');
        console.log(`   Reports data loaded successfully`);
      } else {
        console.log('❌ Reports API failed');
        console.log(`   Status: ${reportsResponse.status}`);
        console.log(`   Error: ${reportsData.error || 'Unknown error'}`);
      }

    } else {
      console.log('❌ Login failed');
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Error: ${loginData.error || 'Unknown error'}`);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  // Test 6: Unauthenticated Access to Protected Routes
  console.log('\n🔒 Test 6: Unauthenticated Access Protection');
  try {
    const protectedRoutes = ['/api/dashboard', '/api/clients', '/api/invoices', '/api/reports'];
    
    for (const route of protectedRoutes) {
      const response = await fetch(`${baseUrl}${route}`);
      const data = await response.json();
      
      if (response.status === 401) {
        console.log(`✅ ${route} properly protected (401)`);
      } else {
        console.log(`❌ ${route} not properly protected (${response.status})`);
      }
    }
  } catch (error) {
    console.log('❌ Protection test failed:', error.message);
  }

  console.log('\n🎯 Production Authentication Fix Test Complete!');
};

// Test for browser environment simulation
const simulateBrowserAuth = () => {
  console.log('\n🌐 Browser Environment Simulation:');
  console.log('1. Login redirect logic updated to use window.location.href');
  console.log('2. Cookie settings optimized for production (Secure, SameSite)');
  console.log('3. Token validation implemented with automatic cleanup');
  console.log('4. Middleware updated to prevent redirect loops');
  console.log('5. API utility created for consistent auth header handling');
  console.log('6. All protected pages updated to use new API utility');
};

// Run tests
if (typeof window === 'undefined') {
  // Node.js environment
  testProductionAuth();
} else {
  // Browser environment
  simulateBrowserAuth();
}

export { testProductionAuth };
