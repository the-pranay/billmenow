'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, XCircle, Clock, Activity } from 'lucide-react'

export default function StatusPage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const overallStatus = {
    status: 'operational',
    message: 'All systems operational'
  }

  const services = [
    {
      name: 'Invoice Creation & Management',
      status: 'operational',
      uptime: '99.98%',
      responseTime: '245ms',
      lastIncident: null
    },
    {
      name: 'Payment Processing',
      status: 'operational',
      uptime: '99.95%',
      responseTime: '180ms',
      lastIncident: null
    },
    {
      name: 'Email Delivery',
      status: 'operational',
      uptime: '99.92%',
      responseTime: '320ms',
      lastIncident: null
    },
    {
      name: 'API Services',
      status: 'operational',
      uptime: '99.97%',
      responseTime: '156ms',
      lastIncident: null
    },
    {
      name: 'Web Application',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '98ms',
      lastIncident: null
    },
    {
      name: 'Database Services',
      status: 'operational',
      uptime: '99.96%',
      responseTime: '45ms',
      lastIncident: null
    }
  ]

  const metrics = [
    {
      name: 'Overall Uptime',
      value: '99.97%',
      trend: '+0.02%',
      period: 'Last 30 days'
    },
    {
      name: 'Average Response Time',
      value: '174ms',
      trend: '-12ms',
      period: 'Last 24 hours'
    },
    {
      name: 'Successful Requests',
      value: '99.94%',
      trend: '+0.01%',
      period: 'Last 7 days'
    },
    {
      name: 'Active Users',
      value: '12,847',
      trend: '+234',
      period: 'Currently online'
    }
  ]

  const incidents = [
    {
      id: 1,
      title: 'Scheduled Maintenance - Database Optimization',
      status: 'completed',
      severity: 'maintenance',
      startTime: '2024-01-15T02:00:00Z',
      endTime: '2024-01-15T04:30:00Z',
      description: 'Routine database maintenance to improve performance.',
      affectedServices: ['Database Services', 'API Services']
    },
    {
      id: 2,
      title: 'Intermittent Email Delays',
      status: 'resolved',
      severity: 'minor',
      startTime: '2024-01-12T14:20:00Z',
      endTime: '2024-01-12T15:45:00Z',
      description: 'Some users experienced delays in email delivery. Issue was resolved by switching to backup email servers.',
      affectedServices: ['Email Delivery']
    },
    {
      id: 3,
      title: 'Payment Gateway Connectivity Issue',
      status: 'resolved',
      severity: 'major',
      startTime: '2024-01-08T09:15:00Z',
      endTime: '2024-01-08T10:30:00Z',
      description: 'Temporary connectivity issues with payment gateway provider affected payment processing.',
      affectedServices: ['Payment Processing']
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'maintenance':
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
      case 'outage':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
      case 'maintenance':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      default:
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'major':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'critical':
        return 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200'
      case 'maintenance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                BillMeNow Status
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Current status of all BillMeNow services
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated
              </div>
              <div className="text-lg font-medium text-gray-900 dark:text-white">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overall Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(overallStatus.status)}
              <div className="ml-3">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {overallStatus.message}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  All systems are running smoothly
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(overallStatus.status)}`}>
              Operational
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {metric.name}
                </h3>
                <Activity className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </div>
              <div className="flex items-center text-sm">
                <span className="text-green-600 dark:text-green-400 mr-1">
                  {metric.trend}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {metric.period}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Services Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Services Status
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {services.map((service, index) => (
              <div key={index} className="p-6 flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(service.status)}
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Uptime: {service.uptime}</span>
                      <span>Response: {service.responseTime}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}>
                  Operational
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Incidents
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {incidents.map((incident) => (
              <div key={incident.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {getStatusIcon(incident.status === 'resolved' || incident.status === 'completed' ? 'operational' : incident.severity)}
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {incident.title}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(incident.startTime).toLocaleDateString()} - {new Date(incident.endTime).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor('operational')}`}>
                    {incident.status}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {incident.description}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Affected services: {incident.affectedServices.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe to Updates */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Stay Updated
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Subscribe to status updates and incident notifications
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
