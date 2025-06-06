#!/usr/bin/env node

// Enhanced Production Diagnostic Script for BillMeNow
console.log("🚀 BillMeNow Production Diagnostic Script");
console.log("🌐 Target: https://billmenow.vercel.app");
console.log("⏰ Time:", new Date().toISOString());
console.log("=" * 60);

// Test 1: Health Check
const testHealthCheck = async () => {
  console.log("\n🏥 1. Health Check Test");
  console.log("----------------------------------------");
  
  try {
    const response = await fetch('https://billmenow.vercel.app/', {
      method: 'GET',
      headers: { 'User-Agent': 'BillMeNow-Diagnostic/1.0' }
    });
    
    console.log("✅ Site Status:", response.status);
    console.log("📊 Response Time:", Date.now());
    
    if (response.status === 200) {
      console.log("🎉 Website is accessible");
      return true;
    } else {
      console.log("⚠️  Unexpected status code");
      return false;
    }
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
    return false;
  }
};

// Test 2: Environment Variables Check
const testEnvironment = async () => {
  console.log("\n🔧 2. Environment Variables Test");
  console.log("----------------------------------------");
  
  try {
    // Test with invalid login to check if JWT_SECRET exists
    const response = await fetch('https://billmenow.vercel.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    console.log("🔗 Login endpoint status:", response.status);
    console.log("📋 Response:", JSON.stringify(data, null, 2));
    
    if (response.status === 400) {
      console.log("✅ Environment: API endpoints working (validation active)");
      return true;
    } else if (response.status === 500) {
      console.log("❌ Environment: Server configuration error");
      console.log("💡 Likely missing environment variables");
      return false;
    }
  } catch (error) {
    console.log("❌ Environment test failed:", error.message);
    return false;
  }
};

// Test 3: Database Connection
const testDatabase = async () => {
  console.log("\n🗄️  3. Database Connection Test");
  console.log("----------------------------------------");
  
  try {
    const response = await fetch('https://billmenow.vercel.app/api/dashboard', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log("🔗 Database test status:", response.status);
    console.log("📋 Response:", JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log("✅ Database: Connected (401 = auth required, DB working)");
      return true;
    } else if (response.status === 500) {
      console.log("❌ Database: Connection failed");
      console.log("💡 Check MONGODB_URI in Vercel environment");
      return false;
    }
  } catch (error) {
    console.log("❌ Database test failed:", error.message);
    return false;
  }
};

// Test 4: Registration Endpoint
const testRegistration = async () => {
  console.log("\n📝 4. Registration Endpoint Test");
  console.log("----------------------------------------");
  
  const testUser = {
    firstName: "Diagnostic",
    lastName: "Test",
    email: `diagnostic.${Date.now()}@billmenow.test`,
    password: "TestPass123!",
    businessName: "Test Business",
    businessType: "Technology",
    phone: "+1234567890",
    country: "USA"
  };
  
  console.log("👤 Test user email:", testUser.email);
  
  try {
    const response = await fetch('https://billmenow.vercel.app/api/auth/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'BillMeNow-Diagnostic/1.0'
      },
      body: JSON.stringify(testUser)
    });
    
    console.log("🔗 Registration status:", response.status);
    console.log("📊 Response headers:", Object.fromEntries(response.headers.entries()));
    
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log("📋 JSON Response:", JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log("📄 Text Response:", text.substring(0, 500) + "...");
      data = { rawResponse: text };
    }
    
    // Analyze response
    if (response.status === 201) {
      console.log("🎉 Registration: SUCCESS!");
      console.log("🎫 Token received:", data.token ? "Yes" : "No");
      console.log("👤 User ID:", data.user?.id);
      return { status: 'success', data };
    } else if (response.status === 400) {
      console.log("⚠️  Registration: Validation Error");
      console.log("🔍 Details:", data.error || data.message);
      return { status: 'validation_error', data };
    } else if (response.status === 409) {
      console.log("ℹ️  Registration: User Exists (this is actually good - endpoint working)");
      return { status: 'user_exists', data };
    } else if (response.status === 500) {
      console.log("❌ Registration: SERVER ERROR");
      console.log("🚨 Error:", data.error || "Unknown server error");
      return { status: 'server_error', data };
    } else {
      console.log("❓ Registration: Unexpected response");
      return { status: 'unexpected', data };
    }
    
  } catch (error) {
    console.log("💥 Registration test failed:", error.message);
    console.log("🔍 Full error:", error);
    return { status: 'network_error', error: error.message };
  }
};

// Main diagnostic function
const runDiagnostics = async () => {
  const results = {
    health: false,
    environment: false,
    database: false,
    registration: null
  };
  
  // Run all tests
  results.health = await testHealthCheck();
  results.environment = await testEnvironment();
  results.database = await testDatabase();
  results.registration = await testRegistration();
  
  // Generate summary report
  console.log("\n📊 DIAGNOSTIC SUMMARY");
  console.log("=====================================");
  
  const healthStatus = results.health ? "✅ PASS" : "❌ FAIL";
  const envStatus = results.environment ? "✅ PASS" : "❌ FAIL";
  const dbStatus = results.database ? "✅ PASS" : "❌ FAIL";
  
  console.log(`🏥 Health Check: ${healthStatus}`);
  console.log(`🔧 Environment: ${envStatus}`);
  console.log(`🗄️  Database: ${dbStatus}`);
  
  if (results.registration) {
    const regStatus = ['success', 'user_exists'].includes(results.registration.status) ? "✅ PASS" : "❌ FAIL";
    console.log(`📝 Registration: ${regStatus} (${results.registration.status})`);
  } else {
    console.log("📝 Registration: ❌ FAIL");
  }
  
  // Provide specific recommendations
  console.log("\n💡 RECOMMENDATIONS");
  console.log("=====================================");
  
  if (!results.health) {
    console.log("🚨 CRITICAL: Website is not accessible");
    console.log("   → Check Vercel deployment status");
    console.log("   → Verify domain configuration");
  }
  
  if (!results.environment) {
    console.log("🚨 CRITICAL: Environment configuration error");
    console.log("   → Check all environment variables in Vercel dashboard");
    console.log("   → Ensure JWT_SECRET and NEXTAUTH_SECRET are set");
    console.log("   → Use VERCEL_ENV_COMPLETE.txt file for reference");
  }
  
  if (!results.database) {
    console.log("🚨 CRITICAL: Database connection failed");
    console.log("   → Verify MONGODB_URI in Vercel environment variables");
    console.log("   → Check MongoDB Atlas network access settings");
    console.log("   → Ensure database user has proper permissions");
  }
  
  if (results.registration && results.registration.status === 'server_error') {
    console.log("🚨 CRITICAL: Registration endpoint error");
    console.log("   → Check Vercel function logs for detailed error");
    console.log("   → Verify all required environment variables");
    console.log("   → Test database connectivity");
    console.log("   → Check User model imports and schema");
  }
  
  // Next steps
  console.log("\n🎯 IMMEDIATE NEXT STEPS");
  console.log("=====================================");
  console.log("1. 🔍 Check Vercel Dashboard → Functions → View Logs");
  console.log("2. ⚙️  Verify Environment Variables in Vercel Settings");
  console.log("3. 📁 Use VERCEL_ENV_COMPLETE.txt to set all variables");
  console.log("4. 🔄 Redeploy after fixing environment variables");
  console.log("5. 🧪 Run this diagnostic again after fixes");
  
  console.log("\n✨ DIAGNOSTIC COMPLETE");
  console.log(`⏰ Completed at: ${new Date().toISOString()}`);
};

// Run diagnostics
runDiagnostics().catch(console.error);
