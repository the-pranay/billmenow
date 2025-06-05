import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Connect to database
    await connectToDatabase();
    
    // Get user details
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        phone: user.phone,
        address: user.address,
        gstin: user.gstin,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return Response.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return Response.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    return Response.json(
      { error: 'Token verification failed' },
      { status: 500 }
    );
  }
}
