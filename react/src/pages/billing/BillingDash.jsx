import { useState, useEffect } from 'react';
import BillingNavSide from '@/components/BillingNavSide';
import api from '@/services/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const BillingDash = () => {
  const [billingStats, setBillingStats] = useState({});
  const [dischargeStats, setDischargeStats] = useState({});
  const [transactionStats, setTransactionStats] = useState({});
  const [physicianStats, setPhysicianStats] = useState({});
  const [patientsList, setPatientsList] = useState({ patients: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const [patientsFilter, setPatientsFilter] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  useEffect(() => {
    loadPatientsList();
  }, [patientsFilter, searchTerm, currentPage]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [billing, discharge, transaction, physician] = await Promise.all([
        api.get(`/billing/dashboard/stats?period=${period}`),
        api.get(`/billing/dashboard/discharge-stats?period=${period}`),
        api.get(`/billing/dashboard/transaction-stats?period=${period}`),
        api.get(`/billing/dashboard/physician-stats?period=${period}`)
      ]);

      setBillingStats(billing.data.stats || {});
      setDischargeStats(discharge.data.stats || {});
      setTransactionStats(transaction.data.stats || {});
      setPhysicianStats(physician.data.stats || {});
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default empty states on error
      setBillingStats({});
      setDischargeStats({});
      setTransactionStats({});
      setPhysicianStats({});
    } finally {
      setLoading(false);
    }
  };

  const loadPatientsList = async () => {
    try {
      const response = await api.get(`/billing/dashboard/patients-list?status=${patientsFilter}&search=${searchTerm}&page=${currentPage}&per_page=10`);
      setPatientsList(response.data || { patients: [], pagination: null });
    } catch (error) {
      console.error('Error loading patients list:', error);
      setPatientsList({ patients: [], pagination: null });
    }
  };

  const formatCurrency = (amount) => {
    // Handle null, undefined, or invalid numbers
    const numericAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  };

  const formatNumber = (num) => {
    // Handle null, undefined, or invalid numbers
    const numericValue = parseInt(num) || 0;
    return new Intl.NumberFormat().format(numericValue);
  };

  const formatDays = (days) => {
    // Handle null, undefined, or invalid numbers
    const numericDays = parseFloat(days) || 0;
    return Math.round(numericDays);
  };

  const getGrowthIndicator = (growth) => {
    if (growth > 0) return { color: 'text-green-600', symbol: '↗', text: 'increase', bg: 'bg-green-50' };
    if (growth < 0) return { color: 'text-red-600', symbol: '↘', text: 'decrease', bg: 'bg-red-50' };
    return { color: 'text-gray-600', symbol: '→', text: 'no change', bg: 'bg-gray-50' };
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 }
        }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const value = parseFloat(context.parsed.y) || 0;
            return `Revenue: ₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280', font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
        ticks: {
          color: '#6B7280',
          font: { size: 11 },
          callback: function(value) {
            const numericValue = parseFloat(value) || 0;
            return '₱' + numericValue.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
          }
        }
      }
    },
    elements: {
      point: { radius: 4, hoverRadius: 6, backgroundColor: '#ffffff', borderWidth: 2 },
      line: { tension: 0.4 }
    }
  };

  const dischargeChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            return `Discharges: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          ...chartOptions.scales.y.ticks,
          callback: function(value) {
            return Math.round(value);
          }
        }
      }
    }
  };

  const revenueByDayData = {
    labels: transactionStats?.revenueByDay?.map(d => d.date) || [],
    datasets: [{
      label: 'Revenue',
      data: transactionStats?.revenueByDay?.map(d => parseFloat(d.revenue) || 0) || [],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#10B981',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const dischargeTrendData = {
    labels: dischargeStats?.dischargeTrend?.map(d => d.date) || [],
    datasets: [{
      label: 'Discharges',
      data: dischargeStats?.dischargeTrend?.map(d => d.discharges) || [],
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#EF4444',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const physicianTypeData = {
    labels: physicianStats?.physicianTypes?.map(p => p.type) || [],
    datasets: [{
      data: physicianStats?.physicianTypes?.map(p => p.count) || [],
      backgroundColor: physicianStats?.physicianTypes?.map(p => p.color) || ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      borderWidth: 0
    }]
  };

  if (loading) {
    return (
      <BillingNavSide>
        <div className="space-y-6 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </BillingNavSide>
    );
  }

  return (
    <BillingNavSide>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="space-y-8 p-6">
          {/* Header Section */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BanknotesIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Billing Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1 text-lg">Monitor revenue, transactions, and patient billing</p>
                </div>
              </div>
              <div className="mt-6 lg:mt-0">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-white border-2 border-gray-200 rounded-xl px-6 py-3 text-gray-700 font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 shadow-sm"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Active Patients */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm font-medium">Active Patients</p>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2">{formatNumber(billingStats?.activePatients)}</p>
                <p className="text-blue-200 text-sm">Currently admitted</p>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <BanknotesIcon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2">{formatCurrency(billingStats?.totalRevenue)}</p>
                <p className="text-green-200 text-sm">All time earnings</p>
              </div>
            </div>

            {/* Today's Revenue */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-purple-100 text-sm font-medium">Today's Revenue</p>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2">{formatCurrency(billingStats?.todayRevenue)}</p>
                {transactionStats?.revenueGrowth !== undefined && (
                  <div className="flex items-center">
                    <span className={`text-lg mr-1 ${getGrowthIndicator(transactionStats.revenueGrowth).color}`}>
                      {getGrowthIndicator(transactionStats.revenueGrowth).symbol}
                    </span>
                    <span className="text-sm text-purple-200">
                      {Math.abs(transactionStats.revenueGrowth)}% {getGrowthIndicator(transactionStats.revenueGrowth).text}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Discharged Patients */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <XMarkIcon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-red-100 text-sm font-medium">Discharged Patients</p>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2">{formatNumber(billingStats?.dischargedPatients)}</p>
                <p className="text-red-200 text-sm">Completed treatment</p>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pending Transactions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-2">Pending Transactions</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(billingStats?.pendingTransactions)}</p>
                  <p className="text-gray-500 text-xs">Awaiting payment</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Average Transaction */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-2">Average Transaction</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(billingStats?.averageTransactionAmount)}</p>
                  <p className="text-gray-500 text-xs">Per transaction</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BanknotesIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Average Stay */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-2">Average Stay</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{formatDays(dischargeStats?.averageStayDuration)} days</p>
                  <p className="text-gray-500 text-xs">Patient duration</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <HomeIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Today's Discharges */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-2">Today's Discharges</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(dischargeStats?.todayDischarges)}</p>
                  <p className="text-gray-500 text-xs">Released today</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XMarkIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Trend */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <ChartBarIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Revenue Trend</h3>
                      <p className="text-gray-600">Daily revenue overview</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(
                        transactionStats?.revenueByDay?.reduce((sum, day) => {
                          return sum + (parseFloat(day.revenue) || 0);
                        }, 0) || 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="h-80 w-full">
                  {transactionStats?.revenueByDay?.length > 0 ? (
                    <Line data={revenueByDayData} options={chartOptions} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ChartBarIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-xl font-medium mb-2">No Revenue Data</p>
                      <p className="text-center text-gray-400">Revenue data will appear here once transactions are recorded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Discharge Trend */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <XMarkIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Discharge Trend</h3>
                      <p className="text-gray-600">Daily discharge overview</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatNumber(dischargeStats?.dischargeTrend?.reduce((sum, day) => sum + day.discharges, 0) || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="h-80 w-full">
                  {dischargeStats?.dischargeTrend?.length > 0 ? (
                    <Line data={dischargeTrendData} options={dischargeChartOptions} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <XMarkIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-xl font-medium mb-2">No Discharge Data</p>
                      <p className="text-center text-gray-400">Discharge data will appear here once patients are discharged</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Physician Types Distribution */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Physician Types</h3>
                  <p className="text-gray-600">Distribution overview</p>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center">
                {physicianStats?.physicianTypes?.length > 0 ? (
                  <Doughnut 
                    data={physicianTypeData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 12,
                            fontSize: 12,
                            padding: 15
                          }
                        }
                      }
                    }} 
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <UserIcon className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No Data Available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Physicians List */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Physicians</h3>
                  <p className="text-gray-600">Active medical staff</p>
                </div>
              </div>
              <div className="space-y-4 max-h-72 overflow-y-auto">
                {physicianStats?.topPhysiciansByRevenue?.length > 0 ? (
                  physicianStats.topPhysiciansByRevenue.slice(0, 5).map((physician, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{physician.physician}</p>
                          <p className="text-xs text-gray-500">{physician.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{physician.patients} patients</p>
                        <p className="text-xs text-gray-500">Active cases</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center text-gray-500 py-12">
                    <UserIcon className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No Data Available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Unpaid Patients */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Unpaid Patients</h3>
                  <p className="text-gray-600">Payment pending</p>
                </div>
              </div>
              <div className="space-y-4 max-h-72 overflow-y-auto">
                {transactionStats?.unpaidPatients?.length > 0 ? (
                  transactionStats.unpaidPatients.slice(0, 5).map((patient, index) => (
                    <div key={index} className="p-4 bg-orange-50 rounded-xl border border-orange-200 hover:bg-orange-100 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{patient.name}</p>
                            <p className="text-xs text-gray-500">{patient.physician}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-orange-600">{formatDays(patient.days_without_payment)} days</p>
                          <p className="text-xs text-gray-500">No payment</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center text-gray-500 py-12">
                    <ExclamationTriangleIcon className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-center">All Payments Current</p>
                    <p className="text-sm text-gray-400 text-center mt-1">No outstanding payments</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patients List */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Patient List</h3>
                    <p className="text-gray-600">Manage patient billing</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-6 sm:mt-0">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <select
                    value={patientsFilter}
                    onChange={(e) => setPatientsFilter(e.target.value)}
                    className="border-2 border-gray-200 rounded-xl px-6 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="active">Active</option>
                    <option value="discharged">Discharged</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Physician</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patientsList?.patients?.length > 0 ? (
                    patientsList.patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {patient.patient_info?.first_name} {patient.patient_info?.last_name}
                              </div>
                              <div className="text-sm text-gray-500">ID: #{patient.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            patient.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : patient.status === 'discharged'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {patient.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.patient_room?.room_name || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.patient_physician ? 
                            `Dr. ${patient.patient_physician.first_name} ${patient.patient_physician.last_name}` : 
                            'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(patient.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {patient.transaction_count}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center text-gray-500">
                          <UserIcon className="w-16 h-16 mb-4 text-gray-300" />
                          <p className="text-xl font-medium">No patients found</p>
                          <p className="text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {patientsList?.pagination && patientsList.pagination.total_pages > 1 && (
              <div className="px-8 py-6 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Showing page {patientsList.pagination.current_page} of {patientsList.pagination.total_pages} 
                  ({patientsList.pagination.total} total patients)
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={!patientsList.pagination.has_prev}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(patientsList.pagination.total_pages, currentPage + 1))}
                    disabled={!patientsList.pagination.has_next}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BillingNavSide>
  );
};

export default BillingDash;