'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Users, 
  ArrowLeft,
  Eye,
  PieChart,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import withAuth from '../components/Auth/withAuth';
import { useToast } from '../components/Utilities/Toast';
import jsPDF from 'jspdf';

function ReportsPage() {
  const [dateRange, setDateRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [reportsData, setReportsData] = useState({
    revenueData: [],
    paymentStatusData: [],
    topClients: [],
    kpiCards: []
  });
  const toast = useToast();
  // Load reports data from API
  const loadReportsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reports?dateRange=${dateRange}`);
      const data = await response.json();
      
      if (data.success) {
        setReportsData(data.reports || {});
      } else {
        toast.error('Failed to load reports data');
      }
    } catch (error) {
      console.error('Error loading reports data:', error);
      toast.error('Failed to load reports data');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, toast]);

  useEffect(() => {
    loadReportsData();
  }, [loadReportsData]);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('BillMeNow - Business Report', 20, 30);
      
      // Add date range
      pdf.setFontSize(12);
      pdf.text(`Period: ${dateRange}`, 20, 45);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55);
      
      // Add KPI summary
      pdf.setFontSize(16);
      pdf.text('Key Performance Indicators', 20, 75);
      
      let yPos = 90;
      reportsData.kpiCards.forEach((kpi) => {
        pdf.setFontSize(12);
        pdf.text(`${kpi.title}: ${kpi.value} (${kpi.change})`, 20, yPos);
        yPos += 15;
      });
      
      // Add revenue data
      pdf.setFontSize(16);
      pdf.text('Revenue Breakdown', 20, yPos + 10);
      yPos += 25;
      
      reportsData.revenueData.forEach((data) => {
        pdf.setFontSize(12);
        pdf.text(`${data.month}: ₹${data.amount.toLocaleString()} (${data.invoices} invoices)`, 20, yPos);
        yPos += 12;
      });
      
      // Save the PDF
      pdf.save(`billmenow-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }  };

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input-primary text-sm"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 3 months</option>
                <option value="6months">Last 6 months</option>
                <option value="1year">Last year</option>
              </select>              <button 
                onClick={exportToPDF}
                disabled={isExporting}
                className="btn-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {reportsData.kpiCards.map((kpi, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{kpi.value}</p>
                    <div className="flex items-center mt-2">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {kpi.change}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50 dark:bg-slate-700 ${kpi.color}`}>
                    <kpi.icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trends</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedMetric('revenue')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      selectedMetric === 'revenue'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    Revenue
                  </button>
                  <button
                    onClick={() => setSelectedMetric('invoices')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      selectedMetric === 'invoices'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    Invoices
                  </button>
                </div>
              </div>

              {/* Simple Bar Chart */}
              <div className="space-y-4">
                {revenueData.map((data, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 text-sm text-gray-600 dark:text-gray-400">{data.month}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedMetric === 'revenue' ? `₹${data.amount.toLocaleString()}` : `${data.invoices} invoices`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${selectedMetric === 'revenue' 
                              ? (data.amount / Math.max(...revenueData.map(d => d.amount))) * 100
                              : (data.invoices / Math.max(...revenueData.map(d => d.invoices))) * 100
                            }%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Status</h2>
              </div>

              <div className="space-y-4">
                {paymentStatusData.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{status.status}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{status.count} invoices</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{status.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{paymentStatusData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Top Clients */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Clients</h2>
            </div>

            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{client.invoices} invoices</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">₹{client.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h2>
            </div>

            <div className="space-y-6">
              {/* Invoice Success Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Success Rate</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">92%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              {/* Collection Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Collection Rate</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">87%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>

              {/* Client Retention */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Retention</span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">95%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              {/* Average Invoice Value */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Invoice Value</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">₹36,286</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Growth</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">+8.2%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="mt-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Insights & Recommendations</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">💡 Revenue Growth</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your revenue increased by 12.5% this month. Consider raising your rates for new projects.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Payment Delays</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  8 invoices are overdue. Send payment reminders to improve cash flow.
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📈 Client Growth</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You gained 3 new clients this month. Focus on client retention strategies.
                </p>
              </div>
            </div>
          </div>
        </div>      </div>
    </div>
  );
}

export default withAuth(ReportsPage);
