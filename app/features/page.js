'use client'

import { Check, Zap, Shield, Clock, Users, BarChart3, Mail, Globe, Smartphone, Database, CreditCard, FileText } from 'lucide-react'

export default function FeaturesPage() {
  const mainFeatures = [
    {
      icon: FileText,
      title: 'Professional Invoicing',
      description: 'Create beautiful, professional invoices with customizable templates and branding.',
      features: [
        'Custom invoice templates',
        'Auto-numbering',
        'Multiple currencies',
        'Tax calculations',
        'Recurring invoices'
      ]
    },
    {
      icon: CreditCard,
      title: 'Payment Processing',
      description: 'Accept payments online with integrated payment gateways and get paid faster.',
      features: [
        'Multiple payment methods',
        'Secure payment processing',
        'Payment reminders',
        'Partial payments',
        'Payment tracking'
      ]
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Organize and manage your clients with a comprehensive CRM system.',
      features: [
        'Client profiles',
        'Contact management',
        'Project tracking',
        'Communication history',
        'Client portal access'
      ]
    },
    {
      icon: BarChart3,
      title: 'Business Analytics',
      description: 'Get insights into your business performance with detailed reports and analytics.',
      features: [
        'Revenue tracking',
        'Payment analytics',
        'Client insights',
        'Tax reports',
        'Custom dashboards'
      ]
    },
    {
      icon: Mail,
      title: 'Email Integration',
      description: 'Send invoices and follow-ups directly from the platform with email automation.',
      features: [
        'Automated reminders',
        'Email templates',
        'Delivery tracking',
        'Custom email domains',
        'SMTP integration'
      ]
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Access your invoices and manage your business from anywhere, on any device.',
      features: [
        'Responsive design',
        'Mobile app',
        'Offline access',
        'Touch-friendly interface',
        'Real-time sync'
      ]
    }
  ]

  const additionalFeatures = [
    { icon: Shield, title: 'Bank-level Security', description: 'SOC 2 Type II compliant with 256-bit encryption' },
    { icon: Clock, title: 'Time Tracking', description: 'Track billable hours and convert to invoices instantly' },
    { icon: Globe, title: 'Multi-language', description: 'Support for 15+ languages and local currencies' },
    { icon: Database, title: 'Data Export', description: 'Export your data anytime in multiple formats' },
    { icon: Zap, title: 'API Access', description: 'Integrate with your favorite tools via REST API' },
    { icon: Users, title: 'Team Collaboration', description: 'Invite team members and manage permissions' }
  ]

  const integrations = [
    { name: 'Razorpay', logo: '🏦', category: 'Payments' },
    { name: 'WhatsApp', logo: '💬', category: 'Communication' },
    { name: 'Google Sheets', logo: '📊', category: 'Productivity' },
    { name: 'Zapier', logo: '⚡', category: 'Automation' },
    { name: 'Slack', logo: '💼', category: 'Communication' },
    { name: 'QuickBooks', logo: '📚', category: 'Accounting' },
    { name: 'Stripe', logo: '💳', category: 'Payments' },
    { name: 'PayPal', logo: '🅿️', category: 'Payments' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything you need to
              <span className="text-blue-600 dark:text-blue-400"> manage your business</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              BillMeNow provides all the tools you need to create invoices, track payments, manage clients, and grow your business - all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Start Free Trial
              </button>
              <button className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Core Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Powerful features designed to streamline your business operations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {mainFeatures.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start mb-6">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mr-4">
                  <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
              
              <ul className="space-y-3">
                {feature.features.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Features */}
      <div className="bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Additional Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Even more tools to help you succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Integrations
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Connect with your favorite tools and services
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {integrations.map((integration, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{integration.logo}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {integration.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {integration.category}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 dark:bg-blue-700">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to streamline your business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses using BillMeNow to manage their invoicing and payments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
