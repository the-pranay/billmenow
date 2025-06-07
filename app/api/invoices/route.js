import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/database.js';
import Invoice from '../../lib/models/Invoice.js';
import Client from '../../lib/models/Client.js';
import { withAuth } from '../../lib/middleware.js';

// GET - Fetch all invoices for the authenticated user
export async function GET(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page')) || 1;
      const limit = parseInt(searchParams.get('limit')) || 10;
      const status = searchParams.get('status') || 'all';
      const clientId = searchParams.get('clientId');
      const search = searchParams.get('search') || '';

      // Build query
      const query = { userId: user.id };
      
      if (status !== 'all') {
        query.status = status;
      }

      if (clientId) {
        query.clientId = clientId;
      }

      if (search) {
        query.$or = [
          { invoiceNumber: { $regex: search, $options: 'i' } },
          { 'client.name': { $regex: search, $options: 'i' } },
          { 'client.company': { $regex: search, $options: 'i' } }
        ];
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const invoices = await Invoice.find(query)
        .populate('clientId', 'name email company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalInvoices = await Invoice.countDocuments(query);
      const totalPages = Math.ceil(totalInvoices / limit);

      // Calculate summary statistics
      const summaryStats = await Invoice.aggregate([
        { $match: { userId: user.id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' }
          }
        }
      ]);

      const summary = {
        total: 0,
        pending: 0,
        paid: 0,
        overdue: 0,
        totalAmount: 0,
        pendingAmount: 0,
        paidAmount: 0,
        overdueAmount: 0
      };

      summaryStats.forEach(stat => {
        summary.total += stat.count;        summary.totalAmount += stat.totalAmount;
        
        if (stat._id === 'sent' || stat._id === 'viewed') {
          summary.pending += stat.count;
          summary.pendingAmount += stat.totalAmount;
        } else if (stat._id === 'paid') {
          summary.paid = stat.count;
          summary.paidAmount = stat.totalAmount;
        } else if (stat._id === 'overdue') {
          summary.overdue = stat.count;
          summary.overdueAmount = stat.totalAmount;
        }
      });

      return NextResponse.json({
        success: true,
        invoices,
        summary,
        pagination: {
          currentPage: page,
          totalPages,
          totalInvoices,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });

    } catch (error) {
      console.error('Get invoices error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Create a new invoice
export async function POST(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const invoiceData = await request.json();
      const {
        clientId,
        items,
        taxRate,
        discountRate,
        notes,
        dueDate,
        isRecurring,
        recurringConfig
      } = invoiceData;

      // Basic validation
      if (!clientId || !items || items.length === 0) {
        return NextResponse.json(
          { error: 'Client and items are required' },
          { status: 400 }
        );
      }

      // Validate client exists and belongs to user
      const client = await Client.findOne({
        _id: clientId,
        userId: user.id
      });

      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }

      // Validate items
      let subtotal = 0;
      const validatedItems = items.map(item => {
        if (!item.description || !item.quantity || !item.rate) {
          throw new Error('Each item must have description, quantity, and rate');
        }
        
        const amount = item.quantity * item.rate;
        subtotal += amount;
        
        return {
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount
        };
      });

      // Calculate totals
      const taxAmount = subtotal * (taxRate / 100);
      const discountAmount = subtotal * (discountRate / 100);
      const total = subtotal + taxAmount - discountAmount;

      // Generate invoice number
      const invoiceCount = await Invoice.countDocuments({ userId: user.id });
      const invoiceNumber = `INV-${Date.now()}-${String(invoiceCount + 1).padStart(3, '0')}`;

      // Create new invoice
      const newInvoice = new Invoice({
        userId: user.id,
        clientId,
        invoiceNumber,
        items: validatedItems,
        subtotal,
        taxRate,
        taxAmount,
        discountRate,
        discountAmount,
        total,
        status: 'draft',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        notes,
        isRecurring,
        recurringConfig: isRecurring ? recurringConfig : undefined
      });

      await newInvoice.save();

      // Populate client data for response
      await newInvoice.populate('clientId', 'name email company');

      return NextResponse.json({
        success: true,
        message: 'Invoice created successfully',
        invoice: newInvoice
      }, { status: 201 });

    } catch (error) {
      console.error('Create invoice error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create invoice' },
        { status: 500 }
      );
    }
  })(request);
}
