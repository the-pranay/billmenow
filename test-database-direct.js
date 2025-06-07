import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Connect to MongoDB to check invoices directly
const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/billmenow');
  }
};

const testInvoicesInDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    
    // Import models
    const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({}, { strict: false }));
    const Client = mongoose.models.Client || mongoose.model('Client', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    console.log('Checking database collections...');
    
    // Check if there are any users
    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find().limit(2);        console.log('Sample users:');
        users.forEach((user, index) => {
          console.log(`User ${index + 1}:`, {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            businessName: user.businessName
          });
        });
      
      if (users.length > 0) {
        const userId = users[0]._id;
        
        // Check invoices for this user
        const invoiceCount = await Invoice.countDocuments({ userId });
        console.log(`Total invoices for user ${userId}: ${invoiceCount}`);
        
        if (invoiceCount > 0) {
          const invoices = await Invoice.find({ userId })
            .populate('clientId', 'name email company')
            .limit(3);
            
          console.log('Sample invoices:');
          invoices.forEach((invoice, index) => {
            console.log(`Invoice ${index + 1}:`, {
              _id: invoice._id,
              invoiceNumber: invoice.invoiceNumber,
              clientId: invoice.clientId,
              status: invoice.status,
              total: invoice.total,
              createdAt: invoice.createdAt
            });
          });
        } else {
          console.log('No invoices found for this user. Let me check if there are any invoices at all...');
          const totalInvoices = await Invoice.countDocuments();
          console.log(`Total invoices in database: ${totalInvoices}`);
          
          if (totalInvoices > 0) {
            const anyInvoices = await Invoice.find().limit(2);
            console.log('Sample invoices from any user:', anyInvoices.map(i => ({
              _id: i._id,
              userId: i.userId,
              invoiceNumber: i.invoiceNumber,
              status: i.status
            })));
          }
        }
      }
    } else {
      console.log('No users found in database');
    }
    
    // Check clients
    const clientCount = await Client.countDocuments();
    console.log(`Total clients in database: ${clientCount}`);
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Database test failed:', error);
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.close();
    }
  }
};

testInvoicesInDatabase();
