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

async function createAdminFromEnv() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local');
      process.exit(1);
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log(`✅ Updated existing user ${adminEmail} to admin role`);
    } else {
      // Create new admin user
      const hashedPassword = await hashPassword(adminPassword);
        const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: hashedPassword,
        businessName: 'BillMeNow Admin',
        businessType: 'other',
        role: 'admin',
        emailVerified: true,
        isActive: true
      });

      await adminUser.save();
      console.log(`✅ Created new admin user: ${adminEmail}`);
    }

    console.log('\n🎉 Admin setup complete!');
    console.log(`📧 Admin Email: ${adminEmail}`);
    console.log(`🔑 Admin Password: ${adminPassword}`);
    console.log('\n🚀 You can now login at: http://localhost:3002/auth/login');
    console.log('🛡️  Admin Dashboard: http://localhost:3002/admin');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  }
}

createAdminFromEnv();
