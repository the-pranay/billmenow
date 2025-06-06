import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database';
import Invoice from '../../../lib/models/Invoice';
import Client from '../../../lib/models/Client';
import Payment from '../../../lib/models/Payment';
import { withAuth } from '../../../lib/middleware';

// GET - Fetch a specific invoice
export async function GET(request, { params }) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { id } = params;

      const invoice = await Invoice.findOne({
        _id: id,
        userId: user.id
      }).populate('clientId', 'name email company address taxId').lean();

      if (!invoice) {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }

      // Get payment history
      const payments = await Payment.find({
        invoiceId: id,
        userId: user.id
      }).sort({ createdAt: -1 }).lean();

      return NextResponse.json({
        success: true,
        invoice: {
          ...invoice,
          payments
        }
      });

    } catch (error) {
      console.error('Get invoice error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoice' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT - Update an invoice
export async function PUT(request, { params }) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { id } = params;
      const updateData = await request.json();

      // Check if invoice exists
      const invoice = await Invoice.findOne({
        _id: id,
        userId: user.id
      });

      if (!invoice) {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }

      // Prevent editing paid invoices
      if (invoice.status === 'paid' && updateData.items) {
        return NextResponse.json(
          { error: 'Cannot edit items of a paid invoice' },
          { status: 400 }
        );
      }

      const {
        clientId,
        items,
        taxRate,
        discountRate,
        notes,
        dueDate,
        status,
        isRecurring,
        recurringConfig
      } = updateData;

      let updateFields = {
        notes,
        dueDate: dueDate ? new Date(dueDate) : invoice.dueDate,
        isRecurring,
        recurringConfig: isRecurring ? recurringConfig : undefined,
        updatedAt: new Date()
      };

      // Update status if provided
      if (status && ['pending', 'paid', 'overdue', 'cancelled'].includes(status)) {
        updateFields.status = status;
      }

      // If updating client, validate it exists
      if (clientId && clientId !== invoice.clientId.toString()) {
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
        updateFields.clientId = clientId;
      }

      // If updating items, recalculate totals
      if (items && items.length > 0) {
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

        const currentTaxRate = taxRate !== undefined ? taxRate : invoice.taxRate;
        const currentDiscountRate = discountRate !== undefined ? discountRate : invoice.discountRate;

        const taxAmount = subtotal * (currentTaxRate / 100);
        const discountAmount = subtotal * (currentDiscountRate / 100);
        const total = subtotal + taxAmount - discountAmount;

        updateFields = {
          ...updateFields,
          items: validatedItems,
          subtotal,
          taxRate: currentTaxRate,
          taxAmount,
          discountRate: currentDiscountRate,
          discountAmount,
          total
        };
      }

      // Update invoice
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        id,
        updateFields,
        { new: true, runValidators: true }
      ).populate('clientId', 'name email company address taxId');

      return NextResponse.json({
        success: true,
        message: 'Invoice updated successfully',
        invoice: updatedInvoice
      });

    } catch (error) {
      console.error('Update invoice error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update invoice' },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE - Delete an invoice
export async function DELETE(request, { params }) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { id } = params;

      // Check if invoice exists
      const invoice = await Invoice.findOne({
        _id: id,
        userId: user.id
      });

      if (!invoice) {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }

      // Prevent deleting paid invoices
      if (invoice.status === 'paid') {
        return NextResponse.json(
          { error: 'Cannot delete a paid invoice' },
          { status: 400 }
        );
      }

      // Check if there are payments associated
      const paymentCount = await Payment.countDocuments({
        invoiceId: id,
        userId: user.id
      });

      if (paymentCount > 0) {
        return NextResponse.json(
          { error: 'Cannot delete invoice with associated payments' },
          { status: 400 }
        );
      }

      // Delete invoice
      await Invoice.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: 'Invoice deleted successfully'
      });

    } catch (error) {
      console.error('Delete invoice error:', error);
      return NextResponse.json(
        { error: 'Failed to delete invoice' },
        { status: 500 }
      );
    }
  })(request);
}
