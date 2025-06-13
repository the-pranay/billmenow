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
      const search = searchParams.get('search') || '';      // Build query - admin can see all invoices, users only see their own
      const query = user.role === 'admin' ? {} : { userId: user.id };
      
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
      const skip = (page - 1) * limit;      const invoices = await Invoice.find(query)
        .populate('clientId', 'name email company')
        .populate('userId', 'firstName lastName email businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalInvoices = await Invoice.countDocuments(query);
      const totalPages = Math.ceil(totalInvoices / limit);      // Calculate summary statistics - admin sees all, users see only their own
      const summaryStats = await Invoice.aggregate([
        { $match: user.role === 'admin' ? {} : { userId: user.id } },
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
        summary.total += stat.count;
        summary.totalAmount += stat.totalAmount;
        
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
        client: clientId,  // Map 'client' field to 'clientId'
        invoiceNumber: providedInvoiceNumber,
        issueDate,
        items,
        subtotal: providedSubtotal,
        taxTotal: providedTaxTotal,
        total: providedTotal,
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

      // Validate items and use provided amounts or calculate them
      let calculatedSubtotal = 0;
      const validatedItems = items.map(item => {
        if (!item.description || !item.quantity || !item.rate) {
          throw new Error('Each item must have description, quantity, and rate');
        }
        
        const amount = item.amount || (item.quantity * item.rate);
        calculatedSubtotal += amount;
        
        return {
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount
        };
      });

      // Use provided totals or calculated ones
      const subtotal = providedSubtotal || calculatedSubtotal;
      const taxTotal = providedTaxTotal || 0;
      const discountAmount = 0; // Not used in current implementation
      const total = providedTotal || (subtotal + taxTotal - discountAmount);      // Generate unique invoice number with retry mechanism
      let invoiceNumber = providedInvoiceNumber;
      
      if (!invoiceNumber) {
        const currentYear = new Date().getFullYear();
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          try {
            // Get the highest invoice number for this user and year
            const lastInvoice = await Invoice.findOne({
              userId: user.id,
              invoiceNumber: { $regex: `^INV-${currentYear}-` }
            }).sort({ invoiceNumber: -1 });
            
            let nextNumber = 1;
            if (lastInvoice) {
              const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]) || 0;
              nextNumber = lastNumber + 1;
            }
            
            invoiceNumber = `INV-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
            
            // Check if this invoice number already exists
            const existingInvoice = await Invoice.findOne({
              userId: user.id,
              invoiceNumber: invoiceNumber
            });
            
            if (!existingInvoice) {
              break; // Unique number found
            }
            
            attempts++;
          } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
              throw new Error('Unable to generate unique invoice number');
            }
          }
        }
        
        if (attempts >= maxAttempts) {
          throw new Error('Failed to generate unique invoice number after multiple attempts');
        }
      } else {
        // Check if provided invoice number already exists
        const existingInvoice = await Invoice.findOne({
          userId: user.id,
          invoiceNumber: providedInvoiceNumber
        });
        
        if (existingInvoice) {
          return NextResponse.json(
            { error: `Invoice number "${providedInvoiceNumber}" already exists. Please use a different number.` },
            { status: 400 }
          );
        }
      }

      // Create new invoice
      const newInvoice = new Invoice({
        userId: user.id,
        clientId,
        invoiceNumber,
        items: validatedItems,
        subtotal,
        taxTotal,
        discountAmount,
        total,
        status: 'draft',
        issueDate: issueDate ? new Date(issueDate) : new Date(),
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
      }, { status: 201 });    } catch (error) {
      console.error('Create invoice error:', error);
      
      // Handle specific MongoDB duplicate key error
      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyValue || {})[0];
        if (duplicateField === 'invoiceNumber') {
          return NextResponse.json(
            { error: `Invoice number "${error.keyValue.invoiceNumber}" already exists. Please try again with a different number.` },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: 'Duplicate entry detected. Please check your data and try again.' },
          { status: 400 }
        );
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return NextResponse.json(
          { error: `Validation failed: ${validationErrors.join(', ')}` },
          { status: 400 }
        );
      }
      
      // Handle general errors
      return NextResponse.json(
        { 
          error: error.message || 'Failed to create invoice. Please try again.',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      );
    }
  })(request);
}
