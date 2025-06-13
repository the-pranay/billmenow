import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../app/lib/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function makeAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Prompt for email (you can change this to your email)
    const adminEmail = process.argv[2];
    
    if (!adminEmail) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node scripts/make-admin.js your-email@example.com');
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ email: adminEmail });
    
    if (!user) {
      console.log(`❌ User with email ${adminEmail} not found`);
      console.log('Please register an account first at /auth/register');
      process.exit(1);
    }

    // Update user role to admin
    await User.findByIdAndUpdate(user._id, { role: 'admin' });
    
    console.log('🎉 Success! User has been promoted to admin');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`👑 Role: admin`);
    console.log(`🔗 Admin Dashboard: http://localhost:3002/api/admin/dashboard`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

makeAdmin();
