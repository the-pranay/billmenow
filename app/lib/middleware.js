import { NextResponse } from 'next/server';
import { verifyToken } from './auth';
import { connectToDatabase } from './database';
import User from './models/User';

export const authMiddleware = async (request) => {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                 request.cookies.get('token')?.value;

    if (!token) {
      return { error: 'No token provided', status: 401 };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return { error: 'Invalid token', status: 401 };
    }    await connectToDatabase();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return { error: 'User not found', status: 401 };
    }

    return { user, userId: user._id };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { error: 'Authentication failed', status: 401 };
  }
};

export const adminMiddleware = async (request) => {
  const authResult = await authMiddleware(request);
  
  if (authResult.error) {
    return authResult;
  }

  if (authResult.user.role !== 'admin') {
    return { error: 'Admin access required', status: 403 };
  }

  return authResult;
};

export const withAuth = (handler) => {
  return async (request) => {
    const authResult = await authMiddleware(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Add user info to request
    request.user = authResult.user;
    request.userId = authResult.userId;
    
    // Pass user as second parameter to match expected handler signature
    return handler(request, authResult.user);
  };
};

export const withAdmin = (handler) => {
  return async (request, context) => {
    const authResult = await adminMiddleware(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Add user info to request
    request.user = authResult.user;
    request.userId = authResult.userId;
    
    return handler(request, context);
  };
};
