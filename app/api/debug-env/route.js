import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      env: {
        MONGODB_URI: process.env.MONGODB_URI ? 'Present' : 'Missing',
        JWT_SECRET: process.env.JWT_SECRET ? 'Present' : 'Missing', 
        RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'Present' : 'Missing',
        RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing',
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL ? 'Yes' : 'No'
      },
      mongodb_connection: process.env.MONGODB_URI?.substring(0, 30) + '...',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
