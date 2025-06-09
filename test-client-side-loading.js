// Test client-side invoice loading to simulate what the payment page does
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const INVOICE_ID = '6846e4f1901f3b2bfebbe081';

async function testClientSideLoading() {
    console.log('🔄 TESTING CLIENT-SIDE INVOICE LOADING\n');
    
    try {
        console.log('📡 Making API call to fetch invoice...');
        console.log(`URL: ${BASE_URL}/api/invoices/public/${INVOICE_ID}`);
        
        const response = await fetch(`${BASE_URL}/api/invoices/public/${INVOICE_ID}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`Status: ${response.status}`);
        console.log(`Status Text: ${response.statusText}`);
        console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('\n✅ API Response successful!');
            console.log('Success:', data.success);
            
            if (data.success && data.invoice) {
                const invoice = data.invoice;
                console.log('\n📄 Invoice Data:');
                console.log(`  ID: ${invoice._id}`);
                console.log(`  Number: ${invoice.invoiceNumber}`);
                console.log(`  Status: ${invoice.status}`);
                console.log(`  Payment Status: ${invoice.paymentStatus}`);
                console.log(`  Total: ₹${invoice.total}`);
                console.log(`  Remaining Balance: ₹${invoice.remainingBalance}`);
                console.log(`  Client: ${invoice.client?.name || 'Unknown'}`);
                console.log(`  Items: ${invoice.items?.length || 0} items`);
                
                // Check if paid
                if (invoice.paymentStatus === 'paid' || invoice.remainingBalance <= 0) {
                    console.log('\n💚 INVOICE STATUS: PAID');
                    console.log('   → Should show "Payment Complete" screen');
                } else {
                    console.log('\n💳 INVOICE STATUS: UNPAID');
                    console.log('   → Should show payment form');
                }
            } else {
                console.log('\n❌ Invalid response structure');
                console.log('Full response:', JSON.stringify(data, null, 2));
            }
        } else {
            console.log('\n❌ API call failed');
            const errorText = await response.text();
            console.log('Error response:', errorText);
        }
        
        // Additional test: check if there are network issues
        console.log('\n🌐 NETWORK CONNECTIVITY TEST:');
        try {
            const homeResponse = await fetch(`${BASE_URL}/`);
            console.log(`Homepage status: ${homeResponse.status}`);
            
            const apiTestResponse = await fetch(`${BASE_URL}/api/invoices/public/test`);
            console.log(`API test endpoint status: ${apiTestResponse.status}`);
        } catch (netError) {
            console.log('❌ Network connectivity issue:', netError.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Error type:', error.name);
        console.error('Stack:', error.stack);
    }
}

testClientSideLoading();
