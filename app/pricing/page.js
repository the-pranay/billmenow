'use client';

import { useState } from 'react';
import { 
  Check, 
  X, 
  Star, 
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [hoveredPlan, setHoveredPlan] = useState(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: billingPeriod === 'monthly' ? 999 : 9990,
      originalPrice: billingPeriod === 'monthly' ? 1499 : 14990,
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Perfect for freelancers and small businesses',
      features: [
        'Up to 50 invoices per month',
        'Up to 10 clients',
        'Basic reporting',
        'Email support',
        'Mobile app access',
        'PDF export'
      ],
      limitations: [
        'No advanced analytics',
        'No team collaboration',
        'No custom branding'
      ],
      popular: false,
      cta: 'Start Free Trial'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: billingPeriod === 'monthly' ? 2499 : 24990,
      originalPrice: billingPeriod === 'monthly' ? 3499 : 34990,
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Best for growing businesses and agencies',
      features: [
        'Unlimited invoices',
        'Unlimited clients',
        'Advanced reporting & analytics',
        'Priority email support',
        'Team collaboration (up to 5 users)',
        'Custom branding',
        'Automated reminders',
        'Multi-currency support',
        'API access'
      ],
      limitations: [
        'No white-label solution'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingPeriod === 'monthly' ? 4999 : 49990,
      originalPrice: billingPeriod === 'monthly' ? 6999 : 69990,
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'For large organizations with advanced needs',
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'White-label solution',
        'Dedicated account manager',
        'Phone support',
        'Custom integrations',
        'Advanced security features',
        'SLA guarantee',
        'Custom training'
      ],
      limitations: [],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

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
              Pricing Plans
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your business. All plans include a 14-day free trial.
            No setup fees, no hidden charges.
          </p>

          {/* Billing Period Toggle */}
          <div className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                Save 33%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                plan.popular
                  ? 'border-blue-500 scale-105'
                  : hoveredPlan === plan.id
                  ? 'border-blue-300 dark:border-blue-600 scale-102'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {plan.description}
                </p>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 ml-1">
                      {plan.period}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <div className="flex items-center mt-2">
                      <span className="text-gray-500 dark:text-gray-400 line-through text-sm">
                        {formatPrice(plan.originalPrice)}{plan.period}
                      </span>
                      <span className="ml-2 text-green-600 dark:text-green-400 text-sm font-medium">
                        Save {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all mb-8 ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  {plan.cta}
                </button>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    What's included:
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center mb-3">
                        <X className="h-5 w-5 text-gray-400 mr-2" />
                        Not included:
                      </h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation) => (
                          <li key={limitation} className="flex items-start">
                            <X className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              {limitation}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Compare All Features
          </h3>
          
          {/* Feature comparison table would go here */}
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>Detailed feature comparison coming soon...</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I change plans anytime?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Yes, all plans come with a 14-day free trial. No credit card required to get started.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We accept all major credit cards, UPI, net banking, and digital wallets.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Yes, you can cancel your subscription at any time. You'll continue to have access until your billing period ends.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to get started?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of businesses already using BillMeNow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}