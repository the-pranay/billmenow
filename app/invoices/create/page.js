'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import withAuth from '../../components/Auth/withAuth';
import { useToast } from '../../components/Utilities/Toast';
import { clientsAPI, invoicesAPI } from '../../lib/api';
import jsPDF from 'jspdf';

function CreateInvoice() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [
      { description: '', quantity: 1, rate: 0, tax: 0, amount: 0 }
    ],
    notes: '',
    terms: 'Payment due within 30 days.',
    globalTax: 0,
    discount: 0
  });
  const [previewMode, setPreviewMode] = useState(false);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0, tax: 0, amount: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Calculate amount
    if (field === 'quantity' || field === 'rate' || field === 'tax') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      const tax = parseFloat(newItems[index].tax) || 0;
      newItems[index].amount = quantity * rate * (1 + tax / 100);
    }
    
    setFormData({ ...formData, items: newItems });
  };
  const selectClient = (client) => {
    setFormData({
      ...formData,
      clientId: client._id || client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: client.address
    });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateTax = () => {
    const itemTax = formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.rate * item.tax / 100);
    }, 0);
    const globalTax = calculateSubtotal() * formData.globalTax / 100;
    return itemTax + globalTax;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discount = subtotal * formData.discount / 100;
    return subtotal + tax - discount;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const toast = useToast();

  // Load clients from API
  useEffect(() => {
    loadClients();
  }, []);
  const loadClients = async () => {
    try {
      setIsLoadingClients(true);
      const data = await clientsAPI.getAll();
      
      if (data && data.success) {
        setClients(data.clients || []);
      } else {
        toast.error('Failed to load clients');
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setIsLoadingClients(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('INVOICE', 20, 30);
      
      // Add invoice number
      pdf.setFontSize(12);
      pdf.text(`Invoice Number: ${formData.invoiceNumber}`, 20, 45);
      pdf.text(`Issue Date: ${new Date(formData.issueDate).toLocaleDateString()}`, 20, 55);
      pdf.text(`Due Date: ${new Date(formData.dueDate).toLocaleDateString()}`, 20, 65);
      
      // Add client info
      pdf.setFontSize(14);
      pdf.text('Bill To:', 20, 85);
      pdf.setFontSize(12);
      pdf.text(formData.clientName, 20, 95);
      pdf.text(formData.clientEmail, 20, 105);
      
      // Add items
      pdf.setFontSize(14);
      pdf.text('Items:', 20, 125);
      
      let yPos = 140;
      formData.items.forEach((item, index) => {
        pdf.setFontSize(10);
        pdf.text(`${item.description} - Qty: ${item.quantity} x ₹${item.rate} = ₹${(item.quantity * item.rate).toLocaleString()}`, 20, yPos);
        yPos += 10;
      });
      
      // Add totals
      yPos += 10;
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();
      
      pdf.setFontSize(12);
      pdf.text(`Subtotal: ₹${subtotal.toLocaleString()}`, 20, yPos);
      pdf.text(`Tax: ₹${tax.toLocaleString()}`, 20, yPos + 10);
      pdf.text(`Total: ₹${total.toLocaleString()}`, 20, yPos + 20);
      
      // Save the PDF
      pdf.save(`${formData.invoiceNumber}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleSubmit = async (status = 'draft') => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {      // Validate required fields
      if (!formData.clientId) {
        toast.error('Please select a client');
        setIsSubmitting(false);
        return;
      }

      if (!formData.items.length || !formData.items[0].description) {
        toast.error('Please add at least one item');
        setIsSubmitting(false);
        return;
      }

      // Calculate totals
      const subtotal = calculateSubtotal();
      const taxAmount = calculateTax();
      const discountAmount = subtotal * formData.discount / 100;
      const total = subtotal + taxAmount - discountAmount;

      // Prepare invoice data
      const invoiceData = {
        clientId: formData.clientId,
        items: formData.items.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          rate: parseFloat(item.rate),
          amount: item.quantity * item.rate
        })),
        taxRate: formData.globalTax,
        discountRate: formData.discount,
        notes: formData.notes,
        dueDate: formData.dueDate,
        status: status
      };      // Save invoice
      const result = await invoicesAPI.create(invoiceData);

      if (result.success) {
          toast.success('Invoice created successfully!');
          
          // If sending invoice, also send email
          if (status === 'sent') {
            await sendInvoiceEmail(result.invoice);
          }
          
          // Redirect after a delay
          setTimeout(() => {
            router.push('/invoices');
          }, 1500);
        } else {
          toast.error(result.error || 'Failed to create invoice');
        }    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const sendInvoiceEmail = async (invoice) => {
    try {
      const emailData = {
        to: formData.clientEmail,
        subject: 'invoice',
        template: 'invoice',
        templateData: {
          clientName: formData.clientName,
          invoiceNumber: invoice.invoiceNumber,
          amount: `₹${invoice.total.toLocaleString('en-IN')}`,
          dueDate: new Date(invoice.dueDate).toLocaleDateString('en-IN'),
          description: invoice.items.map(item => item.description).join(', '),
          paymentLink: `${window.location.origin}/payment/${invoice._id}`,
          senderName: user?.firstName ? `${user.firstName} ${user.lastName}` : 'BillMeNow User',
          businessName: user?.businessName || 'BillMeNow',
          contactDetails: user?.email || 'contact@billmenow.com'
        },
        invoiceId: invoice._id
      };

      const emailResponse = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      const emailResult = await emailResponse.json();
        if (emailResult.success) {
        toast.success('Invoice sent to client via email!');
      } else {
        toast.warning('Invoice created but email failed to send');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.warning('Invoice created but email failed to send');
    }
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Preview Header */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => setPreviewMode(false)}
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Edit
            </button>
            <div className="flex space-x-3">              <button 
                onClick={downloadPDF}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Download PDF
              </button>
              <button 
                onClick={() => handleSubmit('sent')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Invoice
              </button>
            </div>
          </div>

          {/* Invoice Preview */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-slate-700">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-2xl">B</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">BillMeNow</h2>
                <p className="text-gray-600 dark:text-gray-400">Professional Invoicing Platform</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  123 Business Street<br />
                  Mumbai, Maharashtra 400001<br />
                  contact@billmenow.com
                </p>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">INVOICE</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{formData.invoiceNumber}</p>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>Issue Date: {new Date(formData.issueDate).toLocaleDateString()}</p>
                  <p>Due Date: {new Date(formData.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bill To:</h3>
                <div className="text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-white">{formData.clientName}</p>
                  <p>{formData.clientEmail}</p>
                  <p className="whitespace-pre-line">{formData.clientAddress}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-slate-600">
                    <th className="text-left py-3 text-gray-900 dark:text-white font-semibold">Description</th>
                    <th className="text-center py-3 text-gray-900 dark:text-white font-semibold">Qty</th>
                    <th className="text-right py-3 text-gray-900 dark:text-white font-semibold">Rate</th>
                    <th className="text-right py-3 text-gray-900 dark:text-white font-semibold">Tax</th>
                    <th className="text-right py-3 text-gray-900 dark:text-white font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-slate-700">
                      <td className="py-3 text-gray-900 dark:text-white">{item.description}</td>
                      <td className="py-3 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                      <td className="py-3 text-right text-gray-600 dark:text-gray-400">{formatCurrency(item.rate)}</td>
                      <td className="py-3 text-right text-gray-600 dark:text-gray-400">{item.tax}%</td>
                      <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 text-gray-600 dark:text-gray-400">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                {formData.discount > 0 && (
                  <div className="flex justify-between py-2 text-gray-600 dark:text-gray-400">
                    <span>Discount ({formData.discount}%):</span>
                    <span>-{formatCurrency(calculateSubtotal() * formData.discount / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-gray-600 dark:text-gray-400">
                  <span>Tax:</span>
                  <span>{formatCurrency(calculateTax())}</span>
                </div>
                <div className="flex justify-between py-3 text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-slate-600">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            {(formData.notes || formData.terms) && (
              <div className="border-t border-gray-200 dark:border-slate-600 pt-8">
                {formData.notes && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes:</h4>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{formData.notes}</p>
                  </div>
                )}
                {formData.terms && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Terms & Conditions:</h4>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{formData.terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Invoice</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Fill in the details below to create a professional invoice.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setPreviewMode(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                Preview
              </button>
              <button
                onClick={() => handleSubmit('draft')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSubmit('sent')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Invoice
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Details */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Client Selection */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Client Information</h2>
              
              {/* Quick Client Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Existing Client
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">                  {clients.map((client) => (
                    <button
                      key={client._id || client.id}
                      onClick={() => selectClient(client)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        formData.clientId === (client._id || client.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{client.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{client.email}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Client Entry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client Address
                  </label>
                  <textarea
                    value={formData.clientAddress}
                    onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Items & Services</h2>
                <button
                  onClick={addItem}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Service description"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rate
                      </label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tax %
                      </label>
                      <input
                        type="number"
                        value={item.tax}
                        onChange={(e) => updateItem(index, 'tax', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Options</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Global Tax (%)
                  </label>
                  <input
                    type="number"
                    value={formData.globalTax}
                    onChange={(e) => setFormData({ ...formData, globalTax: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional notes for the client..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Payment terms and conditions..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(calculateSubtotal())}</span>
                </div>
                
                {formData.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Discount ({formData.discount}%):</span>
                    <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(calculateSubtotal() * formData.discount / 100)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(calculateTax())}</span>
                </div>
                
                <hr className="border-gray-200 dark:border-slate-600" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-blue-600 dark:text-blue-400">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setPreviewMode(true)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Preview Invoice
                </button>
                <button
                  onClick={() => handleSubmit('draft')}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit('sent')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send to Client
                </button>
              </div>
            </div>
          </div>        </div>
      </div>
    </div>
  );
}

export default withAuth(CreateInvoice);
