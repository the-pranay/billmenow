async function testDashboardTest() {
  try {
    console.log('🧪 Testing dashboard-test route...');
    
    const response = await fetch('http://localhost:3000/api/dashboard-test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Dashboard-test response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Dashboard-test response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Error:', response.statusText);
    }

  } catch (error) {
    console.error('❌ Error testing dashboard-test:', error.message);
  }
}

testDashboardTest();
