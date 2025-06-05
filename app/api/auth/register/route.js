import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database';
import User from '../../../lib/models/User';
import { hashPassword, generateToken } from '../../../lib/auth';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const userData = await request.json();
    const { firstName, lastName, email, password, businessName, businessType, phone, country } = userData;

    // Basic validation
    if (!firstName || !lastName || !email || !password || !businessName) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
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

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      businessName,
      businessType,
      phone,
      country,
      isEmailVerified: false,
      subscription: {
        plan: 'free',
        status: 'active',
        startDate: new Date()
      },
      preferences: {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'UTC',
        language: 'en'
      }
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id);    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        businessName: newUser.businessName,
        businessType: newUser.businessType,
        phone: newUser.phone,
        country: newUser.country,
        isEmailVerified: newUser.isEmailVerified,
        subscription: newUser.subscription,
        preferences: newUser.preferences
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
