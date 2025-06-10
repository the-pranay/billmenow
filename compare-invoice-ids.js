// Compare working vs failing invoice IDs
async function compareInvoiceIDs() {
  try {
    console.log('🔍 Comparing invoice IDs...');
    
    // ID from our successful tests
    const workingId = '68473949eaacdb6a3d1c7e9c';
    
    // ID from the error logs
    const failingId = '6847f01b66e984b6c488677a';
    
    console.log('Working ID:', workingId, 'Length:', workingId.length);
    console.log('Failing ID:', failingId, 'Length:', failingId.length);
    
    // Test both IDs with the API
    for (const [name, id] of [['Working', workingId], ['Failing', failingId]]) {
      console.log(`\n🧪 Testing ${name} ID: ${id}`);
      
      try {
        const testData = {
          amount: 1.01,
          currency: 'INR',
          invoiceId: id,
          clientInfo: {
            name: 'Test User',
            email: 'test@example.com'
          }
        };

        const response = await fetch('https://billmenow.vercel.app/api/payment/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData)
        });

        console.log(`${name} ID - Status:`, response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`${name} ID - Success:`, data.success);
          console.log(`${name} ID - Order ID:`, data.order?.id);
        } else {
          const errorData = await response.json();
          console.log(`${name} ID - Error:`, errorData.error);
        }
        
      } catch (error) {
        console.log(`${name} ID - Exception:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Comparison failed:', error.message);
  }
}

compareInvoiceIDs();
