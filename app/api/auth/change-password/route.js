import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';
import { withAuth } from '../../../lib/middleware.js';

// PUT - Change user password
export async function PUT(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { currentPassword, newPassword, confirmPassword } = await request.json();

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
          { error: 'All password fields are required' },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: 'New password and confirmation do not match' },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long' },
          { status: 400 }
        );
      }

      // Find current user
      const currentUser = await User.findById(user.id);
      if (!currentUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Verify current password
      const bcrypt = await import('bcryptjs');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await User.findByIdAndUpdate(user.id, {
        password: hashedNewPassword,
        updatedAt: new Date()
      });

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      return NextResponse.json(
        { error: 'Failed to change password' },
        { status: 500 }
      );
    }
  })(request);
}
