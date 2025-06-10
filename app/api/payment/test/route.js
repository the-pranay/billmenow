import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('🔍 Payment test API called');
    
    const body = await request.json();
    console.log('📊 Request body:', body);
    
    // Check if we can access environment variables
    const envCheck = {
      MONGODB_URI: process.env.MONGODB_URI ? 'Present' : 'Missing',
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing'
    };
    
    console.log('🔧 Environment check:', envCheck);
    
    return NextResponse.json({
      success: true,
      message: 'Payment test API working',
      receivedData: body,
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Payment test API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Payment test API is running',
    environment: {
      MONGODB_URI: process.env.MONGODB_URI ? 'Present' : 'Missing',
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing'
    }
  });
}
