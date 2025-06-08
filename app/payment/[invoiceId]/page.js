'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import PaymentGateway from '../../components/Payment/PaymentGateway';
import { LoadingSpinner } from '../../components/Utilities/Loading';
import { CheckCircle, XCircle, FileText, User, Mail, Building, CreditCard } from 'lucide-react';

export default function InvoicePaymentPage() {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  
  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch invoice without authentication (public access)
      const response = await fetch(`/api/invoices/public/${invoiceId}`);
      const data = await response.json();

      if (data.success) {
        setInvoice(data.invoice);
        setIsPaid(data.invoice.paymentStatus === 'paid');
      } else {
        setError(data.error || 'Invoice not found');
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError('Failed to load invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId, fetchInvoice]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="max-w-md mx-auto text-center p-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invoice Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isPaid || (invoice && invoice.remainingBalance <= 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="max-w-md mx-auto text-center p-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Complete</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This invoice has already been paid.
          </p>          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Invoice #{invoice.invoiceNumber}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(invoice.total)}</p>
            <p className="text-sm text-green-600 dark:text-green-400">
              Paid: {formatCurrency(invoice.totalPaid)}
              {invoice.payments && invoice.payments.length > 0 && (
                ` on ${formatDate(invoice.payments[0].createdAt)}`
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Pay Invoice
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Secure payment for Invoice #{invoice.invoiceNumber}
          </p>
        </div>        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Invoice Details */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Invoice Details
            </h2>

            <div className="space-y-4">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-gray-200 dark:border-slate-700 pb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Invoice #{invoice.invoiceNumber}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Issue Date: {formatDate(invoice.issueDate)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Due Date: {formatDate(invoice.dueDate)}
                  </p>
                </div>                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(invoice.total)}
                  </p>
                  {invoice.totalPaid > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Paid: {formatCurrency(invoice.totalPaid)}
                    </p>
                  )}
                  {invoice.remainingBalance > 0 && (
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      {invoice.paymentStatus === 'unpaid' ? 'Pending Payment' : 
                       invoice.paymentStatus === 'partial' ? `Remaining: ${formatCurrency(invoice.remainingBalance)}` :
                       invoice.status === 'overdue' ? 'Overdue' : 'Pending Payment'}
                    </p>
                  )}
                </div>
              </div>              {/* Client Information */}
              {invoice.client && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Bill To
                  </h4>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 space-y-1">
                    <p className="font-medium text-gray-900 dark:text-white">{invoice.client.name}</p>
                    {invoice.client.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {invoice.client.email}
                      </p>
                    )}
                    {invoice.client.company && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <Building className="w-3 h-3 mr-1" />
                        {invoice.client.company}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Line Items */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Items</h4>
                <div className="space-y-2">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-600 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.description}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.quantity} × {formatCurrency(item.rate)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax ({invoice.taxRate}%)</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(invoice.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-slate-700 pt-2">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(invoice.total)}</span>
                </div>
                {invoice.totalPaid > 0 && (
                  <>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Amount Paid</span>
                      <span>-{formatCurrency(invoice.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold text-orange-600 dark:text-orange-400 border-t border-gray-200 dark:border-slate-700 pt-2">
                      <span>Remaining Balance</span>
                      <span>{formatCurrency(invoice.remainingBalance)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Payment History */}
              {invoice.payments && invoice.payments.length > 0 && (
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payment History</h4>
                  <div className="space-y-2">
                    {invoice.payments.filter(payment => payment.status === 'paid').map((payment, index) => (
                      <div key={index} className="flex justify-between items-center py-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatDate(payment.createdAt)}
                          </span>
                          {payment.transactionId && (
                            <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                              #{payment.transactionId}
                            </span>
                          )}
                        </div>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Gateway */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Make Payment
            </h2>            <PaymentGateway 
              invoiceData={invoice}
              onPaymentSuccess={() => {
                setIsPaid(true);
                // Optionally refresh the invoice data
                fetchInvoice();
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by BillMeNow • Secure payments processed by Razorpay</p>
          <p className="mt-1">🔒 Your payment information is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
}
