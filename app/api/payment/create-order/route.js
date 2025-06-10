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
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    console.log('🔍 FULL create-order API called');
    
    const { amount, currency = 'INR', invoiceId, clientInfo } = await request.json();
    console.log('📊 Received data:', { amount, currency, invoiceId, clientInfo });

    // Basic validation
    if (!amount || !invoiceId) {
      return NextResponse.json(
        { error: 'Amount and Invoice ID are required' },
        { status: 400 }
      );
    }

    // Try to get user from token (may be null for public payments)
    const user = await getUserFromToken(request);
    console.log('👤 User from token:', user ? 'Present' : 'Public payment');

    // Connect to database
    await connectToDatabase();
    console.log('🔗 Database connected');

    // First, try to find the invoice - check if it's a public payment
    const invoice = await Invoice.findById(invoiceId).populate('clientId');
    console.log('📄 Invoice found:', invoice ? 'Yes' : 'No');

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
    }

    // Create order with Razorpay
    console.log('💳 Creating Razorpay order...');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create a short receipt ID (max 40 chars for Razorpay)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const shortInvoiceId = invoiceId.slice(-8); // Last 8 chars of invoice ID
    const receipt = `rcpt_${shortInvoiceId}_${timestamp}`;

    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: currency,
      receipt: receipt,
      notes: {
        invoiceId: invoiceId,
        userId: user?.id || invoice.userId.toString(),
        clientName: clientInfo?.name || invoice.clientId.name,
        clientEmail: clientInfo?.email || invoice.clientId.email
      }
    });

    console.log('✅ Razorpay order created:', order.id);

    // Create payment record in database
    const payment = new Payment({
      userId: user?.id || invoice.userId, // Use invoice's userId if no authenticated user
      freelancerId: invoice.userId, // The freelancer/user who created the invoice
      invoiceId: invoiceId,
      clientId: invoice.clientId._id || invoice.clientId, // Add required clientId field
      razorpayOrderId: order.id,
      amount: parseFloat(amount),
      currency: currency,
      status: 'pending',
      method: 'razorpay' // Use 'method' instead of 'paymentMethod' to match schema
    });

    await payment.save();
    console.log('📝 Payment record created in database');

    return NextResponse.json({
      success: true,
      order: order,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID // Use actual Razorpay key
    });
    
  } catch (error) {
    console.error('❌ Order creation error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing',
      razorpaySecret: process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing'
    });
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'SIMPLE create-order GET working'
  });
}
