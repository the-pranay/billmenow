const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3002/api';

async function testDashboardRoute() {
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
      } else {
        throw new Error('Login failed');
      }
    } catch (loginError) {
      console.log('⚠️ Login failed, trying registration...');
      
      // If login fails, try registration with a new email
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        firstName: 'Test',
        lastName: 'User3', 
        email: 'testuser3@example.com',
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
    }

    console.log('🎯 Testing dashboard route...');
    
    // Test dashboard route without authentication first
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`);
      console.log('✅ Dashboard route success (no auth)!');
      console.log('📊 Dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));
    } catch (dashError) {
      console.log('Dashboard without auth failed, trying with auth...');
      
      // Test dashboard route with authentication
      const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Dashboard route success with auth!');
      console.log('📊 Dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error testing dashboard route:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testDashboardRoute();
