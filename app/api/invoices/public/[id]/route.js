import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/database.js';
import Invoice from '../../../../lib/models/Invoice.js';
import Payment from '../../../../lib/models/Payment.js';

// GET - Fetch a specific invoice for public access (no authentication required)
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    // Find the invoice without user restriction for public sharing
    const invoice = await Invoice.findById(id)
      .populate('clientId', 'name email company address taxId')
      .lean();

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Get payment history for this invoice
    const payments = await Payment.find({
      invoiceId: id
    }).sort({ createdAt: -1 }).lean();

    // Calculate payment status
    const totalPaid = payments
      .filter(payment => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const paymentStatus = totalPaid >= invoice.total ? 'paid' : 
                         totalPaid > 0 ? 'partial' : 'unpaid';

    // Prepare response with only necessary fields for public view
    const publicInvoice = {
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date,
      dueDate: invoice.dueDate,
      status: invoice.status,
      paymentStatus,
      client: invoice.clientId,
      items: invoice.items || invoice.lineItems, // Handle both field names
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      taxRate: invoice.taxRate,
      total: invoice.total,      notes: invoice.notes,
      terms: invoice.terms,
      totalPaid,
      remainingBalance: invoice.total - totalPaid,
      payments: payments.map(payment => ({
        _id: payment._id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.method, // Use 'method' field from Payment model
        transactionId: payment.transactionId,
        createdAt: payment.createdAt
      })),
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt
    };

    return NextResponse.json({
      success: true,
      invoice: publicInvoice
    });

  } catch (error) {
    console.error('Get public invoice error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid invoice ID format' },
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}
