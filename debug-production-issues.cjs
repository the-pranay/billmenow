#!/usr/bin/env node

/**
 * Comprehensive Debug Script for BillMeNow Production Issues
 * 
 * This script tests:
 * 1. "Something went wrong" errors when creating clients
 * 2. "Invoice created but email failed to send" issues
 * 3. General error handling problems
 */

// Use dynamic import for node-fetch
let fetch;

const BASE_URL = 'http://localhost:3000';
let authToken = null;

console.log('🔍 BillMeNow Production Issues Debug Script');
console.log('===========================================\n');

async function debugProductionIssues() {
    try {
        // Import fetch dynamically
        const fetchModule = await import('node-fetch');
        fetch = fetchModule.default;
        
        // Step 1: Test Authentication
        console.log('🔐 Step 1: Testing Authentication...');
        await testAuthentication();
        
        if (!authToken) {
            console.log('❌ Cannot proceed without authentication');
            return;
        }
        
        // Step 2: Test Client Creation (Something went wrong error)
        console.log('\n👥 Step 2: Testing Client Creation Issues...');
        await testClientCreationIssues();
        
        // Step 3: Test Email Sending Issues
        console.log('\n📧 Step 3: Testing Email Sending Issues...');
        await testEmailSendingIssues();
        
        // Step 4: Test Invoice Creation with Email
        console.log('\n📄 Step 4: Testing Invoice Creation with Email...');
        await testInvoiceCreationWithEmail();
        
        // Step 5: Test Error Handling
        console.log('\n🔍 Step 5: Testing Error Handling...');
        await testErrorHandling();
        
        // Step 6: Provide Recommendations
        console.log('\n💡 Step 6: Analysis and Recommendations...');
        provideRecommendations();
        
    } catch (error) {
        console.log('💥 Unexpected error in debug script:', error.message);
    }
}

async function testAuthentication() {
    const uniqueEmail = `debug${Date.now()}@test.com`;
    const testUser = {
        email: uniqueEmail,
        password: 'password123'
    };
    
    try {
        // Try login first
        console.log('   Attempting login...');
        let response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        
        let result = await response.json();
        console.log(`   Login response: ${response.status} - ${result.success ? 'SUCCESS' : result.error}`);
        
        // If login fails, try registration
        if (!result.success) {
            console.log('   Login failed, attempting registration...');
            response = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...testUser,
                    firstName: 'Debug',
                    lastName: 'User',
                    businessName: 'Debug Business',
                    businessType: 'Service',
                    phone: '+91 9876543210',
                    country: 'India'
                })
            });
            
            result = await response.json();
            console.log(`   Registration response: ${response.status} - ${result.success ? 'SUCCESS' : result.error}`);
        }
        
        if (result.success && result.token) {
            authToken = result.token;
            console.log(`   ✅ Authentication successful. Token: ${authToken.substring(0, 20)}...`);
        } else {
            console.log(`   ❌ Authentication failed: ${result.error}`);
        }
        
    } catch (error) {
        console.log(`   ❌ Authentication error: ${error.message}`);
    }
}

