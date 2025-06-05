import { NextResponse } from 'next/server';

// Mock user database - In production, use a real database
const users = [];

export async function POST(request) {
  try {
    const userData = await request.json();
    const { firstName, lastName, email, password, businessName, businessType, phone, country } = userData;

    // Basic validation
    if (!firstName || !lastName || !email || !password || !businessName) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user (In production, hash password and use database)
    const newUser = {
      id: users.length + 1,
      firstName,
      lastName,
      email,
      password, // In production, hash this password
      businessName,
      businessType,
      phone,
      country,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Return success response (In production, return JWT token)
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        businessName: newUser.businessName
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
