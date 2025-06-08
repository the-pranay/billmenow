import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Payment from '../../../../lib/models/Payment';
import Invoice from '../../../../lib/models/Invoice';
import { authenticateUser } from '../../../../lib/auth';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { paymentId } = params;

    if (!paymentId) {
      return NextResponse.json({
        success: false,
        error: 'Payment ID is required'
      }, { status: 400 });
    }

    // Check authentication - handle both authenticated and public payments
    let userId = null;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader) {
      try {
        const decoded = authenticateUser(authHeader);
        userId = decoded.userId;
      } catch (error) {
        // For public payments, continue without user authentication
        console.log('Public payment status check (no auth):', error.message);
      }
    }

    // Find payment
    let payment = null;
    if (userId) {
      payment = await Payment.findOne({ 
        _id: paymentId, 
        freelancerId: userId 
      });
    } else {
      // For public payments, find payment by ID only
      payment = await Payment.findById(paymentId);
    }

    if (!payment) {
      return NextResponse.json({
        success: false,
        error: 'Payment not found'
      }, { status: 404 });
    }

    // For UPI payments, we might need to implement actual status checking
    // with your payment gateway. For now, we'll return the current status.
    
    // In a real implementation, you would:
    // 1. Check with your payment gateway (Razorpay, etc.) for UPI payment status
    // 2. Update the payment status in database if changed
    // 3. Update invoice status if payment is completed

    if (payment.status === 'completed') {
      // Also update invoice status
      await Invoice.findByIdAndUpdate(payment.invoiceId, {
        status: 'paid',
        paidAt: payment.updatedAt
      });
    }

    return NextResponse.json({
      success: true,
      status: payment.status,
      transactionId: payment.transactionId,
      amount: payment.amount,
      method: payment.method,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
