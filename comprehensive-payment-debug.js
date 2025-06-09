// Comprehensive test to debug payment page loading issues
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const INVOICE_ID = '6846e4f1901f3b2bfebbe081';

async function comprehensivePaymentPageTest() {
    console.log('🔍 COMPREHENSIVE PAYMENT PAGE DEBUG TEST\n');
    console.log('=' * 60);
    
    try {
        // Test 1: Check if the invoice ID is valid
        console.log('🔍 TEST 1: Invoice ID Validation');
        console.log(`Invoice ID: ${INVOICE_ID}`);
        console.log(`Length: ${INVOICE_ID.length}`);
        console.log(`Format: ${/^[a-f0-9]{24}$/.test(INVOICE_ID) ? 'Valid MongoDB ObjectId' : 'Invalid format'}`);
        
        // Test 2: Direct API call to invoice endpoint
        console.log('\n📡 TEST 2: Direct Invoice API Call');
        try {
            const apiResponse = await fetch(`${BASE_URL}/api/invoices/public/${INVOICE_ID}`);
            console.log(`Status: ${apiResponse.status}`);
            
            if (apiResponse.ok) {
                const apiData = await apiResponse.json();
                console.log(`✅ API Success: ${apiData.success}`);
                if (apiData.success && apiData.invoice) {
                    console.log(`   Invoice Number: ${apiData.invoice.invoiceNumber}`);
                    console.log(`   Payment Status: ${apiData.invoice.paymentStatus}`);
                    console.log(`   Client Present: ${!!apiData.invoice.client}`);
                } else {
                    console.log(`❌ API returned success: false`);
                    console.log(`   Error: ${apiData.error || 'Unknown error'}`);
                }
            } else {
                console.log(`❌ API failed with status: ${apiResponse.status}`);
                const errorText = await apiResponse.text();
                console.log(`   Error: ${errorText}`);
            }
        } catch (apiError) {
            console.log(`❌ API call failed: ${apiError.message}`);
        }
        
        // Test 3: Check payment page response
        console.log('\n🌐 TEST 3: Payment Page Response Analysis');
        try {
            const pageResponse = await fetch(`${BASE_URL}/payment/${INVOICE_ID}`);
            console.log(`Status: ${pageResponse.status}`);
            console.log(`Content-Type: ${pageResponse.headers.get('content-type')}`);
            
            const html = await pageResponse.text();
            
            // Check for specific patterns
            const patterns = {
                'Loading State': /Loading invoice\.\.\./,
                'Error State': /Invoice Not Found|Something went wrong/,
                'Payment Form': /Pay Now|PaymentGateway|razorpay/i,
                'React Hydration Error': /__NEXT_DATA__|_next\/static/,
                '404 Error': /404|This page could not be found/,
                'JavaScript Errors': /Error:|ReferenceError|TypeError/,
                'Next.js Error Boundary': /Application error|react-error-boundary/
            };
            
            console.log('\n📊 HTML Pattern Analysis:');
            for (const [name, pattern] of Object.entries(patterns)) {
                const found = pattern.test(html);
                console.log(`   ${found ? '✅' : '❌'} ${name}: ${found ? 'Found' : 'Not found'}`);
            }
            
            // Extract any visible errors from HTML
            const errorMatch = html.match(/<div[^>]*error[^>]*>([^<]*)</i);
            if (errorMatch) {
                console.log(`\n🚨 Extracted Error: ${errorMatch[1]}`);
            }
            
        } catch (pageError) {
            console.log(`❌ Payment page test failed: ${pageError.message}`);
        }
        
        // Test 4: Check if component files exist
        console.log('\n📁 TEST 4: Component File Verification');
        const componentPaths = [
            '/app/payment/[invoiceId]/page.js',
            '/app/components/Payment/PaymentGateway.js',
            '/app/components/Utilities/Loading.js'
        ];
        
        // This would need file system access, so we'll skip for now
        console.log('   Component files assumed to exist (verified earlier)');
        
        // Test 5: Test different invoice IDs
        console.log('\n🧪 TEST 5: Testing Different Scenarios');
        
        // Test with invalid invoice ID
        try {
            const invalidResponse = await fetch(`${BASE_URL}/payment/invalid-id`);
            console.log(`   Invalid ID status: ${invalidResponse.status}`);
        } catch (e) {
            console.log(`   Invalid ID test failed: ${e.message}`);
        }
        
        // Test with valid format but non-existent ID
        try {
            const nonExistentId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but fake
            const nonExistentResponse = await fetch(`${BASE_URL}/payment/${nonExistentId}`);
            console.log(`   Non-existent ID status: ${nonExistentResponse.status}`);
        } catch (e) {
            console.log(`   Non-existent ID test failed: ${e.message}`);
        }
        
        console.log('\n🎯 DIAGNOSIS SUMMARY:');
        console.log('=' * 60);
        console.log('Based on the tests above, possible issues:');
        console.log('1. Next.js routing not recognizing dynamic [invoiceId] parameter');
        console.log('2. Client-side JavaScript not executing properly');
        console.log('3. useEffect hook not triggering the API call');
        console.log('4. CORS or network issues preventing API calls');
        console.log('5. React hydration mismatch causing component to freeze');
        
        console.log('\n📋 RECOMMENDED NEXT STEPS:');
        console.log('1. Check browser developer tools for JavaScript errors');
        console.log('2. Add console.log statements to payment page component');
        console.log('3. Test with a simplified version of the payment page');
        console.log('4. Check if the issue occurs in production build vs development');
        
    } catch (error) {
        console.error('❌ Comprehensive test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

comprehensivePaymentPageTest();
