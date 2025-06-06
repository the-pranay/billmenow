import axios from 'axios';

const PRODUCTION_URL = 'https://billmenow.vercel.app/api';

async function testProductionAuth() {
  console.log('🚀 Testing BillMeNow Production Authentication...\n');
  
  try {
    // Test user login
    console.log('🔐 Testing production login...');
    const loginResponse = await axios.post(`${PRODUCTION_URL}/auth/login`, {
      email: 'testuser@example.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Production login successful!');
      const token = loginResponse.data.token;
      console.log('🎫 Token received:', token.substring(0, 30) + '...');

      // Test protected routes
      console.log('\n🛡️ Testing protected routes...\n');

      // Test dashboard
      console.log('1. Testing dashboard...');
      try {
        const dashboardResponse = await axios.get(`${PRODUCTION_URL}/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Dashboard accessible');
        console.log('📊 Stats:', dashboardResponse.data.stats);
      } catch (dashError) {
        console.error('❌ Dashboard failed:', dashError.response?.status, dashError.response?.data);
      }

      // Test clients
      console.log('\n2. Testing clients...');
      try {
        const clientsResponse = await axios.get(`${PRODUCTION_URL}/clients`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Clients accessible');
        console.log('👥 Clients count:', clientsResponse.data.clients?.length || 0);
      } catch (clientsError) {
        console.error('❌ Clients failed:', clientsError.response?.status, clientsError.response?.data);
      }

      // Test invoices
      console.log('\n3. Testing invoices...');
      try {
        const invoicesResponse = await axios.get(`${PRODUCTION_URL}/invoices`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Invoices accessible');
        console.log('🧾 Invoices count:', invoicesResponse.data.invoices?.length || 0);
      } catch (invoicesError) {
        console.error('❌ Invoices failed:', invoicesError.response?.status, invoicesError.response?.data);
      }

      // Test reports
      console.log('\n4. Testing reports...');
      try {
        const reportsResponse = await axios.get(`${PRODUCTION_URL}/reports`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Reports accessible');
        console.log('📊 Report type available');
      } catch (reportsError) {
        console.error('❌ Reports failed:', reportsError.response?.status, reportsError.response?.data);
      }

      // Test user profile
      console.log('\n5. Testing user profile...');
      try {
        const profileResponse = await axios.get(`${PRODUCTION_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Profile accessible');
        console.log('👤 User:', profileResponse.data.user?.firstName || 'Unknown');
      } catch (profileError) {
        console.error('❌ Profile failed:', profileError.response?.status, profileError.response?.data);
      }

    } else {
      console.error('❌ Production login failed:', loginResponse.data);
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ Production API Error:');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('URL:', error.config?.url);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

testProductionAuth().catch(console.error);
