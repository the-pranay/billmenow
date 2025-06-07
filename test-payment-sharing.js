// Test script for payment sharing functionality
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://billmenow:billmenow123@cluster0.8b9dq.mongodb.net/billmenow?retryWrites=true&w=majority';

async function testPaymentSharing() {
  console.log('🧪 Testing Payment Sharing Functionality...\n');
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('billmenow');
    
    // Find a real invoice
    const invoice = await db.collection('invoices').findOne({});
    
    if (!invoice) {
      console.log('⚠️  No invoices found in database. Creating a test invoice...');
      
      // Create a test client first
      const testClient = {
        name: 'Test Client',
        email: 'test@example.com',
        company: 'Test Company',
        address: '123 Test Street',
        userId: new ObjectId(), // Random user ID for testing
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const clientResult = await db.collection('clients').insertOne(testClient);
      console.log('✅ Created test client:', clientResult.insertedId);
      
      // Create a test invoice
      const testInvoice = {
        invoiceNumber: 'INV-TEST-001',
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'pending',
        clientId: clientResult.insertedId,
        userId: testClient.userId,
        items: [
          {
            description: 'Test Service',
            quantity: 1,
            price: 100.00,
            total: 100.00
          }
        ],
        subtotal: 100.00,
        tax: 10.00,
        taxRate: 10,
        total: 110.00,
        notes: 'Test invoice for payment sharing',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const invoiceResult = await db.collection('invoices').insertOne(testInvoice);
      console.log('✅ Created test invoice:', invoiceResult.insertedId);
      
      const createdInvoice = await db.collection('invoices').findOne({ _id: invoiceResult.insertedId });
      await testPublicAPI(createdInvoice._id);
      
    } else {
      console.log('✅ Found existing invoice:', invoice.invoiceNumber);
      await testPublicAPI(invoice._id);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('✅ Disconnected from MongoDB');
    }
  }
}

async function testPublicAPI(invoiceId) {
  console.log(`\n🔍 Testing Public API for invoice: ${invoiceId}`);
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Test public invoice endpoint
    const response = await fetch(`http://localhost:3000/api/invoices/public/${invoiceId}`);
    const data = await response.json();
    
    console.log('📊 API Response Status:', response.status);
    console.log('📊 API Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Public API working correctly');
      console.log('💰 Invoice Total:', data.invoice.total);
      console.log('💵 Total Paid:', data.invoice.totalPaid);
      console.log('🔄 Payment Status:', data.invoice.paymentStatus);
      console.log('💲 Remaining Balance:', data.invoice.remainingBalance);
      
      // Generate payment link
      const paymentLink = `http://localhost:3000/payment/${invoiceId}`;
      console.log('🔗 Payment Link:', paymentLink);
      
    } else {
      console.log('❌ Public API returned error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run the test
testPaymentSharing().then(() => {
  console.log('\n🎉 Test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});
