import { config } from 'dotenv';
import { connectToDatabase } from './app/lib/database.js';
import Invoice from './app/lib/models/Invoice.js';
import Client from './app/lib/models/Client.js';

// Load environment variables
config({ path: '.env.local' });

async function checkInvoiceFromError() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Database connected');
    
    // Test the exact invoice from error logs
    const invoiceId = '6847f01b66e984b6c488677a';
    console.log('🔍 Searching for invoice from error logs:', invoiceId);
    
    const invoice = await Invoice.findById(invoiceId).populate('clientId');
    
    if (invoice) {
      console.log('✅ Invoice found:', {
        id: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        remainingBalance: invoice.remainingBalance,
        paymentStatus: invoice.paymentStatus,
        status: invoice.status,
        clientName: invoice.clientId?.name,
        userId: invoice.userId.toString()
      });
    } else {
      console.log('❌ Invoice NOT found with ID:', invoiceId);
      
      // Let's check what invoices we do have
      console.log('\n🔍 Checking available invoices...');
      const allInvoices = await Invoice.find({}).limit(5);
      console.log('Available invoices:');
      allInvoices.forEach(inv => {
        console.log(`- ${inv._id} (${inv.invoiceNumber})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

checkInvoiceFromError();
