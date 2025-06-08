'use client';

import { useState, useRef } from 'react';
import { 
  Download,   FileText, 
  Printer, 
  Eye, 
  Settings,
  Palette,
  Layout,
  Type,
  Image as ImageIcon
} from 'lucide-react';

export default function InvoicePDFGenerator({ invoiceData, onDownload, onPreview }) {
  const [pdfSettings, setPdfSettings] = useState({
    template: 'modern',
    colorScheme: 'blue',
    fontSize: 'medium',
    showLogo: true,
    showWatermark: false,
    includeTerms: true,
    includeNotes: true,
    paperSize: 'A4',
    orientation: 'portrait'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef(null);

  // Mock invoice data if not provided
  const invoice = invoiceData || {
    id: 'INV-001',
    number: 'INV-001',
    date: '2025-01-10',
    dueDate: '2025-01-25',
    client: {
      name: 'Tech Solutions Inc.',
      email: 'contact@techsolutions.com',
      address: '123 Business Ave\nTech City, TC 12345\nIndia',
      phone: '+91 9876543210'
    },
    business: {
      name: 'Your Business Name',
      email: 'your@email.com',
      address: '456 Freelancer St\nWork City, WC 67890\nIndia',
      phone: '+91 9876543210',
      gst: '22AAAAA0000A1Z5',
      pan: 'ABCDE1234F'
    },
    items: [
      { description: 'Website Development', quantity: 1, rate: 50000, amount: 50000 },
      { description: 'Logo Design', quantity: 1, rate: 10000, amount: 10000 },
      { description: 'SEO Optimization', quantity: 1, rate: 15000, amount: 15000 }
    ],
    subtotal: 75000,
    tax: 13500,
    total: 88500,
    notes: 'Thank you for your business! Payment is due within 15 days.',
    terms: 'Payment terms: Net 15 days. Late payments may incur additional charges.'
  };

  const templates = [
    { id: 'modern', name: 'Modern', preview: '/templates/modern.png' },
    { id: 'classic', name: 'Classic', preview: '/templates/classic.png' },
    { id: 'minimal', name: 'Minimal', preview: '/templates/minimal.png' },
    { id: 'professional', name: 'Professional', preview: '/templates/professional.png' }
  ];

  const colorSchemes = [
    { id: 'blue', name: 'Blue', primary: '#3B82F6', secondary: '#EFF6FF' },
    { id: 'green', name: 'Green', primary: '#10B981', secondary: '#ECFDF5' },
    { id: 'purple', name: 'Purple', primary: '#8B5CF6', secondary: '#F3E8FF' },
    { id: 'gray', name: 'Gray', primary: '#6B7280', secondary: '#F9FAFB' },
    { id: 'red', name: 'Red', primary: '#EF4444', secondary: '#FEF2F2' }
  ];

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      // In a real application, you would use a library like jsPDF or Puppeteer
      // For now, we'll simulate the PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock PDF download
      const pdfBlob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(pdfSettings);
    }
  };

  const handlePrint = () => {
    if (previewRef.current) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .invoice-container { max-width: 800px; margin: 0 auto; }
              .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .business-info { text-align: right; }
              .invoice-title { font-size: 24px; font-weight: bold; color: ${colorSchemes.find(c => c.id === pdfSettings.colorScheme)?.primary || '#3B82F6'}; }
              .client-info { margin: 20px 0; }
              .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items-table th { background-color: ${colorSchemes.find(c => c.id === pdfSettings.colorScheme)?.secondary || '#EFF6FF'}; }
              .totals { text-align: right; margin-top: 20px; }
              .total-row { font-weight: bold; font-size: 18px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${previewRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">PDF Generator</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePreview}
              className="btn-secondary"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button
              onClick={handlePrint}
              className="btn-secondary"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* PDF Settings */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Layout className="h-4 w-4" />
                <span>Template</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setPdfSettings(prev => ({ ...prev, template: template.id }))}
                    className={`p-3 border rounded-lg transition-colors ${
                      pdfSettings.template === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-full h-16 bg-gray-100 dark:bg-slate-700 rounded mb-2 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Palette className="h-4 w-4" />
                <span>Color Scheme</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.id}
                    onClick={() => setPdfSettings(prev => ({ ...prev, colorScheme: scheme.id }))}
                    className={`p-2 border rounded-lg transition-colors ${
                      pdfSettings.colorScheme === scheme.id
                        ? 'border-gray-900 dark:border-white'
                        : 'border-gray-200 dark:border-slate-700'
                    }`}
                    title={scheme.name}
                  >
                    <div 
                      className="w-full h-6 rounded"
                      style={{ backgroundColor: scheme.primary }}
                    ></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Type className="h-4 w-4" />
                <span>Font Size</span>
              </label>
              <select
                value={pdfSettings.fontSize}
                onChange={(e) => setPdfSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                className="input-primary"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            {/* Options */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Settings className="h-4 w-4" />
                <span>Options</span>
              </label>
              <div className="space-y-3">
                {[
                  { key: 'showLogo', label: 'Show Business Logo' },
                  { key: 'showWatermark', label: 'Add Watermark' },
                  { key: 'includeTerms', label: 'Include Terms & Conditions' },
                  { key: 'includeNotes', label: 'Include Notes' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={pdfSettings[key]}
                      onChange={(e) => setPdfSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Paper Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paper Size
                </label>
                <select
                  value={pdfSettings.paperSize}
                  onChange={(e) => setPdfSettings(prev => ({ ...prev, paperSize: e.target.value }))}
                  className="input-primary"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Orientation
                </label>
                <select
                  value={pdfSettings.orientation}
                  onChange={(e) => setPdfSettings(prev => ({ ...prev, orientation: e.target.value }))}
                  className="input-primary"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>
          </div>

          {/* PDF Preview */}
          <div className="lg:col-span-2">
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-700 px-4 py-2 border-b border-gray-200 dark:border-slate-600">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preview - {invoice.number}.pdf
                </span>
              </div>
              
              <div ref={previewRef} className="p-8 bg-white dark:bg-slate-900 min-h-[600px]">
                {/* Invoice Preview Content */}
                <div className="invoice-container">
                  {/* Header */}
                  <div className="header flex justify-between items-start mb-8">
                    <div>
                      <h1 className="invoice-title text-2xl font-bold" style={{ color: colorSchemes.find(c => c.id === pdfSettings.colorScheme)?.primary }}>
                        INVOICE
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">#{invoice.number}</p>
                    </div>
                    <div className="business-info text-right">
                      {pdfSettings.showLogo && (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded mb-4 ml-auto flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <h2 className="font-bold text-gray-900 dark:text-white">{invoice.business.name}</h2>
                      <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                        {invoice.business.address}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.business.email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.business.phone}</p>
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Bill To:</h3>
                      <div className="text-gray-700 dark:text-gray-300">
                        <p className="font-medium">{invoice.client.name}</p>
                        <div className="text-sm whitespace-pre-line">{invoice.client.address}</div>
                        <p className="text-sm">{invoice.client.email}</p>
                        <p className="text-sm">{invoice.client.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Invoice Date:</span>
                          <span className="font-medium">{invoice.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Due Date:</span>
                          <span className="font-medium">{invoice.dueDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST Number:</span>
                          <span className="font-medium">{invoice.business.gst}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table className="items-table w-full border-collapse mb-6">
                    <thead>
                      <tr style={{ backgroundColor: colorSchemes.find(c => c.id === pdfSettings.colorScheme)?.secondary }}>
                        <th className="border border-gray-300 dark:border-slate-600 p-3 text-left">Description</th>
                        <th className="border border-gray-300 dark:border-slate-600 p-3 text-center">Qty</th>
                        <th className="border border-gray-300 dark:border-slate-600 p-3 text-right">Rate</th>
                        <th className="border border-gray-300 dark:border-slate-600 p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 dark:border-slate-600 p-3">{item.description}</td>
                          <td className="border border-gray-300 dark:border-slate-600 p-3 text-center">{item.quantity}</td>
                          <td className="border border-gray-300 dark:border-slate-600 p-3 text-right">₹{item.rate.toLocaleString()}</td>
                          <td className="border border-gray-300 dark:border-slate-600 p-3 text-right">₹{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="totals flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-slate-600">
                        <span>Subtotal:</span>
                        <span>₹{invoice.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-slate-600">
                        <span>GST (18%):</span>
                        <span>₹{invoice.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b-2 border-gray-900 dark:border-white font-bold text-lg total-row">
                        <span>Total:</span>
                        <span>₹{invoice.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes and Terms */}
                  {pdfSettings.includeNotes && invoice.notes && (
                    <div className="mt-8">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes:</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.notes}</p>
                    </div>
                  )}

                  {pdfSettings.includeTerms && invoice.terms && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Terms & Conditions:</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.terms}</p>
                    </div>
                  )}

                  {/* Watermark */}
                  {pdfSettings.showWatermark && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-6xl font-bold text-gray-200 dark:text-slate-700 transform rotate-45 opacity-10">
                        BillMeNow
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
