import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';
import { withAuth } from '../../../lib/middleware.js';

// DELETE - Delete user account
export async function DELETE(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { confirmPassword } = await request.json();

      // Find current user
      const currentUser = await User.findById(user.id);
      if (!currentUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Verify password for security
      const bcrypt = await import('bcryptjs');
      const isPasswordValid = await bcrypt.compare(confirmPassword, currentUser.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid password confirmation' },
          { status: 400 }
        );
      }

      // In a real application, you would also need to:
      // 1. Delete all related data (invoices, clients, etc.)
      // 2. Handle any active subscriptions
      // 3. Send confirmation email
      // 4. Log the deletion for audit purposes

      // Delete the user
      await User.findByIdAndDelete(user.id);

      return NextResponse.json({
        success: true,
        message: 'Account deleted successfully'
      });

    } catch (error) {
      console.error('Delete account error:', error);
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }
  })(request);
}
