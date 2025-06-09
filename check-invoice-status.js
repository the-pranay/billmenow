// Quick script to check the status of our test invoice
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const INVOICE_ID = '6846e4f1901f3b2bfebbe081';

async function checkInvoiceStatus() {
    try {
        console.log('🔍 Checking invoice status...');
        
        // Get public invoice data (like the payment page would)
        const response = await fetch(`${BASE_URL}/api/invoices/public/${INVOICE_ID}`);
        
        if (!response.ok) {
            console.error('❌ Failed to fetch invoice:', response.status, response.statusText);
            return;
        }        const response_data = await response.json();
        const invoice = response_data.invoice;
        
        console.log('📄 Invoice Details:');
        console.log('   ID:', invoice._id);
        console.log('   Number:', invoice.invoiceNumber);
        console.log('   Status:', invoice.status);
        console.log('   Total:', `₹${invoice.total}`);
        console.log('   Due Date:', new Date(invoice.dueDate).toLocaleDateString());
        console.log('   Client:', invoice.client?.name || 'No client data');
        console.log('   Items Count:', invoice.items?.length || 0);
        
        if (invoice.items && invoice.items.length > 0) {
            console.log('📋 Invoice Items:');
            invoice.items.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.description} - Qty: ${item.quantity} - Rate: ₹${item.rate} - Amount: ₹${item.amount}`);
            });
        }
        
        console.log('✅ Invoice data retrieved successfully!');
        
    } catch (error) {
        console.error('❌ Error checking invoice status:', error.message);
    }
}

checkInvoiceStatus();
