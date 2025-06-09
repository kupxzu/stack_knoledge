import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import api from '@services/api';
import AnimationBG from '@/common/AnimationBG';
import BillingNavSide from '@/components/BillingNavSide';
  

const BillingReports = () => {
  // State management
  const [mode, setMode] = useState('default'); // 'default' or 'advanced'
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  
  // Report data
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});

  // Default mode filters
  const [period, setPeriod] = useState('today');
  const [status, setStatus] = useState('all');
  const [rows, setRows] = useState(10);
  const [page, setPage] = useState(1);

  // Advanced mode filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Helper functions
  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  };

  const formatNumber = (num) => {
    const numericValue = parseInt(num) || 0;
    return new Intl.NumberFormat().format(numericValue);
  };

  // Load reports
  const loadReports = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        mode,
        status,
        rows: rows.toString(),
        page: page.toString()
      });

      if (mode === 'default') {
        params.append('period', period);
      } else {
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
      }

      const response = await api.get(`/billing/reports?${params}`);
      
      if (response.data.success) {
        setReports(response.data.data.patients || []);
        setSummary(response.data.data.summary || {});
        setPagination(response.data.data.pagination || {});
      } else {
        setError('Failed to load reports');
      }
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Error loading reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const params = new URLSearchParams();
      
      if (mode === 'default') {
        params.append('period', period);
      }

      const response = await api.get(`/billing/reports/stats?${params}`);
      
      if (response.data.success) {
        setStats(response.data.stats || {});
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Export reports
  const exportReports = async (format = 'csv') => {
    setExporting(true);
    
    try {
      const params = new URLSearchParams({
        mode,
        status,
        format
      });

      if (mode === 'default') {
        params.append('period', period);
      } else {
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
      }

      const response = await api.get(`/billing/reports/export?${params}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `billing_report_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting:', err);
      setError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Handle mode change
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setPage(1); // Reset to first page
    
    if (newMode === 'advanced' && !startDate && !endDate) {
      // Set default dates for advanced mode
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      setStartDate(weekAgo.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Load data on component mount and filter changes
  useEffect(() => {
    loadReports();
    loadStats();
  }, [mode, period, status, rows, page, startDate, endDate]);

  return (
    <AnimationBG variant="dots" color="blue" intensity="low" className="min-h-screen">
      <div className="min-h-screen bg-gray-50/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
                  Billing Reports
                </h1>
                <p className="text-gray-600 mt-2">
                  Comprehensive billing reports and analytics
                </p>
              </div>
              
              {/* Export Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => exportReports('csv')}
                  disabled={exporting || loading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
                
                <button
                  onClick={() => exportReports('excel')}
                  disabled={exporting || loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  {exporting ? 'Exporting...' : 'Export Excel'}
                </button>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 inline-flex">
              <button
                onClick={() => handleModeChange('default')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'default'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <ClockIcon className="h-4 w-4 inline mr-2" />
                Default Mode
              </button>
              <button
                onClick={() => handleModeChange('advanced')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'advanced'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 inline mr-2" />
                Advanced Mode
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center mb-4">
              <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Period Filter (Default Mode) */}
              {mode === 'default' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              )}

              {/* Date Range (Advanced Mode) */}
              {mode === 'advanced' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Patients</option>
                  <option value="active">Active Only</option>
                  <option value="discharged">Discharged Only</option>
                </select>
              </div>

              {/* Rows Per Page */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rows Per Page
                </label>
                <select
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 rows</option>
                  <option value={20}>20 rows</option>
                  <option value={50}>50 rows</option>
                  <option value={100}>100 rows</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {summary && Object.keys(summary).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <UserGroupIcon className="h-10 w-10 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(summary.total_patients)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-10 w-10 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(summary.total_amount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <CalendarIcon className="h-10 w-10 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Period</p>
                    <p className="text-lg font-bold text-gray-900">
                      {mode === 'default' 
                        ? summary.period_label 
                        : `${summary.date_range?.start} to ${summary.date_range?.end}`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reports Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Patient Reports</h3>
              <p className="text-sm text-gray-500 mt-1">
                Detailed billing information for patients
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading reports...
                </div>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center">
                <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports found for the selected criteria.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Physician
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transactions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.map((patient, index) => (
                        <tr key={patient.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-800">
                                    {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {patient.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {patient.contact}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-600">
                              {formatCurrency(patient.total_amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              patient.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {patient.status === 'active' ? (
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                              ) : (
                                <ClockIcon className="h-3 w-3 mr-1" />
                              )}
                              {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.physician}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.room}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.transaction_count} transactions
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                      {pagination.total} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={!pagination.has_prev}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {/* Page numbers */}
                      {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                        const pageNum = Math.max(1, pagination.current_page - 2) + i;
                        if (pageNum <= pagination.total_pages) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 text-sm border rounded-md ${
                                pageNum === pagination.current_page
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={!pagination.has_next}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Total Summary */}
          {summary && summary.total_amount !== undefined && (
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Report Summary</h3>
                  <p className="text-sm text-gray-600">
                    Total revenue from {formatNumber(summary.total_patients)} patients
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Grand Total</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(summary.total_amount)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimationBG>
  );
};

export default BillingReports;