// Debug script to check Razorpay configuration and order creation
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const INVOICE_ID = '6846e4f1901f3b2bfebbe081';

async function debugRazorpayOrder() {
    try {
        console.log('🔍 Debugging Razorpay order creation...\n');
        
        // Get invoice details first
        console.log('📄 Getting invoice details...');
        const invoiceResponse = await fetch(`${BASE_URL}/api/invoices/public/${INVOICE_ID}`);
        const invoiceData = await invoiceResponse.json();
        
        if (!invoiceData.success) {
            console.error('❌ Failed to get invoice data');
            return;
        }
        
        const invoice = invoiceData.invoice;
        console.log(`✅ Invoice: ${invoice.invoiceNumber}`);
        console.log(`   Total: ₹${invoice.total}`);
        console.log(`   Payment Status: ${invoice.paymentStatus}`);
        console.log(`   Remaining Balance: ₹${invoice.remainingBalance}`);
        
        // Try to create order with detailed logging
        console.log('\n💳 Creating Razorpay order...');
        
        const orderPayload = {
            invoiceId: INVOICE_ID,
            amount: invoice.total,
            currency: 'INR'
        };
        
        console.log('📤 Order payload:', JSON.stringify(orderPayload, null, 2));
        
        const orderResponse = await fetch(`${BASE_URL}/api/payment/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderPayload)
        });
        
        console.log(`📥 Response status: ${orderResponse.status}`);
        console.log(`📥 Response headers:`, Object.fromEntries(orderResponse.headers.entries()));
        
        const responseText = await orderResponse.text();
        console.log(`📥 Response body:`, responseText);
        
        if (!orderResponse.ok) {
            console.error('❌ Order creation failed');
            
            // Try to parse the error response
            try {
                const errorData = JSON.parse(responseText);
                console.error('Error details:', errorData);
            } catch (e) {
                console.error('Raw error response:', responseText);
            }
        } else {
            console.log('✅ Order created successfully!');
            try {
                const orderData = JSON.parse(responseText);
                console.log('Order details:', orderData);
            } catch (e) {
                console.log('Response parsing failed, but order was created');
            }
        }
        
    } catch (error) {
        console.error('❌ Debug script error:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

debugRazorpayOrder();
