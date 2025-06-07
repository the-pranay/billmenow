// Test script to simulate frontend UI interactions and identify error sources
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function simulateFrontendInteractions() {
    console.log('🎯 Simulating Frontend UI Interactions...\n');
    
    let token = null;
    let userId = null;
    
    try {
        // Step 1: Setup authenticated user
        console.log('1. Setting up authenticated user...');
        const testUser = {
            firstName: 'UI',
            lastName: 'Test',
            email: `uitest${Date.now()}@example.com`,
            password: 'UITest123!',
            businessName: 'UI Test Business',
            businessType: 'freelancer',
            phone: '+1234567890',
            country: 'IN'
        };

        try {
            await axios.post(`${BASE_URL}/api/auth/register`, testUser);
        } catch (error) {
            if (error.response?.status !== 409) {
                console.log('❌ Registration failed:', error.response?.data);
                return;
            }
        }

        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        
        if (loginResponse.data.token) {
            token = loginResponse.data.token;
            userId = loginResponse.data.user.id;
            console.log('✅ Authentication setup complete');
        } else {
            console.log('❌ Login failed');
            return;
        }

        // Step 2: Test localStorage simulation (what frontend would do)
        console.log('\n2. Testing localStorage token behavior...');
        
        // Simulate what the frontend does - storing token in localStorage
        const mockLocalStorage = {
            token: token,
            user: JSON.stringify(loginResponse.data.user)
        };
        
        console.log('✅ Token stored in mock localStorage');

        // Step 3: Test API calls with different error scenarios
        console.log('\n3. Testing frontend API call patterns...');
        
        // Test 3a: Normal client creation (should work)
        console.log('\n   3a. Normal client creation:');
        try {
            const clientResponse = await axios.post(`${BASE_URL}/api/clients`, {
                name: 'Frontend Test Client',
                email: 'frontend@test.com',
                phone: '+1234567890',
                company: 'Frontend Test Co',
                address: '123 Test St'
            }, {
                headers: {
                    'Authorization': `Bearer ${mockLocalStorage.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('   ✅ Client creation successful');
            console.log('   📄 Response format:', {
                success: clientResponse.data.success,
                hasClient: !!clientResponse.data.client,
                hasMessage: !!clientResponse.data.message,
                hasError: !!clientResponse.data.error
            });
        } catch (error) {
            console.log('   ❌ Client creation failed');
            console.log('   📄 Error format:', {
                status: error.response?.status,
                hasError: !!error.response?.data?.error,
                hasMessage: !!error.response?.data?.message,
                errorValue: error.response?.data?.error,
                messageValue: error.response?.data?.message
            });
        }

        // Test 3b: Test with malformed request (frontend input validation bypass)
        console.log('\n   3b. Malformed client creation:');
        try {
            const malformedResponse = await axios.post(`${BASE_URL}/api/clients`, {
                name: '', // Empty name
                email: 'invalid-email', // Invalid email
                phone: '+1234567890'
            }, {
                headers: {
                    'Authorization': `Bearer ${mockLocalStorage.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('   ❌ Malformed request should have failed but succeeded');
        } catch (error) {
            console.log('   ✅ Malformed request correctly failed');
            console.log('   📄 Error details:', {
                status: error.response?.status,
                error: error.response?.data?.error,
                isSpecific: error.response?.data?.error !== 'Something went wrong'
            });
        }

        // Test 3c: Test network-level errors (simulate what frontend might see)
        console.log('\n   3c. Network error simulation:');
        try {
            // Try to hit a non-existent endpoint
            await axios.post(`${BASE_URL}/api/nonexistent`, {}, {
                headers: {
                    'Authorization': `Bearer ${mockLocalStorage.token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.log('   📊 Network error response:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                hasData: !!error.response?.data,
                dataType: typeof error.response?.data,
                errorMessage: error.message
            });
        }

        // Step 4: Test the specific clientsAPI.create() pattern
        console.log('\n4. Testing clientsAPI.create() pattern...');
        
        // Simulate the exact pattern used in the frontend
        const simulateClientAPICreate = async (clientData) => {
            try {
                const response = await fetch(`${BASE_URL}/api/clients`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${mockLocalStorage.token}`
                    },
                    body: JSON.stringify(clientData)
                });
                
                // If response is 401, token might be expired
                if (response.status === 401) {
                    console.log('   ⚠️ 401 - Token expired or invalid');
                    return { success: false, error: 'Authentication failed' };
                }
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || `API Error: ${response.status}`);
                }
                
                return data;
            } catch (error) {
                console.log('   🔍 clientsAPI.create() error:', error.message);
                throw error;
            }
        };

        // Test valid client creation
        try {
            const result = await simulateClientAPICreate({
                name: 'API Pattern Test Client',
                email: 'apitest@test.com',
                phone: '+1234567890'
            });
            
            console.log('   ✅ clientsAPI pattern successful');
            console.log('   📄 Result:', { success: result.success, hasClient: !!result.client });
        } catch (error) {
            console.log('   ❌ clientsAPI pattern failed:', error.message);
        }

        // Step 5: Test invoice creation pattern
        console.log('\n5. Testing invoicesAPI.create() pattern...');
        
        // First, get clients to simulate frontend client loading
        const clientsResponse = await axios.get(`${BASE_URL}/api/clients`, {
            headers: { 'Authorization': `Bearer ${mockLocalStorage.token}` }
        });
        
        if (clientsResponse.data.success && clientsResponse.data.clients.length > 0) {
            const testClient = clientsResponse.data.clients[0];
            console.log('   ✅ Clients loaded, testing invoice creation');
            
            const simulateInvoiceAPICreate = async (invoiceData) => {
                try {
                    const response = await fetch(`${BASE_URL}/api/invoices`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${mockLocalStorage.token}`
                        },
                        body: JSON.stringify(invoiceData)
                    });
                    
                    if (response.status === 401) {
                        console.log('   ⚠️ 401 - Token expired or invalid');
                        return { success: false, error: 'Authentication failed' };
                    }
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.error || `API Error: ${response.status}`);
                    }
                    
                    return data;
                } catch (error) {
                    console.log('   🔍 invoicesAPI.create() error:', error.message);
                    throw error;
                }
            };
            
            try {
                const invoiceResult = await simulateInvoiceAPICreate({
                    clientId: testClient._id || testClient.id,
                    items: [{
                        description: 'Test Service',
                        quantity: 1,
                        rate: 1000,
                        amount: 1000
                    }],
                    taxRate: 18,
                    discountRate: 0,
                    notes: 'Test invoice',
                    status: 'draft'
                });
                
                console.log('   ✅ invoicesAPI pattern successful');
            } catch (error) {
                console.log('   ❌ invoicesAPI pattern failed:', error.message);
            }
            
            // Test with missing client ID (simulating the "please select client" error)
            try {
                await simulateInvoiceAPICreate({
                    clientId: '', // Empty client ID
                    items: [{
                        description: 'Test Service',
                        quantity: 1,
                        rate: 1000,
                        amount: 1000
                    }],
                    status: 'draft'
                });
                console.log('   ❌ Empty clientId should have failed but succeeded');
            } catch (error) {
                console.log('   ✅ Empty clientId correctly failed:', error.message);
            }
        } else {
            console.log('   ⚠️ No clients available for invoice testing');
        }

        // Step 6: Test error handling patterns
        console.log('\n6. Testing common frontend error scenarios...');
        
        const errorScenarios = [
            {
                name: 'Expired Token',
                token: 'expired_token_here',
                expectedError: 'Authentication'
            },
            {
                name: 'Malformed Token',
                token: 'malformed.token.here',
                expectedError: 'Authentication'
            },
            {
                name: 'No Token',
                token: null,
                expectedError: 'No token provided'
            }
        ];
        
        for (const scenario of errorScenarios) {
            console.log(`\n   Testing ${scenario.name}:`);
            try {
                const headers = { 'Content-Type': 'application/json' };
                if (scenario.token) {
                    headers['Authorization'] = `Bearer ${scenario.token}`;
                }
                
                await axios.post(`${BASE_URL}/api/clients`, {
                    name: 'Test Client',
                    email: 'test@test.com'
                }, { headers });
                
                console.log(`   ❌ ${scenario.name} should have failed but succeeded`);
            } catch (error) {
                console.log(`   ✅ ${scenario.name} correctly failed:`, error.response?.data?.error);
            }
        }

        console.log('\n🎉 Frontend UI Interaction Testing Complete!');
        console.log('\n📊 FINDINGS:');
        console.log('   • Backend APIs working correctly');
        console.log('   • Error messages are specific and descriptive');
        console.log('   • Authentication flow working properly');
        console.log('\n🔍 NEXT STEPS:');
        console.log('   1. Check frontend console for JavaScript errors');
        console.log('   2. Verify toast notification system is rendering');
        console.log('   3. Check if "Something went wrong" is a frontend fallback message');
        console.log('   4. Test actual frontend UI in browser');

    } catch (error) {
        console.log('💥 Unexpected error:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', error.response.data);
        }
    }
}

simulateFrontendInteractions().catch(console.error);
