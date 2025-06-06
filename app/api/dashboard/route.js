import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/database.js';
import Client from '../../lib/models/Client.js';
import Invoice from '../../lib/models/Invoice.js';
import { withAuth } from '../../lib/middleware.js';

// GET - Fetch dashboard stats for the authenticated user
export async function GET(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const userId = user.id;
      
      // Get basic counts
      const totalInvoices = await Invoice.countDocuments({ userId: userId });
      const totalClients = await Client.countDocuments({ userId: userId });

      // Get revenue stats from paid invoices
      const paidInvoices = await Invoice.find({ 
        userId: userId, 
        status: 'paid' 
      }).select('total');
      
      const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);

      // Get pending amount from pending invoices
      const pendingInvoices = await Invoice.find({ 
        userId: userId, 
        status: 'pending' 
      }).select('total');
      
      const pendingAmount = pendingInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);

      // Get overdue amount (invoices past due date and not paid)
      const currentDate = new Date();
      const overdueInvoices = await Invoice.find({ 
        userId: userId, 
        status: { $ne: 'paid' },
        dueDate: { $lt: currentDate }
      }).select('total');
      
      const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);

      return NextResponse.json({
        success: true,
        stats: {
          totalInvoices,
          totalClients,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          pendingAmount: Math.round(pendingAmount * 100) / 100,
          overdueAmount: Math.round(overdueAmount * 100) / 100
        }
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dashboard data' },
        { status: 500 }
      );
    }
  })(request);
}
