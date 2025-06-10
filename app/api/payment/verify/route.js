import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '../../../lib/database.js';
import Invoice from '../../../lib/models/Invoice.js';
import Payment from '../../../lib/models/Payment.js';
import jwt from 'jsonwebtoken';

// Helper function to get user from token if available
async function getUserFromToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                 request.cookies.get('auth-token')?.value;
    
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature
    } = await request.json();

    // Basic validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification parameters' },
        { status: 400 }
      );
    }

    // Try to get user from token (may be null for public payments)
    const user = await getUserFromToken(request);

    // Find the payment record
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // If user is authenticated, verify they own the payment
    if (user && payment.userId.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }      // Verify payment signature with Razorpay
      const secret = process.env.RAZORPAY_KEY_SECRET;
      
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

      const isValidSignature = expectedSignature === razorpay_signature;

      if (!isValidSignature) {
        // Update payment status to failed
        payment.status = 'failed';
        payment.failureReason = 'Invalid signature';
        await payment.save();

        return NextResponse.json(
          { error: 'Invalid payment signature' },
          { status: 400 }
        );
      }

      // Update payment record
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.status = 'completed';
      payment.transactionFee = payment.amount * 0.024; // 2.4% transaction fee
      payment.netAmount = payment.amount - payment.transactionFee;
      payment.completedAt = new Date();
      await payment.save();    // Update invoice status
    const invoice = await Invoice.findById(payment.invoiceId);
    if (invoice) {
      // Calculate new payment totals
      const newTotalPaid = (invoice.totalPaid || 0) + payment.amount;
      const newRemainingBalance = invoice.total - newTotalPaid;
      
      // Update payment status based on remaining balance
      if (newRemainingBalance <= 0.01) { // Account for floating point precision
        invoice.paymentStatus = 'paid';
        invoice.status = 'paid';
        invoice.paidAt = new Date();
      } else {
        invoice.paymentStatus = 'partial';
      }
        invoice.totalPaid = newTotalPaid;
      invoice.remainingAmount = Math.max(0, newRemainingBalance);
      
      // Add payment to history
      if (!invoice.payments) {
        invoice.payments = [];
      }
      invoice.payments.push({
        amount: payment.amount,
        paymentDate: new Date(),
        paymentMethod: 'razorpay',
        transactionId: razorpay_payment_id,
        status: 'paid'
      });
      
      await invoice.save();
    }

    // Mock payment verification success
    const paymentData = {
      id: razorpay_payment_id,
      order_id: razorpay_order_id,
      status: 'captured',
      amount: payment.amount * 100, // Amount in paise
      currency: payment.currency,
      method: 'card',
      invoice_id: payment.invoiceId,
      verified_at: new Date().toISOString(),
      transaction_id: `txn_${Date.now()}`
    };

    // Log successful payment
    console.log('Payment verified successfully:', {
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      invoice_id: payment.invoiceId,
      amount: payment.amount,
      timestamp: new Date().toISOString()
    });

    // TODO: Send confirmation email to client
    // await sendPaymentConfirmationEmail(invoice, payment);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment: paymentData,
      invoice: {
        id: payment.invoiceId,
        status: invoice.paymentStatus
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
