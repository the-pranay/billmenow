import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('🔍 Simple create-order API called');
    
    const { amount, currency = 'INR', invoiceId, clientInfo } = await request.json();
    console.log('📊 Received data:', { amount, currency, invoiceId, clientInfo });
    
    // Basic validation
    if (!amount || !invoiceId) {
      return NextResponse.json(
        { error: 'Amount and Invoice ID are required' },
        { status: 400 }
      );
    }
    
    // For now, just return success without database operations
    return NextResponse.json({
      success: true,
      message: 'Simple create-order working',
      receivedData: { amount, currency, invoiceId, clientInfo },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Simple create-order error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Simple create-order GET endpoint working'
  });
}
