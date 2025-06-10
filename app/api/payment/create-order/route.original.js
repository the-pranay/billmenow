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
    
    const jwtSecret = process.env.JWT_SECRET || '289e50c62c3c5ecd8aa5c70d532fb708c509d8ada79355186ee177f354fd7a4b1ba9fcd794844f66399a7d7bf4cd9ff6f91f0ee7457dfdcd3588167359ee80be8';
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    console.log('🔄 Payment API called');
    console.log('📍 Environment check:', {
      mongoUri: process.env.MONGODB_URI ? 'Present' : 'Missing',
      razorpayKey: process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing',
      razorpaySecret: process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing'
    });

    await connectToDatabase();
    console.log('✅ Database connected successfully');

    const { amount, currency = 'INR', invoiceId, clientInfo } = await request.json();
    console.log('📊 Request data:', { amount, currency, invoiceId, clientInfo });

    // Basic validation
    if (!amount || !invoiceId) {
      console.log('❌ Validation failed: Missing amount or invoiceId');
      return NextResponse.json(
        { error: 'Amount and Invoice ID are required' },
        { status: 400 }
      );
    }

    // Try to get user from token (may be null for public payments)
    const user = await getUserFromToken(request);    // First, try to find the invoice - check if it's a public payment
    console.log('🔍 Looking for invoice:', invoiceId);
    const invoice = await Invoice.findById(invoiceId).populate('clientId');

    if (!invoice) {
      console.log('❌ Invoice not found in database');
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    console.log('✅ Invoice found:', {
      id: invoice._id,
      total: invoice.total,
      status: invoice.paymentStatus
    });

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
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_3tENk4NwCrtnOC';
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'eMnBFB2AoVi3dOe3P4N55XDX';
    
    console.log('🔑 Using Razorpay keys:', {
      keyId: razorpayKeyId.substring(0, 8) + '...',
      hasSecret: !!razorpayKeySecret
    });

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });// Create a short receipt ID (max 40 chars for Razorpay)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const shortInvoiceId = invoiceId.slice(-8); // Last 8 chars of invoice ID
    const receipt = `rcpt_${shortInvoiceId}_${timestamp}`;    console.log('💳 Creating Razorpay order...');
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

    console.log('✅ Razorpay order created:', order.id);// Create payment record in database
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

    await payment.save();    return NextResponse.json({
      success: true,
      order: order,
      paymentId: payment._id,
      keyId: razorpayKeyId // Use the fallback key
    });
  } catch (error) {
    console.error('Order creation error:', error);
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
