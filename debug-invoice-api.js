import fetch from 'node-fetch';

const invoiceId = '6846e4f1901f3b2bfebbe081';

console.log('🔍 Debugging Invoice API...');
console.log(`Invoice ID: ${invoiceId}`);

try {
  const response = await fetch(`http://localhost:3001/api/invoices/public/${invoiceId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  console.log(`\n📡 Response Status: ${response.status}`);
  console.log(`Response Headers:`, response.headers.raw());

  const responseText = await response.text();
  console.log(`\n📋 Raw Response:`, responseText);

  try {
    const responseJson = JSON.parse(responseText);
    console.log(`\n📊 Parsed JSON:`, JSON.stringify(responseJson, null, 2));
  } catch (parseError) {
    console.log(`\n❌ Failed to parse as JSON:`, parseError.message);
  }

} catch (error) {
  console.error('❌ Request failed:', error.message);
}
