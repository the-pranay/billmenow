// Debug the exact payment API call that's failing
async function debugPaymentAPICall() {
  try {
    console.log('🔍 Debugging Payment API Call...');
    
    const invoiceId = '6847f01b66e984b6c488677a';
    
    // First verify the invoice exists via public API
    console.log('1️⃣ Testing public invoice API...');
    const publicResponse = await fetch(`https://billmenow.vercel.app/api/invoices/public/${invoiceId}`);
    console.log('Public API Status:', publicResponse.status);
    
    if (publicResponse.ok) {
      const publicData = await publicResponse.json();
      console.log('Public API Success:', publicData.success);
      console.log('Invoice Status:', publicData.invoice.status);
      console.log('Payment Status:', publicData.invoice.paymentStatus);
      console.log('Total Amount:', publicData.invoice.total);
      
      // Now test the payment API with the exact same invoice
      console.log('\n2️⃣ Testing payment API...');
      
      const paymentData = {
        amount: publicData.invoice.total,
        currency: 'INR',
        invoiceId: invoiceId,
        clientInfo: {
          name: publicData.invoice.client?.name,
          email: publicData.invoice.client?.email
        }
      };
      
      console.log('Payment Request Data:', paymentData);
      
      const timestamp = Date.now();
      const paymentResponse = await fetch(`https://billmenow.vercel.app/api/payment/create-order?debug=${timestamp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });
      
      console.log('Payment API Status:', paymentResponse.status);
      console.log('Payment API OK:', paymentResponse.ok);
      
      const paymentResult = await paymentResponse.text();
      console.log('Payment API Response:', paymentResult);
      
      try {
        const paymentJson = JSON.parse(paymentResult);
        console.log('Payment API JSON:', paymentJson);
        
        if (paymentJson.error) {
          console.log('❌ Payment API Error:', paymentJson.error);
        }
      } catch (e) {
        console.log('Response is not JSON');
      }
      
    } else {
      console.log('❌ Public API failed');
      const publicError = await publicResponse.text();
      console.log('Public API Error:', publicError);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugPaymentAPICall();
