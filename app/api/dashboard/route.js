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

      // Get invoice counts by status
      const paidInvoicesCount = await Invoice.countDocuments({ 
        userId: userId, 
        status: 'paid' 
      });
      
      const pendingInvoicesCount = await Invoice.countDocuments({ 
        userId: userId, 
        status: { $in: ['sent', 'viewed'] }
      });
      
      const currentDate = new Date();
      const overdueInvoicesCount = await Invoice.countDocuments({ 
        userId: userId, 
        status: { $ne: 'paid' },
        dueDate: { $lt: currentDate }
      });

      // Get revenue stats from paid invoices
      const paidInvoices = await Invoice.find({ 
        userId: userId, 
        status: 'paid' 
      }).select('total issueDate');
      
      const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);

      // Get this month's revenue (current month)
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const thisMonthInvoices = await Invoice.find({
        userId: userId,
        status: 'paid',
        issueDate: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      }).select('total');
      
      const thisMonth = thisMonthInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);

      // Calculate average invoice value
      const avgInvoiceValue = totalInvoices > 0 ? totalRevenue / paidInvoicesCount : 0;

      // Get recent invoices for display
      const recentInvoices = await Invoice.find({ userId: userId })
        .populate('clientId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('invoiceNumber clientId total status issueDate dueDate');

      return NextResponse.json({
        success: true,
        stats: {
          totalInvoices,
          paidInvoices: paidInvoicesCount,
          pendingInvoices: pendingInvoicesCount,
          overdueInvoices: overdueInvoicesCount,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          thisMonth: Math.round(thisMonth * 100) / 100,
          avgInvoiceValue: Math.round(avgInvoiceValue * 100) / 100,
          clientsCount: totalClients
        },
        recentInvoices: recentInvoices.map(invoice => ({
          id: invoice.invoiceNumber,
          clientName: invoice.clientId?.name || 'Unknown Client',
          amount: invoice.total,
          status: invoice.status,
          date: invoice.issueDate,
          dueDate: invoice.dueDate
        }))
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
