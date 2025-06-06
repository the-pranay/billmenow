import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';
import { comparePassword, generateToken } from '../../../lib/auth.js';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({ userId: user._id.toString() });

    // Return user data and token
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
        businessType: user.businessType,
        phone: user.phone,
        country: user.country,
        isEmailVerified: user.isEmailVerified,
        subscription: user.subscription,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
