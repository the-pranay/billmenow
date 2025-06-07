'use client'

import { useState } from 'react'
import { Code, Copy, CheckCircle, Play, Book, Key, Globe, Lock } from 'lucide-react'

export default function APIPage() {
  const [activeEndpoint, setActiveEndpoint] = useState('invoices')
  const [copiedCode, setCopiedCode] = useState('')

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const endpoints = [
    {
      id: 'invoices',
      title: 'Invoices',
      description: 'Create, retrieve, update, and delete invoices',
      methods: [
        {
          method: 'GET',
          path: '/api/invoices',
          description: 'Get all invoices',
          example: `curl -X GET "https://api.billmenow.com/v1/invoices" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
        },
        {
          method: 'POST',
          path: '/api/invoices',
          description: 'Create a new invoice',
          example: `curl -X POST "https://api.billmenow.com/v1/invoices" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "clientId": "client_123",
    "items": [
      {
        "description": "Web Development",
        "quantity": 10,
        "rate": 100,
        "amount": 1000
      }
    ],
    "dueDate": "2024-02-15"
  }'`
        }
      ]
    },
    {
      id: 'clients',
      title: 'Clients',
      description: 'Manage client information',
      methods: [
        {
          method: 'GET',
          path: '/api/clients',
          description: 'Get all clients',
          example: `curl -X GET "https://api.billmenow.com/v1/clients" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
        },
        {
          method: 'POST',
          path: '/api/clients',
          description: 'Create a new client',
          example: `curl -X POST "https://api.billmenow.com/v1/clients" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "address": "123 Business St, City, State 12345"
  }'`
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments',
      description: 'Track and manage payments',
      methods: [
        {
          method: 'GET',
          path: '/api/payments',
          description: 'Get all payments',
          example: `curl -X GET "https://api.billmenow.com/v1/payments" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
        },
        {
          method: 'POST',
          path: '/api/payments',
          description: 'Record a payment',
          example: `curl -X POST "https://api.billmenow.com/v1/payments" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "invoiceId": "inv_123",
    "amount": 1000,
    "method": "bank_transfer",
    "date": "2024-01-15"
  }'`
        }
      ]
    }
  ]

  const quickStart = `# Install the BillMeNow SDK
npm install billmenow-api

# Initialize the client
const BillMeNow = require('billmenow-api');
const client = new BillMeNow('YOUR_API_KEY');

# Create an invoice
const invoice = await client.invoices.create({
  clientId: 'client_123',
  items: [
    {
      description: 'Web Development',
      quantity: 10,
      rate: 100,
      amount: 1000
    }
  ],
  dueDate: '2024-02-15'
});

console.log('Invoice created:', invoice.id);`

  const authentication = `# API Key Authentication
curl -X GET "https://api.billmenow.com/v1/invoices" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# OAuth 2.0 Authentication
curl -X GET "https://api.billmenow.com/v1/invoices" \\
  -H "Authorization: Bearer ACCESS_TOKEN"`

  const sdks = [
    {
      name: 'Node.js',
      language: 'JavaScript',
      install: 'npm install billmenow-api',
      example: `const BillMeNow = require('billmenow-api');
const client = new BillMeNow('YOUR_API_KEY');`
    },
    {
      name: 'Python',
      language: 'Python',
      install: 'pip install billmenow-python',
      example: `import billmenow
client = billmenow.Client('YOUR_API_KEY')`
    },
    {
      name: 'PHP',
      language: 'PHP',
      install: 'composer require billmenow/billmenow-php',
      example: `use BillMeNow\\Client;
$client = new Client('YOUR_API_KEY');`
    },
    {
      name: 'Ruby',
      language: 'Ruby',
      install: 'gem install billmenow',
      example: `require 'billmenow'
client = BillMeNow::Client.new('YOUR_API_KEY')`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              BillMeNow API Documentation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Integrate BillMeNow into your applications with our powerful REST API. Create invoices, manage clients, and automate your billing workflow.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium">
              Documentation
            </button>
            <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium">
              Examples
            </button>
            <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium">
              SDKs
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                API Reference
              </h3>
              <nav className="space-y-2">
                <a href="#quickstart" className="block text-blue-600 dark:text-blue-400 hover:underline">
                  Quick Start
                </a>
                <a href="#authentication" className="block text-blue-600 dark:text-blue-400 hover:underline">
                  Authentication
                </a>
                {endpoints.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    onClick={() => setActiveEndpoint(endpoint.id)}
                    className={`block w-full text-left py-2 px-3 rounded ${
                      activeEndpoint === endpoint.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {endpoint.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Start */}
            <div id="quickstart" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Play className="h-6 w-6 text-blue-500 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Quick Start
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Get started with the BillMeNow API in minutes. Here's a quick example to create your first invoice.
                </p>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <code>{quickStart}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(quickStart, 'quickstart')}
                    className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    {copiedCode === 'quickstart' ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Authentication */}
            <div id="authentication" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Key className="h-6 w-6 text-blue-500 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Authentication
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  The BillMeNow API uses API keys for authentication. Include your API key in the Authorization header of each request.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      API Key Authentication
                    </h3>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{authentication.split('#')[1]}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(authentication.split('#')[1], 'apikey')}
                        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
                      >
                        {copiedCode === 'apikey' ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-300" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      OAuth 2.0
                    </h3>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{authentication.split('#')[2]}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(authentication.split('#')[2], 'oauth')}
                        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
                      >
                        {copiedCode === 'oauth' ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-300" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Endpoints */}
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${
                  activeEndpoint === endpoint.id ? 'block' : 'hidden'
                }`}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <Code className="h-6 w-6 text-blue-500 mr-3" />
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {endpoint.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {endpoint.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-8">
                  {endpoint.methods.map((method, index) => (
                    <div key={index}>
                      <div className="flex items-center mb-4">
                        <span className={`px-3 py-1 rounded text-sm font-medium mr-3 ${
                          method.method === 'GET' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {method.method}
                        </span>
                        <code className="text-lg font-mono text-gray-900 dark:text-white">
                          {method.path}
                        </code>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {method.description}
                      </p>
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{method.example}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(method.example, `${endpoint.id}-${index}`)}
                          className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
                        >
                          {copiedCode === `${endpoint.id}-${index}` ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-300" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* SDKs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Book className="h-6 w-6 text-blue-500 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Official SDKs
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Use our official SDKs to integrate BillMeNow into your favorite programming language.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sdks.map((sdk, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {sdk.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {sdk.language}
                      </p>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded p-2 mb-3">
                        <code className="text-sm">{sdk.install}</code>
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                        <code>{sdk.example}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
