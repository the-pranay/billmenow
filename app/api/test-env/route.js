import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envData = {
      mongodbUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      smtpUser: process.env.SMTP_USER || 'NOT SET',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'NOT SET',
      nodeEnv: process.env.NODE_ENV || 'NOT SET',
      mongodbUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
      mongodbStartsWithSrv: process.env.MONGODB_URI ? process.env.MONGODB_URI.startsWith('mongodb+srv') : false
    };

    return NextResponse.json({
      success: true,
      message: 'Environment variables test',
      data: envData
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
