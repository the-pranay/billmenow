import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Payment from '../../../lib/models/Payment';
import Invoice from '../../../lib/models/Invoice';
import { authenticateUser } from '../../../lib/auth';

export async function POST(request) {
  try {
    await dbConnect();

    const { amount, currency, invoiceId, upiId, clientInfo } = await request.json();

    // Validate required fields
    if (!amount || !invoiceId || !upiId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: amount, invoiceId, upiId'
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
        console.log('Public UPI payment (no auth):', error.message);
      }
    }

    // Verify invoice exists and amount matches
    let invoice = null;
    if (userId) {
      invoice = await Invoice.findOne({ 
        _id: invoiceId, 
        freelancerId: userId 
      });
    } else {
      // For public payments, find invoice by ID only
      invoice = await Invoice.findById(invoiceId);
    }

    if (!invoice) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 });
    }

    if (invoice.total !== amount) {
      return NextResponse.json({
        success: false,
        error: 'Amount mismatch with invoice total'
      }, { status: 400 });
    }

    // Check if payment already exists for this invoice
    const existingPayment = await Payment.findOne({ 
      invoiceId: invoiceId,
      status: { $in: ['completed', 'processing'] }
    });

    if (existingPayment) {
      return NextResponse.json({
        success: false,
        error: 'Payment already exists for this invoice'
      }, { status: 400 });
    }

    // Create payment record
    const payment = new Payment({
      invoiceId: invoiceId,
      freelancerId: userId || invoice.freelancerId,
      amount: amount,
      currency: currency || 'INR',
      method: 'upi',
      status: 'processing',
      upiId: upiId,
      clientInfo: clientInfo,
      metadata: {
        upiString: `upi://pay?pa=${upiId}&pn=BillMeNow&am=${amount}&cu=INR&tn=Invoice-${invoiceId}`,
        createdAt: new Date()
      }
    });

    await payment.save();

    return NextResponse.json({
      success: true,
      paymentId: payment._id,
      upiString: payment.metadata.upiString,
      message: 'UPI payment order created successfully'
    });

  } catch (error) {
    console.error('UPI order creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
