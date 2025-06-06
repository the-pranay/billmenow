#!/usr/bin/env node

// Test the exact same request that the frontend would make
const testFrontendRegistration = async () => {
  console.log("🧪 Testing Frontend Registration Request");
  console.log("=======================================");
  
  // Exact same data structure as the frontend form
  const frontendFormData = {
    firstName: "John",
    lastName: "Doe", 
    email: `frontend.test.${Date.now()}@billmenow.com`,
    password: "password123",
    confirmPassword: "password123",
    businessName: "John's Business",
    businessType: "freelancer",
    phone: "+1234567890",
    country: "IN",
    terms: true,
    privacy: true,
    marketing: false
  };
  
  console.log("👤 Test Data:", JSON.stringify(frontendFormData, null, 2));
  console.log("\n🌐 Making request to production...");
  
  try {
    const response = await fetch('https://billmenow.vercel.app/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(frontendFormData)
    });

    console.log("🔗 Response Status:", response.status);
    console.log("📊 Response Headers:", Object.fromEntries(response.headers.entries()));

    // Try to parse response
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
      console.log("📋 JSON Response:", JSON.stringify(responseData, null, 2));
    } else {
      const text = await response.text();
      console.log("📄 Text Response:", text);
      responseData = { rawText: text };
    }

    // Analyze what the frontend would see
    console.log("\n🔍 Frontend Analysis:");
    console.log("response.ok:", response.ok);
    console.log("response.status:", response.status);
    
    if (!response.ok) {
      const errorMessage = responseData.error || responseData.message || 'Registration failed';
      console.log("❌ Error that frontend would show:", errorMessage);
    } else {
      console.log("✅ Success response");
      console.log("🎫 Token received:", responseData.token ? "Yes" : "No");
      console.log("👤 User data:", responseData.user ? "Yes" : "No");
    }

  } catch (error) {
    console.log("💥 Network Error:", error.message);
    console.log("🔍 This is what frontend would catch:", error);
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("✨ Frontend Test Complete");
};

// Also test with local development
const testLocalRegistration = async () => {
  console.log("\n🏠 Testing Local Development Server");
  console.log("==================================");
  
  const localFormData = {
    firstName: "Local",
    lastName: "Test",
    email: `local.test.${Date.now()}@billmenow.com`,
    password: "password123",
    confirmPassword: "password123",
    businessName: "Local Business",
    businessType: "freelancer",
    phone: "+1234567890",
    country: "IN",
    terms: true,
    privacy: true,
    marketing: false
  };
  
  try {
    console.log("🌐 Making request to localhost:3000...");
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(localFormData)
    });

    console.log("🔗 Local Response Status:", response.status);
    
    if (response.status !== 500) {
      const data = await response.json();
      console.log("📋 Local Response:", JSON.stringify(data, null, 2));
    } else {
      console.log("❌ Local server also returning 500 error");
    }

  } catch (error) {
    console.log("💥 Local server not running or error:", error.message);
  }
};

// Run both tests
const runTests = async () => {
  await testFrontendRegistration();
  await testLocalRegistration();
};

runTests().catch(console.error);
