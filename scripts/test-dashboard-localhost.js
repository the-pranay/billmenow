import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3001/api';

async function testDashboardRoute() {
  try {    // First register a test user
    console.log('🔐 Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'User', 
      email: 'testuser@example.com',
      password: 'password123',
      businessName: 'Test Business',
      businessType: 'freelancer',
      phone: '1234567890',
      country: 'US'
    });

    if (!registerResponse.data.success) {
      console.log('⚠️ Registration failed, trying to login with existing user...');
      
      // Try to login instead
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'testuser@example.com',
        password: 'password123'
      });

      if (!loginResponse.data.success) {
        throw new Error('Both registration and login failed');
      }

      console.log('✅ Login successful!');
      var token = loginResponse.data.token;
    } else {
      console.log('✅ Registration successful!');
      var token = registerResponse.data.token;
    }

    console.log('🎯 Testing dashboard route...');
    
    // Test dashboard route with authentication
    const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Dashboard route success!');
    console.log('📊 Dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));

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
