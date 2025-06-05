import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database';
import Client from '../../../lib/models/Client';
import Invoice from '../../../lib/models/Invoice';
import { withAuth } from '../../../lib/middleware';

// GET - Fetch a specific client
export async function GET(request, { params }) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { id } = params;

      const client = await Client.findOne({
        _id: id,
        userId: user.id
      }).lean();

      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }

      // Get client statistics
      const invoiceStats = await Invoice.aggregate([
        {
          $match: {
            clientId: client._id,
            userId: user.id
          }
        },
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalAmount: { $sum: '$total' },
            paidAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'paid'] },
                  '$total',
                  0
                ]
              }
            },
            pendingAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'pending'] },
                  '$total',
                  0
                ]
              }
            },
            overdueAmount: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'overdue'] },
                  '$total',
                  0
                ]
              }
            }
          }
        }
      ]);

      const stats = invoiceStats[0] || {
        totalInvoices: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueAmount: 0
      };

      return NextResponse.json({
        success: true,
        client: {
          ...client,
          stats
        }
      });

    } catch (error) {
      console.error('Get client error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch client' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT - Update a client
export async function PUT(request, { params }) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { id } = params;
      const updateData = await request.json();

      const {
        name,
        email,
        phone,
        company,
        address,
        city,
        state,
        zipCode,
        country,
        taxId,
        notes,
        status
      } = updateData;

      // Basic validation
      if (!name || !email) {
        return NextResponse.json(
          { error: 'Name and email are required' },
          { status: 400 }
        );
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Please provide a valid email address' },
          { status: 400 }
        );
      }

      // Check if client exists
      const client = await Client.findOne({
        _id: id,
        userId: user.id
      });

      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }

      // Check if email is already used by another client
      if (email.toLowerCase() !== client.email) {
        const existingClient = await Client.findOne({
          userId: user.id,
          email: email.toLowerCase(),
          _id: { $ne: id }
        });

        if (existingClient) {
          return NextResponse.json(
            { error: 'Another client with this email already exists' },
            { status: 409 }
          );
        }
      }

      // Update client
      const updatedClient = await Client.findByIdAndUpdate(
        id,
        {
          name,
          email: email.toLowerCase(),
          phone,
          company,
          address: {
            street: address,
            city,
            state,
            zipCode,
            country
          },
          taxId,
          notes,
          status,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      return NextResponse.json({
        success: true,
        message: 'Client updated successfully',
        client: updatedClient
      });

    } catch (error) {
      console.error('Update client error:', error);
      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE - Delete a client
export async function DELETE(request, { params }) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { id } = params;

      // Check if client exists
      const client = await Client.findOne({
        _id: id,
        userId: user.id
      });

      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }

      // Check if client has invoices
      const invoiceCount = await Invoice.countDocuments({
        clientId: id,
        userId: user.id
      });

      if (invoiceCount > 0) {
        return NextResponse.json(
          { error: 'Cannot delete client with existing invoices. Please delete all invoices first.' },
          { status: 400 }
        );
      }

      // Delete client
      await Client.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: 'Client deleted successfully'
      });

    } catch (error) {
      console.error('Delete client error:', error);
      return NextResponse.json(
        { error: 'Failed to delete client' },
        { status: 500 }
      );
    }
  })(request);
}
