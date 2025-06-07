import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/database.js';
import User from '../../../lib/models/User.js';
import Invoice from '../../../lib/models/Invoice.js';
import { withAuth } from '../../../lib/middleware.js';
import nodemailer from 'nodemailer';

// Mock email service - replace with actual email provider (SendGrid, Mailgun, etc.)
export async function POST(request) {
  return withAuth(async (request, user) => {
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
      }      // Email templates with placeholders
      const emailTemplates = {
        invoice: {
          subject: 'Invoice #{invoiceNumber} from {businessName}',
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Invoice #{invoiceNumber}</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <div style="display: inline-block; background: rgba(255,255,255,0.15); padding: 12px 20px; border-radius: 50px; margin-bottom: 20px;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">📄 Invoice</h1>
                  </div>
                  <h2 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">#{invoiceNumber}</h2>
                  <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">New invoice from {businessName}</p>
                </div>

                <!-- Content -->
                <div style="padding: 40px 30px;">
                  <p style="margin: 0 0 25px 0; font-size: 18px; color: #374151; line-height: 1.6;">
                    Hello <strong style="color: #1f2937;">{clientName}</strong>,
                  </p>
                  <p style="margin: 0 0 30px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
                    I hope this email finds you well. Please find your invoice #{invoiceNumber} for the services provided.
                  </p>

                  <!-- Invoice Card -->
                  <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 16px; padding: 25px; margin: 30px 0;">
                    <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600;">📋 Invoice Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Invoice Number:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">#{invoiceNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Amount:</td>
                        <td style="padding: 8px 0; color: #059669; font-weight: 700; font-size: 18px; text-align: right;">{amount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Due Date:</td>
                        <td style="padding: 8px 0; color: #dc2626; font-weight: 600; text-align: right;">{dueDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Description:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 500; text-align: right;">{description}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Payment Button -->
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="{paymentLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3); transition: all 0.3s ease;">
                      💳 Pay Invoice Securely
                    </a>
                  </div>

                  <!-- Payment Methods -->
                  <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid #a7f3d0;">
                    <h4 style="margin: 0 0 15px 0; color: #065f46; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                      🔒 Secure Payment Options Available
                    </h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                      <div style="display: flex; align-items: center; color: #047857; font-weight: 500;">
                        <span style="margin-right: 8px;">💳</span> Credit/Debit Cards
                      </div>
                      <div style="display: flex; align-items: center; color: #047857; font-weight: 500;">
                        <span style="margin-right: 8px;">📱</span> UPI Payments
                      </div>
                      <div style="display: flex; align-items: center; color: #047857; font-weight: 500;">
                        <span style="margin-right: 8px;">🏦</span> Net Banking
                      </div>
                      <div style="display: flex; align-items: center; color: #047857; font-weight: 500;">
                        <span style="margin-right: 8px;">💸</span> Bank Transfer
                      </div>
                    </div>
                  </div>

                  <!-- Footer Message -->
                  <div style="text-align: center; margin: 40px 0 20px 0;">
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      If you have any questions about this invoice, I'm here to help!
                    </p>
                    <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                      Thank you for your business! 🙏
                    </p>
                  </div>
                </div>

                <!-- Business Footer -->
                <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 5px 0; color: #1f2937; font-weight: 600; font-size: 16px;">{senderName}</p>
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-weight: 500;">{businessName}</p>
                  <p style="margin: 0; color: #9ca3af; font-size: 14px;">{contactDetails}</p>
                  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      Powered by BillMeNow • Secure payments by Razorpay
                    </p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
      },      reminder: {
        subject: 'Payment Reminder: Invoice #{invoiceNumber} - Due {dueDate}',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Reminder</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #fef3c7;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
                <div style="display: inline-block; background: rgba(255,255,255,0.15); padding: 12px 20px; border-radius: 50px; margin-bottom: 20px;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">⏰ Payment Reminder</h1>
                </div>
                <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Invoice #{invoiceNumber}</h2>
                <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Payment due reminder</p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px;">
                <p style="margin: 0 0 25px 0; font-size: 18px; color: #374151; line-height: 1.6;">
                  Hello <strong style="color: #1f2937;">{clientName}</strong>,
                </p>
                <p style="margin: 0 0 30px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
                  This is a friendly reminder that invoice #{invoiceNumber} is due for payment.
                </p>

                <!-- Invoice Card -->
                <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 16px; padding: 25px; margin: 30px 0;">
                  <h3 style="margin: 0 0 20px 0; color: #92400e; font-size: 20px; font-weight: 600;">⚠️ Invoice Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #92400e; font-weight: 500;">Invoice Number:</td>
                      <td style="padding: 8px 0; color: #92400e; font-weight: 600; text-align: right;">#{invoiceNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #92400e; font-weight: 500;">Amount:</td>
                      <td style="padding: 8px 0; color: #dc2626; font-weight: 700; font-size: 18px; text-align: right;">{amount}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #92400e; font-weight: 500;">Due Date:</td>
                      <td style="padding: 8px 0; color: #dc2626; font-weight: 600; text-align: right;">{dueDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #92400e; font-weight: 500;">Days Overdue:</td>
                      <td style="padding: 8px 0; color: #dc2626; font-weight: 700; text-align: right;">{daysOverdue}</td>
                    </tr>
                  </table>
                </div>

                <!-- Payment Button -->
                <div style="text-align: center; margin: 40px 0;">
                  <a href="{paymentLink}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3); transition: all 0.3s ease;">
                    💳 Pay Now
                  </a>
                </div>

                <p style="margin: 30px 0; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
                  If you've already made the payment, please disregard this reminder. If you have any questions or need to discuss payment terms, please feel free to contact me.
                </p>
                
                <div style="text-align: center; margin: 40px 0 20px 0;">
                  <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                    Thank you for your prompt attention! 🙏
                  </p>
                </div>
              </div>

              <!-- Business Footer -->
              <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 5px 0; color: #1f2937; font-weight: 600; font-size: 16px;">{senderName}</p>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-weight: 500;">{businessName}</p>
                <p style="margin: 0; color: #9ca3af; font-size: 14px;">{contactDetails}</p>
              </div>
            </div>
          </body>
          </html>
        `
      },      thankyou: {
        subject: 'Payment Received - Thank You! Invoice #{invoiceNumber}',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Received</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #ecfdf5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center;">
                <div style="display: inline-block; background: rgba(255,255,255,0.15); padding: 12px 20px; border-radius: 50px; margin-bottom: 20px;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">✅ Payment Received!</h1>
                </div>
                <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Thank You!</h2>
                <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Invoice #{invoiceNumber} has been paid</p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px;">
                <p style="margin: 0 0 25px 0; font-size: 18px; color: #374151; line-height: 1.6;">
                  Hello <strong style="color: #1f2937;">{clientName}</strong>,
                </p>
                <p style="margin: 0 0 30px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
                  Thank you for your payment! I'm writing to confirm that we have received your payment for invoice #{invoiceNumber}.
                </p>

                <!-- Payment Confirmation Card -->
                <div style="background: #ecfdf5; border: 2px solid #059669; border-radius: 16px; padding: 25px; margin: 30px 0;">
                  <h3 style="margin: 0 0 20px 0; color: #065f46; font-size: 20px; font-weight: 600;">💳 Payment Confirmation</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #047857; font-weight: 500;">Invoice Number:</td>
                      <td style="padding: 8px 0; color: #065f46; font-weight: 600; text-align: right;">#{invoiceNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #047857; font-weight: 500;">Amount Paid:</td>
                      <td style="padding: 8px 0; color: #059669; font-weight: 700; font-size: 18px; text-align: right;">{amount}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #047857; font-weight: 500;">Payment Date:</td>
                      <td style="padding: 8px 0; color: #065f46; font-weight: 600; text-align: right;">{paymentDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #047857; font-weight: 500;">Transaction ID:</td>
                      <td style="padding: 8px 0; color: #065f46; font-weight: 600; text-align: right; font-family: monospace;">{transactionId}</td>
                    </tr>
                  </table>
                </div>

                <!-- Success Message -->
                <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 16px; padding: 25px; margin: 30px 0; text-align: center;">
                  <h4 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">
                    🎉 Payment Processed Successfully
                  </h4>
                  <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                    Your invoice has been marked as paid in our system. A receipt is available for your records.
                  </p>
                </div>

                <div style="text-align: center; margin: 40px 0;">
                  <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    I appreciate your prompt payment and look forward to continuing our business relationship.
                  </p>
                  <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                    Thank you for choosing us! 🙏
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                    If you need any additional documentation or have questions, please don't hesitate to reach out.
                  </p>
                </div>
              </div>

              <!-- Business Footer -->
              <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 5px 0; color: #1f2937; font-weight: 600; font-size: 16px;">{senderName}</p>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-weight: 500;">{businessName}</p>
                <p style="margin: 0; color: #9ca3af; font-size: 14px;">{contactDetails}</p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Powered by BillMeNow • Secure payments by Razorpay
                  </p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      },      followup: {
        subject: 'Following Up: Invoice #{invoiceNumber} - {daysOverdue} Days Overdue',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice Follow-up</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #fef2f2;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
                <div style="display: inline-block; background: rgba(255,255,255,0.15); padding: 12px 20px; border-radius: 50px; margin-bottom: 20px;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">🔔 Invoice Follow-up</h1>
                </div>
                <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">#{invoiceNumber}</h2>
                <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">{daysOverdue} days overdue</p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 30px;">
                <p style="margin: 0 0 25px 0; font-size: 18px; color: #374151; line-height: 1.6;">
                  Hello <strong style="color: #1f2937;">{clientName}</strong>,
                </p>
                <p style="margin: 0 0 30px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
                  I hope this message finds you well. I'm following up regarding invoice #{invoiceNumber}, which is now {daysOverdue} days overdue.
                </p>

                <!-- Invoice Card -->
                <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 16px; padding: 25px; margin: 30px 0;">
                  <h3 style="margin: 0 0 20px 0; color: #991b1b; font-size: 20px; font-weight: 600;">⚠️ Outstanding Invoice</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #b91c1c; font-weight: 500;">Invoice Number:</td>
                      <td style="padding: 8px 0; color: #991b1b; font-weight: 600; text-align: right;">#{invoiceNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #b91c1c; font-weight: 500;">Original Amount:</td>
                      <td style="padding: 8px 0; color: #dc2626; font-weight: 700; font-size: 18px; text-align: right;">{amount}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #b91c1c; font-weight: 500;">Due Date:</td>
                      <td style="padding: 8px 0; color: #dc2626; font-weight: 600; text-align: right;">{dueDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #b91c1c; font-weight: 500;">Days Overdue:</td>
                      <td style="padding: 8px 0; color: #dc2626; font-weight: 700; text-align: right;">{daysOverdue}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #b91c1c; font-weight: 500;">Late Fee (if applicable):</td>
                      <td style="padding: 8px 0; color: #dc2626; font-weight: 600; text-align: right;">{lateFee}</td>
                    </tr>
                  </table>
                </div>

                <p style="margin: 30px 0; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
                  I understand that sometimes payments can be delayed due to various reasons. If you're experiencing any issues or need to discuss alternative payment arrangements, please let me know so we can work together to resolve this.
                </p>

                <!-- Payment Button -->
                <div style="text-align: center; margin: 40px 0;">
                  <a href="{paymentLink}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3); transition: all 0.3s ease;">
                    💳 Pay Outstanding Amount
                  </a>
                </div>

                <div style="text-align: center; margin: 40px 0 20px 0;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    I value our business relationship and would appreciate your prompt attention to this matter.
                  </p>
                  <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                    Please contact me at your earliest convenience to discuss this further.
                  </p>
                </div>
              </div>

              <!-- Business Footer -->
              <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 5px 0; color: #1f2937; font-weight: 600; font-size: 16px;">{senderName}</p>
                <p style="margin: 0 0 5px 0; color: #6b7280; font-weight: 500;">{businessName}</p>
                <p style="margin: 0; color: #9ca3af; font-size: 14px;">{contactDetails}</p>
              </div>
            </div>
          </body>
          </html>
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
    const transporter = nodemailer.createTransport({
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
      }
    });
  } catch (error) {
    console.error('Email sending error:', error);    return NextResponse.json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    }, { status: 500 });
  }
  })(request);
}
