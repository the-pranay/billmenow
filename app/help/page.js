'use client'

import { useState } from 'react'
import { Search, Book, MessageCircle, Mail, Phone, Clock } from 'lucide-react'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: Book,
      faqs: [
        {
          question: 'How do I create my first invoice?',
          answer: 'Navigate to the Invoices section and click "Create New Invoice". Fill in your client details, add line items, and send it directly to your client.'
        },
        {
          question: 'How do I set up my business profile?',
          answer: 'Go to Settings > Business Profile to add your company details, logo, and billing information.'
        },
        {
          question: 'Can I customize invoice templates?',
          answer: 'Yes! You can customize colors, fonts, and layouts in Settings > Invoice Templates.'
        }
      ]
    },
    {
      title: 'Billing & Payments',
      icon: MessageCircle,
      faqs: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, PayPal, and bank transfers. Enterprise plans can also pay via wire transfer.'
        },
        {
          question: 'How do I upgrade or downgrade my plan?',
          answer: 'Visit the Pricing page or go to Settings > Subscription to change your plan at any time.'
        },
        {
          question: 'Do you offer refunds?',
          answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans.'
        }
      ]
    },
    {
      title: 'Technical Support',
      icon: Phone,
      faqs: [
        {
          question: 'Why are my emails not sending?',
          answer: 'Check your email settings in Settings > Email Configuration. Ensure your SMTP settings are correct or try using our default email service.'
        },
        {
          question: 'How do I export my data?',
          answer: 'You can export your invoices, clients, and reports in various formats from the respective sections.'
        },
        {
          question: 'Is my data secure?',
          answer: 'Absolutely. We use bank-level encryption and comply with SOC 2 Type II standards.'
        }
      ]
    }
  ]

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Find answers to common questions and get the support you need
          </p>
          
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <Mail className="h-8 w-8 text-blue-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Email Support
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Get help from our support team
            </p>
            <button className="text-blue-500 hover:text-blue-600 font-medium">
              Contact Support →
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <MessageCircle className="h-8 w-8 text-green-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Live Chat
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Chat with us in real-time
            </p>
            <button className="text-green-500 hover:text-green-600 font-medium">
              Start Chat →
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <Clock className="h-8 w-8 text-purple-500 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Status Page
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Check service status
            </p>
            <button className="text-purple-500 hover:text-purple-600 font-medium">
              View Status →
            </button>
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {(searchQuery ? filteredFAQs : faqCategories).map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <category.icon className="h-6 w-6 text-blue-500 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {category.title}
                  </h2>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {category.faqs.map((faq, faqIndex) => (
                  <details key={faqIndex} className="group">
                    <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {faq.question}
                      </h3>
                      <svg
                        className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our support team is here to help you succeed
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Contact Support
            </button>
            <button className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Schedule a Call
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