async function testClientCreationIssues() {
    if (!authToken) return;
    
    const testClient = {
        name: 'Debug Test Client',
        email: 'debug.client@test.com',
        phone: '+91 9876543210',
        company: 'Debug Company',
        address: '123 Debug Street, Debug City, Debug State'
    };
    
    console.log('   Testing normal client creation...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(testClient)
        });
        
        const result = await response.json();
        console.log(`   Response status: ${response.status}`);
        console.log(`   Response data:`, JSON.stringify(result, null, 2));
        
        if (result.success) {
            console.log('   ✅ Client creation successful');
        } else {
            console.log(`   ❌ Client creation failed: ${result.error}`);
            
            // Check for specific error patterns
            if (result.error?.includes('already exists')) {
                console.log('   🔍 Error type: Duplicate client (expected)');
            } else if (result.error?.includes('validation')) {
                console.log('   🔍 Error type: Validation error');
            } else {
                console.log('   🔍 Error type: Unknown - this might be the "Something went wrong" issue');
            }
        }
        
    } catch (error) {
        console.log(`   ❌ CAUGHT "Something went wrong" type error: ${error.message}`);
        console.log('   🔍 This is likely where the generic "Something went wrong" message comes from');
        
        // Analyze the error
        if (error.message.includes('fetch')) {
            console.log('   🔍 Error analysis: Network/Fetch error');
        } else if (error.message.includes('JSON')) {
            console.log('   🔍 Error analysis: JSON parsing error');
        } else {
            console.log('   🔍 Error analysis: Unknown error type');
        }
    }
    
    // Test error scenarios
    console.log('   Testing error scenarios...');
    
    // Test 1: Missing fields
    try {
        const response = await fetch(`${BASE_URL}/api/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name: '', email: '' })
        });
        
        const result = await response.json();
        console.log(`   Missing fields test: ${response.status} - ${result.error || 'No error'}`);
        
    } catch (error) {
        console.log(`   ❌ Missing fields error: ${error.message}`);
    }
    
    // Test 2: Invalid token
    try {
        const response = await fetch(`${BASE_URL}/api/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid-token'
            },
            body: JSON.stringify(testClient)
        });
        
        const result = await response.json();
        console.log(`   Invalid token test: ${response.status} - ${result.error || 'No error'}`);
        
    } catch (error) {
        console.log(`   ❌ Invalid token error: ${error.message}`);
    }
}

async function testEmailSendingIssues() {
    if (!authToken) return;
    
    const testEmailData = {
        to: 'debug@test.com',
        subject: 'Test Email from Debug Script',
        template: 'invoice',
        templateData: {
            clientName: 'Debug Client',
            invoiceNumber: 'DBG-001',
            amount: '₹1,000',
            dueDate: new Date().toLocaleDateString('en-IN'),
            description: 'Debug test services',
            paymentLink: `${BASE_URL}/payment/debug`,
            senderName: 'Debug User',
            businessName: 'Debug Business',
            contactDetails: 'debug@test.com'
        },
        type: 'test'
    };
    
    console.log('   Testing email sending...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/email/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(testEmailData)
        });
        
        const result = await response.json();
        console.log(`   Email response status: ${response.status}`);
        console.log(`   Email response data:`, JSON.stringify(result, null, 2));
        
        if (result.success) {
            console.log('   ✅ Email sent successfully');
            if (result.data?.mode === 'mock') {
                console.log('   ℹ️ Email sent in mock mode (SMTP not configured)');
            }
        } else {
            console.log(`   ❌ Email failed to send: ${result.message}`);
            
            // Check for specific email error patterns
            if (result.message?.includes('SMTP')) {
                console.log('   🔍 Error type: SMTP configuration issue');
            } else if (result.message?.includes('authentication')) {
                console.log('   🔍 Error type: Email authentication issue');
            } else {
                console.log('   🔍 Error type: Unknown email error');
            }
        }
        
    } catch (error) {
        console.log(`   ❌ Email sending error: ${error.message}`);
        console.log('   🔍 This might be causing "Invoice created but email failed to send"');
    }
}

