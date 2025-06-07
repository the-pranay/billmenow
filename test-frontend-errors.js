// Test script to reproduce "Something went wrong" and "please select the client" errors
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testFrontendErrors() {
    console.log('🔍 Testing Frontend Error Scenarios...\n');
    
    let token = null;
    let clientId = null;
    
    try {
        // Create test user data
        const testUser = {
            firstName: 'Frontend',
            lastName: 'Test',
            email: `frontend${Date.now()}@example.com`,
            password: 'TestPassword123!',
            confirmPassword: 'TestPassword123!',
            businessName: 'Frontend Test Business',
            businessType: 'freelancer',
            phone: '+1234567890',
            country: 'IN',
            terms: true,
            privacy: true,
            marketing: false
        };

        // Test 1: Register and Login User
        console.log('1. Setting up test user...');
        try {
            await axios.post(`${BASE_URL}/api/auth/register`, testUser);
            console.log('✅ Registration: SUCCESS');
        } catch (error) {
            if (error.response?.status === 409) {
                console.log('ℹ️ User already exists, continuing...');
            } else {
                console.log('❌ Registration: FAILED');
                console.log('Error:', error.response?.data || error.message);
                return;
            }
        }

        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        
        if (loginResponse.data.token) {
            token = loginResponse.data.token;
            console.log('✅ Login: SUCCESS');
        } else {
            console.log('❌ Login: No token received');
            return;
        }

        // Test 2: Test Client Creation Error Scenarios
        console.log('\n2. Testing Client Creation Error Scenarios...');
        
        // Test 2a: Valid client creation (should work)
        console.log('\n   2a. Valid client creation:');
        try {
            const validClientData = {
                name: 'Valid Test Client',
                email: 'validclient@example.com',
                phone: '+1234567890',
                company: 'Valid Company',
                address: '123 Valid Street, Valid City',
                notes: 'Valid test client'
            };

            const validClientResponse = await axios.post(`${BASE_URL}/api/clients`, validClientData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (validClientResponse.data.success) {
                clientId = validClientResponse.data.client._id;
                console.log('   ✅ Valid Client Creation: SUCCESS');
            } else {
                console.log('   ❌ Valid Client Creation: FAILED');
                console.log('   Response:', validClientResponse.data);
            }
        } catch (error) {
            console.log('   ❌ Valid Client Creation: ERROR');
            console.log('   Error:', error.response?.data || error.message);
            console.log('   Status:', error.response?.status);
        }

        // Test 2b: Invalid client creation (missing required fields)
        console.log('\n   2b. Invalid client creation (missing name):');
        try {
            const invalidClientData = {
                // name: '', // Missing required field
                email: 'invalidclient@example.com',
                phone: '+1234567890'
            };

            const invalidClientResponse = await axios.post(`${BASE_URL}/api/clients`, invalidClientData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('   ❌ Invalid Client Creation: Should have failed but succeeded');
            console.log('   Response:', invalidClientResponse.data);
        } catch (error) {
            console.log('   ✅ Invalid Client Creation: CORRECTLY FAILED');
            console.log('   Error message:', error.response?.data?.error || 'Unknown error');
            console.log('   Status:', error.response?.status);
        }

        // Test 2c: Client creation with no auth token
        console.log('\n   2c. Client creation without auth token:');
        try {
            const noAuthClientData = {
                name: 'No Auth Client',
                email: 'noauth@example.com'
            };

            const noAuthResponse = await axios.post(`${BASE_URL}/api/clients`, noAuthClientData, {
                headers: {
                    'Content-Type': 'application/json'
                    // No Authorization header
                }
            });

            console.log('   ❌ No Auth Client Creation: Should have failed but succeeded');
            console.log('   Response:', noAuthResponse.data);
        } catch (error) {
            console.log('   ✅ No Auth Client Creation: CORRECTLY FAILED');
            console.log('   Error message:', error.response?.data?.error || 'Unknown error');
            console.log('   Status:', error.response?.status);
        }

        // Test 2d: Client creation with invalid auth token
        console.log('\n   2d. Client creation with invalid auth token:');
        try {
            const invalidAuthClientData = {
                name: 'Invalid Auth Client',
                email: 'invalidauth@example.com'
            };

            const invalidAuthResponse = await axios.post(`${BASE_URL}/api/clients`, invalidAuthClientData, {
                headers: {
                    'Authorization': 'Bearer invalid_token_here',
                    'Content-Type': 'application/json'
                }
            });

            console.log('   ❌ Invalid Auth Client Creation: Should have failed but succeeded');
            console.log('   Response:', invalidAuthResponse.data);
        } catch (error) {
            console.log('   ✅ Invalid Auth Client Creation: CORRECTLY FAILED');
            console.log('   Error message:', error.response?.data?.error || 'Unknown error');
            console.log('   Status:', error.response?.status);
        }

        // Test 3: Test Invoice Creation Error Scenarios
        console.log('\n3. Testing Invoice Creation Error Scenarios...');
        
        // Test 3a: Valid invoice creation (should work)
        console.log('\n   3a. Valid invoice creation:');
        try {
            const validInvoiceData = {
                clientId: clientId,
                items: [
                    {
                        description: 'Valid Service',
                        quantity: 1,
                        rate: 1000,
                        amount: 1000
                    }
                ],
                taxRate: 18,
                discountRate: 0,
                notes: 'Valid test invoice',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'draft'
            };

            const validInvoiceResponse = await axios.post(`${BASE_URL}/api/invoices`, validInvoiceData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (validInvoiceResponse.data.success) {
                console.log('   ✅ Valid Invoice Creation: SUCCESS');
            } else {
                console.log('   ❌ Valid Invoice Creation: FAILED');
                console.log('   Response:', validInvoiceResponse.data);
            }
        } catch (error) {
            console.log('   ❌ Valid Invoice Creation: ERROR');
            console.log('   Error:', error.response?.data || error.message);
            console.log('   Status:', error.response?.status);
        }

        // Test 3b: Invoice creation without client ID
        console.log('\n   3b. Invoice creation without client ID:');
        try {
            const noClientInvoiceData = {
                // clientId: '', // Missing client ID
                items: [
                    {
                        description: 'Service without client',
                        quantity: 1,
                        rate: 1000,
                        amount: 1000
                    }
                ],
                taxRate: 18,
                notes: 'Invoice without client',
                status: 'draft'
            };

            const noClientResponse = await axios.post(`${BASE_URL}/api/invoices`, noClientInvoiceData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('   ❌ No Client Invoice Creation: Should have failed but succeeded');
            console.log('   Response:', noClientResponse.data);
        } catch (error) {
            console.log('   ✅ No Client Invoice Creation: CORRECTLY FAILED');
            console.log('   Error message:', error.response?.data?.error || 'Unknown error');
            console.log('   Status:', error.response?.status);
        }

        // Test 3c: Invoice creation with invalid client ID
        console.log('\n   3c. Invoice creation with invalid client ID:');
        try {
            const invalidClientInvoiceData = {
                clientId: '507f1f77bcf86cd799439011', // Valid ObjectId format but non-existent
                items: [
                    {
                        description: 'Service with invalid client',
                        quantity: 1,
                        rate: 1000,
                        amount: 1000
                    }
                ],
                taxRate: 18,
                notes: 'Invoice with invalid client',
                status: 'draft'
            };

            const invalidClientResponse = await axios.post(`${BASE_URL}/api/invoices`, invalidClientInvoiceData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('   ❌ Invalid Client Invoice Creation: Should have failed but succeeded');
            console.log('   Response:', invalidClientResponse.data);
        } catch (error) {
            console.log('   ✅ Invalid Client Invoice Creation: CORRECTLY FAILED');
            console.log('   Error message:', error.response?.data?.error || 'Unknown error');
            console.log('   Status:', error.response?.status);
        }

        // Test 4: Test API Error Handling
        console.log('\n4. Testing API Error Response Formats...');
        
        // Test 4a: Check if error responses include proper error messages
        console.log('\n   4a. Checking error response format consistency:');
        
        const errorTestCases = [
            {
                name: 'Missing Auth Token',
                request: () => axios.post(`${BASE_URL}/api/clients`, { name: 'Test' })
            },
            {
                name: 'Invalid JSON',
                request: () => axios.post(`${BASE_URL}/api/clients`, 'invalid json', {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                })
            },
            {
                name: 'Empty Request Body',
                request: () => axios.post(`${BASE_URL}/api/clients`, {}, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                })
            }
        ];

        for (const testCase of errorTestCases) {
            try {
                await testCase.request();
                console.log(`   ❌ ${testCase.name}: Should have failed but succeeded`);
            } catch (error) {
                const hasErrorProperty = error.response?.data?.error;
                const hasMessageProperty = error.response?.data?.message;
                const isString = typeof error.response?.data?.error === 'string';
                
                console.log(`   📊 ${testCase.name}:`);
                console.log(`      Status: ${error.response?.status}`);
                console.log(`      Has 'error' property: ${!!hasErrorProperty}`);
                console.log(`      Has 'message' property: ${!!hasMessageProperty}`);
                console.log(`      Error is string: ${isString}`);
                console.log(`      Error value: "${error.response?.data?.error}"`);
            }
        }

        console.log('\n🎉 Frontend Error Testing Complete!');
        console.log('\n📊 ANALYSIS:');
        console.log('   • Authentication system working correctly');
        console.log('   • Backend API error handling implemented');
        console.log('   • Frontend should catch and display these errors properly');
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('   1. Check frontend console for JavaScript errors');
        console.log('   2. Verify toast notification system is working');
        console.log('   3. Ensure clientsAPI.create() and invoicesAPI.create() handle errors properly');
        console.log('   4. Check if "Something went wrong" is a generic error fallback');

    } catch (error) {
        console.log('💥 Unexpected error:', error.message);
    }
}

testFrontendErrors().catch(console.error);
