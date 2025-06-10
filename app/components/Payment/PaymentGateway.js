'use client';

import { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Shield
} from 'lucide-react';
import { useToast } from '../Utilities/Toast';
import { ButtonLoading } from '../Utilities/Loading';

export default function PaymentGateway({ invoiceData, onPaymentSuccess }) {
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const [transactionId, setTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
    const toast = useToast();
  
  // Don't use fallback data - wait for real invoice data
  if (!invoiceData) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading payment information...</p>
      </div>
    );
  }
  const invoice = invoiceData;    const handleRazorpayPayment = async () => {
    // Prevent duplicate payments
    if (paymentStatus === 'success') {
      toast.warning('Payment has already been completed');
      return;
    }
    
    setPaymentStatus('processing');
    setIsProcessing(true);
    
    try {
      toast.info('Creating payment order...');
      
      // First test the environment and API connectivity
      console.log('🧪 Testing API connectivity...');
      const testResponse = await fetch('/api/payment/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: 'connectivity',
          invoiceId: invoice._id,
          amount: invoice.total
        })
      });
      
      const testData = await testResponse.json();
      console.log('🧪 Test API response:', testData);
      
      if (!testResponse.ok) {
        throw new Error(`Test API failed: ${testData.error || 'Unknown error'}`);
      }
        // If test works, proceed with actual payment
      console.log('✅ Test API working, proceeding with payment...');
      
      // Test the create-order route first
      console.log('🔍 Testing create-order route...');
      const testOrderResponse = await fetch('/api/payment/create-order-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'create-order-route' })
      });
      
      const testOrderData = await testOrderResponse.json();
      console.log('🔍 Create-order test response:', testOrderData);
        if (!testOrderResponse.ok) {
        throw new Error(`Create-order test failed: ${testOrderData.error || 'Route not found'}`);
      }
      
      // Create order through our API - handle both authenticated and public payments
      console.log('📝 Preparing order request with data:', {
        amount: invoice.total,
        currency: 'INR',
        invoiceId: invoice._id,
        clientInfo: {
          name: invoice.client?.name,
          email: invoice.client?.email
        }
      });

      // Add cache-busting timestamp to avoid 404 cache issues
      const timestamp = Date.now();
      const apiUrl = `/api/payment/create-order?t=${timestamp}`;
      console.log('🔗 Making request to URL:', apiUrl);

      const orderResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          // Include auth header if available (for authenticated users)
          ...(typeof window !== 'undefined' && localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        cache: 'no-cache',
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

      console.log('📡 Order API response status:', orderResponse.status);      console.log('📡 Order API response headers:', Object.fromEntries(orderResponse.headers.entries()));
      console.log('📡 Order API response ok:', orderResponse.ok);

      let orderData;

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('❌ Order API failed with status:', orderResponse.status);
        console.error('❌ Order API error response:', errorText);
        
        // If it's a 404, try one more time with a different URL format
        if (orderResponse.status === 404) {
          console.log('🔄 Retrying with absolute URL due to 404...');
          const retryUrl = `${window.location.origin}/api/payment/create-order?retry=${timestamp}`;
          
          const retryResponse = await fetch(retryUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
              ...(typeof window !== 'undefined' && localStorage.getItem('token') && {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              })
            },
            cache: 'no-cache',
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
          
          console.log('🔄 Retry response status:', retryResponse.status);
          
          if (retryResponse.ok) {
            console.log('✅ Retry succeeded');
            const retryData = await retryResponse.json();
            console.log('📋 Retry response data:', retryData);
            
            if (retryData.success) {
              // Continue with the retry data
              orderData = retryData;
            } else {
              throw new Error(retryData.error || 'Failed to create order after retry');
            }
          } else {
            const retryErrorText = await retryResponse.text();
            console.error('❌ Retry also failed:', retryErrorText);
            throw new Error(`API request failed: ${orderResponse.status} - ${errorText}. Retry failed: ${retryResponse.status} - ${retryErrorText}`);
          }
        } else {
          throw new Error(`API request failed: ${orderResponse.status} - ${errorText}`);
        }      } else {
        orderData = await orderResponse.json();
        console.log('📋 Order API response data:', orderData);
        
        if (!orderData.success) {
          throw new Error(orderData.error || 'Failed to create order');
        }
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
    } catch (error) {      console.error('Payment initiation error:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
      toast.error(`Payment failed: ${error.message}`);
    }
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
      {/* Razorpay Payment Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Details Section */}
        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Secure Payment</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Secure payment gateway powered by Razorpay. Supports all major credit/debit cards, net banking, UPI, and digital wallets.
            </p>            <button
              onClick={handleRazorpayPayment}
              disabled={isProcessing || paymentStatus === 'success'}
              className="w-full btn-primary"
            >
              {isProcessing ? (
                <ButtonLoading text="Processing..." />
              ) : paymentStatus === 'success' ? (
                "Payment Completed"
              ) : (
                `Pay ₹${invoice.total.toLocaleString()}`
              )}
            </button>
          </div>
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
