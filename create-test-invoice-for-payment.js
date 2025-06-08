// Create a test invoice for payment testing
import { connectToDatabase } from './app/lib/database.js';
import Invoice from './app/lib/models/Invoice.js';
import Client from './app/lib/models/Client.js';
import User from './app/lib/models/User.js';

async function createTestInvoice() {
  try {
    await connectToDatabase();
    console.log('📊 Database connected');

    // Find an existing user and client
    const user = await User.findOne();
    const client = await Client.findOne();

    if (!user || !client) {
      console.log('❌ No user or client found. Creating test data...');
      return;
    }

    console.log('👤 Found user:', user.email);
    console.log('🏢 Found client:', client.name);

    // Create a test invoice
    const testInvoice = new Invoice({
      userId: user._id,
      clientId: client._id,
      invoiceNumber: `TEST-${Date.now()}`,
      items: [
        {
          description: 'Test Service',
          quantity: 1,
          rate: 100.00,
          amount: 100.00
        }
      ],
      subtotal: 100.00,
      total: 100.00,
      paymentStatus: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      issueDate: new Date()
    });

    const savedInvoice = await testInvoice.save();
    console.log('✅ Test invoice created:');
    console.log('Invoice ID:', savedInvoice._id.toString());
    console.log('Invoice Number:', savedInvoice.invoiceNumber);
    console.log('Total:', savedInvoice.total);
    console.log('Payment Status:', savedInvoice.paymentStatus);

    return savedInvoice._id.toString();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestInvoice();
