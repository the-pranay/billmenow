// Debug users collection
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function debugUsers() {
  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('🔍 Debugging users collection...\n');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Get total count
    const count = await usersCollection.countDocuments();
    console.log(`📊 Total users: ${count}\n`);
    
    if (count > 0) {
      // Get first few users to see structure
      console.log('📋 Sample users (first 3):');
      const sampleUsers = await usersCollection.find({}).limit(3).toArray();
      
      sampleUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. User ${user._id}:`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Name: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
        console.log(`   Business: ${user.businessName || 'N/A'}`);
        console.log(`   Created: ${user.createdAt || 'N/A'}`);
        
        // Show all fields for first user
        if (index === 0) {
          console.log('   All fields:', Object.keys(user));
        }
      });
      
      // Check for demo user specifically
      console.log('\n🔍 Searching for demo users...');
      const demoUsers = await usersCollection.find({
        email: { $regex: /demo|test/i }
      }).toArray();
      
      if (demoUsers.length > 0) {
        console.log(`Found ${demoUsers.length} demo/test users:`);
        demoUsers.forEach(user => {
          console.log(`  - ${user.email} (${user.firstName} ${user.lastName})`);
        });
      } else {
        console.log('No demo/test users found');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugUsers();
