import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';
import { withAuth } from '../../../lib/middleware.js';

// GET - Get user settings
export async function GET(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const userProfile = await User.findById(user.id)
        .select('preferences settings')
        .lean();

      if (!userProfile) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        settings: userProfile.settings || {},
        preferences: userProfile.preferences || {}
      });

    } catch (error) {
      console.error('Get settings error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT - Update user settings
export async function PUT(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const settingsData = await request.json();
      const {
        theme,
        language,
        timezone,
        dateFormat,
        currency,
        emailNotifications,
        invoiceReminders,
        paymentAlerts,
        marketingEmails,
        pushNotifications,
        smsNotifications,
        twoFactorAuth,
        sessionTimeout,
        loginAlerts,
        autoSaveInvoices,
        defaultDueDate,
        lateFeePercentage,
        sendReminders,
        reminderDays,
        profileVisibility,
        analyticsSharing,
        dataCollection
      } = settingsData;

      // Find current user
      const currentUser = await User.findById(user.id);
      if (!currentUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Prepare update object
      const updateFields = {
        settings: {
          // General Settings
          theme,
          language,
          timezone,
          dateFormat,
          currency,
          
          // Notifications
          emailNotifications,
          invoiceReminders,
          paymentAlerts,
          marketingEmails,
          pushNotifications,
          smsNotifications,
          
          // Security
          twoFactorAuth,
          sessionTimeout,
          loginAlerts,
          
          // Invoice Settings
          autoSaveInvoices,
          defaultDueDate,
          lateFeePercentage,
          sendReminders,
          reminderDays,
          
          // Privacy
          profileVisibility,
          analyticsSharing,
          dataCollection
        },
        updatedAt: new Date()
      };

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        updateFields,
        { new: true, runValidators: true }
      ).select('settings preferences');

      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully',
        settings: updatedUser.settings,
        preferences: updatedUser.preferences
      });

    } catch (error) {
      console.error('Update settings error:', error);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }
  })(request);
}
