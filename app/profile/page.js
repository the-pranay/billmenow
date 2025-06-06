'use client';

import { useState } from 'react';
import { Camera, User, Building, Mail, Globe, Upload, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import withAuth from '../components/Auth/withAuth';

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('business');
  const [profileData, setProfileData] = useState({
    // Business Info
    businessName: '',
    businessType: 'freelancer',
    ownerName: '',
    email: '',
    phone: '',
    website: '',
    
    // Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    
    // Business Details
    gstNumber: '',
    panNumber: '',
    businessDescription: '',
    
    // Banking
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    
    // Invoice Settings
    invoicePrefix: 'INV',
    invoiceNumberStart: '001',
    currency: 'INR',
    taxRate: '18',
    
    // Payment Gateway
    razorpayKeyId: '',
    razorpaySecret: '',
    upiId: ''
  });

  const [logoPreview, setLogoPreview] = useState(null);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building },
    { id: 'banking', label: 'Banking', icon: User },
    { id: 'invoice', label: 'Invoice Settings', icon: Mail },
    { id: 'payment', label: 'Payment Gateway', icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Setup</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Setup Steps</h2>
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              {/* Business Info Tab */}
              {activeTab === 'business' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Business Information</h2>
                  </div>

                  {/* Logo Upload */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Logo
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="relative">                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-slate-700 overflow-hidden">
                          {logoPreview ? (
                            <Image src={logoPreview} alt="Logo preview" width={96} height={96} className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <button className="btn-secondary">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </button>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          PNG, JPG up to 2MB. Recommended: 400x400px
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={profileData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        className="input-primary"
                        placeholder="Your business name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Business Type
                      </label>
                      <select
                        value={profileData.businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                        className="input-primary"
                      >
                        <option value="freelancer">Individual Freelancer</option>
                        <option value="agency">Agency</option>
                        <option value="company">Company</option>
                        <option value="consultant">Consultant</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Owner/Contact Name *
                      </label>
                      <input
                        type="text"
                        value={profileData.ownerName}
                        onChange={(e) => handleInputChange('ownerName', e.target.value)}
                        className="input-primary"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="input-primary"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="input-primary"
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="input-primary"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Description
                    </label>
                    <textarea
                      value={profileData.businessDescription}
                      onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                      rows={4}
                      className="input-primary"
                      placeholder="Brief description of your business and services..."
                    />
                  </div>

                  {/* Address Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Business Address</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={profileData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="input-primary"
                          placeholder="Building, Street, Area"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={profileData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="input-primary"
                          placeholder="Your city"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          State/Province
                        </label>
                        <input
                          type="text"
                          value={profileData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="input-primary"
                          placeholder="Your state"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ZIP/Postal Code
                        </label>
                        <input
                          type="text"
                          value={profileData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          className="input-primary"
                          placeholder="123456"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Country
                        </label>
                        <select
                          value={profileData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="input-primary"
                        >
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                          <option value="Canada">Canada</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Tax Information */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tax Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          GST Number
                        </label>
                        <input
                          type="text"
                          value={profileData.gstNumber}
                          onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                          className="input-primary"
                          placeholder="22AAAAA0000A1Z5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          PAN Number
                        </label>
                        <input
                          type="text"
                          value={profileData.panNumber}
                          onChange={(e) => handleInputChange('panNumber', e.target.value)}
                          className="input-primary"
                          placeholder="ABCDE1234F"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Banking Tab */}
              {activeTab === 'banking' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Banking Information</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        value={profileData.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        className="input-primary"
                        placeholder="State Bank of India"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        value={profileData.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        className="input-primary"
                        placeholder="1234567890123456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        IFSC Code *
                      </label>
                      <input
                        type="text"
                        value={profileData.ifscCode}
                        onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                        className="input-primary"
                        placeholder="SBIN0001234"
                      />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        💡 Why do we need banking information?
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your banking details will be displayed on invoices to help clients make direct transfers. 
                        This information is securely stored and only visible to you and your clients on invoices.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoice Settings Tab */}
              {activeTab === 'invoice' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invoice Settings</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Invoice Number Prefix
                      </label>
                      <input
                        type="text"
                        value={profileData.invoicePrefix}
                        onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                        className="input-primary"
                        placeholder="INV"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Example: INV-001, INV-002, etc.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Starting Number
                      </label>
                      <input
                        type="text"
                        value={profileData.invoiceNumberStart}
                        onChange={(e) => handleInputChange('invoiceNumberStart', e.target.value)}
                        className="input-primary"
                        placeholder="001"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Your first invoice will be {profileData.invoicePrefix}-{profileData.invoiceNumberStart}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Default Currency
                      </label>
                      <select
                        value={profileData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="input-primary"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="AUD">AUD (A$)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Default Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        value={profileData.taxRate}
                        onChange={(e) => handleInputChange('taxRate', e.target.value)}
                        className="input-primary"
                        placeholder="18"
                        min="0"
                        max="50"
                        step="0.01"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        GST rate for Indian businesses is typically 18%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Gateway Tab */}
              {activeTab === 'payment' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Gateway Setup</h2>
                  </div>

                  <div className="space-y-8">
                    {/* Razorpay Setup */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Razorpay Integration
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Razorpay Key ID
                          </label>
                          <input
                            type="text"
                            value={profileData.razorpayKeyId}
                            onChange={(e) => handleInputChange('razorpayKeyId', e.target.value)}
                            className="input-primary"
                            placeholder="rzp_test_1234567890"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Razorpay Secret
                          </label>
                          <input
                            type="password"
                            value={profileData.razorpaySecret}
                            onChange={(e) => handleInputChange('razorpaySecret', e.target.value)}
                            className="input-primary"
                            placeholder="Keep your secret key secure"
                          />
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                            🔐 Security Note
                          </h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Never share your Razorpay secret key. It will be securely stored and used only for payment processing.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* UPI Setup */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        UPI Payment
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          UPI ID
                        </label>
                        <input
                          type="text"
                          value={profileData.upiId}
                          onChange={(e) => handleInputChange('upiId', e.target.value)}
                          className="input-primary"
                          placeholder="yourname@paytm / yourname@phonepe"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Clients can pay directly to your UPI ID
                        </p>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                        💰 Payment Methods Available
                      </h4>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• Credit/Debit Cards via Razorpay</li>
                        <li>• UPI Payments (PhonePe, Paytm, GPay)</li>
                        <li>• Net Banking</li>
                        <li>• Wallet Payments</li>
                        <li>• Bank Transfers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-4 bg-gray-50 dark:bg-slate-700/50">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    All changes are automatically saved
                  </p>
                  <button className="btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>      </div>
    </div>
  );
}

export default withAuth(ProfilePage);
