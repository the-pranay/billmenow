import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/database.js';
import Invoice from '../../lib/models/Invoice.js';
import Payment from '../../lib/models/Payment.js';
import Client from '../../lib/models/Client.js';
import { withAuth } from '../../lib/middleware.js';

export async function GET(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { searchParams } = new URL(request.url);
      const reportType = searchParams.get('type') || 'revenue';
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const period = searchParams.get('period') || 'month'; // month, quarter, year

      // Set default date range
      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        };
      } else {
        // Default to last 12 months
        const start = new Date();
        start.setMonth(start.getMonth() - 12);
        dateFilter = {
          createdAt: { $gte: start }
        };
      }

      const baseQuery = { userId: user.id, ...dateFilter };

      switch (reportType) {
        case 'revenue':
          return await generateRevenueReport(baseQuery, period);
          
        case 'clients':
          return await generateClientReport(baseQuery, period);
          
        case 'invoices':
          return await generateInvoiceReport(baseQuery, period);
          
        case 'payments':
          return await generatePaymentReport(baseQuery, period);
          
        default:
          return NextResponse.json(
            { error: 'Invalid report type' },
            { status: 400 }
          );
      }

    } catch (error) {
      console.error('Reports error:', error);
      return NextResponse.json(
        { error: 'Failed to generate report' },
        { status: 500 }
      );
    }
  })(request);
}

async function generateRevenueReport(baseQuery, period) {
  // Revenue by period
  const revenueByPeriod = await Invoice.aggregate([
    { $match: { ...baseQuery, status: 'paid' } },
    {
      $group: {
        _id: getPeriodGrouping(period),
        revenue: { $sum: '$total' },
        invoiceCount: { $sum: 1 },
        avgInvoiceValue: { $avg: '$total' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.quarter': 1 } }
  ]);

  // Revenue by client
  const revenueByClient = await Invoice.aggregate([
    { $match: { ...baseQuery, status: 'paid' } },
    {
      $group: {
        _id: '$clientId',
        revenue: { $sum: '$total' },
        invoiceCount: { $sum: 1 }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'clients',
        localField: '_id',
        foreignField: '_id',
        as: 'client'
      }
    },
    { $unwind: '$client' },
    {
      $project: {
        revenue: 1,
        invoiceCount: 1,
        clientName: '$client.name',
        clientCompany: '$client.company'
      }
    }
  ]);

  // Total revenue summary
  const totalRevenue = await Invoice.aggregate([
    { $match: { ...baseQuery, status: 'paid' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        totalInvoices: { $sum: 1 },
        avgInvoiceValue: { $avg: '$total' }
      }
    }
  ]);

  return NextResponse.json({
    success: true,
    data: {
      revenueByPeriod,
      revenueByClient,
      summary: totalRevenue[0] || { totalRevenue: 0, totalInvoices: 0, avgInvoiceValue: 0 }
    }
  });
}

async function generateClientReport(baseQuery, period) {
  // Client statistics
  const clientStats = await Client.aggregate([
    { $match: { userId: baseQuery.userId } },
    {
      $lookup: {
        from: 'invoices',
        localField: '_id',
        foreignField: 'clientId',
        as: 'invoices'
      }
    },
    {
      $project: {
        name: 1,
        company: 1,
        email: 1,
        createdAt: 1,
        totalInvoices: { $size: '$invoices' },
        totalRevenue: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$invoices',
                  cond: { $eq: ['$$this.status', 'paid'] }
                }
              },
              as: 'invoice',
              in: '$$invoice.total'
            }
          }
        },
        pendingAmount: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$invoices',
                  cond: { $eq: ['$$this.status', 'pending'] }
                }
              },
              as: 'invoice',
              in: '$$invoice.total'
            }
          }
        }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ]);

  return NextResponse.json({
    success: true,
    data: {
      clients: clientStats,
      summary: {
        totalClients: clientStats.length,
        activeClients: clientStats.filter(c => c.totalInvoices > 0).length
      }
    }
  });
}

async function generateInvoiceReport(baseQuery, period) {
  // Invoice status distribution
  const invoiceStatus = await Invoice.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' }
      }
    }
  ]);

  // Invoices by period
  const invoicesByPeriod = await Invoice.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: getPeriodGrouping(period),
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        paidAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'paid'] }, '$total', 0]
          }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.quarter': 1 } }
  ]);

  return NextResponse.json({
    success: true,
    data: {
      invoiceStatus,
      invoicesByPeriod
    }
  });
}

async function generatePaymentReport(baseQuery, period) {
  const paymentStats = await Payment.aggregate([
    { $match: { userId: baseQuery.userId } },
    {
      $group: {
        _id: getPeriodGrouping(period, '$createdAt'),
        totalPayments: { $sum: '$amount' },
        paymentCount: { $sum: 1 },
        transactionFees: { $sum: '$transactionFee' },
        netAmount: { $sum: '$netAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.quarter': 1 } }
  ]);

  return NextResponse.json({
    success: true,
    data: {
      paymentsByPeriod: paymentStats
    }
  });
}

function getPeriodGrouping(period, dateField = '$createdAt') {
  switch (period) {
    case 'year':
      return { year: { $year: dateField } };
    case 'quarter':
      return {
        year: { $year: dateField },
        quarter: { $ceil: { $divide: [{ $month: dateField }, 3] } }
      };
    case 'month':
    default:
      return {
        year: { $year: dateField },
        month: { $month: dateField }
      };
  }
}