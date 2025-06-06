import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';
import { withAuth } from '../../../lib/middleware.js';

// GET - Export user data
export async function GET(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      // Find user with all their data
      const userData = await User.findById(user.id)
        .select('-password -resetPasswordToken -resetPasswordExpires')
        .lean();

      if (!userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // In a real application, you would also include related data like:
      // - Invoices
      // - Clients
      // - Templates
      // - Transaction history
      // For now, we'll just export the user profile and settings

      const exportData = {
        user: userData,
        exportDate: new Date().toISOString(),
        dataVersion: '1.0',
        description: 'Complete user data export from BillMeNow'
      };

      // Set headers for file download
      const response = NextResponse.json(exportData);
      response.headers.set('Content-Disposition', `attachment; filename="billmenow-data-${user.id}-${new Date().toISOString().split('T')[0]}.json"`);
      response.headers.set('Content-Type', 'application/json');

      return response;

    } catch (error) {
      console.error('Export data error:', error);
      return NextResponse.json(
        { error: 'Failed to export data' },
        { status: 500 }
      );
    }
  })(request);
}
