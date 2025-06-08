// List existing invoices for testing
import { connectToDatabase } from './app/lib/database.js';
import Invoice from './app/lib/models/Invoice.js';
import Client from './app/lib/models/Client.js';

async function listInvoices() {
  try {
    await connectToDatabase();
    console.log('📊 Database connected');

    const invoices = await Invoice.find().populate('clientId').limit(5);
    
    if (invoices.length === 0) {
      console.log('❌ No invoices found in database');
      return;
    }

    console.log(`📋 Found ${invoices.length} invoices:`);
    
    for (const invoice of invoices) {
      console.log('\n---');
      console.log('Invoice ID:', invoice._id.toString());
      console.log('Invoice Number:', invoice.invoiceNumber);
      console.log('Client:', invoice.clientId?.name || 'Unknown');
      console.log('Total:', invoice.total);
      console.log('Payment Status:', invoice.paymentStatus);
      console.log('Due Date:', invoice.dueDate);
    }

    // Return the first pending invoice for testing
    const pendingInvoice = invoices.find(inv => inv.paymentStatus === 'pending');
    if (pendingInvoice) {
      console.log('\n✅ Using this invoice for payment testing:', pendingInvoice._id.toString());
      return pendingInvoice._id.toString();
    } else {
      console.log('\n⚠️ No pending invoices found. Using first invoice:', invoices[0]._id.toString());
      return invoices[0]._id.toString();
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listInvoices().then(invoiceId => {
  if (invoiceId) {
    console.log('\n🧪 Test Invoice ID for Payment API:', invoiceId);
  }
});
