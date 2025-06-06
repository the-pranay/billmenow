#!/usr/bin/env node

// Test local registration endpoint
import http from 'http';

const testData = {
  firstName: 'Local',
  lastName: 'User',
  email: `local.test.${Date.now()}@billmenow.test`,
  password: 'TestPassword123!',
  businessName: 'Test Business',
  businessType: 'freelancer',
  phone: '+1234567890',
  country: 'IN'
};

console.log('🏠 Testing Local Registration Endpoint');
console.log('====================================');
console.log('📧 Test Email:', testData.email);
console.log('🌐 Server: http://localhost:3001');

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`\n🔗 Response Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonResponse = JSON.parse(data);
      console.log('📋 JSON Response:', JSON.stringify(jsonResponse, null, 2));
        if (res.statusCode === 201) {
        console.log('✅ LOCAL REGISTRATION: SUCCESS');
        console.log('🎉 User created successfully in local environment');
      } else if (res.statusCode === 200) {
        console.log('✅ LOCAL REGISTRATION: SUCCESS (200)');
        console.log('🎉 User created successfully in local environment');
      } else if (res.statusCode === 400) {
        console.log('⚠️ LOCAL REGISTRATION: VALIDATION ERROR');
        console.log('💡 Check validation requirements');
      } else if (res.statusCode === 500) {
        console.log('❌ LOCAL REGISTRATION: SERVER ERROR');
        console.log('🚨 Database connection or server issue');
      } else {
        console.log(`⚠️ LOCAL REGISTRATION: UNEXPECTED STATUS ${res.statusCode}`);
      }
    } catch (e) {
      console.log('📋 Raw Response:', data);
      console.log('❌ Failed to parse JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
  console.log('💡 Make sure the development server is running on http://localhost:3001');
});

req.write(postData);
req.end();
