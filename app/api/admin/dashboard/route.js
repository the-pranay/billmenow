import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';
import Invoice from '../../../lib/models/Invoice.js';
import Payment from '../../../lib/models/Payment.js';
import Client from '../../../lib/models/Client.js';
import { withAuth, withAdmin } from '../../../lib/middleware.js';

export async function GET(request) {
  return withAuth(async (request, user) => {
    return withAdmin(async (request, adminUser) => {
      try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30'; // days

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        // Get user statistics
        const userStats = await User.aggregate([
          {
            $group: {
              _id: null,
              totalUsers: { $sum: 1 },
              activeUsers: {
                $sum: {
                  $cond: [
                    { $gte: ['$lastLogin', startDate] },
                    1,
                    0
                  ]
                }
              },
              newUsers: {
                $sum: {
                  $cond: [
                    { $gte: ['$createdAt', startDate] },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]);

        // Get subscription statistics
        const subscriptionStats = await User.aggregate([
          {
            $group: {
              _id: '$subscription.plan',
              count: { $sum: 1 }
            }
          }
        ]);

        // Get revenue statistics
        const revenueStats = await Payment.aggregate([
          {
            $match: {
              status: 'completed',
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$amount' },
              totalTransactionFees: { $sum: '$transactionFee' },
              netRevenue: { $sum: '$netAmount' },
              paymentCount: { $sum: 1 }
            }
          }
        ]);

        // Get invoice statistics
        const invoiceStats = await Invoice.aggregate([
          {
            $match: {
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

        // Get top users by revenue
        const topUsers = await User.aggregate([
          {
            $lookup: {
              from: 'payments',
              localField: '_id',
              foreignField: 'userId',
              as: 'payments'
            }
          },
          {
            $project: {
              firstName: 1,
              lastName: 1,
              email: 1,
              businessName: 1,
              subscription: 1,
              totalRevenue: {
                $sum: {
                  $map: {
                    input: {
                      $filter: {
                        input: '$payments',
                        cond: { $eq: ['$$this.status', 'completed'] }
                      }
                    },
                    as: 'payment',
                    in: '$$payment.amount'
                  }
                }
              }
            }
          },
          { $sort: { totalRevenue: -1 } },
          { $limit: 10 }
        ]);

        // Get recent activity
        const recentActivity = await Invoice.aggregate([
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              _id: 1,
              invoiceNumber: 1,
              total: 1,
              status: 1,
              createdAt: 1,
              userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
              userEmail: '$user.email'
            }
          },
          { $sort: { createdAt: -1 } },
          { $limit: 20 }
        ]);

        // Get monthly growth data (last 12 months)
        const monthlyGrowth = await User.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
              }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              newUsers: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format statistics
        const formattedUserStats = userStats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          newUsers: 0
        };

        const formattedRevenueStats = revenueStats[0] || {
          totalRevenue: 0,
          totalTransactionFees: 0,
          netRevenue: 0,
          paymentCount: 0
        };

        const formattedInvoiceStats = {};
        invoiceStats.forEach(stat => {
          formattedInvoiceStats[stat._id] = {
            count: stat.count,
            totalAmount: stat.totalAmount
          };
        });

        const formattedSubscriptionStats = {};
        subscriptionStats.forEach(stat => {
          formattedSubscriptionStats[stat._id] = stat.count;
        });

        return NextResponse.json({
          success: true,
          data: {
            users: formattedUserStats,
            revenue: formattedRevenueStats,
            invoices: formattedInvoiceStats,
            subscriptions: formattedSubscriptionStats,
            topUsers,
            recentActivity,
            monthlyGrowth
          }
        });

      } catch (error) {
        console.error('Admin dashboard error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch admin dashboard data' },
          { status: 500 }
        );
      }
    })(request, user);
  })(request);
}