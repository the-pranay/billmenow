'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Users, 
  ArrowLeft,
  PieChart
} from 'lucide-react';
import Link from 'next/link';
import withAuth from '../components/Auth/withAuth';
import { useToast } from '../components/Utilities/Toast';
import { reportsAPI } from '../lib/api';
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
  });  const toast = useToast();

  const loadReportsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await reportsAPI.getAll();
      
      if (data && data.success) {
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
  }, [toast]);

  // Load reports data from API
  useEffect(() => {
    loadReportsData();
  }, [dateRange, loadReportsData]);

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
      if (reportsData.kpiCards && reportsData.kpiCards.length > 0) {
        reportsData.kpiCards.forEach((kpi) => {
          pdf.setFontSize(12);
          pdf.text(`${kpi.title}: ${kpi.value} (${kpi.change})`, 20, yPos);
          yPos += 15;
        });
      }
      
      // Add revenue data
      pdf.setFontSize(16);
      pdf.text('Revenue Breakdown', 20, yPos + 10);
      yPos += 25;
      
      if (reportsData.revenueData && reportsData.revenueData.length > 0) {
        reportsData.revenueData.forEach((data) => {
          pdf.setFontSize(12);
          pdf.text(`${data.month}: ₹${data.amount.toLocaleString()} (${data.invoices} invoices)`, 20, yPos);
          yPos += 12;
        });
      }
      
      // Save the PDF
      pdf.save(`billmenow-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  // Use real data or fallback to mock data
  const { revenueData, paymentStatusData, topClients, kpiCards } = reportsData;

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
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 3 months</option>
                <option value="6months">Last 6 months</option>
                <option value="1year">Last year</option>
              </select>
              <button 
                onClick={exportToPDF}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">            {kpiCards && kpiCards.map((kpi) => (
              <div key={kpi.id || kpi.title} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
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
              <div className="space-y-4">                {revenueData && revenueData.map((data) => (
                  <div key={data.month || data.id} className="flex items-center space-x-4">
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

              <div className="space-y-4">                {paymentStatusData && paymentStatusData.map((status) => (
                  <div key={status.status || status.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${status.color || 'bg-gray-500'}`}></div>
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

              {paymentStatusData && paymentStatusData.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{paymentStatusData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Clients */}
        {topClients && topClients.length > 0 && (
          <div className="mt-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Clients</h2>
              </div>

              <div className="space-y-4">                {topClients.map((client) => (
                  <div key={client.name || client.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
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
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ReportsPage);
