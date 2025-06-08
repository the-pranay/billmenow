import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import Invoice from '../../../lib/models/Invoice.js';
import { withAuth } from '../../../lib/middleware.js';

// GET - Generate next available invoice number for the authenticated user
export async function GET(request) {
  return withAuth(async (request, user) => {
    try {
      await connectToDatabase();

      const currentYear = new Date().getFullYear();
      
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
      
      const invoiceNumber = `INV-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
      
      // Verify this number doesn't exist (extra safety check)
      const existingInvoice = await Invoice.findOne({
        userId: user.id,
        invoiceNumber: invoiceNumber
      });
      
      if (existingInvoice) {
        // If collision, increment and try again
        nextNumber++;
        const fallbackNumber = `INV-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
        return NextResponse.json({
          success: true,
          invoiceNumber: fallbackNumber
        });
      }

      return NextResponse.json({
        success: true,
        invoiceNumber: invoiceNumber
      });

    } catch (error) {
      console.error('Generate invoice number error:', error);
      
      // Fallback generation
      const currentYear = new Date().getFullYear();
      const fallbackNumber = `INV-${currentYear}-${String(Date.now()).slice(-3)}`;
      
      return NextResponse.json({
        success: true,
        invoiceNumber: fallbackNumber,
        fallback: true
      });
    }
  })(request);
}
