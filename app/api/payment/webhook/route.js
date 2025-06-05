import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import Invoice from '../../../lib/models/Invoice.js';
import Payment from '../../../lib/models/Payment.js';
import User from '../../../lib/models/User.js';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await connectToDatabase();

    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    console.log('Webhook received:', {
      hasBody: !!body,
      bodyLength: body?.length,
      hasSignature: !!signature,
      timestamp: new Date().toISOString()
    });

    // Verify webhook signature for security
    if (process.env.RAZORPAY_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    // Parse JSON with error handling
    let event;
    try {
      event = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw body:', body);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    if (!event || !event.event) {
      console.error('Invalid event structure:', event);
      return NextResponse.json({ error: 'Invalid event structure' }, { status: 400 });
    }
    
    console.log('Webhook parsed successfully:', {
      event: event.event,
      payment_id: event.payload?.payment?.entity?.id,
      order_id: event.payload?.payment?.entity?.order_id,
      status: event.payload?.payment?.entity?.status,
      timestamp: new Date().toISOString()
    });

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;

      case 'payment.authorized':
        await handlePaymentAuthorized(event.payload.payment.entity);
        break;

      case 'refund.created':
        await handleRefundCreated(event.payload.refund.entity);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment) {
  try {
    console.log('Processing payment captured:', payment.id);

    // Find the payment record in our database
    const paymentRecord = await Payment.findOne({
      razorpayPaymentId: payment.id
    });

    if (!paymentRecord) {
      console.error('Payment record not found:', payment.id);
      return;
    }

    // Update payment status
    paymentRecord.status = 'completed';
    paymentRecord.capturedAt = new Date();
    paymentRecord.razorpayResponse = payment;
    await paymentRecord.save();

    // Update invoice status to paid
    const invoice = await Invoice.findById(paymentRecord.invoiceId);
    if (invoice) {
      invoice.status = 'paid';
      invoice.paidAt = new Date();
      invoice.paidAmount = payment.amount / 100; // Convert from paise to rupees
      await invoice.save();

      // Send payment confirmation email
      await sendPaymentConfirmationEmail(invoice, payment);
    }

    console.log('Payment captured successfully processed:', {
      payment_id: payment.id,
      invoice_id: invoice?._id,
      amount: payment.amount / 100
    });

  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment) {
  try {
    console.log('Processing payment failed:', payment.id);

    // Find the payment record
    const paymentRecord = await Payment.findOne({
      razorpayPaymentId: payment.id
    });

    if (paymentRecord) {
      paymentRecord.status = 'failed';
      paymentRecord.failureReason = payment.error_description;
      paymentRecord.razorpayResponse = payment;
      await paymentRecord.save();

      // Update invoice status back to pending
      const invoice = await Invoice.findById(paymentRecord.invoiceId);
      if (invoice) {
        invoice.status = 'pending';
        await invoice.save();
      }

      console.log('Payment failure processed:', {
        payment_id: payment.id,
        error_code: payment.error_code,
        error_description: payment.error_description
      });
    }

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleOrderPaid(order) {
  try {
    console.log('Processing order paid:', order.id);

    // Find payments for this order
    const payments = await Payment.find({
      razorpayOrderId: order.id
    });

    for (const payment of payments) {
      payment.status = 'completed';
      await payment.save();

      // Update associated invoice
      const invoice = await Invoice.findById(payment.invoiceId);
      if (invoice) {
        invoice.status = 'paid';
        invoice.paidAt = new Date();
        invoice.paidAmount = order.amount_paid / 100;
        await invoice.save();
      }
    }

    console.log('Order paid processed:', {
      order_id: order.id,
      amount_paid: order.amount_paid / 100
    });

  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

async function handlePaymentAuthorized(payment) {
  try {
    console.log('Processing payment authorized:', payment.id);

    const paymentRecord = await Payment.findOne({
      razorpayPaymentId: payment.id
    });

    if (paymentRecord) {
      paymentRecord.status = 'authorized';
      paymentRecord.authorizedAt = new Date();
      paymentRecord.razorpayResponse = payment;
      await paymentRecord.save();
    }

  } catch (error) {
    console.error('Error handling payment authorized:', error);
  }
}

async function handleRefundCreated(refund) {
  try {
    console.log('Processing refund created:', refund.id);

    // Find the original payment
    const paymentRecord = await Payment.findOne({
      razorpayPaymentId: refund.payment_id
    });

    if (paymentRecord) {
      // Update payment record with refund info
      paymentRecord.refundId = refund.id;
      paymentRecord.refundAmount = refund.amount / 100;
      paymentRecord.refundStatus = refund.status;
      paymentRecord.refundedAt = new Date();
      await paymentRecord.save();

      // Update invoice status
      const invoice = await Invoice.findById(paymentRecord.invoiceId);
      if (invoice) {
        if (refund.amount === paymentRecord.amount * 100) {
          // Full refund
          invoice.status = 'refunded';
        } else {
          // Partial refund
          invoice.status = 'partially_refunded';
        }
        await invoice.save();
      }
    }

  } catch (error) {
    console.error('Error handling refund created:', error);
  }
}

async function sendPaymentConfirmationEmail(invoice, payment) {
  try {
    // Get user and client details
    const user = await User.findById(invoice.userId);
    const invoiceWithClient = await Invoice.findById(invoice._id).populate('clientId');

    if (user && invoiceWithClient.clientId) {
      const emailData = {
        to: invoiceWithClient.clientId.email,
        subject: 'thankyou',
        template: 'thankyou',
        templateData: {
          clientName: invoiceWithClient.clientId.name,
          invoiceNumber: invoiceWithClient.invoiceNumber,
          amount: `₹${(payment.amount / 100).toLocaleString('en-IN')}`,
          paymentDate: new Date().toLocaleDateString('en-IN'),
          transactionId: payment.id,
          senderName: `${user.firstName} ${user.lastName}`,
          businessName: user.businessName || 'N/A',
          contactDetails: user.email
        }
      };

      // Call email API (you could also directly send email here)
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` // You'll need to generate a token for system emails
        },
        body: JSON.stringify(emailData)
      });

      if (emailResponse.ok) {
        console.log('Payment confirmation email sent successfully');
      } else {
        console.error('Failed to send payment confirmation email');
      }
    }

  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
  }
}
