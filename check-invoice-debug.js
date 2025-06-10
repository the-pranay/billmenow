import { config } from 'dotenv';
import { connectToDatabase } from './app/lib/database.js';
import Invoice from './app/lib/models/Invoice.js';

// Load environment variables
config({ path: '.env.local' });

async function checkInvoice() {
  try {
    console.log('🔄 Connecting to database...');
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
    console.log('🔗 URI value:', process.env.MONGODB_URI?.substring(0, 50) + '...');
    
    await connectToDatabase();
    console.log('✅ Database connected');
    
    const invoiceId = '68473949eaacdb6a3d1c7e9c';
    console.log('🔍 Searching for invoice:', invoiceId);
    
    // Try to find the invoice
    const invoice = await Invoice.findById(invoiceId).populate('clientId');
    
    if (invoice) {
      console.log('✅ Invoice found:', {
        id: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        remainingBalance: invoice.remainingBalance,
        paymentStatus: invoice.paymentStatus,
        clientName: invoice.clientId?.name || 'No client name',
        userId: invoice.userId.toString()
      });
    } else {
      console.log('❌ Invoice not found with ID:', invoiceId);
      
      // Let's check if there are any invoices at all
      const allInvoices = await Invoice.find({}).limit(5);
      console.log('📊 Sample invoices in database:');
      allInvoices.forEach(inv => {
        console.log(`- ${inv._id.toString()} (${inv.invoiceNumber})`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
  process.exit(0);
}

checkInvoice();
