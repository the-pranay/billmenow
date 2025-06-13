import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import Payment from '../../../lib/models/Payment.js';
import { withAuth } from '../../../lib/middleware.js';

// GET - Get all payments (for admin) or user's payments
export async function GET(request) {
  try {
    // Check authentication
    const authResult = await withAuth(async (req, user) => {
      return user;
    })(request);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult;
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const isAdmin = user.role === 'admin';
      // Build query based on user role - admin sees all, users see only their own
    const query = user.role === 'admin' ? {} : { userId: user._id };
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    if (status && status !== 'all') {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('userId', 'firstName lastName email businessName')
      .populate('invoiceId', 'invoiceNumber total')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPayments = await Payment.countDocuments(query);
    const totalPages = Math.ceil(totalPayments / limit);

    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalPayments,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}
