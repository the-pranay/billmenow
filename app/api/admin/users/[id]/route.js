import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/database.js';
import User from '../../../../lib/models/User.js';
import Invoice from '../../../../lib/models/Invoice.js';
import Payment from '../../../../lib/models/Payment.js';
import Client from '../../../../lib/models/Client.js';
import { withAuth, withAdmin } from '../../../../lib/middleware.js';

// GET - Fetch a specific user (admin only)
export async function GET(request, { params }) {
  return withAuth(async () => {
    return withAdmin(async () => {
      try {
        await connectToDatabase();

        const { id } = params;

        const targetUser = await User.findById(id)
          .select('-password -resetPasswordToken -resetPasswordExpires')
          .lean();

        if (!targetUser) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Get comprehensive user statistics
        const invoiceStats = await Invoice.aggregate([
          { $match: { userId: targetUser._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$total' }
            }
          }
        ]);

        const paymentStats = await Payment.aggregate([
          { $match: { userId: targetUser._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$amount' },
              totalFees: { $sum: '$transactionFee' }
            }
          }
        ]);

        const clientCount = await Client.countDocuments({ userId: targetUser._id });

        // Recent activity
        const recentInvoices = await Invoice.find({ userId: targetUser._id })
          .populate('clientId', 'name company')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        const recentPayments = await Payment.find({ userId: targetUser._id })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        // Format statistics
        const formattedInvoiceStats = {};
        invoiceStats.forEach(stat => {
          formattedInvoiceStats[stat._id] = {
            count: stat.count,
            totalAmount: stat.totalAmount
          };
        });

        const formattedPaymentStats = {};
        paymentStats.forEach(stat => {
          formattedPaymentStats[stat._id] = {
            count: stat.count,
            totalAmount: stat.totalAmount,
            totalFees: stat.totalFees
          };
        });

        return NextResponse.json({
          success: true,
          user: {
            ...targetUser,
            stats: {
              invoices: formattedInvoiceStats,
              payments: formattedPaymentStats,
              clients: clientCount
            },
            recentActivity: {
              invoices: recentInvoices,
              payments: recentPayments
            }
          }
        });

      } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch user' },
          { status: 500 }
        );
      }
    })(request, user);
  })(request);
}

// PUT - Update user (admin only)
export async function PUT(request, { params }) {
  return withAuth(async () => {
    return withAdmin(async () => {
      try {
        await connectToDatabase();

        const { id } = params;
        const updateData = await request.json();

        const targetUser = await User.findById(id);
        if (!targetUser) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        const {
          firstName,
          lastName,
          businessName,
          businessType,
          phone,
          country,
          isEmailVerified,
          subscription,
          status
        } = updateData;

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
          id,
          {
            firstName,
            lastName,
            businessName,
            businessType,
            phone,
            country,
            isEmailVerified,
            subscription: {
              ...targetUser.subscription,
              ...subscription
            },
            status,
            updatedAt: new Date()
          },
          { new: true, runValidators: true }
        ).select('-password -resetPasswordToken -resetPasswordExpires');

        return NextResponse.json({
          success: true,
          message: 'User updated successfully',
          user: updatedUser
        });

      } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }
    })(request, user);
  })(request);
}

// DELETE - Delete user (admin only)
export async function DELETE(request, { params }) {
  return withAuth(async () => {
    return withAdmin(async () => {
      try {
        await connectToDatabase();

        const { id } = params;

        const targetUser = await User.findById(id);
        if (!targetUser) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Check if user has data that prevents deletion
        const invoiceCount = await Invoice.countDocuments({ userId: id });
        const paymentCount = await Payment.countDocuments({ userId: id });

        if (invoiceCount > 0 || paymentCount > 0) {
          return NextResponse.json(
            { error: 'Cannot delete user with existing invoices or payments. Please archive the user instead.' },
            { status: 400 }
          );
        }

        // Delete related clients
        await Client.deleteMany({ userId: id });

        // Delete user
        await User.findByIdAndDelete(id);

        return NextResponse.json({
          success: true,
          message: 'User deleted successfully'
        });

      } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
          { error: 'Failed to delete user' },
          { status: 500 }
        );
      }
    })(request, user);
  })(request);
}