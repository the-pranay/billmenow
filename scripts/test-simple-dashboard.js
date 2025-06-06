async function testSimpleDashboard() {
  try {
    console.log('🧪 Testing simple dashboard route...');
    
    const response = await fetch('http://localhost:3000/api/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Dashboard response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Dashboard response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Error:', response.statusText);
      const errorText = await response.text();
      console.log('❌ Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Error testing dashboard:', error.message);
  }
}

testSimpleDashboard();
