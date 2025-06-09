import fetch from 'node-fetch';
import fs from 'fs';

const invoiceId = '6846e4f1901f3b2bfebbe081';
const url = `http://localhost:3001/payment/${invoiceId}`;

console.log('🔍 Testing payment page with debug logs...');

try {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  console.log(`📡 Payment page status: ${response.status}`);
  const html = await response.text();
  
  // Check for specific patterns
  const patterns = {
    'Loading State': /Loading invoice\.\.\./i,
    'Debug Invoice ID': /Debug: invoiceId = /i,
    'React Hydration': /Hydration failed/i,
    'Console Debug': /console\.log/i,
    'Payment Form': /PaymentGateway/i,
    'Error State': /Invoice Not Found/i,
    'Next.js Error': /__NEXT_DATA__/i
  };

  console.log('\n📊 Page Content Analysis:');
  for (const [name, pattern] of Object.entries(patterns)) {
    const found = pattern.test(html);
    console.log(`   ${found ? '✅' : '❌'} ${name}: ${found ? 'Found' : 'Not found'}`);
  }

  // Save the response for detailed analysis
  fs.writeFileSync('payment-page-debug.html', html);
  console.log('\n💾 Full page saved to payment-page-debug.html');

  // Check if the page contains our debug logs
  if (html.includes('console.log')) {
    console.log('\n🎯 Debug logs are present in the HTML');
  } else {
    console.log('\n❌ Debug logs not found in HTML');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
}
