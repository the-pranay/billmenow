import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testMinimalDashboard() {
  console.log('🧪 Testing minimal dashboard route...');
  
  try {
    const response = await fetch('http://localhost:3000/api/dashboard-minimal', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Dashboard response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dashboard data:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Error:', response.statusText);
      const errorData = await response.text();
      console.log('❌ Error details:', errorData);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testMinimalDashboard();
