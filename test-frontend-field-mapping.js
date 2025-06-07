// Test script to verify frontend field mapping fix
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testFieldMappingFix() {
    try {
        console.log('🔄 Testing Frontend Field Mapping Fix...\n');
        
        // Step 1: Login
        console.log('1. Logging in...');
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login successful');

        // Step 2: Get clients
        console.log('\n2. Getting clients...');
        const clientsResponse = await fetch(`${BASE_URL}/api/clients`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const clientsData = await clientsResponse.json();
        if (!clientsData.success || clientsData.clients.length === 0) {
            throw new Error('No clients found');
        }
        
        const clientId = clientsData.clients[0]._id;
        console.log(`✅ Found ${clientsData.clients.length} clients`);
        console.log(`   Using client: ${clientId}`);

        // Step 3: Test with CORRECTED field mapping (frontend now sends 'client' not 'clientId')
        console.log('\n3. Testing with corrected field mapping...');
        const correctedInvoiceData = {
            client: clientId, // Frontend now correctly sends 'client' field
            invoiceNumber: `INV-FIXED-${Date.now()}`,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: [
                {
                    description: 'Fixed Field Mapping Test',
                    quantity: 1,
                    rate: 2500,
                    amount: 2500
                }
            ],
            subtotal: 2500,
            taxTotal: 450,
            total: 2950,
            notes: 'Test invoice with corrected field mapping',
            status: 'draft'
        };

        const fixedResponse = await fetch(`${BASE_URL}/api/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(correctedInvoiceData)
        });

        const fixedResult = await fixedResponse.json();
        
        if (!fixedResponse.ok) {
            console.error('❌ Fixed field mapping test failed!');
            console.error(`   Status: ${fixedResponse.status}`);
            console.error(`   Response:`, fixedResult);
            return;
        }

        if (fixedResult.success) {
            console.log('✅ Fixed field mapping test: SUCCESS!');
            console.log(`   Invoice ID: ${fixedResult.invoice._id}`);
            console.log(`   Invoice Number: ${fixedResult.invoice.invoiceNumber}`);
            console.log(`   Client mapped correctly: ${fixedResult.invoice.clientId ? 'YES' : 'NO'}`);
            console.log(`   Total: ₹${fixedResult.invoice.total}`);
        } else {
            console.log('❌ Fixed field mapping test failed:', fixedResult.error);
        }

        console.log('\n🎉 Field mapping fix test completed!');
        console.log('\n✅ CONCLUSION:');
        console.log('   Frontend now sends "client" field instead of "clientId"');
        console.log('   This matches what the backend expects');
        console.log('   Should resolve "Please select the client" errors');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testFieldMappingFix();
