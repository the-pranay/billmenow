import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Import models
import User from '../app/lib/models/User.js';
import Invoice from '../app/lib/models/Invoice.js';
import Payment from '../app/lib/models/Payment.js';
import Client from '../app/lib/models/Client.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Admin:aB9OFzt6p1XhW45S@billmenow.wcieo80.mongodb.net/billmenow';

async function seedTestData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 12);
      const testUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        businessName: 'John\'s Business',
        businessType: 'consultant',
        phone: '+1234567890',
        isEmailVerified: true,
        role: 'user'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
        businessName: 'Smith Services',
        businessType: 'agency',
        phone: '+1234567891',
        isEmailVerified: true,
        role: 'user'
      },
      {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@example.com',
        password: hashedPassword,
        businessName: 'Wilson Corp',
        businessType: 'small_business',
        phone: '+1234567892',
        isEmailVerified: false,
        role: 'user'
      }
    ];

    console.log('Creating test users...');
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
    const createdUsers = await User.insertMany(testUsers);
    console.log(`Created ${createdUsers.length} test users`);

    // Create test clients
    const testClients = [
      {
        name: 'Acme Corp',
        email: 'contact@acme.com',
        company: 'Acme Corporation',
        phone: '+1111111111',
        address: '123 Business St',
        userId: createdUsers[0]._id
      },
      {
        name: 'Beta Inc',
        email: 'info@beta.com',
        company: 'Beta Incorporated',
        phone: '+2222222222',
        address: '456 Commerce Ave',
        userId: createdUsers[1]._id
      },
      {
        name: 'Gamma Ltd',
        email: 'hello@gamma.com',
        company: 'Gamma Limited',
        phone: '+3333333333',
        address: '789 Trade Blvd',
        userId: createdUsers[0]._id
      }
    ];

    console.log('Creating test clients...');
    await Client.deleteMany({ email: { $in: testClients.map(c => c.email) } });
    const createdClients = await Client.insertMany(testClients);
    console.log(`Created ${createdClients.length} test clients`);

    // Create test invoices
    const testInvoices = [
      {
        userId: createdUsers[0]._id,
        clientId: createdClients[0]._id,
        invoiceNumber: 'INV-001',
        status: 'paid',
        subtotal: 1000,
        tax: 180,
        total: 1180,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [
          {
            description: 'Web Development',
            quantity: 1,
            rate: 1000,
            amount: 1000
          }
        ]
      },
      {
        userId: createdUsers[1]._id,
        clientId: createdClients[1]._id,
        invoiceNumber: 'INV-002',
        status: 'sent',
        subtotal: 2000,
        tax: 360,
        total: 2360,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        items: [
          {
            description: 'Design Services',
            quantity: 2,
            rate: 1000,
            amount: 2000
          }
        ]
      },
      {
        userId: createdUsers[0]._id,
        clientId: createdClients[2]._id,
        invoiceNumber: 'INV-003',
        status: 'viewed',
        subtotal: 1500,
        tax: 270,
        total: 1770,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        items: [
          {
            description: 'Consulting',
            quantity: 3,
            rate: 500,
            amount: 1500
          }
        ]
      }
    ];

    console.log('Creating test invoices...');
    await Invoice.deleteMany({ invoiceNumber: { $in: testInvoices.map(i => i.invoiceNumber) } });
    const createdInvoices = await Invoice.insertMany(testInvoices);
    console.log(`Created ${createdInvoices.length} test invoices`);    // Create test payments
    const testPayments = [
      {
        userId: createdUsers[0]._id,
        freelancerId: createdUsers[0]._id,
        invoiceId: createdInvoices[0]._id,
        amount: 1180,
        currency: 'INR',
        method: 'upi',
        status: 'completed',
        transactionId: 'TXN-001',
        upiId: 'john@paytm'
      },
      {
        userId: createdUsers[1]._id,
        freelancerId: createdUsers[1]._id,
        invoiceId: createdInvoices[1]._id,
        amount: 2360,
        currency: 'INR',
        method: 'card',
        status: 'pending',
        transactionId: 'TXN-002'
      },
      {
        userId: createdUsers[0]._id,
        freelancerId: createdUsers[0]._id,
        invoiceId: createdInvoices[2]._id,
        amount: 1770,
        currency: 'INR',
        method: 'razorpay',
        status: 'failed',
        transactionId: 'TXN-003',
        failureReason: 'Payment declined by bank'
      }
    ];

    console.log('Creating test payments...');
    await Payment.deleteMany({ transactionId: { $in: testPayments.map(p => p.transactionId) } });
    const createdPayments = await Payment.insertMany(testPayments);
    console.log(`Created ${createdPayments.length} test payments`);

    console.log('\n✅ Test data seeded successfully!');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`🏢 Clients: ${createdClients.length}`);
    console.log(`📄 Invoices: ${createdInvoices.length}`);
    console.log(`💳 Payments: ${createdPayments.length}`);

  } catch (error) {
    console.error('Error seeding test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding
seedTestData();
