import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('🔍 SIMPLE create-order API called');
    
    const { amount, currency = 'INR', invoiceId, clientInfo } = await request.json();
    console.log('📊 Received data:', { amount, currency, invoiceId, clientInfo });
    
    // Basic validation
    if (!amount || !invoiceId) {
      return NextResponse.json(
        { error: 'Amount and Invoice ID are required' },
        { status: 400 }
      );
    }
    
    // Return the expected format for Razorpay
    return NextResponse.json({
      success: true,
      order: {
        id: 'order_test_' + Date.now(),
        amount: amount * 100, // Convert to paise
        currency: currency
      },
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_3tENk4NwCrtnOC',
      message: 'SIMPLE create-order working - payment should proceed!'
    });
    
  } catch (error) {
    console.error('❌ SIMPLE create-order error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'SIMPLE create-order GET working'
  });
}
