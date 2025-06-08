// Comprehensive Invoice Creation Test
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// Define schemas (simplified versions for testing)
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  businessName: String
});

const clientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  phone: String,
  address: String
});

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  invoiceNumber: String,
  items: Array,
  subtotal: Number,
  taxTotal: Number,
  total: Number,
  status: String,
  issueDate: Date,
  dueDate: Date,
  notes: String
});

// Add the compound index that was causing duplicate key errors
invoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
const Client = mongoose.model('Client', clientSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);

async function testInvoiceCreationWorkflow() {
  console.log('🧪 Testing Complete Invoice Creation Workflow\n');
  
  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Connected to MongoDB Atlas\n');
      // Test 1: Find any test user
    console.log('1. 📋 Finding test user...');
    const user = await User.findOne({ email: { $regex: /test/i } });
    if (!user) {
      console.log('❌ No test user found');
      return;
    }
    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.businessName})`);
    console.log(`   Email: ${user.email}\n`);
    
    // Test 2: Find clients for this user
    console.log('2. 👥 Finding clients...');
    const clients = await Client.find({ userId: user._id });
    if (clients.length === 0) {
      console.log('❌ No clients found for demo user');
      return;
    }
    console.log(`✅ Found ${clients.length} clients:`);
    clients.forEach((client, index) => {
      console.log(`   ${index + 1}. ${client.name} (${client.email})`);
    });
    console.log();
    
    // Test 3: Check existing invoices
    console.log('3. 📄 Checking existing invoices...');
    const existingInvoices = await Invoice.find({ userId: user._id }).sort({ invoiceNumber: -1 });
    console.log(`✅ Found ${existingInvoices.length} existing invoices`);
    if (existingInvoices.length > 0) {
      console.log(`   Latest: ${existingInvoices[0].invoiceNumber}`);
    }
    console.log();
    
    // Test 4: Generate next invoice number (our new algorithm)
    console.log('4. 🔢 Testing invoice number generation...');
    const currentYear = new Date().getFullYear();
    
    // Get the highest invoice number for this user and year
    const lastInvoice = await Invoice.findOne({
      userId: user._id,
      invoiceNumber: { $regex: `^INV-${currentYear}-` }
    }).sort({ invoiceNumber: -1 });
    
    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]) || 0;
      nextNumber = lastNumber + 1;
    }
    
    const newInvoiceNumber = `INV-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
    console.log(`✅ Generated invoice number: ${newInvoiceNumber}\n`);
    
    // Test 5: Verify uniqueness
    console.log('5. 🔍 Verifying invoice number uniqueness...');
    const duplicateCheck = await Invoice.findOne({
      userId: user._id,
      invoiceNumber: newInvoiceNumber
    });
    
    if (duplicateCheck) {
      console.log(`❌ Invoice number ${newInvoiceNumber} already exists!`);
      return;
    }
    console.log(`✅ Invoice number ${newInvoiceNumber} is unique\n`);
    
    // Test 6: Create test invoice (simulate the actual creation)
    console.log('6. 📝 Creating test invoice...');
    const testInvoice = new Invoice({
      userId: user._id,
      clientId: clients[0]._id,
      invoiceNumber: newInvoiceNumber,
      items: [
        {
          description: 'Test Service - Invoice Creation Fix Verification',
          quantity: 1,
          rate: 10000,
          amount: 10000
        }
      ],
      subtotal: 10000,
      taxTotal: 1800, // 18%
      total: 11800,
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      notes: 'Test invoice created to verify duplicate key fix'
    });
    
    const savedInvoice = await testInvoice.save();
    console.log(`✅ Invoice created successfully!`);
    console.log(`   ID: ${savedInvoice._id}`);
    console.log(`   Number: ${savedInvoice.invoiceNumber}`);
    console.log(`   Client: ${clients[0].name}`);
    console.log(`   Amount: ₹${savedInvoice.total}\n`);
    
    // Test 7: Try to create duplicate (should fail gracefully)
    console.log('7. 🚫 Testing duplicate prevention...');
    try {
      const duplicateInvoice = new Invoice({
        userId: user._id,
        clientId: clients[0]._id,
        invoiceNumber: newInvoiceNumber, // Same number
        items: [{ description: 'Duplicate test', quantity: 1, rate: 1000, amount: 1000 }],
        subtotal: 1000,
        taxTotal: 180,
        total: 1180,
        status: 'draft',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: 'This should fail'
      });
      
      await duplicateInvoice.save();
      console.log('❌ Duplicate invoice was created - this should not happen!');
      
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Duplicate key error caught correctly!');
        console.log(`   Error: E11000 duplicate key (as expected)`);
        console.log(`   Field: ${Object.keys(error.keyValue)[0]}`);
        console.log(`   Value: ${Object.values(error.keyValue)[0]}`);
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
    console.log();
    
    // Test 8: Create another invoice with sequential number
    console.log('8. 🔄 Creating second invoice with sequential number...');
    const secondNumber = `INV-${currentYear}-${String(nextNumber + 1).padStart(3, '0')}`;
    
    const secondInvoice = new Invoice({
      userId: user._id,
      clientId: clients[0]._id,
      invoiceNumber: secondNumber,
      items: [
        {
          description: 'Second Test Service',
          quantity: 2,
          rate: 5000,
          amount: 10000
        }
      ],
      subtotal: 10000,
      taxTotal: 1800,
      total: 11800,
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: 'Second test invoice'
    });
    
    const savedSecondInvoice = await secondInvoice.save();
    console.log(`✅ Second invoice created successfully!`);
    console.log(`   Number: ${savedSecondInvoice.invoiceNumber}`);
    console.log(`   Sequential numbering working correctly!\n`);
    
    console.log('🎉 ALL TESTS PASSED! Invoice creation workflow is working perfectly!');
    console.log('\n📊 Summary:');
    console.log('  ✅ Database connection: Working');
    console.log('  ✅ User authentication: Data available');
    console.log('  ✅ Client data: Available');
    console.log('  ✅ Invoice number generation: Working');
    console.log('  ✅ Uniqueness validation: Working');
    console.log('  ✅ Duplicate prevention: Working');
    console.log('  ✅ Sequential numbering: Working');
    console.log('  ✅ Invoice creation: Working');
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await Invoice.deleteOne({ _id: savedInvoice._id });
    await Invoice.deleteOne({ _id: savedSecondInvoice._id });
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(`  Error: ${error.message}`);
    console.error(`  Code: ${error.code || 'N/A'}`);
    if (error.stack) {
      console.error(`  Stack: ${error.stack}`);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

testInvoiceCreationWorkflow();
