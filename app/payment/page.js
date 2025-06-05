'use client';

import PaymentGateway from '../components/Payment/PaymentGateway';

export default function PaymentPage() {
  // In a real app, these would come from URL params or props
  const invoiceId = 'INV-001';
  const amount = 25000;
  const clientInfo = {
    name: 'Tech Solutions Inc.',
    email: 'contact@techsolutions.com'
  };

  return (
    <PaymentGateway 
      invoiceId={invoiceId}
      amount={amount}
      clientInfo={clientInfo}
    />
  );
}
