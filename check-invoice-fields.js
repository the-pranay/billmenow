import fetch from 'node-fetch';

const invoiceId = '6846e4f1901f3b2bfebbe081';

try {
  const response = await fetch(`http://localhost:3000/api/invoices/public/${invoiceId}`);
  const data = await response.json();

  if (data.success) {
    const invoice = data.invoice;
    console.log('🔍 Invoice Field Analysis:');
    console.log(`Date field: ${invoice.date || 'MISSING'}`);
    console.log(`Tax field: ${invoice.tax || 'MISSING'}`);
    console.log(`TaxRate field: ${invoice.taxRate || 'MISSING'}`);
    console.log(`Subtotal: ${invoice.subtotal}`);
    console.log(`Total: ${invoice.total}`);
    
    // Calculate missing tax info if needed
    if (!invoice.tax && !invoice.taxRate && invoice.total > invoice.subtotal) {
      const taxAmount = invoice.total - invoice.subtotal;
      const taxRate = (taxAmount / invoice.subtotal * 100).toFixed(2);
      console.log(`\n📊 Calculated from data:`);
      console.log(`Tax amount: ${taxAmount}`);
      console.log(`Tax rate: ${taxRate}%`);
    }
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
