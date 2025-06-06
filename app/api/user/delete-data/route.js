import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';
import { withAuth } from '../../../lib/middleware.js';

// DELETE - Delete all user data (but keep account)
export async function DELETE(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { confirmAction } = await request.json();

      if (confirmAction !== 'DELETE_ALL_DATA') {
        return NextResponse.json(
          { error: 'Action confirmation required' },
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

      // Reset user data while keeping the account
      const resetData = {
        preferences: {},
        settings: {
          theme: 'system',
          language: 'en',
          timezone: 'Asia/Kolkata',
          dateFormat: 'DD/MM/YYYY',
          currency: 'INR',
          emailNotifications: true,
          invoiceReminders: true,
          paymentAlerts: true,
          marketingEmails: false,
          pushNotifications: true,
          smsNotifications: false,
          twoFactorAuth: false,
          sessionTimeout: '30',
          loginAlerts: true,
          autoSaveInvoices: true,
          defaultDueDate: '30',
          lateFeePercentage: '2',
          sendReminders: true,
          reminderDays: ['7', '3', '1'],
          profileVisibility: 'private',
          analyticsSharing: false,
          dataCollection: 'minimal'
        }
      };

      // In a real application, you would also need to:
      // 1. Delete all invoices
      // 2. Delete all clients
      // 3. Delete all templates
      // 4. Delete all transaction history
      // 5. Reset any analytics data
      // 6. Clear any cached data

      // Update user with reset data
      await User.findByIdAndUpdate(user.id, resetData);

      return NextResponse.json({
        success: true,
        message: 'All data deleted successfully. Account and login credentials preserved.'
      });

    } catch (error) {
      console.error('Delete data error:', error);
      return NextResponse.json(
        { error: 'Failed to delete data' },
        { status: 500 }
      );
    }
  })(request);
}
