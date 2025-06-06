import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

async function testJustDashboard() {
  try {
    // Login first
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'testuser@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('🎫 Token received');

    // Test dashboard route specifically
    const dashboardResponse = await axios.get(`${BASE_URL}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Dashboard response status:', dashboardResponse.status);
    console.log('📊 Dashboard raw response:');
    console.log(JSON.stringify(dashboardResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error testing dashboard:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testJustDashboard();
