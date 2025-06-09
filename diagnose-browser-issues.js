// Diagnostic script to check payment page status and potential issues
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const INVOICE_ID = '6846e4f1901f3b2bfebbe081';

async function diagnoseBrowserIssues() {
    console.log('🔍 DIAGNOSING SIMPLE BROWSER PAYMENT PAGE ISSUES\n');
    console.log('=' * 60);
    
    try {
        // Check 1: Payment page HTML response
        console.log('🌐 CHECK 1: Payment Page HTML Response');
        const pageResponse = await fetch(`${BASE_URL}/payment/${INVOICE_ID}`);
        
        console.log(`Status: ${pageResponse.status}`);
        console.log(`Headers:`, Object.fromEntries(pageResponse.headers.entries()));
        
        if (pageResponse.ok) {
            const html = await pageResponse.text();
            console.log(`✅ Page loads successfully (${html.length} characters)`);
            
            // Check for common error indicators in HTML
            if (html.includes('error') || html.includes('Error')) {
                console.log('⚠️  HTML contains error text');
            }
            if (html.includes('500') || html.includes('404')) {
                console.log('⚠️  HTML contains error status codes');
            }
            if (html.includes('Something went wrong')) {
                console.log('⚠️  HTML contains "Something went wrong" message');
            }
            
            // Check for payment components
            if (html.includes('razorpay') || html.includes('Razorpay')) {
                console.log('✅ Razorpay references found in HTML');
            } else {
                console.log('❌ No Razorpay references in HTML');
            }
            
            // Save HTML for manual inspection
            console.log('💾 Saving HTML response for inspection...');
        } else {
            console.log('❌ Page failed to load');
            const errorText = await pageResponse.text();
            console.log('Error response:', errorText);
        }
        
        // Check 2: Invoice API
        console.log('\n📄 CHECK 2: Invoice API Response');
        const invoiceResponse = await fetch(`${BASE_URL}/api/invoices/public/${INVOICE_ID}`);
        
        if (invoiceResponse.ok) {
            const invoiceData = await invoiceResponse.json();
            console.log('✅ Invoice API working');
            console.log(`Invoice: ${invoiceData.invoice.invoiceNumber}`);
            console.log(`Amount: ₹${invoiceData.invoice.total}`);
            console.log(`Status: ${invoiceData.invoice.paymentStatus}`);
        } else {
            console.log('❌ Invoice API failed');
            const errorData = await invoiceResponse.json();
            console.log('Error:', errorData);
        }
        
        // Check 3: Payment Order Creation
        console.log('\n💳 CHECK 3: Payment Order Creation');
        const orderResponse = await fetch(`${BASE_URL}/api/payment/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                invoiceId: INVOICE_ID,
                amount: 2360,
                currency: 'INR'
            })
        });
        
        if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            console.log('✅ Payment order creation working');
            console.log(`Order ID: ${orderData.order.id}`);
            console.log(`Key ID: ${orderData.keyId}`);
        } else {
            console.log('❌ Payment order creation failed');
            const errorData = await orderResponse.json();
            console.log('Error:', errorData);
        }
        
        // Check 4: Server status
        console.log('\n🖥️  CHECK 4: Server Health');
        const healthResponse = await fetch(`${BASE_URL}/api/health`);
        
        if (healthResponse.ok) {
            console.log('✅ Server responding');
        } else {
            console.log('⚠️  Health endpoint not available (normal for this app)');
        }
        
        // Check 5: Homepage accessibility
        console.log('\n🏠 CHECK 5: Homepage Accessibility');
        const homeResponse = await fetch(`${BASE_URL}/`);
        
        if (homeResponse.ok) {
            console.log('✅ Homepage accessible');
        } else {
            console.log('❌ Homepage not accessible');
        }
        
        console.log('\n🎯 DIAGNOSIS SUMMARY:');
        console.log('=' * 60);
        console.log('If the Simple Browser shows issues, possible causes:');
        console.log('1. JavaScript errors preventing page functionality');
        console.log('2. CSS/styling issues making content invisible');
        console.log('3. Razorpay script loading failures');
        console.log('4. API connectivity problems');
        console.log('5. Missing environment variables');
        
        console.log('\n📋 RECOMMENDED ACTIONS:');
        console.log('1. Check browser developer tools for JavaScript errors');
        console.log('2. Verify all APIs are responding correctly (checked above)');
        console.log('3. Test payment page in a regular browser');
        console.log('4. Check server logs for errors');
        
    } catch (error) {
        console.error('❌ Diagnosis failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

diagnoseBrowserIssues();