async function testInvoiceCreationWithEmail() {
    if (!authToken) return;
    
    console.log('   Testing invoice creation workflow...');
    
    // First, get a client to use for the invoice
    try {
        const clientsResponse = await fetch(`${BASE_URL}/api/clients`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const clientsResult = await clientsResponse.json();
        
        if (!clientsResult.success || !clientsResult.clients?.length) {
            console.log('   ⚠️ No clients available for invoice test');
            return;
        }
        
        const testClient = clientsResult.clients[0];
        console.log(`   Using client: ${testClient.name}`);
        
        // Create test invoice
        const invoiceData = {
            client: testClient._id,
            invoiceNumber: `DBG-${Date.now()}`,
            issueDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            items: [{
                description: 'Debug Test Service',
                quantity: 1,
                rate: 1000,
                amount: 1000
            }],
            subtotal: 1000,
            taxTotal: 0,
            total: 1000,
            notes: 'Debug test invoice',
            status: 'sent'
        };
        
        console.log('   Creating invoice...');
        
        const invoiceResponse = await fetch(`${BASE_URL}/api/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(invoiceData)
        });
        
        const invoiceResult = await invoiceResponse.json();
        console.log(`   Invoice creation status: ${invoiceResponse.status}`);
        console.log(`   Invoice creation result:`, JSON.stringify(invoiceResult, null, 2));
        
        if (invoiceResult.success) {
            console.log('   ✅ Invoice created successfully');
            
            // Test email sending for the invoice
            console.log('   Testing email sending for invoice...');
            
            const emailData = {
                to: testClient.email,
                subject: 'invoice',
                template: 'invoice',
                templateData: {
                    clientName: testClient.name,
                    invoiceNumber: invoiceResult.invoice.invoiceNumber,
                    amount: `₹${invoiceResult.invoice.total}`,
                    dueDate: new Date(invoiceResult.invoice.dueDate).toLocaleDateString('en-IN'),
                    description: 'Debug test services',
                    paymentLink: `${BASE_URL}/payment/${invoiceResult.invoice._id}`,
                    senderName: 'Debug User',
                    businessName: 'Debug Business',
                    contactDetails: 'debug@test.com'
                },
                invoiceId: invoiceResult.invoice._id
            };
            
            const emailResponse = await fetch(`${BASE_URL}/api/email/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(emailData)
            });
            
            const emailResult = await emailResponse.json();
            
            if (emailResult.success) {
                console.log('   ✅ Invoice email sent successfully');
            } else {
                console.log('   ❌ Invoice email failed to send');
                console.log('   🔍 This would show "Invoice created but email failed to send"');
            }
            
        } else {
            console.log(`   ❌ Invoice creation failed: ${invoiceResult.error}`);
        }
        
    } catch (error) {
        console.log(`   ❌ Invoice workflow error: ${error.message}`);
    }
}

async function testErrorHandling() {
    console.log('   Testing various error scenarios...');
    
    // Test 1: Invalid API endpoint
    try {
        const response = await fetch(`${BASE_URL}/api/invalid-endpoint`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log(`   Invalid endpoint test: ${response.status}`);
    } catch (error) {
        console.log(`   Invalid endpoint error: ${error.message}`);
    }
    
    // Test 2: Malformed JSON
    try {
        const response = await fetch(`${BASE_URL}/api/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: '{ invalid json }'
        });
        console.log(`   Malformed JSON test: ${response.status}`);
    } catch (error) {
        console.log(`   Malformed JSON error: ${error.message}`);
    }
    
    // Test 3: Network timeout simulation
    console.log('   Testing error handling patterns...');
}

function provideRecommendations() {
    console.log('📋 ANALYSIS SUMMARY:');
    console.log('====================');
    
    console.log('\n🔍 LIKELY CAUSES OF "Something went wrong":');
    console.log('   1. Frontend catch blocks showing generic error messages');
    console.log('   2. Network/fetch errors not being handled specifically');
    console.log('   3. Server returning non-JSON responses');
    console.log('   4. Authentication token issues');
    console.log('   5. Database connection problems');
    
    console.log('\n📧 LIKELY CAUSES OF EMAIL FAILURES:');
    console.log('   1. SMTP configuration issues (Gmail app password)');
    console.log('   2. Nodemailer transporter not properly configured');
    console.log('   3. Email service rate limiting');
    console.log('   4. Invalid email templates or data');
    console.log('   5. Network issues with email provider');
    
    console.log('\n🛠️ RECOMMENDED FIXES:');
    console.log('   1. Improve frontend error handling with specific messages');
    console.log('   2. Add better server error logging and responses');
    console.log('   3. Implement email fallback mechanisms');
    console.log('   4. Add retry logic for failed operations');
    console.log('   5. Enhance toast notification system');
    console.log('   6. Add proper error boundaries');
    
    console.log('\n📝 NEXT STEPS:');
    console.log('   1. Run this script and check the actual error patterns');
    console.log('   2. Check browser console for JavaScript errors');
    console.log('   3. Verify SMTP configuration in production');
    console.log('   4. Test with different client data patterns');
    console.log('   5. Check server logs for detailed error information');
}

// Run the debug script
debugProductionIssues().catch(console.error);
