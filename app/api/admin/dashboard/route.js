import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';
import Invoice from '../../../lib/models/Invoice.js';
import Payment from '../../../lib/models/Payment.js';
import { withAuth } from '../../../lib/middleware.js';

export async function GET(request) {
  try {
    // Check authentication
    const authResult = await withAuth(async (req, user) => {
      if (user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
      return user;
    })(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });
    const activeUsers = await User.countDocuments({
      isEmailVerified: true
    });

    // Get invoice statistics
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
    const pendingInvoices = await Invoice.countDocuments({ 
      status: { $in: ['sent', 'viewed'] } 
    });    // Get payment statistics
    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({ status: 'completed' });
    const pendingPayments = await Payment.countDocuments({ status: { $in: ['pending', 'processing', 'authorized'] } });

    // Get total revenue
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt')
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        userStats: {
          totalUsers,
          newUsers,
          activeUsers
        },
        invoiceStats: {
          totalInvoices,
          paidInvoices,
          pendingInvoices
        },
        paymentStats: {
          totalPayments,
          successfulPayments,
          pendingPayments,
          totalRevenue
        },
        recentUsers
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin dashboard data' },
      { status: 500 }
    );
  }
}