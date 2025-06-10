import { NextResponse } from 'next/server';

export async function POST(request) {
  return NextResponse.json({
    success: true,
    message: 'CREATE-ORDER route is working!',
    timestamp: new Date().toISOString(),
    method: 'POST'
  });
}

export async function GET(request) {
  return NextResponse.json({
    success: true,
    message: 'CREATE-ORDER route is working!',
    timestamp: new Date().toISOString(),
    method: 'GET'
  });
}
