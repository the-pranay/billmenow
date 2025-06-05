'use client';

import { useState } from 'react';
import { 
  Mail, 
  Send, 
  Eye, 
  Edit, 
  Copy, 
  Save, 
  RefreshCw, 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import withAuth from '../components/Auth/withAuth';
import { useToast } from '../components/Utilities/Toast';

function EmailTemplatesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTemplate, setActiveTemplate] = useState('invoice');
  const [isLoading, setIsLoading] = useState(false);
  const [emailContent, setEmailContent] = useState({
    invoice: {
      subject: 'Invoice #{invoiceNumber} from {businessName}',
      body: `Dear {clientName},

I hope this email finds you well. Please find attached invoice #{invoiceNumber} for the services provided.

Invoice Details:
• Invoice Number: #{invoiceNumber}
• Amount: {amount}
• Due Date: {dueDate}
• Description: {description}

You can view and pay this invoice online using the link below:
{paymentLink}

Payment Methods Available:
• Credit/Debit Cards via Razorpay
• UPI Payments (PhonePe, Paytm, GPay)
• Net Banking
• Direct Bank Transfer

If you have any questions about this invoice, please don't hesitate to reach out.

Thank you for your business!

Best regards,
{senderName}
{businessName}
{contactDetails}`
    },
    reminder: {
      subject: 'Payment Reminder: Invoice #{invoiceNumber} - Due {dueDate}',
      body: `Dear {clientName},

I hope you're doing well. This is a friendly reminder that invoice #{invoiceNumber} is due for payment.

Invoice Details:
• Invoice Number: #{invoiceNumber}
• Amount: {amount}
• Due Date: {dueDate}
• Days Overdue: {daysOverdue}

You can quickly pay this invoice online using the secure link below:
{paymentLink}

If you've already made the payment, please disregard this reminder. If you have any questions or need to discuss payment terms, please feel free to contact me.

Thank you for your prompt attention to this matter.

Best regards,
{senderName}
{businessName}
{contactDetails}`
    },
    thankyou: {
      subject: 'Payment Received - Thank You! Invoice #{invoiceNumber}',
      body: `Dear {clientName},

Thank you for your payment! I'm writing to confirm that we have received your payment for invoice #{invoiceNumber}.

Payment Details:
• Invoice Number: #{invoiceNumber}
• Amount Paid: {amount}
• Payment Date: {paymentDate}
• Transaction ID: {transactionId}

Your invoice has been marked as paid in our system. A receipt is attached for your records.

I appreciate your prompt payment and look forward to continuing our business relationship.

If you need any additional documentation or have questions, please don't hesitate to reach out.

Best regards,
{senderName}
{businessName}
{contactDetails}`
    },
    followup: {
      subject: 'Following Up: Invoice #{invoiceNumber} - {daysOverdue} Days Overdue',
      body: `Dear {clientName},

I hope this message finds you well. I'm following up regarding invoice #{invoiceNumber}, which is now {daysOverdue} days overdue.

Invoice Details:
• Invoice Number: #{invoiceNumber}
• Original Amount: {amount}
• Due Date: {dueDate}
• Days Overdue: {daysOverdue}
• Late Fee (if applicable): {lateFee}

I understand that sometimes payments can be delayed due to various reasons. If you're experiencing any issues or need to discuss alternative payment arrangements, please let me know so we can work together to resolve this.

You can still pay online using this secure link:
{paymentLink}

I value our business relationship and would appreciate your prompt attention to this matter.

Please contact me at your earliest convenience to discuss this further.

Best regards,
{senderName}
{businessName}
{contactDetails}`
    }
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('invoice');

  const templates = [
    { id: 'invoice', name: 'New Invoice', icon: Mail, color: 'text-blue-600' },
    { id: 'reminder', name: 'Payment Reminder', icon: Clock, color: 'text-yellow-600' },
    { id: 'thankyou', name: 'Payment Received', icon: CheckCircle, color: 'text-green-600' },
    { id: 'followup', name: 'Overdue Follow-up', icon: AlertCircle, color: 'text-red-600' }
  ];

  const placeholders = [
    '{clientName}', '{invoiceNumber}', '{amount}', '{dueDate}', 
    '{description}', '{paymentLink}', '{senderName}', '{businessName}',
    '{contactDetails}', '{daysOverdue}', '{paymentDate}', '{transactionId}', '{lateFee}'
  ];

  const handleTemplateChange = (field, value) => {
    setEmailContent(prev => ({
      ...prev,
      [activeTemplate]: {
        ...prev[activeTemplate],
        [field]: value
      }
    }));
  };

  const insertPlaceholder = (placeholder) => {
    const currentContent = emailContent[activeTemplate].body;
    const newContent = currentContent + placeholder;
    handleTemplateChange('body', newContent);
  };

  const previewEmail = () => {
    // Replace placeholders with sample data for preview
    const sampleData = {
      '{clientName}': 'John Smith',
      '{invoiceNumber}': 'INV-001',
      '{amount}': '₹25,000',
      '{dueDate}': '2025-01-15',
      '{description}': 'Website Development Services',
      '{paymentLink}': 'https://billmenow.com/pay/inv-001',
      '{senderName}': 'Your Name',
      '{businessName}': 'Your Business',
      '{contactDetails}': 'your@email.com | +91 9876543210',
      '{daysOverdue}': '5',
      '{paymentDate}': '2025-01-10',
      '{transactionId}': 'TXN123456789',
      '{lateFee}': '₹500'
    };

    let preview = emailContent[activeTemplate].body;
    Object.entries(sampleData).forEach(([placeholder, value]) => {
      preview = preview.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });    return preview;
  };

  const sendTestEmail = async () => {
    if (!user?.email) {
      toast.error('No email address found for testing');
      return;
    }

    setIsLoading(true);
    try {
      const sampleData = {
        clientName: 'John Smith (Test)',
        invoiceNumber: 'INV-TEST-001',
        amount: '₹25,000',
        dueDate: '2025-01-15',
        description: 'Website Development Services (Test)',
        paymentLink: 'https://billmenow.com/pay/test',
        senderName: user.name || 'Your Name',
        businessName: 'Your Business',
        contactDetails: `${user.email} | +91 9876543210`,
        daysOverdue: '5',
        paymentDate: '2025-01-10',
        transactionId: 'TXN123456789',
        lateFee: '₹500'
      };

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.email,
          subject: emailContent[activeTemplate].subject,
          template: activeTemplate,
          templateData: sampleData,
          type: 'test'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Test email sent to ${user.email}`);
      } else {
        throw new Error(result.message || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Test email error:', error);
      toast.error(`Failed to send test email: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplates = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would save to database
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Email templates saved successfully');
    } catch (error) {
      toast.error('Failed to save templates');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/settings"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Settings</span>
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Templates</h1>
            <div className="flex items-center space-x-4">              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="btn-secondary"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              <button 
                onClick={saveTemplates}
                disabled={isLoading}
                className="btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Template Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Email Templates</h2>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setActiveTemplate(template.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTemplate === template.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <template.icon className={`h-5 w-5 ${template.color}`} />
                      <span className="font-medium">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-secondary">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Template
                </button>
                <button className="w-full btn-secondary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Default
                </button>                <button 
                  onClick={sendTestEmail}
                  disabled={isLoading}
                  className="w-full btn-secondary"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              {!previewMode ? (
                <div className="p-6">                  <div className="flex items-center space-x-3 mb-6">
                    {(() => {
                      const template = templates.find(t => t.id === activeTemplate);
                      const IconComponent = template?.icon;
                      return IconComponent ? (
                        <IconComponent className={`h-6 w-6 ${template.color}`} />
                      ) : null;
                    })()}
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {templates.find(t => t.id === activeTemplate)?.name} Template
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Subject Line */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        value={emailContent[activeTemplate].subject}
                        onChange={(e) => handleTemplateChange('subject', e.target.value)}
                        className="input-primary"
                        placeholder="Enter email subject..."
                      />
                    </div>

                    {/* Email Body */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Body
                      </label>
                      <textarea
                        value={emailContent[activeTemplate].body}
                        onChange={(e) => handleTemplateChange('body', e.target.value)}
                        rows={16}
                        className="input-primary font-mono text-sm"
                        placeholder="Enter email content..."
                      />
                    </div>

                    {/* Placeholders */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Available Placeholders
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {placeholders.map((placeholder) => (
                          <button
                            key={placeholder}
                            onClick={() => insertPlaceholder(placeholder)}
                            className="text-left text-xs bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 px-3 py-2 rounded border font-mono text-gray-700 dark:text-gray-300 transition-colors"
                          >
                            {placeholder}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Click on any placeholder to insert it into your email template
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email Preview</h2>
                  </div>

                  {/* Email Header */}
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6 border border-gray-200 dark:border-slate-600">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">From:</span>
                        <p className="font-medium text-gray-900 dark:text-white">Your Business &lt;your@email.com&gt;</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">To:</span>
                        <p className="font-medium text-gray-900 dark:text-white">John Smith &lt;john@client.com&gt;</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Subject:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {emailContent[activeTemplate].subject.replace('{invoiceNumber}', 'INV-001').replace('{businessName}', 'Your Business')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email Body Preview */}
                  <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg p-6">
                    <div className="whitespace-pre-wrap text-gray-900 dark:text-white leading-relaxed">
                      {previewEmail()}
                    </div>
                  </div>

                  {/* Preview Actions */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      This is how your email will appear to clients
                    </div>
                    <div className="flex items-center space-x-3">                      <button 
                        onClick={sendTestEmail}
                        disabled={isLoading}
                        className="btn-secondary"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isLoading ? 'Sending...' : 'Send Test Email'}
                      </button>
                      <button className="btn-primary">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Template
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Template Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Email Template Tips</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-700 dark:text-blue-300">
            <div>
              <h4 className="font-medium mb-2">Best Practices:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Keep subject lines clear and descriptive</li>
                <li>Use a professional but friendly tone</li>
                <li>Include all necessary payment information</li>
                <li>Provide multiple payment options</li>
                <li>Include your contact information</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Available Placeholders:</h4>
              <p>
                Use placeholders like {'{clientName}'} and {'{amount}'} to automatically insert 
                invoice-specific information. Placeholders will be replaced with actual data 
                when emails are sent.
              </p>
            </div>
          </div>
        </div>      </div>
    </div>
  );
}

export default withAuth(EmailTemplatesPage);
