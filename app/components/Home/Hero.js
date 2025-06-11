'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Hero() {  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [stats, setStats] = useState({
    invoicesCreated: 0,
    paymentsProcessed: 0,
    totalPaymentCount: 0,
    happyFreelancers: 0,
    uptime: 99.9
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const features = [
    "Create Professional Invoices",
    "Track Payments Instantly", 
    "Manage Clients Efficiently",
    "Generate Detailed Reports"
  ];

  // Fetch live statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);
  useEffect(() => {
    setIsMounted(true);
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 10000000) { // 1 crore
      return `₹${(num / 10000000).toFixed(1)}Cr+`;
    } else if (num >= 100000) { // 1 lakh
      return `₹${(num / 100000).toFixed(1)}L+`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    }
    return num.toString();
  };

  // Count up animation for numbers
  const [countUpStats, setCountUpStats] = useState({
    invoicesCreated: 0,
    paymentsProcessed: 0,
    happyFreelancers: 0,
    uptime: 0
  });
  useEffect(() => {
    if (!isLoading && stats.invoicesCreated > 0 && isMounted) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setCountUpStats({
          invoicesCreated: Math.floor(stats.invoicesCreated * progress),
          paymentsProcessed: Math.floor(stats.paymentsProcessed * progress),
          happyFreelancers: Math.floor(stats.happyFreelancers * progress),
          uptime: Math.min(stats.uptime, 99.9 * progress)
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setCountUpStats(stats);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [isLoading, stats, isMounted]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      {isMounted && (
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`space-y-8 z-10 relative ${isMounted && isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full text-blue-800 dark:text-blue-200 text-sm font-medium backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  🚀 #1 Invoice Platform for Freelancers
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                  Smart Invoice &
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-gradient-x">
                    {" "}Payment Platform
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl font-light">
                  Generate professional invoices, collect payments via Razorpay/UPI, and manage your freelance business with ease. 
                  <span className="font-semibold text-blue-600 dark:text-blue-400"> Built for modern freelancers who demand efficiency.</span>
                </p>

                {/* Dynamic Feature Display */}
                <div className="h-10 flex items-center">
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200/50 dark:border-slate-700/50">
                    <span className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
                      ✨ {features[currentFeature]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced CTA Buttons */}              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/auth/login" 
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/20"
                >
                  Start Creating Invoices
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                <button className="group inline-flex items-center justify-center px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 font-bold rounded-2xl hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl">
                  <svg className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 110 5H9V10z" />
                  </svg>
                  Watch Demo
                </button>
              </div>

              {/* Enhanced Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full border-3 border-white dark:border-slate-800 shadow-lg"></div>
                    ))}
                  </div>                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isLoading || !isMounted ? '5000+' : `${countUpStats.happyFreelancers}+`} Happy Freelancers
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1,2,3,4,5].map((i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">4.9/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Right Content - Enhanced Interactive Preview */}
            <div className={`relative z-10 ${isMounted && isVisible ? 'animate-fade-in-up animation-delay-300' : 'opacity-0'}`}>              <div className="relative">
                {/* Enhanced Floating Elements */}
                {isMounted && (
                  <>
                    <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl shadow-lg transform rotate-12 animate-float"></div>
                    <div className="absolute -top-2 -right-8 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl shadow-lg transform -rotate-12 animate-float animation-delay-1000"></div>
                    <div className="absolute -bottom-4 -left-8 w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-lg transform rotate-45 animate-float animation-delay-2000"></div>
                  </>
                )}
                
                {/* Enhanced Invoice Preview */}
                <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-3xl transition-shadow duration-500">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                          <span className="text-white font-bold text-2xl">B</span>
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">BillMeNow</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Professional Invoicing</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-gray-900 dark:text-white">INVOICE</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">#INV-2025-001</div>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-3">Bill To:</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <div className="font-semibold">Acme Corporation</div>
                          <div>John Smith</div>
                          <div className="text-blue-600 dark:text-blue-400">john@acme.com</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-3">Invoice Details:</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <div>Date: Jan 15, 2025</div>
                          <div>Due: Jan 30, 2025</div>
                          <div className="inline-flex px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold">
                            ✓ Paid
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-gray-600 dark:text-gray-300">Web Development</span>
                        <span className="font-bold text-gray-900 dark:text-white">₹25,000</span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-gray-600 dark:text-gray-300">UI/UX Design</span>
                        <span className="font-bold text-gray-900 dark:text-white">₹15,000</span>
                      </div>
                      <div className="flex justify-between text-xl font-black pt-3">
                        <span className="text-gray-900 dark:text-white">Total</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">₹40,000</span>
                      </div>
                    </div>

                    {/* Enhanced Pay Button */}
                    <button className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white font-bold py-4 rounded-2xl hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Pay with UPI / Card</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>      </section>
{/* Enhanced Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.1) 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-800 dark:text-blue-200 text-sm font-semibold mb-6">
              ✨ Powerful Features
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Everything You Need to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Scale Your Business</span>
            </h2>            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              From invoice creation to payment collection, we&apos;ve got you covered with powerful features designed for modern freelancers and businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Enhanced Feature Cards */}
            {[
              {
                icon: "📄",
                title: "Professional Invoices",
                description: "Create stunning invoices with customizable templates, your logo, and professional layouts that impress clients.",
                color: "blue",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: "💳",
                title: "Instant Payments",
                description: "Accept payments via Razorpay, UPI, cards, and wallets. Get paid faster than ever with automated reminders.",
                color: "green",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: "👥",
                title: "Client Management",
                description: "Organize your clients, track their payment history, and manage relationships with our intuitive CRM.",
                color: "purple",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: "📊",
                title: "Analytics & Reports",
                description: "Gain insights with detailed reports, revenue tracking, and business analytics to grow your business.",
                color: "orange",
                gradient: "from-orange-500 to-red-500"
              },
              {
                icon: "🔄",
                title: "Recurring Billing",
                description: "Set up automatic recurring invoices for regular clients and subscription-based services.",
                color: "pink",
                gradient: "from-pink-500 to-purple-500"
              },
              {
                icon: "📱",
                title: "Mobile Friendly",
                description: "Access your invoices, clients, and payments from any device, anywhere with our responsive design.",
                color: "indigo",
                gradient: "from-indigo-500 to-blue-500"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-slate-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transform hover:scale-105 hover:-translate-y-2"
              >
                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                
                {/* Floating Icon */}
                <div className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className={`inline-flex items-center text-sm font-semibold bg-gradient-to-r ${feature.gradient} text-transparent bg-clip-text`}>
                      Learn more 
                      <svg className="ml-1 w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-20">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Ready to experience these features?
            </p>            <Link 
              href="/auth/login" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              Start Your Free Trial
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>{/* Live Stats Section - Enhanced Design */}
      <section className="py-24 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
        </div>
          {/* Animated Particles */}
        {isMounted && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              ></div>
            ))}
          </div>
        )}

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Real numbers from our growing community of freelancers and businesses
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">            {[
              { 
                number: isLoading || !isMounted ? "50K+" : `${countUpStats.invoicesCreated.toLocaleString()}+`, 
                label: "Invoices Created",
                icon: "📄",
                color: "from-yellow-400 to-orange-500"
              },
              { 
                number: isLoading || !isMounted ? "₹100Cr+" : formatNumber(countUpStats.paymentsProcessed), 
                label: "Payments Processed",
                icon: "💰",
                color: "from-green-400 to-emerald-500"
              },
              { 
                number: isLoading || !isMounted ? "5000+" : `${countUpStats.happyFreelancers.toLocaleString()}+`, 
                label: "Happy Freelancers",
                icon: "👥",
                color: "from-purple-400 to-pink-500"
              },
              { 
                number: isLoading || !isMounted ? "99.9%" : `${countUpStats.uptime.toFixed(1)}%`, 
                label: "Uptime",
                icon: "⚡",
                color: "from-blue-400 to-cyan-500"
              }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-500" 
                     style={{backgroundImage: `linear-gradient(135deg, ${stat.color.split(' ')[1]}, ${stat.color.split(' ')[3]})`}}></div>
                
                <div className="relative">
                  <div className="text-4xl mb-4">{stat.icon}</div>
                  <div className={`text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.color} mb-2`}>
                    {stat.number}
                  </div>                  <div className="text-blue-100 font-medium text-lg">{stat.label}</div>
                  {(isLoading || !isMounted) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="flex flex-wrap justify-center items-center gap-8 text-blue-100">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">PCI Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Enhanced CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Advanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full" style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'moveGrid 20s linear infinite'
          }}></div>
        </div>        {/* Floating Orbs */}
        {isMounted && (
          <>
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/30 rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/30 rounded-full blur-xl animate-float animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-indigo-500/30 rounded-full blur-xl animate-float animation-delay-4000"></div>
          </>
        )}

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-blue-200 text-sm font-semibold border border-white/20">
              🎉 Join the Revolution
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight">
              Ready to Transform
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"> Your Business?</span>
            </h2>
            
            <p className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Join thousands of freelancers and businesses who have revolutionized their invoicing process with BillMeNow. 
              <span className="font-semibold text-white"> Start your journey today.</span>
            </p>

            {/* Enhanced CTA Buttons */}            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Link 
                href="/auth/login" 
                className="group relative inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-xl rounded-2xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <span className="relative flex items-center">
                  Get Started Free
                  <svg className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              
              <button className="group inline-flex items-center justify-center px-10 py-5 bg-white/10 backdrop-blur-sm text-white font-bold text-xl rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/30 hover:border-white/50">
                <svg className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 110 5H9V10z" />
                </svg>
                Schedule Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-12 border-t border-white/20">
              <p className="text-blue-200 mb-6 text-lg">Trusted by industry leaders</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                {['🏢 Enterprise Ready', '🛡️ Bank-level Security', '⚡ 99.9% Uptime', '🌍 Global Support'].map((feature, i) => (
                  <div key={i} className="flex items-center space-x-2 text-blue-100">
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}