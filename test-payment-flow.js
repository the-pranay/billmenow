import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testPaymentFlow() {
  console.log('🧪 Testing Payment Flow Issue...\n');
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Find a sample invoice
    const invoice = await db.collection('invoices').findOne({});
    if (!invoice) {
      console.log('❌ No invoices found in database');
      return;
    }
    
    console.log('📋 Found Sample Invoice:');
    console.log(`   ID: ${invoice._id}`);
    console.log(`   Number: ${invoice.invoiceNumber}`);
    console.log(`   Total: ₹${invoice.total}`);
    
    // Test payment link generation
    const baseUrl = 'http://localhost:3000';
    const paymentLink = `${baseUrl}/payment/${invoice._id}`;
    
    console.log('\n🔗 Generated Payment Link:');
    console.log(`   ${paymentLink}`);
    
    // Test email template data
    const templateData = {
      clientName: 'Test Client',
      invoiceNumber: invoice.invoiceNumber,
      amount: `₹${invoice.total.toLocaleString('en-IN')}`,
      dueDate: new Date(invoice.dueDate).toLocaleDateString('en-IN'),
      description: 'Test Invoice',
      paymentLink: paymentLink,
      senderName: 'Test Sender',
      businessName: 'Test Business',
      contactDetails: 'test@example.com'
    };
    
    console.log('\n📧 Email Template Data:');
    console.log(JSON.stringify(templateData, null, 2));
    
    // Test placeholder replacement (same logic as in API)
    const testTemplate = 'Pay now: {paymentLink} for invoice {invoiceNumber}';
    let processedTemplate = testTemplate;
    
    Object.entries(templateData).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      processedTemplate = processedTemplate.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    
    console.log('\n🔄 Template Processing Test:');
    console.log(`   Original: ${testTemplate}`);
    console.log(`   Processed: ${processedTemplate}`);
    
    // Test API call
    console.log('\n🌐 Testing Email API...');
    const emailData = {
      to: 'test@example.com',
      subject: 'invoice',
      template: 'invoice',
      templateData: templateData,
      invoiceId: invoice._id.toString()
    };
    
    // Simulate API call (without actually sending)
    console.log('   Email API payload ready ✓');
    console.log('   Payment link in payload:', templateData.paymentLink);
    
    console.log('\n🎯 Test Payment Link Access:');
    console.log(`   Try accessing: ${paymentLink}`);
    console.log('   Should show: Invoice payment page with Razorpay integration');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.close();
  }
}

testPaymentFlow();
