'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  CheckCircle, 
  XCircle, 
  Copy, 
  ExternalLink,
  QrCode,
  AlertCircle,
  Shield,
  Zap
} from 'lucide-react';
import { useToast } from '../Utilities/Toast';
import { ButtonLoading } from '../Utilities/Loading';

export default function PaymentGateway({ invoiceData, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const [upiId] = useState('freelancer@paytm'); // TODO: Make this configurable
  const [qrCode, setQrCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  
  const toast = useToast();
  
  // Use real invoice data passed as props
  const invoice = invoiceData || {
    _id: 'default',
    total: 25000,
    remainingBalance: 25000,
    client: { name: 'Default Client', email: 'client@example.com' },
    invoiceNumber: 'INV-001',
    items: []
  };

  // Calculate payment amount (remaining balance if partially paid, otherwise total)
  const paymentAmount = invoice.remainingBalance > 0 ? invoice.remainingBalance : invoice.total;

  useEffect(() => {
    // Generate QR code for UPI payments
    if (paymentMethod === 'upi') {
      const upiUrl = `upi://pay?pa=${upiId}&pn=BillMeNow&am=${invoice.total}&cu=INR&tn=Invoice-${invoice.invoiceNumber}`;
      setQrCode(upiUrl);
    }
  }, [paymentMethod, upiId, invoice.total, invoice.invoiceNumber]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Poll payment status for UPI and bank transfers
  const startStatusPolling = (paymentId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/status/${paymentId}`, {
          headers: {
            ...(typeof window !== 'undefined' && localStorage.getItem('token') && {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
          }
        });
        
        const data = await response.json();
        
        if (data.success && data.status === 'completed') {
          setPaymentStatus('success');
          setTransactionId(data.transactionId);
          setIsProcessing(false);
          clearInterval(interval);
          toast.success('Payment completed successfully!');
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
        } else if (data.status === 'failed') {
          setPaymentStatus('failed');
          setIsProcessing(false);
          clearInterval(interval);
          toast.error('Payment failed. Please try again.');
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);
    
    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (paymentStatus === 'processing') {
        setPaymentStatus('pending');
        setIsProcessing(false);
        toast.warning('Payment verification timed out. Please check your payment status.');
      }
    }, 600000);
  };

  const handleRazorpayPayment = async () => {
    setPaymentStatus('processing');
    setIsProcessing(true);
    
    try {
      toast.info('Creating payment order...');
      
      // Create order through our API - handle both authenticated and public payments
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include auth header if available (for authenticated users)
          ...(typeof window !== 'undefined' && localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({
          amount: invoice.total,
          currency: 'INR',
          invoiceId: invoice._id,
          clientInfo: {
            name: invoice.client?.name,
            email: invoice.client?.email
          }
        })
      });

      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      toast.success('Payment order created successfully');
      
      const options = {
        key: orderData.keyId, // Razorpay Key ID from backend
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'BillMeNow',
        description: `Payment for ${invoice.invoiceNumber}`,
        image: '/logo.png',
        order_id: orderData.order.id,
        handler: async function(response) {
          try {
            toast.info('Verifying payment...');
            
            // Verify payment through our API - handle both authenticated and public payments
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // Include auth header if available (for authenticated users)
                ...(typeof window !== 'undefined' && localStorage.getItem('token') && {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                })
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                invoiceId: invoice._id
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              setTransactionId(response.razorpay_payment_id);
              setPaymentStatus('success');
              setIsProcessing(false);
              toast.success('Payment completed successfully!');
              if (onPaymentSuccess) {
                onPaymentSuccess();
              }
              console.log('Payment verified successfully:', verifyData);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentStatus('failed');
            setIsProcessing(false);
            toast.error(`Payment verification failed: ${error.message}`);
          }
        },
        prefill: {
          name: invoice.client?.name,
          email: invoice.client?.email,
          contact: '+919876543210'
        },
        notes: {
          invoice_id: invoice._id
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setPaymentStatus('pending');
            setIsProcessing(false);
            toast.warning('Payment cancelled');
          }
        }
      };

      // Load Razorpay script and open payment modal
      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Load Razorpay script dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        script.onerror = () => {
          throw new Error('Failed to load Razorpay SDK');
        };
        document.body.appendChild(script);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
      toast.error(`Payment failed: ${error.message}`);
    }
  };

  const handleUpiPayment = async () => {
    setPaymentStatus('processing');
    setIsProcessing(true);
    toast.info('Processing UPI payment...');
    
    try {
      // Create UPI payment order
      const orderResponse = await fetch('/api/payment/create-upi-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({
          amount: invoice.total,
          currency: 'INR',
          invoiceId: invoice._id,
          upiId: upiId,
          clientInfo: {
            name: invoice.client?.name,
            email: invoice.client?.email
          }
        })
      });

      const orderData = await orderResponse.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create UPI order');
      }

      // Start polling for payment status
      startStatusPolling(orderData.paymentId);
      
      // Try to open UPI app
      if (qrCode && /Android|iPhone/i.test(navigator.userAgent)) {
        window.location.href = qrCode;
      }
      
      toast.success('UPI payment initiated. Please complete the payment in your UPI app.');
      
    } catch (error) {
      console.error('UPI payment error:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
      toast.error(`UPI payment failed: ${error.message}`);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to clipboard');
  };

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transactionId);
    toast.success('Transaction ID copied to clipboard');
  };

  // Success state
  if (paymentStatus === 'success') {
    return (
      <div className="text-center space-y-6">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Thank you for your payment. Your invoice has been marked as paid.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</span>
            <span className="font-semibold text-gray-900 dark:text-white">₹{invoice.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Invoice ID</span>
            <span className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm text-gray-900 dark:text-white">{transactionId}</span>
              <button
                onClick={copyTransactionId}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full btn-primary">
            Download Receipt
          </button>
          <button className="w-full btn-secondary">
            View Invoice
          </button>
        </div>
      </div>
    );
  }

  // Failed state
  if (paymentStatus === 'failed') {
    return (
      <div className="text-center space-y-6">
        <div className="mb-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Failed</h2>
          <p className="text-gray-600 dark:text-gray-300">
            We couldn&apos;t process your payment. Please try again or contact support.
          </p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => setPaymentStatus('pending')}
            className="w-full btn-primary"
          >
            Try Again
          </button>
          <button className="w-full btn-secondary">
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  // Main payment interface
  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Choose Payment Method</h3>
        <div className="space-y-3">
          <button
            onClick={() => setPaymentMethod('razorpay')}
            className={`w-full p-4 border rounded-lg transition-colors ${
              paymentMethod === 'razorpay'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center space-x-4">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Card Payment</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Credit/Debit Cards, Net Banking, Wallets via Razorpay
                </p>
              </div>
              <div className="ml-auto flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">Secure</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('upi')}
            className={`w-full p-4 border rounded-lg transition-colors ${
              paymentMethod === 'upi'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center space-x-4">
              <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">UPI Payment</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  PhonePe, Google Pay, Paytm, BHIM & other UPI apps
                </p>
              </div>
              <div className="ml-auto flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">Instant</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('bank')}
            className={`w-full p-4 border rounded-lg transition-colors ${
              paymentMethod === 'bank'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center space-x-4">
              <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Bank Transfer</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Direct bank transfer via NEFT/RTGS/IMPS
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Payment Method Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Details Section */}
        <div className="space-y-4">
          {paymentMethod === 'razorpay' && (
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Card Payment</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Secure payment gateway powered by Razorpay. Supports all major credit/debit cards, net banking, and digital wallets.
              </p>
              <button
                onClick={handleRazorpayPayment}
                disabled={isProcessing}
                className="w-full btn-primary"
              >
                {isProcessing ? (
                  <ButtonLoading text="Processing..." />
                ) : (
                  `Pay ₹${invoice.total.toLocaleString()}`
                )}
              </button>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">UPI Payment</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pay using UPI ID:</p>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-slate-700 rounded border">
                    <span className="font-mono text-sm flex-1 text-gray-900 dark:text-white">{upiId}</span>
                    <button
                      onClick={copyUpiId}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {qrCode && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Or scan QR code:</p>
                    <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                      <QrCode className="h-32 w-32 text-gray-800" />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleUpiPayment}
                  disabled={isProcessing}
                  className="w-full btn-primary"
                >
                  {isProcessing ? (
                    <ButtonLoading text="Processing..." />
                  ) : (
                    `Pay ₹${invoice.total.toLocaleString()} via UPI`
                  )}
                </button>
              </div>
            </div>
          )}

          {paymentMethod === 'bank' && (
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Bank Transfer Details</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-slate-700 rounded p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Account Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">BillMeNow Services</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Account Number:</span>
                    <span className="font-mono text-gray-900 dark:text-white">123456789012</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">IFSC Code:</span>
                    <span className="font-mono text-gray-900 dark:text-white">SBIN0001234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Bank Name:</span>
                    <span className="text-gray-900 dark:text-white">State Bank of India</span>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Important Note</h3>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Please include Invoice ID &quot;{invoice.invoiceNumber}&quot; in the transfer description for faster processing.
                  </p>
                </div>

                <button className="w-full btn-secondary">
                  I&apos;ve Made the Transfer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Invoice ID</span>
              <span className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Client</span>
              <span className="font-medium text-gray-900 dark:text-white">{invoice.client?.name || 'Client'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Due Date</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : 'N/A'}
              </span>
            </div>
            
            <div className="border-t border-gray-200 dark:border-slate-600 pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{(invoice.subtotal || invoice.total).toLocaleString()}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax ({invoice.taxRate}%)</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{invoice.tax.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-slate-600 pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{invoice.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white dark:bg-slate-600 rounded border">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Description:</strong> {invoice.items?.map(item => item.description).join(', ') || 'Invoice payment'}
            </p>
          </div>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          <h3 className="font-medium text-green-800 dark:text-green-200">Secure Payment</h3>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300">
          Your payment information is encrypted and secure. We never store your card details.
        </p>
      </div>
    </div>
  );
}
