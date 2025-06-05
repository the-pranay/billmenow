import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
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
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Update invoice status in database
    // 2. Send confirmation email to client
    // 3. Update payment records
    // 4. Trigger webhooks if needed

    // Mock payment verification success
    const paymentData = {
      id: razorpay_payment_id,
      order_id: razorpay_order_id,
      status: 'captured',
      amount: 2500000, // Amount in paise
      currency: 'INR',
      method: 'card',
      invoice_id: invoice_id,
      verified_at: new Date().toISOString(),
      transaction_id: `txn_${Date.now()}`
    };

    // Log successful payment
    console.log('Payment verified successfully:', {
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      invoice_id: invoice_id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment: paymentData
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
