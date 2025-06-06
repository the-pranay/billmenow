import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../app/lib/models/User.js';
import Client from '../app/lib/models/Client.js';
import Invoice from '../app/lib/models/Invoice.js';
import { hashPassword } from '../app/lib/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function connectToMongoDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }
  
  console.log('🔗 Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectToMongoDB();
    console.log('✅ Connected to database');

    // Create a test user
    const testEmail = 'test@billmenow.com';
    let testUser = await User.findOne({ email: testEmail });
    
    if (!testUser) {
      console.log('👤 Creating test user...');
      const hashedPassword = await hashPassword('password123');
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        password: hashedPassword,
        businessName: 'Test Business',
        businessType: 'freelancer',
        phone: '+1234567890',
        country: 'IN',
        emailVerified: true,
        isActive: true
      });
      console.log('✅ Test user created');
    } else {
      console.log('👤 Test user already exists');
    }

    // Create test clients
    console.log('👥 Creating test clients...');
    const clientsData = [
      {
        name: 'Acme Corporation',
        email: 'john@acme.com',
        phone: '+1234567890',
        company: 'Acme Corporation',
        address: '123 Business St, New York, NY 10001',
        notes: 'Large enterprise client',
        userId: testUser._id
      },
      {
        name: 'Tech Solutions Ltd',
        email: 'admin@techsolutions.com',
        phone: '+1234567891',
        company: 'Tech Solutions Ltd',
        address: '456 Tech Ave, San Francisco, CA 94105',
        notes: 'Software development company',
        userId: testUser._id
      },
      {
        name: 'Digital Agency',
        email: 'contact@digitalagency.com',
        phone: '+1234567892',
        company: 'Digital Agency',
        address: '789 Creative Blvd, Austin, TX 73301',
        notes: 'Marketing and design agency',
        userId: testUser._id
      },
      {
        name: 'Startup Inc',
        email: 'hello@startup.com',
        phone: '+1234567893',
        company: 'Startup Inc',
        address: '321 Innovation Dr, Seattle, WA 98101',
        notes: 'Early stage startup',
        userId: testUser._id
      }
    ];

    // Clear existing clients for this user and create new ones
    await Client.deleteMany({ userId: testUser._id });
    const clients = await Client.create(clientsData);
    console.log(`✅ Created ${clients.length} test clients`);

    // Create test invoices
    console.log('📄 Creating test invoices...');
    const invoicesData = [
      {
        userId: testUser._id,
        clientId: clients[0]._id,
        invoiceNumber: 'INV-2025-001',
        items: [
          {
            description: 'Web Development Services',
            quantity: 40,
            rate: 2500,
            amount: 100000
          }
        ],
        subtotal: 100000,
        taxRate: 18,
        taxAmount: 18000,
        discountRate: 0,
        discountAmount: 0,
        total: 118000,
        status: 'paid',
        issueDate: new Date('2025-01-15'),
        dueDate: new Date('2025-02-15'),
        paidDate: new Date('2025-02-10'),
        notes: 'Complete website redesign project'
      },
      {
        userId: testUser._id,
        clientId: clients[1]._id,
        invoiceNumber: 'INV-2025-002',
        items: [
          {
            description: 'Mobile App Development',
            quantity: 60,
            rate: 3000,
            amount: 180000
          }
        ],
        subtotal: 180000,
        taxRate: 18,
        taxAmount: 32400,
        discountRate: 5,
        discountAmount: 9000,
        total: 203400,        status: 'sent',
        issueDate: new Date('2025-02-01'),
        dueDate: new Date('2025-03-01'),
        notes: 'iOS and Android mobile application'
      },
      {
        userId: testUser._id,
        clientId: clients[2]._id,
        invoiceNumber: 'INV-2025-003',
        items: [
          {
            description: 'SEO Optimization',
            quantity: 20,
            rate: 1500,
            amount: 30000
          },
          {
            description: 'Content Writing',
            quantity: 10,
            rate: 1000,
            amount: 10000
          }
        ],
        subtotal: 40000,
        taxRate: 18,
        taxAmount: 7200,
        discountRate: 0,
        discountAmount: 0,
        total: 47200,
        status: 'overdue',
        issueDate: new Date('2024-12-15'),
        dueDate: new Date('2025-01-15'),
        notes: 'SEO and content marketing services'
      },
      {
        userId: testUser._id,
        clientId: clients[3]._id,
        invoiceNumber: 'INV-2025-004',
        items: [
          {
            description: 'Consulting Services',
            quantity: 15,
            rate: 4000,
            amount: 60000
          }
        ],
        subtotal: 60000,
        taxRate: 18,
        taxAmount: 10800,
        discountRate: 0,
        discountAmount: 0,
        total: 70800,
        status: 'draft',
        issueDate: new Date('2025-06-01'),
        dueDate: new Date('2025-07-01'),
        notes: 'Business strategy consulting'
      }
    ];

    // Clear existing invoices for this user and create new ones
    await Invoice.deleteMany({ userId: testUser._id });
    const invoices = await Invoice.create(invoicesData);
    console.log(`✅ Created ${invoices.length} test invoices`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Data Summary:');
    console.log(`👤 Test User: ${testUser.email} (password: password123)`);
    console.log(`👥 Clients: ${clients.length}`);
    console.log(`📄 Invoices: ${invoices.length}`);
    console.log('\n💡 You can now login with:');
    console.log('   Email: test@billmenow.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
