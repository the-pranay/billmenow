'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  CreditCard, 
  Mail, 
  Smartphone, 
  Moon, 
  Sun, 
  Volume2, 
  Eye, 
  Lock, 
  Key, 
  Trash2,
  Download,
  Upload,
  Save,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Utilities/Toast';
import withAuth from '../components/Auth/withAuth';
import { apiCall } from '../lib/api';

function SettingsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    theme: 'system',
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    
    // Notifications
    emailNotifications: true,
    invoiceReminders: true,
    paymentAlerts: true,
    marketingEmails: false,
    pushNotifications: true,
    smsNotifications: false,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginAlerts: true,
    
    // Invoice Settings
    autoSaveInvoices: true,
    defaultDueDate: '30',
    lateFeePercentage: '2',
    sendReminders: true,
    reminderDays: ['7', '3', '1'],
    
    // Privacy
    profileVisibility: 'private',
    analyticsSharing: false,
    dataCollection: 'minimal'
  });  // Load settings data on component mount
  useEffect(() => {
    loadSettingsData();
  }, [loadSettingsData]);

  // Apply theme changes when theme setting changes
  useEffect(() => {
    if (settings.theme) {
      applyTheme(settings.theme);
    }
  }, [settings.theme]);

  const applyTheme = (theme) => {
    const html = document.documentElement;
    
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else if (theme === 'system') {
      // Remove manual theme classes and let system preference take over
      html.classList.remove('dark', 'light');
      localStorage.removeItem('theme');
      
      // Apply system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  };  const loadSettingsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiCall('/api/user/settings', {
        method: 'GET'
      });

      if (data && data.success && data.settings) {
        setSettings(prev => ({
          ...prev,
          ...data.settings
        }));
      }
    } catch (err) {
      error('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  const handleSave = async () => {
    setIsSaving(true);    try {
      const data = await apiCall('/api/user/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });

      if (data && data.success) {
        success('Settings saved successfully!');
      } else {
        error(data?.error || 'Failed to save settings');
      }
    } catch (err) {
      error('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  // Additional button functionality
  const handleChangePassword = () => {
    // Create a simple modal for password change
    const currentPassword = window.prompt('Enter your current password:');
    if (!currentPassword) return;
    
    const newPassword = window.prompt('Enter your new password (minimum 8 characters):');
    if (!newPassword || newPassword.length < 8) {
      error('New password must be at least 8 characters long');
      return;
    }
    
    const confirmPassword = window.prompt('Confirm your new password:');
    if (newPassword !== confirmPassword) {
      error('Passwords do not match');
      return;
    }
    
    changePassword(currentPassword, newPassword, confirmPassword);
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      setIsLoading(true);      const data = await apiCall('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      if (data && data.success) {
        success('Password changed successfully!');
      } else {
        error(data?.error || 'Failed to change password');
      }
    } catch (err) {
      error('Failed to change password');
      console.error('Error changing password:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDownloadData = async () => {
    try {
      setIsLoading(true);
      
      // For blob responses, we need to use a direct fetch with auth headers
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/export-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `billmenow-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        success('Data downloaded successfully!');
      } else {
        error('Failed to download data');
      }
    } catch (err) {
      error('Failed to download data');
      console.error('Error downloading data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteAccount = () => {
    const password = window.prompt('To delete your account, please enter your password:');
    if (!password) return;
    
    if (window.confirm('⚠️ WARNING: This will permanently delete your account and ALL data including invoices, clients, and settings. This action CANNOT be undone. Are you absolutely sure?')) {
      deleteAccount(password);
    }
  };

  const deleteAccount = async (password) => {    try {
      setIsLoading(true);
      const data = await apiCall('/api/user/delete-account', {
        method: 'DELETE',
        body: JSON.stringify({
          confirmPassword: password
        })
      });

      if (data && data.success) {
        success('Account deleted successfully. Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        error(data?.error || 'Failed to delete account');
      }
    } catch (err) {
      error('Failed to delete account');
      console.error('Error deleting account:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupTwoFactor = () => {
    // Implement 2FA setup
    alert('Two-factor authentication setup will be implemented in a future update.');
  };
  const handleDeleteAllData = () => {
    if (window.confirm('⚠️ WARNING: This will delete ALL your data (invoices, clients, reports) but keep your account. This action CANNOT be undone. Are you sure?')) {
      deleteAllData();
    }
  };
  const deleteAllData = async () => {
    try {
      setIsLoading(true);
      const data = await apiCall('/api/user/delete-data', {
        method: 'DELETE',
        body: JSON.stringify({
          confirmAction: 'DELETE_ALL_DATA'
        })
      });

      if (data && data.success) {
        success('All data deleted successfully!');
        // Reload settings to show reset values
        loadSettingsData();
      } else {
        error(data?.error || 'Failed to delete data');
      }
    } catch (err) {
      error('Failed to delete data');
      console.error('Error deleting data:', err);
    } finally {      setIsLoading(false);
    }
  };

  const handleExportSettings = async () => {
    try {
      const exportData = {
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `billmenow-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      success('Settings exported successfully!');
    } catch (err) {
      error('Failed to export settings');
      console.error('Error exporting settings:', err);
    }
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.settings) {
              setSettings(importedData.settings);
              success('Settings imported successfully!');
            } else {
              error('Invalid settings file format');
            }
          } catch (err) {
            error('Failed to parse settings file');
            console.error('Error parsing settings file:', err);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'invoice', label: 'Invoice', icon: CreditCard },
    { id: 'privacy', label: 'Privacy', icon: Lock }
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Settings - {user?.name || 'User'}
            </h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
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
              
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">General Settings</h2>
                  </div>

                  <div className="space-y-8">
                    {/* Appearance */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Theme
                          </label>
                          <div className="space-y-3">
                            {[
                              { value: 'light', label: 'Light Mode', icon: Sun },
                              { value: 'dark', label: 'Dark Mode', icon: Moon },
                              { value: 'system', label: 'System Default', icon: Palette }
                            ].map(({ value, label, icon: Icon }) => (
                              <label key={value} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="theme"
                                  value={value}
                                  checked={settings.theme === value}
                                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                />
                                <Icon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Language
                          </label>
                          <select
                            value={settings.language}
                            onChange={(e) => handleSettingChange('language', e.target.value)}
                            className="input-primary"
                          >
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Localization */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Localization</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Timezone
                          </label>
                          <select
                            value={settings.timezone}
                            onChange={(e) => handleSettingChange('timezone', e.target.value)}
                            className="input-primary"
                          >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date Format
                          </label>
                          <select
                            value={settings.dateFormat}
                            onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                            className="input-primary"
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Default Currency
                          </label>
                          <select
                            value={settings.currency}
                            onChange={(e) => handleSettingChange('currency', e.target.value)}
                            className="input-primary"
                          >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="AUD">AUD (A$)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
                  </div>

                  <div className="space-y-8">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'emailNotifications', label: 'General Email Notifications', desc: 'Receive important updates via email' },
                          { key: 'invoiceReminders', label: 'Invoice Reminders', desc: 'Get notified about pending invoices' },
                          { key: 'paymentAlerts', label: 'Payment Alerts', desc: 'Instant notifications when payments are received' },
                          { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Product updates and promotional content' }
                        ].map(({ key, label, desc }) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                            <div>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings[key]}
                                onChange={(e) => handleSettingChange(key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Push Notifications</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'pushNotifications', label: 'Browser Push Notifications', desc: 'Get instant notifications in your browser', icon: Volume2 },
                          { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive critical alerts via SMS', icon: Smartphone }
                        ].map(({ key, label, desc, icon: Icon }) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                            <div>
                              <div className="flex items-center space-x-2">
                                <Icon className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings[key]}
                                onChange={(e) => handleSettingChange(key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Settings</h2>
                  </div>

                  <div className="space-y-8">
                    {/* Two-Factor Authentication */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h3>
                      <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Key className="h-5 w-5 text-gray-500" />
                              <span className="font-medium text-gray-900 dark:text-white">Enable 2FA</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.twoFactorAuth}
                              onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>                        {settings.twoFactorAuth && (
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                            <button 
                              className="btn-secondary"
                              onClick={handleSetupTwoFactor}
                            >
                              Setup Authenticator App
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Session Settings */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Session Management</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Session Timeout (minutes)
                          </label>
                          <select
                            value={settings.sessionTimeout}
                            onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                            className="input-primary max-w-xs"
                          >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="120">2 hours</option>
                            <option value="480">8 hours</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Eye className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-900 dark:text-white">Login Alerts</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Get notified of new login attempts to your account
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.loginAlerts}
                              onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Password & Account */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Password & Account</h3>
                      <div className="space-y-3">
                        <button 
                          onClick={handleChangePassword}
                          className="btn-secondary"
                        >
                          Change Password
                        </button>

                        <button 
                          onClick={handleDownloadData}
                          className="btn-secondary"
                        >
                          Download Account Data
                        </button>

                        <button 
                          onClick={handleDeleteAccount}
                          className="btn-danger"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoice Settings */}
              {activeTab === 'invoice' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invoice Settings</h2>
                  </div>

                  <div className="space-y-8">
                    {/* Auto-save and Defaults */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Default Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">Auto-save Invoices</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Automatically save invoices as you type
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.autoSaveInvoices}
                              onChange={(e) => handleSettingChange('autoSaveInvoices', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Default Due Date (Days)
                            </label>
                            <select
                              value={settings.defaultDueDate}
                              onChange={(e) => handleSettingChange('defaultDueDate', e.target.value)}
                              className="input-primary"
                            >
                              <option value="7">7 days</option>
                              <option value="15">15 days</option>
                              <option value="30">30 days</option>
                              <option value="45">45 days</option>
                              <option value="60">60 days</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Late Fee Percentage
                            </label>
                            <input
                              type="number"
                              value={settings.lateFeePercentage}
                              onChange={(e) => handleSettingChange('lateFeePercentage', e.target.value)}
                              className="input-primary"
                              min="0"
                              max="10"
                              step="0.5"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reminder Settings */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Reminders</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">Send Automatic Reminders</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Automatically send payment reminders to clients
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.sendReminders}
                              onChange={(e) => handleSettingChange('sendReminders', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {settings.sendReminders && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Reminder Schedule (Days before due date)
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {['7', '3', '1', '0'].map((day) => (
                                <label key={day} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={settings.reminderDays.includes(day)}
                                    onChange={(e) => {
                                      const newReminderDays = e.target.checked
                                        ? [...settings.reminderDays, day]
                                        : settings.reminderDays.filter(d => d !== day);
                                      handleSettingChange('reminderDays', newReminderDays);
                                    }}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {day === '0' ? 'Due date' : `${day} days`}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy Settings</h2>
                  </div>

                  <div className="space-y-8">
                    {/* Profile Visibility */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Visibility</h3>
                      <div className="space-y-3">
                        {[
                          { value: 'public', label: 'Public', desc: 'Your profile is visible to everyone' },
                          { value: 'clients', label: 'Clients Only', desc: 'Only your clients can view your profile' },
                          { value: 'private', label: 'Private', desc: 'Your profile is completely private' }
                        ].map(({ value, label, desc }) => (
                          <label key={value} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg cursor-pointer">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={value}
                              checked={settings.profileVisibility === value}
                              onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2 mt-1"
                            />
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Data Collection */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data & Analytics</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">Analytics Sharing</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Share anonymized usage data to help improve the platform
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.analyticsSharing}
                              onChange={(e) => handleSettingChange('analyticsSharing', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Data Collection Level
                          </label>
                          <select
                            value={settings.dataCollection}
                            onChange={(e) => handleSettingChange('dataCollection', e.target.value)}
                            className="input-primary max-w-xs"
                          >
                            <option value="none">No data collection</option>
                            <option value="minimal">Minimal (Essential only)</option>
                            <option value="standard">Standard (Recommended)</option>
                            <option value="full">Full (All features)</option>
                          </select>
                        </div>
                      </div>
                    </div>                    {/* Data Export */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
                      <div className="space-y-3">
                        <button 
                          onClick={handleDownloadData}
                          className="btn-secondary"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export My Data
                        </button>

                        <button 
                          onClick={handleExportSettings}
                          className="btn-secondary"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Export Settings
                        </button>

                        <button 
                          onClick={handleImportSettings}
                          className="btn-secondary"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Import Settings
                        </button>

                        <button 
                          onClick={handleDeleteAllData}
                          className="btn-danger"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete All Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}              {/* Save Button */}
              <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-4 bg-gray-50 dark:bg-slate-700/50">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Save your settings changes
                  </p>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save All Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>    </div>
  );
}

export default withAuth(SettingsPage);
