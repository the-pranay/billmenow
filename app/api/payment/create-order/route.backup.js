import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('🔍 BACKUP create-order API called');
    
    const body = await request.json();
    console.log('📊 Received body:', body);
    
    return NextResponse.json({
      success: true,
      message: 'BACKUP create-order working - this means the route exists!',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ BACKUP create-order error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'BACKUP create-order failed but route exists'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'BACKUP create-order GET working'
  });
}
