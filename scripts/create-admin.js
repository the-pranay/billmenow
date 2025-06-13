import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../app/lib/models/User.js';
import { hashPassword } from '../app/lib/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Admin details (change these to your preferred credentials)
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@billmenow.com', // Change this to your email
      password: 'admin123456', // Change this to a secure password
      businessName: 'BillMeNow Admin',
      businessType: 'Technology',
      phoneNumber: '+1234567890',
      address: {
        street: 'Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        zipCode: '12345',
        country: 'Admin Country'
      },
      role: 'admin',
      emailVerified: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log(`📧 Email: ${adminData.email}`);
      
      // Update role to admin if not already
      if (existingAdmin.role !== 'admin') {
        await User.findByIdAndUpdate(existingAdmin._id, { role: 'admin' });
        console.log('👑 Role updated to admin');
      }
    } else {
      // Hash password
      const hashedPassword = await hashPassword(adminData.password);
      adminData.password = hashedPassword;

      // Create admin user
      const admin = new User(adminData);
      await admin.save();
      
      console.log('🎉 Admin user created successfully!');
      console.log(`📧 Email: ${adminData.email}`);
      console.log(`🔑 Password: admin123456`);
    }
    
    console.log('🔗 Admin Dashboard: http://localhost:3002/api/admin/dashboard');
    console.log('🔗 Login: http://localhost:3002/auth/login');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdmin();
