#!/usr/bin/env node

// Load environment variables
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Test MongoDB Atlas connection directly
import { connectToDatabase } from '../app/lib/database.js';

const testDatabaseConnection = async () => {
  console.log("🗄️  Testing MongoDB Atlas Connection");
  console.log("====================================");
  
  console.log("📋 Environment Variables:");
  console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✅ Set" : "❌ Not Set");
  console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Not Set");
  
  if (process.env.MONGODB_URI) {
    // Mask the password for security
    const maskedUri = process.env.MONGODB_URI.replace(/:[^:@]*@/, ':***@');
    console.log("MongoDB URI (masked):", maskedUri);
  }
  
  console.log("\n🔌 Attempting to connect to MongoDB Atlas...");
  
  try {
    const connection = await connectToDatabase();
    console.log("✅ Database connection successful!");
    console.log("🏷️  Database name:", connection.connections[0]?.name);
    console.log("📊 Connection state:", connection.connections[0]?.readyState);
    
    // Test a simple query
    console.log("\n🧪 Testing simple query...");
    const User = (await import('../app/lib/models/User.js')).default;
    const userCount = await User.countDocuments();
    console.log("👥 Total users in database:", userCount);
    
    return true;
  } catch (error) {
    console.log("❌ Database connection failed!");
    console.log("🚨 Error:", error.message);
    
    if (error.message.includes('IP')) {
      console.log("\n💡 SOLUTION:");
      console.log("1. Go to MongoDB Atlas Dashboard");
      console.log("2. Navigate to Network Access");  
      console.log("3. Add IP Address: 0.0.0.0/0 (Allow from anywhere)");
      console.log("4. Wait 2-3 minutes for changes to apply");
    }
    
    return false;
  }
};

testDatabaseConnection().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
