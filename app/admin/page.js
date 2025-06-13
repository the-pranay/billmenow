'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  FileText, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Search,
  Download,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    fetchAllData();
    
    // Set up real-time data fetching every 30 seconds
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user, router]);

  const fetchAllData = async () => {
    if (!user || user.role !== 'admin') return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchUsers(),
        fetchInvoices(),
        fetchPayments()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };
  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const response = await fetch('/api/admin/dashboard');
      console.log('Dashboard response status:', response.status);
      const data = await response.json();
      console.log('Full dashboard response:', data);
      if (data.success) {
        setDashboardData(data.data);
        console.log('Dashboard data set:', data.data); // Debug log
      } else {
        console.error('Dashboard API error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users data...');
      const response = await fetch('/api/admin/users');
      console.log('Users response status:', response.status);
      const data = await response.json();
      console.log('Full users response:', data);
      if (data.success) {
        setUsers(data.users);
        console.log('Users data set:', data.users); // Debug log
      } else {
        console.error('Users API error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      console.log('Fetching invoices data...');
      const response = await fetch('/api/invoices');
      console.log('Invoices response status:', response.status);
      const data = await response.json();
      console.log('Full invoices response:', data);
      if (data.success) {
        setInvoices(data.invoices);
        console.log('Invoices data set:', data.invoices); // Debug log
      } else {
        console.error('Invoices API error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      console.log('Fetching payments data...');
      const response = await fetch('/api/payment/status');
      console.log('Payments response status:', response.status);
      const data = await response.json();
      console.log('Full payments response:', data);
      if (data.success) {
        setPayments(data.payments);
        console.log('Payments data set:', data.payments); // Debug log
      } else {
        console.error('Payments API error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isEmailVerified: !currentStatus }),
      });

      if (response.ok) {
        await fetchUsers();
        alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
        alert('User deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    } finally {
      setActionLoading(null);
    }
  };  const exportData = async (type) => {
    try {
      setActionLoading(`export-${type}`);
      console.log(`Starting export for ${type}...`);
      
      const response = await fetch(`/api/admin/export/${type}`);
      console.log(`Export response status for ${type}:`, response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Export response data for ${type}:`, data);
      
      if (data.success) {
        // Create CSV content
        const csvContent = data.csvData;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        console.log(`${type} exported successfully!`);
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully!`);
      } else {
        console.error(`Export ${type} failed:`, data.error);
        alert(`Error exporting ${type}: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      alert(`Error exporting ${type}. Please try again. Error: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.businessName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && user.isEmailVerified;
    if (filterStatus === 'inactive') return matchesSearch && !user.isEmailVerified;
    if (filterStatus === 'admin') return matchesSearch && user.role === 'admin';
    
    return matchesSearch;
  });
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Access Denied</h2>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🛡️ Admin Control Center</h1>
              <p className="text-purple-200">
                Welcome back, <strong>{user?.firstName}</strong>! You have full administrative control over BillMeNow.
              </p>              <div className="flex items-center mt-3 text-sm text-purple-300">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Real-time monitoring active • Last updated: {new Date().toLocaleTimeString()}
                <button
                  onClick={fetchAllData}
                  disabled={loading}
                  className="ml-4 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-xs border border-purple-500/30 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-purple-600/20 px-4 py-2 rounded-lg border border-purple-500/30">
                <div className="text-purple-200 text-sm">Administrator</div>
                <div className="text-white font-semibold">{user?.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
            {[
              { id: 'dashboard', label: 'Overview', icon: TrendingUp, color: 'from-blue-500 to-purple-600' },
              { id: 'users', label: 'Users', icon: Users, color: 'from-green-500 to-blue-600' },
              { id: 'invoices', label: 'Invoices', icon: FileText, color: 'from-purple-500 to-pink-600' },
              { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-orange-500 to-red-600' },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 flex-1 justify-center ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                      : 'text-purple-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm rounded-lg p-6 border border-blue-400/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-200">Total Users</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {dashboardData?.userStats?.totalUsers || 0}
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                      {dashboardData?.userStats?.newUsers || 0} new this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-300" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-blue-600/20 backdrop-blur-sm rounded-lg p-6 border border-green-400/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-200">Total Invoices</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {dashboardData?.invoiceStats?.totalInvoices || 0}
                    </p>
                    <p className="text-xs text-green-300 mt-1">
                      {dashboardData?.invoiceStats?.paidInvoices || 0} paid
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-300" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm rounded-lg p-6 border border-purple-400/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-200">Total Payments</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {dashboardData?.paymentStats?.totalPayments || 0}
                    </p>
                    <p className="text-xs text-purple-300 mt-1">
                      {dashboardData?.paymentStats?.successfulPayments || 0} successful
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-300" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm rounded-lg p-6 border border-orange-400/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-200">Total Revenue</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      ₹{dashboardData?.paymentStats?.totalRevenue?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-orange-300 mt-1">Platform earnings</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/30 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-orange-300" />
                  </div>
                </div>
              </div>
            </div>            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">⚡ Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => exportData('users')}
                  disabled={actionLoading === 'export-users'}
                  className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg hover:from-blue-500/30 hover:to-purple-600/30 transition-all duration-200 text-left border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-6 h-6 text-blue-300 mb-2" />
                  <h3 className="font-medium text-white">Export Users</h3>
                  <p className="text-sm text-blue-200 mt-1">
                    {actionLoading === 'export-users' ? 'Exporting...' : 'Download user data as CSV'}
                  </p>
                </button>
                
                <button
                  onClick={() => exportData('invoices')}
                  disabled={actionLoading === 'export-invoices'}
                  className="p-4 bg-gradient-to-r from-green-500/20 to-blue-600/20 rounded-lg hover:from-green-500/30 hover:to-blue-600/30 transition-all duration-200 text-left border border-green-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-6 h-6 text-green-300 mb-2" />
                  <h3 className="font-medium text-white">Export Invoices</h3>
                  <p className="text-sm text-green-200 mt-1">
                    {actionLoading === 'export-invoices' ? 'Exporting...' : 'Download invoice data as CSV'}
                  </p>
                </button>
                
                <button
                  onClick={() => exportData('payments')}
                  disabled={actionLoading === 'export-payments'}
                  className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-lg hover:from-purple-500/30 hover:to-pink-600/30 transition-all duration-200 text-left border border-purple-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-6 h-6 text-purple-300 mb-2" />
                  <h3 className="font-medium text-white">Export Payments</h3>
                  <p className="text-sm text-purple-200 mt-1">
                    {actionLoading === 'export-payments' ? 'Exporting...' : 'Download payment data as CSV'}
                  </p>
                </button>
              </div>
            </div>

            {/* Platform Health */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">📊 Platform Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {dashboardData?.userStats?.activeUsers || 0}
                  </div>
                  <div className="text-sm text-green-300">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {dashboardData?.invoiceStats?.pendingInvoices || 0}
                  </div>
                  <div className="text-sm text-blue-300">Pending Invoices</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {dashboardData?.paymentStats?.pendingPayments || 0}
                  </div>
                  <div className="text-sm text-purple-300">Pending Payments</div>
                </div>
              </div>
            </div>
          </div>
        )}        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-purple-300"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                >
                  <option value="all" className="bg-slate-800">All Users</option>
                  <option value="active" className="bg-slate-800">Active</option>
                  <option value="inactive" className="bg-slate-800">Inactive</option>
                  <option value="admin" className="bg-slate-800">Admins</option>
                </select>                <button
                  onClick={() => exportData('users')}
                  disabled={actionLoading === 'export-users'}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {actionLoading === 'export-users' ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-purple-300">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{user.businessName || 'N/A'}</div>
                          <div className="text-sm text-purple-300">{user.businessType || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-purple-300 border border-purple-500/30'
                              : 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            user.isEmailVerified 
                              ? 'bg-gradient-to-r from-green-500/20 to-blue-600/20 text-green-300 border border-green-500/30'
                              : 'bg-gradient-to-r from-red-500/20 to-orange-600/20 text-red-300 border border-red-500/30'
                          }`}>
                            {user.isEmailVerified ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleUserStatus(user._id, user.isEmailVerified)}
                              disabled={actionLoading === user._id}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                user.isEmailVerified
                                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                                  : 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'
                              }`}
                            >
                              {user.isEmailVerified ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => deleteUser(user._id)}
                              disabled={actionLoading === user._id}
                              className="p-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">📄 All Invoices ({invoices.length})</h2>                <button
                  onClick={() => exportData('invoices')}
                  disabled={actionLoading === 'export-invoices'}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {actionLoading === 'export-invoices' ? 'Exporting...' : 'Export'}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Invoice #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {invoices.length > 0 ? invoices.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {invoice.invoiceNumber || `INV-${invoice._id.slice(-6)}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                          {invoice.clientId?.name || invoice.clientName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                          ₹{(invoice.total || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            invoice.status === 'paid' 
                              ? 'bg-gradient-to-r from-green-500/20 to-blue-600/20 text-green-300 border border-green-500/30'
                              : invoice.status === 'sent'
                              ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-300 border border-blue-500/30'
                              : 'bg-gradient-to-r from-gray-500/20 to-slate-600/20 text-gray-300 border border-gray-500/30'
                          }`}>
                            {invoice.status || 'draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-purple-300">
                          No invoices found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">💳 All Payments ({payments.length})</h2>                <button
                  onClick={() => exportData('payments')}
                  disabled={actionLoading === 'export-payments'}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {actionLoading === 'export-payments' ? 'Exporting...' : 'Export'}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Status
                      </th>                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {payments.length > 0 ? payments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {payment.transactionId || payment._id.slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                          {payment.userId?.firstName && payment.userId?.lastName 
                            ? `${payment.userId.firstName} ${payment.userId.lastName}`
                            : payment.userId?.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                          ₹{(payment.amount || 0).toLocaleString()}
                        </td>                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'completed' 
                              ? 'bg-gradient-to-r from-green-500/20 to-blue-600/20 text-green-300 border border-green-500/30'
                              : payment.status === 'pending' || payment.status === 'processing' || payment.status === 'authorized'
                              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-600/20 text-yellow-300 border border-yellow-500/30'
                              : 'bg-gradient-to-r from-red-500/20 to-pink-600/20 text-red-300 border border-red-500/30'
                          }`}>
                            {payment.status || 'unknown'}
                          </span>
                        </td>                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200">
                          {payment.method || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-purple-300">
                          No payments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
