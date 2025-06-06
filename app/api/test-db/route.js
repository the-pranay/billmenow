import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/database.js';

export async function GET() {
  try {
    console.log('Testing database connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    
    const connection = await connectToDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        readyState: connection.connection.readyState,
        host: connection.connection.host,
        name: connection.connection.name
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      mongodbUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET'
    }, { status: 500 });
  }
}
