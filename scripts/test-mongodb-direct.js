#!/usr/bin/env node

// Direct MongoDB connection test
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔗 Direct MongoDB Atlas Connection Test');
console.log('=======================================');
console.log('URI:', MONGODB_URI ? 'SET' : 'NOT SET');

if (!MONGODB_URI) {
  console.log('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Mask password for logging
const maskedUri = MONGODB_URI.replace(/:[^:@]*@/, ':***@');
console.log('Masked URI:', maskedUri);

console.log('\n🔌 Connecting to MongoDB Atlas...');

async function testDirectConnection() {
  try {
    // Set mongoose connection options
    const options = {
      bufferCommands: false,
      connectTimeoutMS: 10000, // 10 seconds
      serverSelectionTimeoutMS: 10000, // 10 seconds
    };

    console.log('⏳ Attempting connection...');
    
    // Connect directly with mongoose
    await mongoose.connect(MONGODB_URI, options);
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test a simple operation
    console.log('🔍 Testing database operations...');
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    
    if (result.ok === 1) {
      console.log('✅ Database ping successful!');
    }
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:`, collections.map(c => c.name));
    
    // Test user model import
    try {
      const User = (await import('../app/lib/models/User.js')).default;
      console.log('✅ User model imported successfully');
      
      // Test a simple query (should not fail even if no users exist)
      const userCount = await User.countDocuments();
      console.log(`👥 Current user count: ${userCount}`);
      
    } catch (modelError) {
      console.log('⚠️ User model test failed:', modelError.message);
    }
    
  } catch (error) {
    console.log('❌ Connection failed!');
    console.log('🚨 Error Type:', error.name);
    console.log('🚨 Error Message:', error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\n💡 This is typically caused by:');
      console.log('1. Network connectivity issues');
      console.log('2. MongoDB Atlas IP whitelist restrictions');
      console.log('3. Incorrect connection string');
      console.log('4. MongoDB Atlas cluster is paused/unavailable');
      
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Check MongoDB Atlas Network Access settings');
      console.log('2. Add 0.0.0.0/0 to IP whitelist (allow all IPs)');
      console.log('3. Verify cluster is running and accessible');
      console.log('4. Check if your IP has changed');
    }
    
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Connection closed');
    }
  }
}

testDirectConnection()
  .then(() => {
    console.log('\n🎉 Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💥 Test failed:', error.message);
    process.exit(1);
  });
