// Test script to check database and create test invoice for payment testing
import { connectToDatabase } from './app/lib/database.js';
import Invoice from './app/lib/models/Invoice.js';
import Client from './app/lib/models/Client.js';
import User from './app/lib/models/User.js';

async function setupTestInvoiceForPayment() {
  try {
    console.log('🔍 Checking database connection and existing data...\n');
    
    await connectToDatabase();
    console.log('✅ Database connected successfully');

    // Check existing data
    const userCount = await User.countDocuments();
    const clientCount = await Client.countDocuments();
    const invoiceCount = await Invoice.countDocuments();
    
    console.log(`📊 Database Stats:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Clients: ${clientCount}`);
    console.log(`   Invoices: ${invoiceCount}`);

    if (invoiceCount > 0) {
      // Find existing invoices
      const invoices = await Invoice.find().populate('clientId').limit(3);
      console.log('\n📋 Existing Invoices:');
      
      for (const invoice of invoices) {
        console.log(`\n   Invoice ID: ${invoice._id}`);
        console.log(`   Number: ${invoice.invoiceNumber}`);
        console.log(`   Client: ${invoice.clientId?.name || 'Unknown'}`);
        console.log(`   Total: ₹${invoice.total}`);
        console.log(`   Status: ${invoice.paymentStatus || 'pending'}`);
        console.log(`   Payment URL: http://localhost:3000/payment/${invoice._id}`);
      }

      // Use the first invoice for testing
      const testInvoice = invoices[0];
      console.log(`\n🎯 Use this invoice for payment testing:`);
      console.log(`   Invoice ID: ${testInvoice._id}`);
      console.log(`   Payment URL: http://localhost:3000/payment/${testInvoice._id}`);
      
      return testInvoice._id.toString();
    } else {
      console.log('\n⚠️  No invoices found. Let me create a test invoice...');
      
      // Find or create test user and client
      let testUser = await User.findOne();
      let testClient = await Client.findOne();
      
      if (!testUser) {
        console.log('Creating test user...');
        testUser = new User({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'hashedpassword123',
          role: 'user'
        });
        await testUser.save();
        console.log('✅ Test user created');
      }
      
      if (!testClient) {
        console.log('Creating test client...');
        testClient = new Client({
          name: 'Test Client Company',
          email: 'client@testcompany.com',
          phone: '+91-9876543210',
          address: '123 Test Street, Test City',
          userId: testUser._id
        });
        await testClient.save();
        console.log('✅ Test client created');
      }
      
      // Create test invoice
      const testInvoice = new Invoice({
        userId: testUser._id,
        clientId: testClient._id,
        invoiceNumber: `PAY-TEST-${Date.now()}`,
        items: [
          {
            description: 'Payment Test Service',
            quantity: 1,
            rate: 1000,
            amount: 1000
          }
        ],
        subtotal: 1000,
        total: 1000,
        paymentStatus: 'pending',
        status: 'sent',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        issueDate: new Date()
      });
      
      await testInvoice.save();
      console.log('✅ Test invoice created');
      console.log(`\n🎯 Test invoice details:`);
      console.log(`   Invoice ID: ${testInvoice._id}`);
      console.log(`   Number: ${testInvoice.invoiceNumber}`);
      console.log(`   Total: ₹${testInvoice.total}`);
      console.log(`   Payment URL: http://localhost:3000/payment/${testInvoice._id}`);
      
      return testInvoice._id.toString();
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check if MongoDB is running');
    console.log('   2. Verify MONGODB_URI in .env.local');
    console.log('   3. Check database connection settings');
  }
}

// Run the setup
setupTestInvoiceForPayment().then(invoiceId => {
  if (invoiceId) {
    console.log('\n🚀 Ready for payment testing!');
    console.log(`Open: http://localhost:3000/payment/${invoiceId}`);
  }
  process.exit(0);
});
