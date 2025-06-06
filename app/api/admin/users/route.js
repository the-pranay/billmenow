// filepath: d:\billmenow\app\api\admin\users\route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';
import Invoice from '../../../lib/models/Invoice.js';
import Payment from '../../../lib/models/Payment.js';
import { withAuth, withAdmin } from '../../../lib/middleware.js';

// GET - Fetch all users (admin only)
export async function GET(request) {
  return withAuth(async (request, user) => {
    return withAdmin(async (request, adminUser) => {
      try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'all';
        const plan = searchParams.get('plan') || 'all';

        // Build query
        const query = {};
        
        if (search) {
          query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { businessName: { $regex: search, $options: 'i' } }
          ];
        }

        if (status === 'active') {
          query.isEmailVerified = true;
        } else if (status === 'inactive') {
          query.isEmailVerified = false;
        }

        if (plan !== 'all') {
          query['subscription.plan'] = plan;
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const users = await User.find(query)
          .select('-password -resetPasswordToken -resetPasswordExpires')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);

        // Get additional statistics for each user
        const usersWithStats = await Promise.all(
          users.map(async (user) => {
            const invoiceStats = await Invoice.aggregate([
              { $match: { userId: user._id } },
              {
                $group: {
                  _id: null,
                  totalInvoices: { $sum: 1 },
                  totalRevenue: {
                    $sum: {
                      $cond: [{ $eq: ['$status', 'paid'] }, '$total', 0]
                    }
                  },
                  pendingAmount: {
                    $sum: {
                      $cond: [{ $eq: ['$status', 'pending'] }, '$total', 0]
                    }
                  }
                }
              }
            ]);

            const stats = invoiceStats[0] || {
              totalInvoices: 0,
              totalRevenue: 0,
              pendingAmount: 0
            };

            return {
              ...user,
              stats
            };
          })
        );

        return NextResponse.json({
          success: true,
          users: usersWithStats,
          pagination: {
            currentPage: page,
            totalPages,
            totalUsers,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        });

      } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch users' },
          { status: 500 }
        );
      }
    })(request, user);
  })(request);
}