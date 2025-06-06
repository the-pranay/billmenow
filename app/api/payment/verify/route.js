import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '../../../lib/database';
import Invoice from '../../../lib/models/Invoice';
import Payment from '../../../lib/models/Payment';
import { withAuth } from '../../../lib/middleware';

export async function POST(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        invoice_id 
      } = await request.json();

      // Basic validation
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { error: 'Missing required payment verification parameters' },
          { status: 400 }
        );
      }

      // Find the payment record
      const payment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
        userId: user.id
      });

      if (!payment) {
        return NextResponse.json(
          { error: 'Payment record not found' },
          { status: 404 }
        );
      }

      // In production, verify payment signature with Razorpay
      // const secret = process.env.RAZORPAY_KEY_SECRET;
      const secret = 'test_secret_key'; // Mock secret for development
      
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
      await payment.save();

      // Update invoice status
      const invoice = await Invoice.findById(payment.invoiceId);
      if (invoice) {
        invoice.status = 'paid';
        invoice.paidAt = new Date();
        invoice.payments.push({
          amount: payment.amount,
          paymentDate: new Date(),
          paymentMethod: 'razorpay',
          transactionId: razorpay_payment_id
        });
        await invoice.save();
      }      // Mock payment verification success
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
          status: 'paid'
        }
      });

    } catch (error) {
      console.error('Payment verification error:', error);
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 500 }
      );
    }
  })(request);
}
