import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/database.js';
import User from '../../lib/models/User.js';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Check if we have any users
    const userCount = await User.countDocuments();
    const users = await User.find({}, { email: 1, firstName: 1, lastName: 1, createdAt: 1 }).limit(5);
    
    return NextResponse.json({
      success: true,
      message: 'User data retrieved',
      data: {
        userCount,
        users: users.map(user => ({
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
