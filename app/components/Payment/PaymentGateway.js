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

export default function PaymentPage({ invoiceId, amount, clientInfo }) {
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const [upiId] = useState('freelancer@paytm'); // TODO: Make this configurable
  const [qrCode, setQrCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  
  const toast = useToast();

  // Mock invoice data
  const invoiceData = {
    id: invoiceId || 'INV-001',
    amount: amount || 25000,
    clientName: clientInfo?.name || 'Tech Solutions Inc.',
    clientEmail: clientInfo?.email || 'contact@techsolutions.com',
    description: 'Website Development Services - Phase 1',
    dueDate: '2024-01-15'
  };
  useEffect(() => {
    // Generate QR code for UPI payments
    if (paymentMethod === 'upi') {
      const upiUrl = `upi://pay?pa=${upiId}&pn=BillMeNow&am=${invoiceData.amount}&cu=INR&tn=Invoice-${invoiceData.id}`;
      setQrCode(upiUrl);
    }
  }, [paymentMethod, upiId, invoiceData.amount, invoiceData.id]);

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
  };const handleRazorpayPayment = async () => {
    setPaymentStatus('processing');
    setIsProcessing(true);
    
    try {
      toast.info('Creating payment order...');      // Create order through our API - handle both authenticated and public payments
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
          amount: invoiceData.amount,
          currency: 'INR',
          invoiceId: invoiceData.id,
          clientInfo: {
            name: invoiceData.clientName,
            email: invoiceData.clientEmail
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
        description: invoiceData.description,
        image: '/logo.png',
        order_id: orderData.order.id,
        handler: async function(response) {
          try {
            toast.info('Verifying payment...');            // Verify payment through our API - handle both authenticated and public payments
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
                invoiceId: invoiceData.id
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              setTransactionId(response.razorpay_payment_id);
              setPaymentStatus('success');
              setIsProcessing(false);
              toast.success('Payment completed successfully!');
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
          name: invoiceData.clientName,
          email: invoiceData.clientEmail,
          contact: '+919876543210'
        },
        notes: {
          invoice_id: invoiceData.id
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
  };  const handleUpiPayment = async () => {
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
          amount: invoiceData.amount,
          currency: 'INR',
          invoiceId: invoiceData.id,
          upiId: upiId,
          clientInfo: {
            name: invoiceData.clientName,
            email: invoiceData.clientEmail
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

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Thank you for your payment. Your invoice has been marked as paid.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{invoiceData.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Invoice ID</span>
              <span className="font-semibold text-gray-900 dark:text-white">{invoiceData.id}</span>
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
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 text-center">
          <div className="mb-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Failed</h1>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Payment</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Secure payment for Invoice {invoiceData.id}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Choose Payment Method</h2>

              {/* Payment Method Selection */}
              <div className="space-y-4 mb-8">
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
                        Direct transfer to bank account
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs text-gray-500 dark:text-gray-400">1-2 days</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Payment Details Based on Method */}
              {paymentMethod === 'razorpay' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-medium text-blue-800 dark:text-blue-200">Secure Payment</h3>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your payment is processed securely through Razorpay with bank-level encryption.
                    </p>
                  </div>                  <ButtonLoading
                    onClick={handleRazorpayPayment}
                    loading={isProcessing}
                    className="w-full btn-primary"
                  >
                    Pay ₹{invoiceData.amount.toLocaleString()}
                  </ButtonLoading>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="space-y-6">
                  {/* UPI ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pay to UPI ID
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={upiId}
                        readOnly
                        className="flex-1 input-primary bg-gray-50 dark:bg-slate-700"
                      />
                      <button
                        onClick={copyUpiId}
                        className="btn-secondary p-2"
                        title="Copy UPI ID"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>                  {/* QR Code */}
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                      {qrCode ? (                        <div className="text-center">
                          <Image 
                            src={`/api/qr-code?data=${encodeURIComponent(qrCode)}&size=128`}
                            alt="UPI Payment QR Code"
                            width={128}
                            height={128}
                            className="h-32 w-32 mx-auto border rounded"
                            onError={(e) => {
                              // Fallback to external service if our API fails
                              e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(qrCode)}`;
                            }}
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Scan with any UPI app
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Amount: ₹{invoiceData.amount.toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <QrCode className="h-32 w-32 text-gray-400 mx-auto animate-pulse" />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Generating QR code...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>                  <div className="grid grid-cols-1 gap-3">
                    <ButtonLoading
                      onClick={handleUpiPayment}
                      loading={isProcessing}
                      className="btn-primary w-full"
                    >
                      {isProcessing ? 'Waiting for Payment...' : `Pay ₹${invoiceData.amount.toLocaleString()} via UPI`}
                    </ButtonLoading>
                    
                    {isProcessing && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Waiting for payment confirmation
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Complete the payment in your UPI app. This page will update automatically.
                        </p>
                      </div>
                    )}

                    {qrCode && !isProcessing && (
                      <button 
                        onClick={() => window.open(qrCode, '_blank')}
                        className="btn-secondary w-full"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open UPI App
                      </button>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Bank Transfer Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Account Name:</span>
                        <span className="font-medium text-gray-900 dark:text-white">Freelancer Name</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Account Number:</span>
                        <span className="font-mono text-gray-900 dark:text-white">1234567890123456</span>
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
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Important Note</h3>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Please include Invoice ID &quot;{invoiceData.id}&quot; in the transfer description for faster processing.
                    </p>
                  </div>

                  <button className="w-full btn-secondary">
                    I&apos;ve Made the Transfer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Invoice ID</span>
                  <span className="font-medium text-gray-900 dark:text-white">{invoiceData.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Client</span>
                  <span className="font-medium text-gray-900 dark:text-white">{invoiceData.clientName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Due Date</span>
                  <span className="font-medium text-gray-900 dark:text-white">{invoiceData.dueDate}</span>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{(invoiceData.amount / 1.18).toFixed(0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600 dark:text-gray-400">GST (18%)</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{(invoiceData.amount - (invoiceData.amount / 1.18)).toFixed(0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{invoiceData.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Description:</strong> {invoiceData.description}
                </p>
              </div>
            </div>

            {/* Security Info */}
            <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h3 className="font-medium text-green-800 dark:text-green-200">Secure Payment</h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
