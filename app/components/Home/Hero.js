'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    "Create Professional Invoices",
    "Track Payments Instantly",
    "Manage Clients Efficiently",
    "Generate Detailed Reports"
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 ${isVisible ? 'fade-in' : 'opacity-0'}`}>
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-800 dark:text-blue-200 text-sm font-medium">
                  🚀 #1 Invoice Platform for Freelancers
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Smart Invoice &
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    {" "}Payment Platform
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                  Generate professional invoices, collect payments via Razorpay/UPI, and manage your freelance business with ease. 
                  Built for modern freelancers who demand efficiency.
                </p>

                {/* Dynamic Feature Display */}
                <div className="h-8 flex items-center">
                  <span className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                    ✨ {features[currentFeature]}
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start Creating Invoices
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 110 5H9V10z" />
                  </svg>
                  Watch Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">5000+ Happy Freelancers</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">4.9/5</span>
                </div>
              </div>
            </div>

            {/* Right Content - Interactive Preview */}
            <div className={`relative ${isVisible ? 'slide-up' : 'opacity-0'}`}>
              <div className="relative">
                {/* Floating Elements */}
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                
                {/* Mock Invoice Preview */}
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-slate-700">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                          <span className="text-white font-bold text-xl">B</span>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">BillMeNow</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Professional Invoicing</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">INVOICE</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">#INV-2025-001</div>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Bill To:</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <div>Acme Corporation</div>
                          <div>John Smith</div>
                          <div>john@acme.com</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Invoice Details:</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <div>Date: Jan 15, 2025</div>
                          <div>Due: Jan 30, 2025</div>
                          <div className="inline-flex px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">
                            Paid
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Web Development</span>
                        <span className="font-semibold text-gray-900 dark:text-white">₹25,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">UI/UX Design</span>
                        <span className="font-semibold text-gray-900 dark:text-white">₹15,000</span>
                      </div>
                      <hr className="border-gray-200 dark:border-slate-600" />
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900 dark:text-white">Total</span>
                        <span className="text-blue-600 dark:text-blue-400">₹40,000</span>
                      </div>
                    </div>

                    {/* Pay Button */}
                    <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Pay with UPI / Card</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Manage Your Business
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From invoice creation to payment collection, we've got you covered with powerful features designed for modern freelancers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: "📄",
                title: "Professional Invoices",
                description: "Create stunning invoices with customizable templates, your logo, and professional layouts.",
                color: "blue"
              },
              {
                icon: "💳",
                title: "Instant Payments",
                description: "Accept payments via Razorpay, UPI, cards, and wallets. Get paid faster than ever.",
                color: "green"
              },
              {
                icon: "👥",
                title: "Client Management",
                description: "Organize your clients, track their payment history, and manage relationships easily.",
                color: "purple"
              },
              {
                icon: "📊",
                title: "Analytics & Reports",
                description: "Gain insights with detailed reports, revenue tracking, and business analytics.",
                color: "orange"
              },
              {
                icon: "🔄",
                title: "Recurring Billing",
                description: "Set up automatic recurring invoices for regular clients and subscriptions.",
                color: "pink"
              },
              {
                icon: "📱",
                title: "Mobile Friendly",
                description: "Access your invoices, clients, and payments from any device, anywhere.",
                color: "indigo"
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-white dark:bg-slate-700 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-500">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: "50K+", label: "Invoices Created" },
              { number: "₹100Cr+", label: "Payments Processed" },
              { number: "5000+", label: "Happy Freelancers" },
              { number: "99.9%", label: "Uptime" }
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl font-bold">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Invoicing?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of freelancers who have streamlined their billing process with BillMeNow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Get Started Free
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}