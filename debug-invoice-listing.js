// Debug script to test invoice listing API
import fs from 'fs';

const DEBUG_URL = 'http://localhost:3002';

async function testInvoiceAPI() {
    console.log('🔍 Testing Invoice API...\n');
    
    try {
        // First, let's test without authentication to see if API is accessible
        console.log('1. Testing API accessibility...');
        const response = await fetch(`${DEBUG_URL}/api/invoices`);
        console.log(`Status: ${response.status}`);
        
        if (response.status === 401) {
            console.log('❌ Authentication required - this is expected\n');
        } else {
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            const text = await response.text();
            console.log('Response body:', text.substring(0, 200) + '...\n');
        }
        
        // Check if there are any invoices in the database by checking the API structure
        console.log('2. Checking API route file...');
        
        // Let's also check if there are test invoices we can verify
        console.log('3. Testing with sample auth (if available)...');
        
        // Test the invoice creation API structure
        console.log('4. Testing POST structure...');
        const postResponse = await fetch(`${DEBUG_URL}/api/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client: 'test-client-id',
                invoiceNumber: 'DEBUG-001',
                items: [{ description: 'Test', quantity: 1, rate: 100, amount: 100 }],
                total: 100
            })
        });
        
        console.log(`POST Status: ${postResponse.status}`);
        const postText = await postResponse.text();
        console.log('POST Response:', postText.substring(0, 300));
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

testInvoiceAPI();
