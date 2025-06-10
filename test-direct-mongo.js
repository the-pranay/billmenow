import { config } from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
config({ path: '.env.local' });

async function testDirectConnection() {
  try {
    console.log('🔄 Testing direct MongoDB connection...');
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
    console.log('🔗 URI value:', process.env.MONGODB_URI?.substring(0, 50) + '...');
    
    // Clear any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Connect directly
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
    
    console.log('✅ Database connected successfully');
    
    // Test a simple query
    const adminDb = mongoose.connection.db.admin();
    const info = await adminDb.serverStatus();
    console.log('🗄️ Database info:', {
      host: info.host,
      version: info.version,
      uptime: info.uptime
    });
    
    // List databases
    const databases = await adminDb.listDatabases();
    console.log('📚 Available databases:', databases.databases.map(db => db.name));
    
    // Test the billmenow database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections in billmenow:', collections.map(col => col.name));
    
    // Try to find the specific invoice
    const invoiceId = '68473949eaacdb6a3d1c7e9c';
    console.log('🔍 Searching for invoice:', invoiceId);
    
    // Direct query without model
    const invoiceDoc = await mongoose.connection.db.collection('invoices').findOne({
      _id: new mongoose.Types.ObjectId(invoiceId)
    });
    
    if (invoiceDoc) {
      console.log('✅ Invoice found:', {
        id: invoiceDoc._id,
        invoiceNumber: invoiceDoc.invoiceNumber,
        total: invoiceDoc.total,
        paymentStatus: invoiceDoc.paymentStatus
      });
    } else {
      console.log('❌ Invoice not found with ID:', invoiceId);
      
      // Show some sample invoices
      const sampleInvoices = await mongoose.connection.db.collection('invoices').find({}).limit(5).toArray();
      console.log('📊 Sample invoices in database:');
      sampleInvoices.forEach(inv => {
        console.log(`- ${inv._id} (${inv.invoiceNumber || 'No number'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testDirectConnection();
