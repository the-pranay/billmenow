import Razorpay from 'razorpay';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testRazorpayConnection() {
  try {
    console.log('🧪 Testing Razorpay Connection...\n');

    // Check if keys are set
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('❌ Razorpay keys not found in environment variables');
      console.log('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local');
      return;
    }

    if (keyId.includes('XXXXXXXXX') || keySecret.includes('XXXXXXX')) {
      console.error('❌ Please replace placeholder values with actual Razorpay keys');
      console.log('Current Key ID:', keyId);
      return;
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    console.log('✅ Razorpay instance created successfully');
    console.log('Key ID:', keyId);
    console.log('Mode:', keyId.startsWith('rzp_test_') ? 'TEST' : 'LIVE');

    // Test creating an order
    console.log('\n📋 Testing order creation...');
    
    const orderOptions = {
      amount: 100, // Amount in paise (₹1.00)
      currency: 'INR',
      receipt: 'test_receipt_' + Date.now(),
      notes: {
        test: 'This is a test order'
      }
    };

    const order = await razorpay.orders.create(orderOptions);
    console.log('✅ Test order created successfully:');
    console.log('Order ID:', order.id);
    console.log('Amount:', order.amount / 100, 'INR');
    console.log('Status:', order.status);

    // Test fetching the order
    console.log('\n🔍 Testing order fetch...');
    const fetchedOrder = await razorpay.orders.fetch(order.id);
    console.log('✅ Order fetched successfully:');
    console.log('Fetched Order ID:', fetchedOrder.id);

    console.log('\n🎉 All Razorpay tests passed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Your Razorpay integration is working correctly');
    console.log('2. You can now test payments in your application');
    console.log('3. Use test cards provided in Razorpay documentation');
    console.log('4. Monitor test transactions in Razorpay Dashboard');

  } catch (error) {
    console.error('❌ Razorpay test failed:', error.message);
    
    if (error.statusCode === 401) {
      console.log('\n💡 Troubleshooting:');
      console.log('- Check if your Key ID and Key Secret are correct');
      console.log('- Make sure you\'re using test keys (starting with rzp_test_)');
      console.log('- Verify keys are copied correctly without extra spaces');
    }
  }
}

// Run the test
testRazorpayConnection()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
