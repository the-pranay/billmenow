// Test with known test user data
const testWithTestUser = async () => {
  console.log('🔧 Testing with Test User...\n');

  // Use test user from previous session
  const testUser = {
    email: 'john.doe@example.com',
    password: 'password123'
  };

  console.log(`Testing with: ${testUser.email}`);

  try {
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.success) {
      console.log('✅ Login successful');
      console.log(`   User: ${loginData.user.firstName} ${loginData.user.lastName}`);
      
      const token = loginData.token;

      // Test Dashboard API
      const dashboardResponse = await fetch('http://localhost:3000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const dashboardData = await dashboardResponse.json();
      
      if (dashboardResponse.ok && dashboardData.success) {
        console.log('✅ Dashboard API successful');
        console.log(`   Stats loaded: ${JSON.stringify(dashboardData.stats, null, 2)}`);
      } else {
        console.log('❌ Dashboard API failed');
        console.log(`   Error: ${dashboardData.error}`);
      }

    } else {
      console.log('❌ Login failed');
      console.log(`   Error: ${loginData.error}`);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
};

testWithTestUser();
