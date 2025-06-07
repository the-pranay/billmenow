// Debug script to reproduce and fix "Something went wrong" client creation error
import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function debugSomethingWentWrong() {
    console.log('🔍 Debugging "Something went wrong" Client Creation Error...\n');
    
    let authToken = null;
    
    try {
        // Step 1: Authenticate
        console.log('1. Authenticating...');
        
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        
        if (loginResponse.data.success && loginResponse.data.token) {
            authToken = loginResponse.data.token;
            console.log('✅ Authentication successful');
            console.log(`   Token: ${authToken.substring(0, 20)}...`);
        } else {
            console.log('❌ Authentication failed');
            return;
        }
        
        // Step 2: Test client creation scenarios
        console.log('\n2. Testing Client Creation Scenarios...');
        
        // Scenario A: Valid client data
        console.log('\n   A. Valid client creation:');
        const validClient = {
            name: 'Debug Test Client',
            email: 'debug@test.com',
            phone: '+91 9876543210',
            company: 'Debug Company',
            address: '123 Debug Street',
            notes: 'Debug test client'
        };
        
        try {
            console.log('      Sending request...');
            console.log('      Data:', JSON.stringify(validClient, null, 8));
            
            const response = await axios.post(`${BASE_URL}/api/clients`, validClient, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('      ✅ SUCCESS:', response.data);
            
        } catch (error) {
            console.log('      ❌ ERROR - This is likely the "Something went wrong" scenario');
            console.log('      Status:', error.response?.status);
            console.log('      Data:', error.response?.data);
            console.log('      Message:', error.message);
            
            // Analyze the error
            if (error.response?.status === 500) {
                console.log('      🔍 500 Error - Server-side issue');
            } else if (error.response?.status === 401) {
                console.log('      🔍 401 Error - Authentication issue');
            } else if (error.response?.status === 400) {
                console.log('      🔍 400 Error - Validation issue');
            } else if (error.code === 'ECONNREFUSED') {
                console.log('      🔍 Connection refused - Server not running');
            } else {
                console.log('      🔍 Unknown error type');
            }
        }
        
        // Scenario B: Test direct server health
        console.log('\n   B. Testing server health:');
        try {
            const healthResponse = await axios.get(`${BASE_URL}/api/clients`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            console.log('      ✅ Server responding:', healthResponse.status);
        } catch (error) {
            console.log('      ❌ Server health check failed:', error.response?.status || error.code);
        }
        
        // Scenario C: Test without authorization
        console.log('\n   C. Testing without authorization:');
        try {
            await axios.post(`${BASE_URL}/api/clients`, validClient, {
                headers: {
                    'Content-Type': 'application/json'
                    // No Authorization header
                }
            });
        } catch (error) {
            console.log('      Expected error (no auth):', error.response?.status, error.response?.data?.error);
        }
        
        console.log('\n🎯 Analysis Summary:');
        console.log('   - If Scenario A fails with 500: Server-side error (database, validation, etc.)');
        console.log('   - If Scenario A fails with network error: Server not responding');
        console.log('   - If Scenario A succeeds: Error is likely in frontend error handling');
        console.log('   - The "Something went wrong" message comes from generic error handling');
        
    } catch (error) {
        console.log('💥 Unexpected error:', error.message);
    }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    debugSomethingWentWrong().catch(console.error);
}

export { debugSomethingWentWrong };
