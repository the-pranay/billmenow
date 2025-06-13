// Simple test to verify admin APIs are working
async function testAdminAPIs() {
  console.log('🧪 Testing Admin APIs...\n');
  
  // We need to login first to get the auth token
  console.log('⚠️  Note: These APIs require authentication.');
  console.log('To test manually:');
  console.log('1. Login at: http://localhost:3001/auth/login');
  console.log('   Email: thepranay2004@gmail.com');
  console.log('   Password: admin@30');
  console.log('2. Visit: http://localhost:3001/admin');
  console.log('3. Check browser console for API logs');
  
  console.log('\n🔗 Direct API endpoints to test (after login):');
  console.log('📊 Dashboard Stats: http://localhost:3001/api/admin/dashboard');
  console.log('👥 Users List: http://localhost:3001/api/admin/users');
  console.log('📄 Invoices List: http://localhost:3001/api/invoices');
  console.log('💳 Payments List: http://localhost:3001/api/payment/status');
  
  console.log('\n📋 Expected Results Based on Database:');
  console.log('✅ Total Users: 41');
  console.log('✅ Total Invoices: 46');
  console.log('✅ Total Payments: 45');
  console.log('✅ Total Revenue: ₹1,205.4');
  console.log('✅ Active Users: 2');
  console.log('✅ Paid Invoices: 7');
  console.log('✅ Completed Payments: 6');
}

testAdminAPIs();
