// Script to save and examine the payment page HTML
import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const INVOICE_ID = '6846e4f1901f3b2bfebbe081';

async function examinePaymentPageHTML() {
    try {
        console.log('🔍 Fetching payment page HTML...');
        
        const response = await fetch(`${BASE_URL}/payment/${INVOICE_ID}`);
        const html = await response.text();
        
        // Save full HTML for inspection
        fs.writeFileSync('payment-page-response.html', html);
        console.log('✅ HTML saved to payment-page-response.html');
        
        // Extract key information
        console.log('\n📋 HTML ANALYSIS:');
        console.log(`Length: ${html.length} characters`);
        
        // Check for error indicators
        const errorPatterns = [
            'error',
            'Error',
            'Something went wrong',
            '500',
            '404',
            'Internal Server Error',
            'Application error',
            'This page could not be found'
        ];
        
        const foundErrors = [];
        errorPatterns.forEach(pattern => {
            if (html.toLowerCase().includes(pattern.toLowerCase())) {
                foundErrors.push(pattern);
            }
        });
        
        if (foundErrors.length > 0) {
            console.log('❌ Error indicators found:', foundErrors);
        } else {
            console.log('✅ No obvious error indicators');
        }
        
        // Check for payment-related content
        const paymentPatterns = [
            'razorpay',
            'Razorpay',
            'payment',
            'Payment',
            'Pay Now',
            'invoice',
            'Invoice',
            'amount',
            'total'
        ];
        
        const foundPayment = [];
        paymentPatterns.forEach(pattern => {
            if (html.includes(pattern)) {
                foundPayment.push(pattern);
            }
        });
        
        console.log('💳 Payment-related content found:', foundPayment);
        
        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (titleMatch) {
            console.log(`📄 Page Title: "${titleMatch[1]}"`);
        }
        
        // Look for Next.js error patterns
        if (html.includes('_next') && html.includes('__next')) {
            console.log('✅ Next.js app structure detected');
        }
        
        // Extract visible text content (simplified)
        const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/is);
        if (bodyMatch) {
            const bodyContent = bodyMatch[1];
            // Remove script tags and extract text
            const textContent = bodyContent
                .replace(/<script[^>]*>.*?<\/script>/gis, '')
                .replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            console.log('\n📝 Visible Text Content (first 500 chars):');
            console.log(textContent.substring(0, 500) + (textContent.length > 500 ? '...' : ''));
        }
        
    } catch (error) {
        console.error('❌ Failed to examine HTML:', error.message);
    }
}

examinePaymentPageHTML();
