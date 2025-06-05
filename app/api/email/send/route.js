import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';
import Invoice from '../../../lib/models/Invoice.js';
import { withAuth } from '../../../lib/middleware.js';
import nodemailer from 'nodemailer';

// Mock email service - replace with actual email provider (SendGrid, Mailgun, etc.)
export const POST = withAuth(async (request, user) => {
  try {
    await connectToDatabase();

    const { to, subject, template, templateData, type, invoiceId } = await request.json();

      // Validate required fields
      if (!to || !subject || !template || !templateData) {
        return NextResponse.json({
          success: false,
          message: 'Missing required fields: to, subject, template, templateData'
        }, { status: 400 });
      }

      // Get user details for email templates
      const userData = await User.findById(user.id).select('firstName lastName businessName email').lean();
      
      // If invoice email, get invoice details
      let invoiceData = null;
      if (invoiceId) {
        invoiceData = await Invoice.findOne({
          _id: invoiceId,
          userId: user.id
        }).populate('clientId').lean();
      }

      // Email templates with placeholders
      const emailTemplates = {
        invoice: {
          subject: 'Invoice #{invoiceNumber} from {businessName}',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Invoice #{invoiceNumber}</h2>
              <p>Dear {clientName},</p>
              <p>Please find attached invoice #{invoiceNumber} for the services provided.</p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Invoice Details:</h3>
                <ul>
                  <li><strong>Invoice Number:</strong> #{invoiceNumber}</li>
                  <li><strong>Amount:</strong> {amount}</li>
                  <li><strong>Due Date:</strong> {dueDate}</li>
                <li><strong>Description:</strong> {description}</li>
              </ul>
            </div>

            <p>You can view and pay this invoice online using the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{paymentLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View & Pay Invoice
              </a>
            </div>

            <div style="margin: 30px 0; padding: 20px; background: #ecfdf5; border-radius: 8px;">
              <h4 style="color: #065f46; margin: 0 0 10px 0;">Payment Methods Available:</h4>
              <ul style="color: #047857; margin: 0;">
                <li>Credit/Debit Cards via Razorpay</li>
                <li>UPI Payments (PhonePe, Paytm, GPay)</li>
                <li>Net Banking</li>
                <li>Direct Bank Transfer</li>
              </ul>
            </div>

            <p>If you have any questions about this invoice, please don't hesitate to reach out.</p>
            <p>Thank you for your business!</p>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0;"><strong>{senderName}</strong></p>
              <p style="margin: 0; color: #6b7280;">{businessName}</p>
              <p style="margin: 0; color: #6b7280;">{contactDetails}</p>
            </div>
          </div>
        `
      },
      reminder: {
        subject: 'Payment Reminder: Invoice #{invoiceNumber} - Due {dueDate}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Payment Reminder</h2>
            <p>Dear {clientName},</p>
            <p>This is a friendly reminder that invoice #{invoiceNumber} is due for payment.</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e;">Invoice Details:</h3>
              <ul style="color: #92400e;">
                <li><strong>Invoice Number:</strong> #{invoiceNumber}</li>
                <li><strong>Amount:</strong> {amount}</li>
                <li><strong>Due Date:</strong> {dueDate}</li>
                <li><strong>Days Overdue:</strong> {daysOverdue}</li>
              </ul>
            </div>

            <p>You can quickly pay this invoice online using the secure link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{paymentLink}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Pay Now
              </a>
            </div>

            <p>If you've already made the payment, please disregard this reminder. If you have any questions or need to discuss payment terms, please feel free to contact me.</p>
            <p>Thank you for your prompt attention to this matter.</p>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0;"><strong>{senderName}</strong></p>
              <p style="margin: 0; color: #6b7280;">{businessName}</p>
              <p style="margin: 0; color: #6b7280;">{contactDetails}</p>
            </div>
          </div>
        `
      },
      thankyou: {
        subject: 'Payment Received - Thank You! Invoice #{invoiceNumber}',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Payment Received!</h2>
            <p>Dear {clientName},</p>
            <p>Thank you for your payment! I'm writing to confirm that we have received your payment for invoice #{invoiceNumber}.</p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #065f46;">Payment Details:</h3>
              <ul style="color: #047857;">
                <li><strong>Invoice Number:</strong> #{invoiceNumber}</li>
                <li><strong>Amount Paid:</strong> {amount}</li>
                <li><strong>Payment Date:</strong> {paymentDate}</li>
                <li><strong>Transaction ID:</strong> {transactionId}</li>
              </ul>
            </div>

            <p>Your invoice has been marked as paid in our system. A receipt is attached for your records.</p>
            <p>I appreciate your prompt payment and look forward to continuing our business relationship.</p>
            <p>If you need any additional documentation or have questions, please don't hesitate to reach out.</p>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0;"><strong>{senderName}</strong></p>
              <p style="margin: 0; color: #6b7280;">{businessName}</p>
              <p style="margin: 0; color: #6b7280;">{contactDetails}</p>
            </div>
          </div>
        `
      },
      followup: {
        subject: 'Following Up: Invoice #{invoiceNumber} - {daysOverdue} Days Overdue',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Invoice Follow-up</h2>
            <p>Dear {clientName},</p>
            <p>I hope this message finds you well. I'm following up regarding invoice #{invoiceNumber}, which is now {daysOverdue} days overdue.</p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #991b1b;">Invoice Details:</h3>
              <ul style="color: #b91c1c;">
                <li><strong>Invoice Number:</strong> #{invoiceNumber}</li>
                <li><strong>Original Amount:</strong> {amount}</li>
                <li><strong>Due Date:</strong> {dueDate}</li>
                <li><strong>Days Overdue:</strong> {daysOverdue}</li>
                <li><strong>Late Fee (if applicable):</strong> {lateFee}</li>
              </ul>
            </div>

            <p>I understand that sometimes payments can be delayed due to various reasons. If you're experiencing any issues or need to discuss alternative payment arrangements, please let me know so we can work together to resolve this.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="{paymentLink}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Pay Outstanding Amount
              </a>
            </div>

            <p>I value our business relationship and would appreciate your prompt attention to this matter.</p>
            <p>Please contact me at your earliest convenience to discuss this further.</p>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0;"><strong>{senderName}</strong></p>
              <p style="margin: 0; color: #6b7280;">{businessName}</p>
              <p style="margin: 0; color: #6b7280;">{contactDetails}</p>
            </div>
          </div>
        `
      }
    };

    // Get the email template
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      return NextResponse.json({
        success: false,
        message: `Invalid template: ${template}`
      }, { status: 400 });
    }

    // Replace placeholders in subject and content
    let emailSubject = emailTemplate.subject;
    let emailContent = emailTemplate.html;

    Object.entries(templateData).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      emailSubject = emailSubject.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      emailContent = emailContent.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });    // Create transporter for nodemailer
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (error) {
      console.error('SMTP configuration error:', error);
      // Fall back to mock mode if SMTP is not configured
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('📧 SMTP not configured, using mock mode');
        console.log('📧 Email would be sent:', {
          to,
          subject: emailSubject,
          template,
          timestamp: new Date().toISOString()
        });

        return NextResponse.json({
          success: true,
          message: 'Email sent successfully (mock mode)',
          data: {
            to,
            subject: emailSubject,
            template,
            sentAt: new Date().toISOString(),
            mode: 'mock'
          }
        });
      }
      throw error;
    }

    // Send email using nodemailer
    const mailOptions = {
      from: {
        name: userData.businessName || `${userData.firstName} ${userData.lastName}`,
        address: process.env.FROM_EMAIL || process.env.SMTP_USER
      },
      to: to,
      subject: emailSubject,
      html: emailContent,
      // Add reply-to if different from sender
      replyTo: userData.email
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', info.messageId);    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: {
        to,
        subject: emailSubject,
        template,
        sentAt: new Date().toISOString(),
        messageId: info.messageId
      }    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    }, { status: 500 });
  }
});
