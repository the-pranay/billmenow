import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { email } = await request.json();

    // Basic validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    const successResponse = {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    };

    if (!user) {
      return NextResponse.json(successResponse);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, resetUrl);

    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset token: ${resetToken}`); // Remove in production

    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
