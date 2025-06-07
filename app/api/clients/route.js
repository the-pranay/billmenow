import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/database.js';
import Client from '../../lib/models/Client.js';
import { withAuth } from '../../lib/middleware.js';

// GET - Fetch all clients for the authenticated user
export async function GET(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page')) || 1;
      const limit = parseInt(searchParams.get('limit')) || 10;
      const search = searchParams.get('search') || '';
      const status = searchParams.get('status') || 'all';

      // Build query
      const query = { userId: user.id };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } }
        ];
      }

      if (status !== 'all') {
        query.status = status;
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const clients = await Client.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalClients = await Client.countDocuments(query);
      const totalPages = Math.ceil(totalClients / limit);

      return NextResponse.json({
        success: true,
        clients,
        pagination: {
          currentPage: page,
          totalPages,
          totalClients,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });

    } catch (error) {
      console.error('Get clients error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      );
    }
  })(request);
}

// POST - Create a new client
export async function POST(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const clientData = await request.json();
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
        notes
      } = clientData;

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

      // Check if client already exists for this user
      const existingClient = await Client.findOne({
        userId: user.id,
        email: email.toLowerCase()
      });

      if (existingClient) {
        return NextResponse.json(
          { error: 'Client with this email already exists' },
          { status: 409 }
        );
      }

      // Create new client
      const newClient = new Client({
        userId: user.id,
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
        status: 'active'
      });

      await newClient.save();

      return NextResponse.json({
        success: true,
        message: 'Client created successfully',
        client: newClient
      }, { status: 201 });    } catch (error) {
      console.error('Create client error:', error);
      
      // Provide more specific error messages based on error type
      if (error.code === 11000) {
        // MongoDB duplicate key error
        return NextResponse.json(
          { error: 'A client with this email already exists' },
          { status: 409 }
        );
      }
      
      if (error.name === 'ValidationError') {
        // Mongoose validation error
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return NextResponse.json(
          { error: `Validation error: ${validationErrors.join(', ')}` },
          { status: 400 }
        );
      }
      
      if (error.name === 'CastError') {
        // Invalid ObjectId or type casting error
        return NextResponse.json(
          { error: 'Invalid data format provided' },
          { status: 400 }
        );
      }
      
      // Database connection errors
      if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Database connection error. Please try again.' },
          { status: 503 }
        );
      }
      
      // Generic server error
      return NextResponse.json(
        { error: 'Internal server error. Please try again later.' },
        { status: 500 }
      );
    }
  })(request);
}
