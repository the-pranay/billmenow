// Test script to verify payment flow with Razorpay test cards
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const INVOICE_ID = '6846e4f1901f3b2bfebbe081';

async function testPaymentFlow() {
    try {
        console.log('🔄 Testing payment flow...\n');
        
        // Step 1: Get invoice data for payment
        console.log('📄 Step 1: Getting invoice data...');
        const invoiceResponse = await fetch(`${BASE_URL}/api/invoices/public/${INVOICE_ID}`);
        const invoiceData = await invoiceResponse.json();
        
        if (!invoiceResponse.ok || !invoiceData.success) {
            console.error('❌ Failed to get invoice data');
            return;
        }
        
        const invoice = invoiceData.invoice;
        console.log(`✅ Invoice loaded: ${invoice.invoiceNumber} - ₹${invoice.total}`);
        
        // Step 2: Create Razorpay order
        console.log('\n💳 Step 2: Creating Razorpay payment order...');
        const orderResponse = await fetch(`${BASE_URL}/api/payment/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                invoiceId: INVOICE_ID,
                amount: invoice.total
            })
        });
        
        if (!orderResponse.ok) {
            console.error('❌ Failed to create payment order:', orderResponse.status);
            const errorText = await orderResponse.text();
            console.error('Error details:', errorText);
            return;
        }
          const orderData = await orderResponse.json();
        console.log('✅ Razorpay order created successfully!');
        console.log(`   Order ID: ${orderData.order.id}`);
        console.log(`   Amount: ₹${orderData.order.amount / 100}`);
        console.log(`   Currency: ${orderData.order.currency}`);
        console.log(`   Receipt: ${orderData.order.receipt}`);
        
        // Step 3: Verify payment page accessibility
        console.log('\n🌐 Step 3: Verifying payment page...');
        const paymentPageResponse = await fetch(`${BASE_URL}/payment/${INVOICE_ID}`);
        
        if (paymentPageResponse.ok) {
            console.log('✅ Payment page is accessible!');
            console.log(`   URL: ${BASE_URL}/payment/${INVOICE_ID}`);
        } else {
            console.error('❌ Payment page not accessible');
        }
        
        // Step 4: Display test information
        console.log('\n🧪 Step 4: Payment testing instructions');
        console.log('═══════════════════════════════════════');
        console.log('📋 Payment Test Information:');
        console.log(`   Invoice: ${invoice.invoiceNumber}`);
        console.log(`   Amount: ₹${invoice.total}`);
        console.log(`   Payment Link: ${BASE_URL}/payment/${INVOICE_ID}`);
        console.log(`   Razorpay Order ID: ${orderData.order.id}`);
        
        console.log('\n💳 Razorpay Test Cards for Manual Testing:');
        console.log('   🟢 SUCCESS CARD:');
        console.log('      Card Number: 4111 1111 1111 1111');
        console.log('      CVV: Any 3 digits (e.g., 123)');
        console.log('      Expiry: Any future date (e.g., 12/30)');
        console.log('      Name: Any name');
        
        console.log('\n   🔴 FAILURE CARD:');
        console.log('      Card Number: 4000 0000 0000 0002');
        console.log('      CVV: Any 3 digits (e.g., 123)');
        console.log('      Expiry: Any future date (e.g., 12/30)');
        console.log('      Name: Any name');
        
        console.log('\n📝 Manual Testing Steps:');
        console.log('   1. Open payment link in browser');
        console.log('   2. Click "Pay Now" button');
        console.log('   3. Enter test card details');
        console.log('   4. Complete payment process');
        console.log('   5. Verify success/failure handling');
        console.log('   6. Check invoice status update');
        
        console.log('\n✅ Payment flow test setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error testing payment flow:', error.message);
    }
}

testPaymentFlow();
