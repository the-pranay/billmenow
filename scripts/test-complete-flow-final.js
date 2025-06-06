import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000/api';

async function testCompleteAuthFlow() {
  try {
    let token;
    
    // Try to login first
    console.log('🔐 Testing user login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'testuser@example.com',
        password: 'password123'
      });

      if (loginResponse.data.success) {
        console.log('✅ Login successful!');
        token = loginResponse.data.token;
        console.log('🎫 Token received:', token.substring(0, 20) + '...');
      } else {
        throw new Error('Login failed');
      }
    } catch (loginError) {
      console.log('⚠️ Login failed, trying registration...');
      
      // If login fails, try registration with a new email
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        firstName: 'Test',
        lastName: 'User4', 
        email: 'testuser4@example.com',
        password: 'password123',
        businessName: 'Test Business',
        businessType: 'freelancer',
        phone: '1234567890',
        country: 'US'
      });

      if (!registerResponse.data.success) {
        throw new Error('Both login and registration failed');
      }

      console.log('✅ Registration successful!');
      token = registerResponse.data.token;
      console.log('🎫 Token received:', token.substring(0, 20) + '...');
    }

    console.log('\n🎯 Testing protected routes with authentication...\n');
    
    // Test dashboard route
    console.log('1. Testing dashboard route...');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Dashboard route success!');
      console.log('📊 Dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));
    } catch (dashError) {
      console.error('❌ Dashboard route failed:', dashError.response?.status, dashError.response?.statusText);
      if (dashError.response?.data) {
        console.error('Error data:', dashError.response.data);
      }
    }

    // Test clients route
    console.log('\n2. Testing clients route...');
    try {
      const clientsResponse = await axios.get(`${BASE_URL}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Clients route success!');
      console.log('👥 Clients data:', JSON.stringify(clientsResponse.data, null, 2));
    } catch (clientsError) {
      console.error('❌ Clients route failed:', clientsError.response?.status, clientsError.response?.statusText);
      if (clientsError.response?.data) {
        console.error('Error data:', clientsError.response.data);
      }
    }

    // Test invoices route
    console.log('\n3. Testing invoices route...');
    try {
      const invoicesResponse = await axios.get(`${BASE_URL}/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Invoices route success!');
      console.log('🧾 Invoices data:', JSON.stringify(invoicesResponse.data, null, 2));
    } catch (invoicesError) {
      console.error('❌ Invoices route failed:', invoicesError.response?.status, invoicesError.response?.statusText);
      if (invoicesError.response?.data) {
        console.error('Error data:', invoicesError.response.data);
      }
    }

    console.log('\n🎉 Authentication flow testing complete!');

  } catch (error) {
    console.error('❌ Error in authentication flow test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testCompleteAuthFlow();
