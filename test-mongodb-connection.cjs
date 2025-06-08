// MongoDB Connection Diagnostics
// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/billmenow';

async function testMongoConnection() {
  console.log('🔍 MongoDB Connection Diagnostics\n');
  
  console.log('📋 Configuration:');
  console.log(`  URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  console.log(`  Node.js: ${process.version}`);
  console.log(`  Mongoose: ${mongoose.version}\n`);
  
  console.log('🔌 Testing connection...');
  
  try {
    // Set connection timeout
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
      heartbeatFrequencyMS: 10000, // 10 second heartbeat
      maxIdleTimeMS: 30000, // 30 second idle timeout
    };
    
    console.log('⏱️  Attempting connection with 5 second timeout...');
    const startTime = Date.now();
    
    await mongoose.connect(MONGODB_URI, options);
    
    const connectionTime = Date.now() - startTime;
    console.log(`✅ Connection successful! (${connectionTime}ms)\n`);
    
    // Test database operations
    console.log('🧪 Testing database operations...');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📂 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Test a simple query
    console.log('\n🔍 Testing query operation...');
    const users = await db.collection('users').countDocuments();
    console.log(`👥 Total users in database: ${users}`);
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error(`  Error: ${error.message}`);
    console.error(`  Code: ${error.code || 'N/A'}`);
    console.error(`  Name: ${error.name || 'N/A'}`);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 DNS resolution failed. Check:');
      console.error('  - Internet connection');
      console.error('  - MongoDB Atlas cluster is running');
      console.error('  - Correct cluster hostname');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Check:');
      console.error('  - MongoDB service is running');
      console.error('  - Port is correct (27017 for local)');
      console.error('  - Firewall settings');
    }
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
      console.error('\n💡 Connection timeout. Check:');
      console.error('  - Network connectivity');
      console.error('  - MongoDB Atlas IP whitelist');
      console.error('  - VPN or proxy settings');
    }
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication failed. Check:');
      console.error('  - Username and password are correct');
      console.error('  - User has proper permissions');
      console.error('  - Database name is correct');
    }
    
  } finally {
    console.log('\n🔌 Closing connection...');
    await mongoose.disconnect();
    process.exit(0);
  }
}

testMongoConnection();
