import mongoose from 'mongoose';
import User from '../app/lib/models/User.js';
import Invoice from '../app/lib/models/Invoice.js';
import Payment from '../app/lib/models/Payment.js';
import Client from '../app/lib/models/Client.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Admin:aB9OFzt6p1XhW45S@billmenow.wcieo80.mongodb.net/billmenow';

async function verifyData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!');

    // Get all counts
    const userCount = await User.countDocuments();
    const clientCount = await Client.countDocuments();
    const invoiceCount = await Invoice.countDocuments();
    const paymentCount = await Payment.countDocuments();

    console.log('\n📊 DATABASE COUNTS:');
    console.log(`👥 Total Users: ${userCount}`);
    console.log(`🏢 Total Clients: ${clientCount}`);
    console.log(`📄 Total Invoices: ${invoiceCount}`);
    console.log(`💳 Total Payments: ${paymentCount}`);

    // Get admin users
    const adminUsers = await User.find({ role: 'admin' }).select('firstName lastName email');
    console.log('\n🛡️  ADMIN USERS:');
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.firstName} ${admin.lastName} (${admin.email})`);
    });

    // Get user stats for dashboard
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    const activeUsers = await User.countDocuments({ isEmailVerified: true });

    console.log('\n📈 USER STATS:');
    console.log(`   Total: ${totalUsers}`);
    console.log(`   New (30 days): ${newUsers}`);
    console.log(`   Active: ${activeUsers}`);

    // Get invoice stats
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
    const pendingInvoices = await Invoice.countDocuments({ 
      status: { $in: ['sent', 'viewed'] } 
    });

    console.log('\n📄 INVOICE STATS:');
    console.log(`   Total: ${totalInvoices}`);
    console.log(`   Paid: ${paidInvoices}`);
    console.log(`   Pending: ${pendingInvoices}`);

    // Get payment stats
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const pendingPayments = await Payment.countDocuments({ 
      status: { $in: ['pending', 'processing', 'authorized'] } 
    });

    // Get total revenue
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    console.log('\n💳 PAYMENT STATS:');
    console.log(`   Total: ${totalPayments}`);
    console.log(`   Completed: ${completedPayments}`);
    console.log(`   Pending: ${pendingPayments}`);
    console.log(`   Total Revenue: ₹${totalRevenue.toLocaleString()}`);

    // Sample data
    console.log('\n🔍 SAMPLE DATA:');
    
    const sampleUsers = await User.find().limit(3).select('firstName lastName email isEmailVerified role businessName');
    console.log('\n👥 Sample Users:');
    sampleUsers.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - ${user.isEmailVerified ? 'Verified' : 'Not Verified'}`);
    });

    const sampleInvoices = await Invoice.find().limit(3).select('invoiceNumber status total').populate('userId', 'firstName lastName');
    console.log('\n📄 Sample Invoices:');
    sampleInvoices.forEach((invoice, i) => {
      console.log(`   ${i + 1}. ${invoice.invoiceNumber || 'N/A'} - ₹${invoice.total} - ${invoice.status} - User: ${invoice.userId?.firstName} ${invoice.userId?.lastName}`);
    });

    const samplePayments = await Payment.find().limit(3).select('transactionId status amount method').populate('userId', 'firstName lastName');
    console.log('\n💳 Sample Payments:');
    samplePayments.forEach((payment, i) => {
      console.log(`   ${i + 1}. ${payment.transactionId || 'N/A'} - ₹${payment.amount} - ${payment.status} - ${payment.method} - User: ${payment.userId?.firstName} ${payment.userId?.lastName}`);
    });

    if (totalUsers === 0 && totalInvoices === 0 && totalPayments === 0) {
      console.log('\n❌ NO DATA FOUND! The database appears to be empty.');
      console.log('   Run the seeding script: node scripts/seed-test-data.js');
    } else {
      console.log('\n✅ DATABASE HAS DATA! Admin dashboard should display these numbers.');
    }

  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the verification
verifyData();
