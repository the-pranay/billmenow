// Minimal test for dashboard route
import axios from 'axios';

async function testDashboard() {
    try {
        // Register and login to get token
        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            email: `test${Date.now()}@example.com`,
            password: 'TestPassword123!',
            confirmPassword: 'TestPassword123!',
            businessName: 'Test Business',
            businessType: 'freelancer',
            phone: '+1234567890',
            country: 'IN',
            terms: true,
            privacy: true,
            marketing: false
        };

        const registerResponse = await axios.post('http://localhost:3000/api/auth/register', testUser);
        const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
            email: testUser.email,
            password: testUser.password
        });
        
        const token = loginResponse.data.token;
        console.log('Token:', token);

        // Test dashboard with detailed error logging
        console.log('Testing dashboard route...');
        const response = await axios.get('http://localhost:3000/api/dashboard', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Dashboard test passed!');
        console.log('Response:', response.data);

    } catch (error) {
        console.error('❌ Dashboard test failed:');
        console.error('Error message:', error.message);
        console.error('Status:', error.response?.status);
        console.error('Status text:', error.response?.statusText);
        console.error('Response data:', error.response?.data);
        console.error('Response headers:', error.response?.headers);
    }
}

testDashboard();
