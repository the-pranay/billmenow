// Simple test to check existing users
import { connectToDatabase } from './app/lib/database.js';
import User from './app/lib/models/User.js';

async function checkUsers() {
  try {
    await connectToDatabase();
    const users = await User.find({}, 'email firstName lastName businessName');
    console.log('📋 Existing users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.firstName} ${user.lastName}) - ${user.businessName}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

checkUsers();
