import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/database.js';
import Invoice from '../../lib/models/Invoice.js';
import Client from '../../lib/models/Client.js';
import Payment from '../../lib/models/Payment.js';
import { withAuth } from '../../lib/middleware.js';

export async function GET(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { searchParams } = new URL(request.url);
      const period = searchParams.get('period') || '30'; // days

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Get invoice statistics
      const invoiceStats = await Invoice.aggregate([
        {
          $match: {
            userId: user.id,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' }
          }
        }
      ]);

      // Get overall statistics
      const overallStats = await Invoice.aggregate([
        {
          $match: { userId: user.id }
        },
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            pendingAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'pending'] },
                  '$total',
                  0
                ]
              }
            },
            paidAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'paid'] },
                  '$total',
                  0
                ]
              }
            },
            overdueAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'overdue'] },
                  '$total',
                  0
                ]
              }
            }
          }
        }
      ]);

      // Get recent invoices
      const recentInvoices = await Invoice.find({ userId: user.id })
        .populate('clientId', 'name company')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      // Get client count
      const clientCount = await Client.countDocuments({ userId: user.id, status: 'active' });

      // Get monthly revenue trend (last 6 months)
      const monthlyRevenue = await Invoice.aggregate([
        {
          $match: {
            userId: user.id,
            status: 'paid',
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$total' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      // Get top clients by revenue
      const topClients = await Invoice.aggregate([
        {
          $match: {
            userId: user.id,
            status: 'paid'
          }
        },
        {
          $group: {
            _id: '$clientId',
            totalRevenue: { $sum: '$total' },
            invoiceCount: { $sum: 1 }
          }
        },
        {
          $sort: { totalRevenue: -1 }
        },
        {
          $limit: 5
        },
        {
          $lookup: {
            from: 'clients',
            localField: '_id',
            foreignField: '_id',
            as: 'client'
          }
        },
        {
          $unwind: '$client'
        },
        {
          $project: {
            _id: 1,
            totalRevenue: 1,
            invoiceCount: 1,
            name: '$client.name',
            company: '$client.company',
            email: '$client.email'
          }
        }
      ]);

      // Format invoice statistics
      const formattedInvoiceStats = {
        pending: { count: 0, amount: 0 },
        paid: { count: 0, amount: 0 },
        overdue: { count: 0, amount: 0 },
        cancelled: { count: 0, amount: 0 }
      };

      invoiceStats.forEach(stat => {
        if (formattedInvoiceStats[stat._id]) {
          formattedInvoiceStats[stat._id] = {
            count: stat.count,
            amount: stat.totalAmount
          };
        }
      });

      const overall = overallStats[0] || {
        totalInvoices: 0,
        totalRevenue: 0,
        pendingAmount: 0,
        paidAmount: 0,
        overdueAmount: 0
      };

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalInvoices: overall.totalInvoices,
            totalRevenue: overall.totalRevenue,
            pendingAmount: overall.pendingAmount,
            paidAmount: overall.paidAmount,
            overdueAmount: overall.overdueAmount,
            clientCount
          },
          periodStats: formattedInvoiceStats,
          recentInvoices,
          monthlyRevenue,
          topClients
        }
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dashboard data' },
        { status: 500 }
      );
    }
  })(request);
}
