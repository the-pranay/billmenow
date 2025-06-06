// Test just the clients route to see if withAuth works
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testClientsRoute() {
    console.log('🧪 Testing Clients Route with withAuth...\n');
    
    // Test data
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

    try {
        // Register and login to get token
        const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        
        const token = loginResponse.data.token;
        console.log(`Token received: ${token ? 'Yes' : 'No'}`);

        // Test clients route
        console.log('Testing clients route...');
        const clientsResponse = await axios.get(`${BASE_URL}/api/clients`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Clients route test passed!');
        console.log('Response:', clientsResponse.data);

    } catch (error) {
        console.error('❌ Clients route test failed:');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testClientsRoute().catch(console.error);
