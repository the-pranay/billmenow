import { connectToDatabase } from '../app/lib/database.js';
import User from '../app/lib/models/User.js';
import Client from '../app/lib/models/Client.js';
import Invoice from '../app/lib/models/Invoice.js';
import Payment from '../app/lib/models/Payment.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectToDatabase();
    console.log('✅ Connected to database');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@billmenow.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@billmenow.com',
        password: hashedPassword,
        role: 'admin',
        businessName: 'BillMeNow Admin',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await admin.save();
      console.log('✅ Admin user created: admin@billmenow.com / admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create demo user
    const demoExists = await User.findOne({ email: 'demo@example.com' });
    let demoUser;
    if (!demoExists) {
      const hashedPassword = await bcrypt.hash('demo123', 12);
      demoUser = new User({
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@example.com',
        password: hashedPassword,
        role: 'user',
        businessName: 'Demo Business Solutions',
        phone: '+91 98765 43210',
        address: '123 Demo Street, Mumbai, Maharashtra, 400001',
        gstin: '27ABCDE1234F1Z5',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await demoUser.save();
      console.log('✅ Demo user created: demo@example.com / demo123');
    } else {
      demoUser = demoExists;
      console.log('ℹ️  Demo user already exists');
    }

    // Create sample clients for demo user
    const clientsData = [
      {
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+91 98765 11111',
        address: '456 Business Park, Bangalore, Karnataka, 560001',
        gstin: '29ACME1234A1Z1',
        userId: demoUser._id
      },
      {
        name: 'TechStart Solutions',
        email: 'info@techstart.com',
        phone: '+91 98765 22222',
        address: '789 Tech Hub, Pune, Maharashtra, 411001',
        gstin: '27TECH1234B2Z2',
        userId: demoUser._id
      },
      {
        name: 'Global Enterprises',
        email: 'admin@global.com',
        phone: '+91 98765 33333',
        address: '321 Corporate Center, Delhi, Delhi, 110001',
        gstin: '07GLOB1234C3Z3',
        userId: demoUser._id
      }
    ];

    const existingClients = await Client.find({ userId: demoUser._id });
    if (existingClients.length === 0) {
      const clients = await Client.insertMany(clientsData);
      console.log(`✅ Created ${clients.length} sample clients`);

      // Create sample invoices
      const invoicesData = [
        {
          invoiceNumber: 'INV-2024-001',
          clientId: clients[0]._id,
          userId: demoUser._id,
          items: [
            {
              description: 'Website Development',
              quantity: 1,
              rate: 50000,
              amount: 50000
            },
            {
              description: 'SEO Optimization',
              quantity: 1,
              rate: 15000,
              amount: 15000
            }
          ],
          subtotal: 65000,
          taxRate: 18,
          taxAmount: 11700,
          totalAmount: 76700,
          status: 'paid',
          issueDate: new Date('2024-01-15'),
          dueDate: new Date('2024-02-15'),
          paidAt: new Date('2024-02-10'),
          paidAmount: 76700,
          notes: 'Thank you for your business!'
        },
        {
          invoiceNumber: 'INV-2024-002',
          clientId: clients[1]._id,
          userId: demoUser._id,
          items: [
            {
              description: 'Mobile App Development',
              quantity: 1,
              rate: 75000,
              amount: 75000
            }
          ],
          subtotal: 75000,
          taxRate: 18,
          taxAmount: 13500,
          totalAmount: 88500,
          status: 'pending',
          issueDate: new Date('2024-02-01'),
          dueDate: new Date('2024-03-01'),
          notes: 'Payment due within 30 days'
        },
        {
          invoiceNumber: 'INV-2024-003',
          clientId: clients[2]._id,
          userId: demoUser._id,
          items: [
            {
              description: 'Digital Marketing Campaign',
              quantity: 3,
              rate: 20000,
              amount: 60000
            },
            {
              description: 'Content Creation',
              quantity: 1,
              rate: 25000,
              amount: 25000
            }
          ],
          subtotal: 85000,
          taxRate: 18,
          taxAmount: 15300,
          totalAmount: 100300,
          status: 'overdue',
          issueDate: new Date('2024-01-01'),
          dueDate: new Date('2024-01-31'),
          notes: 'Follow up required'
        }
      ];

      const invoices = await Invoice.insertMany(invoicesData);
      console.log(`✅ Created ${invoices.length} sample invoices`);

      // Create sample payment for the paid invoice
      const paidInvoice = invoices[0];
      const paymentData = {
        invoiceId: paidInvoice._id,
        userId: demoUser._id,
        clientId: paidInvoice.clientId,
        amount: paidInvoice.totalAmount,
        status: 'completed',
        paymentMethod: 'razorpay',
        razorpayOrderId: 'order_demo123456',
        razorpayPaymentId: 'pay_demo123456',
        razorpaySignature: 'signature_demo123456',
        transactionDate: new Date('2024-02-10'),
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10')
      };

      const payment = new Payment(paymentData);
      await payment.save();
      console.log('✅ Created sample payment record');

    } else {
      console.log('ℹ️  Sample data already exists');
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Accounts Created:');
    console.log('  Admin: admin@billmenow.com / admin123');
    console.log('  Demo User: demo@example.com / demo123');
    console.log('\n🔗 You can now start the application and login with these credentials.');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Check if running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('\n✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
