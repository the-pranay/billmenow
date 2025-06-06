import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database';
import Invoice from '../../../lib/models/Invoice';
import Payment from '../../../lib/models/Payment';
import { withAuth } from '../../../lib/middleware';

// In production, uncomment this to use actual Razorpay SDK
// const Razorpay = require('razorpay');

export async function POST(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { amount, currency = 'INR', invoiceId, clientInfo } = await request.json();

      // Basic validation
      if (!amount || !invoiceId) {
        return NextResponse.json(
          { error: 'Amount and Invoice ID are required' },
          { status: 400 }
        );
      }

      // Verify invoice exists and belongs to user
      const invoice = await Invoice.findOne({
        _id: invoiceId,
        userId: user.id
      }).populate('clientId');

      if (!invoice) {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }

      // Check if invoice is already paid
      if (invoice.status === 'paid') {
        return NextResponse.json(
          { error: 'Invoice is already paid' },
          { status: 400 }
        );
      }

      // Validate amount matches invoice total
      if (parseFloat(amount) !== invoice.total) {
        return NextResponse.json(
          { error: 'Payment amount does not match invoice total' },
          { status: 400 }
        );
      }

      // In production, create order with Razorpay
      // const razorpay = new Razorpay({
      //   key_id: process.env.RAZORPAY_KEY_ID,
      //   key_secret: process.env.RAZORPAY_KEY_SECRET,
      // });

      // const order = await razorpay.orders.create({
      //   amount: amount * 100, // Amount in paise
      //   currency: currency,
      //   receipt: `receipt_${invoiceId}`,
      //   notes: {
      //     invoiceId: invoiceId,
      //     userId: user.id
      //   }
      // });      // Mock order creation for development
      const order = {
        id: `order_${Date.now()}`,
        entity: 'order',
        amount: amount * 100, // Amount in paise
        amount_paid: 0,
        amount_due: amount * 100,
        currency: currency,
        receipt: `receipt_${invoiceId}`,
        status: 'created',
        attempts: 0,
        notes: {
          invoice_id: invoiceId,
          client_name: clientInfo?.name || invoice.clientId.name,
          client_email: clientInfo?.email || invoice.clientId.email
        },
        created_at: Math.floor(Date.now() / 1000)
      };

      // Create payment record in database
      const payment = new Payment({
        userId: user.id,
        invoiceId: invoiceId,
        razorpayOrderId: order.id,
        amount: parseFloat(amount),
        currency: currency,
        status: 'pending',
        paymentMethod: 'razorpay'
      });

      await payment.save();

      return NextResponse.json({
        success: true,
        order: order,
        paymentId: payment._id
      });

    } catch (error) {
      console.error('Order creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }
  })(request);
}
