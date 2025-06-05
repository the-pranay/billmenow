import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';
import { withAuth } from '../../../lib/middleware.js';
import { hashPassword } from '../../../lib/auth.js';

// GET - Get user profile
export async function GET(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const userProfile = await User.findById(user.id)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .lean();

      if (!userProfile) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: userProfile
      });

    } catch (error) {
      console.error('Get profile error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT - Update user profile
export async function PUT(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const updateData = await request.json();
      const {
        firstName,
        lastName,
        businessName,
        businessType,
        phone,
        country,
        address,
        city,
        state,
        zipCode,
        taxId,
        website,
        preferences,
        currentPassword,
        newPassword
      } = updateData;

      // Find current user
      const currentUser = await User.findById(user.id);
      if (!currentUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // If password change is requested, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return NextResponse.json(
            { error: 'Current password is required to change password' },
            { status: 400 }
          );
        }

        const { comparePassword } = await import('../../../lib/auth');
        const isCurrentPasswordValid = await comparePassword(currentPassword, currentUser.password);
        
        if (!isCurrentPasswordValid) {
          return NextResponse.json(
            { error: 'Current password is incorrect' },
            { status: 400 }
          );
        }

        if (newPassword.length < 6) {
          return NextResponse.json(
            { error: 'New password must be at least 6 characters long' },
            { status: 400 }
          );
        }
      }

      // Prepare update object
      const updateFields = {
        firstName,
        lastName,
        businessName,
        businessType,
        phone,
        country,
        businessDetails: {
          address,
          city,
          state,
          zipCode,
          taxId,
          website
        },
        preferences: {
          ...currentUser.preferences,
          ...preferences
        },
        updatedAt: new Date()
      };

      // Add hashed password if changing
      if (newPassword) {
        updateFields.password = await hashPassword(newPassword);
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        updateFields,
        { new: true, runValidators: true }
      ).select('-password -resetPasswordToken -resetPasswordExpires');

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });

    } catch (error) {
      console.error('Update profile error:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }
  })(request);
}
