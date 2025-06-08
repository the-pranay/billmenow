// Test to find existing invoices and create a test invoice if none exist
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const mongoUrl = process.env.MONGODB_URI;

async function findOrCreateTestInvoice() {
  let client;
  
  try {
    console.log('🔍 Connecting to MongoDB...');
    client = new MongoClient(mongoUrl);
    await client.connect();
    
    const db = client.db();
    const invoicesCollection = db.collection('invoices');
    const clientsCollection = db.collection('clients');
    const usersCollection = db.collection('users');
    
    // First, let's see if there are any existing invoices
    console.log('📋 Checking existing invoices...');
    const existingInvoices = await invoicesCollection.find({}).limit(5).toArray();
    
    if (existingInvoices.length > 0) {
      console.log(`✅ Found ${existingInvoices.length} existing invoices:`);
      existingInvoices.forEach((invoice, index) => {
        console.log(`${index + 1}. ID: ${invoice._id} | Number: ${invoice.invoiceNumber} | Total: ₹${invoice.total} | Status: ${invoice.paymentStatus || invoice.status}`);
      });
      
      // Return the first unpaid invoice
      const unpaidInvoice = existingInvoices.find(inv => 
        inv.paymentStatus !== 'paid' && inv.status !== 'paid'
      );
      
      if (unpaidInvoice) {
        console.log(`\n🎯 Using existing unpaid invoice: ${unpaidInvoice._id}`);
        console.log(`💰 Amount: ₹${unpaidInvoice.total}`);
        console.log(`📄 Invoice Number: ${unpaidInvoice.invoiceNumber}`);
        return unpaidInvoice._id.toString();
      }
    }
    
    console.log('🏗️  Creating test invoice...');
    
    // Check if test user exists
    let testUser = await usersCollection.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('👤 Creating test user...');
      const userResult = await usersCollection.insertOne({
        name: 'Test User',
        email: 'test@example.com',
        businessName: 'Test Business',
        createdAt: new Date()
      });
      testUser = { _id: userResult.insertedId };
    }
    
    // Check if test client exists
    let testClient = await clientsCollection.findOne({ email: 'client@example.com' });
    if (!testClient) {
      console.log('👤 Creating test client...');
      const clientResult = await clientsCollection.insertOne({
        name: 'Test Client',
        email: 'client@example.com',
        company: 'Client Company Ltd',
        address: '123 Test Street, Test City',
        userId: testUser._id,
        createdAt: new Date()
      });
      testClient = { _id: clientResult.insertedId };
    }
    
    // Create test invoice
    console.log('📄 Creating test invoice...');
    const testInvoice = {
      userId: testUser._id,
      clientId: testClient._id,
      invoiceNumber: `INV-TEST-${Date.now()}`,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      items: [
        {
          description: 'Website Development Services',
          quantity: 1,
          rate: 25000,
          amount: 25000
        },
        {
          description: 'SEO Optimization',
          quantity: 1, 
          rate: 15000,
          amount: 15000
        }
      ],
      subtotal: 40000,
      taxRate: 18,
      tax: 7200,
      total: 47200,
      totalPaid: 0,
      remainingBalance: 47200,
      paymentStatus: 'unpaid',
      status: 'sent',
      payments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await invoicesCollection.insertOne(testInvoice);
    console.log(`✅ Test invoice created with ID: ${result.insertedId}`);
    console.log(`💰 Total Amount: ₹${testInvoice.total}`);
    console.log(`📄 Invoice Number: ${testInvoice.invoiceNumber}`);
    
    return result.insertedId.toString();
    
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

findOrCreateTestInvoice().then(invoiceId => {
  if (invoiceId) {
    console.log(`\n🔗 Test your payment page at:`);
    console.log(`http://localhost:3001/payment/${invoiceId}`);
  }
}).catch(console.error);
