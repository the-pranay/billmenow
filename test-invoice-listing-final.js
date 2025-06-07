// Test invoice listing functionality
const testInvoiceAPI = async () => {
  try {
    console.log('Testing invoice API at localhost:3003...');
    
    const response = await fetch('http://localhost:3003/api/invoices');
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response Structure:');
      console.log('- success:', data.success);
      console.log('- invoices count:', data.invoices?.length || 0);
      console.log('- summary:', data.summary);
      console.log('- pagination:', data.pagination);
      
      if (data.invoices && data.invoices.length > 0) {
        console.log('\nFirst invoice structure:');
        const firstInvoice = data.invoices[0];
        console.log('- _id:', firstInvoice._id);
        console.log('- invoiceNumber:', firstInvoice.invoiceNumber);
        console.log('- clientId structure:', firstInvoice.clientId);
        console.log('- client structure:', firstInvoice.client);
        console.log('- status:', firstInvoice.status);
        console.log('- total:', firstInvoice.total);
        console.log('- createdAt:', firstInvoice.createdAt);
      } else {
        console.log('\nNo invoices found in response');
      }
    } else {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testInvoiceAPI();
