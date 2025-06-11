import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/database';
import Invoice from '../../lib/models/Invoice';
import Payment from '../../lib/models/Payment';
import User from '../../lib/models/User';

export async function GET() {
  try {
    await connectToDatabase();

    // Get total invoices count
    const totalInvoices = await Invoice.countDocuments();

    // Get total payment amount processed
    const paymentStats = await Payment.aggregate([
      {
        $match: {
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalPayments: { $sum: 1 }
        }
      }
    ]);

    // Get total users count
    const totalUsers = await User.countDocuments();

    // Calculate uptime (you can replace this with actual monitoring data)
    const uptime = 99.9; // This should come from your monitoring service

    const stats = {
      invoicesCreated: totalInvoices,
      paymentsProcessed: paymentStats.length > 0 ? paymentStats[0].totalAmount : 0,
      totalPaymentCount: paymentStats.length > 0 ? paymentStats[0].totalPayments : 0,
      happyFreelancers: totalUsers,
      uptime: uptime
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics',
        // Return fallback stats if database fails
        stats: {
          invoicesCreated: 0,
          paymentsProcessed: 0,
          totalPaymentCount: 0,
          happyFreelancers: 0,
          uptime: 99.9
        }
      },
      { status: 500 }
    );
  }
}
