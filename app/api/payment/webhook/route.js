import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    // In production, verify webhook signature
    // const crypto = require('crypto');
    // const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    // const expectedSignature = crypto.createHmac('sha256', secret)
    //   .update(body)
    //   .digest('hex');

    // if (signature !== expectedSignature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    // }

    const event = JSON.parse(body);
    
    console.log('Webhook received:', {
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
  // In production:
  // 1. Update invoice status to 'paid'
  // 2. Send payment confirmation email
  // 3. Update analytics/reports
  // 4. Process any follow-up actions
  
  console.log('Payment captured:', {
    payment_id: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    method: payment.method,
    status: payment.status
  });
}

async function handlePaymentFailed(payment) {
  // In production:
  // 1. Log payment failure
  // 2. Send failure notification
  // 3. Update invoice status
  
  console.log('Payment failed:', {
    payment_id: payment.id,
    error_code: payment.error_code,
    error_description: payment.error_description
  });
}

async function handleOrderPaid(order) {
  // In production:
  // 1. Mark order as completed
  // 2. Trigger fulfillment process
  // 3. Send completion notifications
  
  console.log('Order paid:', {
    order_id: order.id,
    amount: order.amount,
    amount_paid: order.amount_paid,
    status: order.status
  });
}
