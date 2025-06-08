import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import Invoice from '../../../lib/models/Invoice.js';
import Payment from '../../../lib/models/Payment.js';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';

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
    await connectToDatabase();

    const { amount, currency = 'INR', invoiceId, clientInfo } = await request.json();

    // Basic validation
    if (!amount || !invoiceId) {
      return NextResponse.json(
        { error: 'Amount and Invoice ID are required' },
        { status: 400 }
      );
    }

    // Try to get user from token (may be null for public payments)
    const user = await getUserFromToken(request);

    // First, try to find the invoice - check if it's a public payment
    const invoice = await Invoice.findById(invoiceId).populate('clientId');

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // If user is authenticated, verify they own the invoice
    // If not authenticated, allow if invoice exists (public payment)
    if (user && invoice.userId.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if invoice is already paid
    if (invoice.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      );
    }

    // Validate amount matches invoice remaining balance
    const amountToValidate = invoice.remainingBalance || invoice.total;
    if (Math.abs(parseFloat(amount) - amountToValidate) > 0.01) {
      return NextResponse.json(
        { error: 'Payment amount does not match invoice balance' },
        { status: 400 }
      );
    }    // Create order with Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: currency,
      receipt: `receipt_${invoiceId}_${Date.now()}`,
      notes: {
        invoiceId: invoiceId,
        userId: user?.id || invoice.userId.toString(),
        clientName: clientInfo?.name || invoice.clientId.name,
        clientEmail: clientInfo?.email || invoice.clientId.email
      }
    });// Create payment record in database
    const payment = new Payment({
      userId: user?.id || invoice.userId, // Use invoice's userId if no authenticated user
      invoiceId: invoiceId,
      clientId: invoice.clientId._id || invoice.clientId, // Add required clientId field
      razorpayOrderId: order.id,
      amount: parseFloat(amount),
      currency: currency,
      status: 'pending',
      method: 'razorpay' // Use 'method' instead of 'paymentMethod' to match schema
    });

    await payment.save();    return NextResponse.json({
      success: true,
      order: order,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID // Use actual Razorpay key
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
