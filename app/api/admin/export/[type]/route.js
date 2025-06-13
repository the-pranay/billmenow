import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/database.js';
import User from '../../../../lib/models/User.js';
import Invoice from '../../../../lib/models/Invoice.js';
import Payment from '../../../../lib/models/Payment.js';
import { withAuth, withAdmin } from '../../../../lib/middleware.js';

// GET - Export data as CSV (admin only)
export async function GET(request, { params }) {
  try {
    // Check authentication and admin privileges
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

    const { type } = params;

    if (type === 'users') {
      return await exportUsers();
    } else if (type === 'invoices') {
      return await exportInvoices();
    } else if (type === 'payments') {
      return await exportPayments();
    } else {
      return NextResponse.json(
        { error: 'Invalid export type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

async function exportUsers() {
  const users = await User.find({})
    .select('-password -resetPasswordToken -resetPasswordExpires')
    .sort({ createdAt: -1 })
    .lean();

  const csvHeaders = [
    'ID',
    'First Name',
    'Last Name',
    'Email',
    'Business Name',
    'Business Type',
    'Phone',
    'Role',
    'Email Verified',
    'Subscription Plan',
    'Subscription Status',
    'Created At',
    'Last Login'
  ];

  const csvRows = users.map(user => [
    user._id.toString(),
    user.firstName || '',
    user.lastName || '',
    user.email || '',
    user.businessName || '',
    user.businessType || '',
    user.phone || '',
    user.role || 'user',
    user.isEmailVerified ? 'Yes' : 'No',
    user.subscription?.plan || 'free',
    user.subscription?.status || 'inactive',
    user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
    user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : ''
  ]);

  const csvContent = [csvHeaders, ...csvRows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return NextResponse.json({
    success: true,
    csvData: csvContent
  });
}

async function exportInvoices() {
  const invoices = await Invoice.find({})
    .populate('userId', 'firstName lastName email businessName')
    .populate('clientId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const csvHeaders = [
    'Invoice ID',
    'Invoice Number',
    'User Name',
    'User Email',
    'Client Name',
    'Client Email',
    'Amount',
    'Tax',
    'Total',
    'Status',
    'Due Date',
    'Created At',
    'Paid At'
  ];

  const csvRows = invoices.map(invoice => [
    invoice._id.toString(),
    invoice.invoiceNumber || '',
    invoice.userId ? `${invoice.userId.firstName || ''} ${invoice.userId.lastName || ''}`.trim() : '',
    invoice.userId?.email || '',
    invoice.clientId?.name || '',
    invoice.clientId?.email || '',
    invoice.subtotal || 0,
    invoice.tax || 0,
    invoice.total || 0,
    invoice.status || '',
    invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
    invoice.createdAt ? new Date(invoice.createdAt).toISOString().split('T')[0] : '',
    invoice.paidAt ? new Date(invoice.paidAt).toISOString().split('T')[0] : ''
  ]);

  const csvContent = [csvHeaders, ...csvRows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return NextResponse.json({
    success: true,
    csvData: csvContent
  });
}

async function exportPayments() {
  const payments = await Payment.find({})
    .populate('userId', 'firstName lastName email businessName')
    .populate('invoiceId', 'invoiceNumber total')
    .sort({ createdAt: -1 })
    .lean();

  const csvHeaders = [
    'Payment ID',
    'Transaction ID',
    'User Name',
    'User Email',
    'Invoice Number',
    'Amount',
    'Currency',
    'Status',
    'Payment Method',
    'Gateway',
    'Transaction Fee',
    'Created At',
    'Updated At'
  ];

  const csvRows = payments.map(payment => [
    payment._id.toString(),
    payment.transactionId || '',
    payment.userId ? `${payment.userId.firstName || ''} ${payment.userId.lastName || ''}`.trim() : '',
    payment.userId?.email || '',
    payment.invoiceId?.invoiceNumber || '',
    payment.amount || 0,
    payment.currency || 'INR',
    payment.status || '',
    payment.paymentMethod || '',
    payment.gateway || '',
    payment.transactionFee || 0,
    payment.createdAt ? new Date(payment.createdAt).toISOString().split('T')[0] : '',
    payment.updatedAt ? new Date(payment.updatedAt).toISOString().split('T')[0] : ''
  ]);

  const csvContent = [csvHeaders, ...csvRows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return NextResponse.json({
    success: true,
    csvData: csvContent
  });
}
