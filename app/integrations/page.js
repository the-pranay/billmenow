'use client';

import { ArrowLeft, Zap, CreditCard, Smartphone, BarChart } from 'lucide-react';
import Link from 'next/link';

export default function IntegrationsPage() {
  const integrations = [
    {
      name: 'Razorpay',
      description: 'Secure payment processing for Indian businesses',
      icon: <CreditCard className="h-8 w-8" />,
      status: 'Active',
      category: 'Payments'
    },
    {
      name: 'WhatsApp Business',
      description: 'Send invoice notifications via WhatsApp',
      icon: <Smartphone className="h-8 w-8" />,
      status: 'Coming Soon',
      category: 'Communication'
    },
    {
      name: 'Google Sheets',
      description: 'Export invoice data to Google Sheets',
      icon: <BarChart className="h-8 w-8" />,
      status: 'Coming Soon',
      category: 'Analytics'
    },
    {
      name: 'Zapier',
      description: 'Connect with 3000+ apps via Zapier',
      icon: <Zap className="h-8 w-8" />,
      status: 'Coming Soon',
      category: 'Automation'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard"
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Integrations
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Integrations
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect BillMeNow with your favorite tools and streamline your workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-blue-600 dark:text-blue-400">
                  {integration.icon}
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    integration.status === 'Active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}
                >
                  {integration.status}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {integration.name}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {integration.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {integration.category}
                </span>
                <button
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    integration.status === 'Active'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={integration.status !== 'Active'}
                >
                  {integration.status === 'Active' ? 'Configure' : 'Coming Soon'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
