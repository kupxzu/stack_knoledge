import { useState, useEffect } from 'react';
import BillingNavSide from '@/components/BillingNavSide';
import api from '@/services/api';
import {
  UserIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  HomeIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ChartPieIcon,
  Bars3BottomLeftIcon,
  PresentationChartLineIcon,
  CalendarDaysIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon
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
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
  
  // Chart view modes
  const [trendChartMode, setTrendChartMode] = useState('line');
  const [statsChartMode, setStatsChartMode] = useState('pie');
  
  // Mobile states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileView, setMobileView] = useState('overview'); // overview, charts, patients

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
    const numericAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericAmount);
  };

  const formatNumber = (num) => {
    const numericValue = parseInt(num) || 0;
    return new Intl.NumberFormat().format(numericValue);
  };

  const formatDays = (days) => {
    const numericDays = parseFloat(days) || 0;
    return Math.round(numericDays);
  };

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return now.toLocaleDateString('en-US', options);
  };

  // Combined Revenue & Discharge Trend Data
  const combinedTrendData = {
    labels: transactionStats?.revenueByDay?.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Revenue (₱)',
        data: transactionStats?.revenueByDay?.map(d => parseFloat(d.revenue) || 0) || [],
        borderColor: '#059669',
        backgroundColor: trendChartMode === 'bar' ? 'rgba(5, 150, 105, 0.8)' : 'rgba(5, 150, 105, 0.1)',
        fill: trendChartMode === 'line',
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#059669',
        pointBorderWidth: 2,
        pointRadius: trendChartMode === 'line' ? 0 : 3,
        pointHoverRadius: 5,
        yAxisID: 'y'
      },
      {
        label: 'Discharges',
        data: dischargeStats?.dischargeTrend?.map(d => d.discharges) || [],
        borderColor: '#DC2626',
        backgroundColor: trendChartMode === 'bar' ? 'rgba(220, 38, 38, 0.8)' : 'rgba(220, 38, 38, 0.1)',
        fill: trendChartMode === 'line',
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#DC2626',
        pointBorderWidth: 2,
        pointRadius: trendChartMode === 'line' ? 0 : 3,
        pointHoverRadius: 5,
        yAxisID: 'y1'
      }
    ]
  };

  // Statistics Chart Data
  const statsData = {
    labels: [
      'Active Patients',
      'Discharged Patients', 
      'Pending Transactions',
      'Avg Stay (Days)',
      'Today\'s Discharges'
    ],
    datasets: [{
      label: 'Statistics',
      data: [
        parseInt(billingStats?.activePatients) || 0,
        parseInt(billingStats?.dischargedPatients) || 0,
        parseInt(billingStats?.pendingTransactions) || 0,
        formatDays(dischargeStats?.averageStayDuration) || 0,
        parseInt(dischargeStats?.todayDischarges) || 0
      ],
      backgroundColor: [
        '#3B82F6', // Blue
        '#EF4444', // Red
        '#F59E0B', // Amber
        '#8B5CF6', // Purple
        '#10B981'  // Emerald
      ],
      borderColor: [
        '#2563EB',
        '#DC2626',
        '#D97706',
        '#7C3AED',
        '#059669'
      ],
      borderWidth: statsChartMode === 'pie' ? 0 : 2,
      fill: statsChartMode === 'line',
      tension: 0.4,
      pointBackgroundColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: statsChartMode === 'line' ? 0 : 3,
      pointHoverRadius: 5
    }]
  };

  // Revenue Statistics Chart Data
  const revenueStatsData = {
    labels: ['Total Revenue', 'Today\'s Revenue', 'Average Transaction'],
    datasets: [{
      label: 'Revenue (₱)',
      data: [
        parseFloat(billingStats?.totalRevenue) || 0,
        parseFloat(billingStats?.todayRevenue) || 0,
        parseFloat(billingStats?.averageTransactionAmount) || 0
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)', // Emerald
        'rgba(139, 92, 246, 0.8)',  // Purple
        'rgba(59, 130, 246, 0.8)'   // Blue
      ],
      borderColor: [
        '#10B981',
        '#8B5CF6',
        '#3B82F6'
      ],
      borderWidth: 2,
      fill: statsChartMode === 'line',
      tension: 0.4,
      pointBackgroundColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: statsChartMode === 'line' ? 0 : 3,
      pointHoverRadius: 5
    }]
  };

  // Mobile-optimized chart options
  const mobileChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 10, family: 'Inter' },
          color: '#374151',
          boxWidth: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: { family: 'Inter', size: 11 },
        bodyFont: { family: 'Inter', size: 10 },
        padding: 8,
        callbacks: {
          label: function(context) {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;
            if (datasetLabel.includes('Revenue')) {
              return `${datasetLabel}: ₱${value.toLocaleString('en-PH')}`;
            }
            return `${datasetLabel}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: '#6B7280', 
          font: { size: 9, family: 'Inter' },
          maxRotation: 45
        },
        border: { display: false }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: { color: 'rgba(5, 150, 105, 0.1)', drawBorder: false },
        ticks: {
          color: '#059669',
          font: { size: 9, family: 'Inter' },
          callback: function(value) {
            return '₱' + (value/1000).toFixed(0) + 'k';
          }
        },
        border: { display: false }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        ticks: {
          color: '#DC2626',
          font: { size: 9, family: 'Inter' },
          callback: function(value) {
            return Math.round(value);
          }
        },
        border: { display: false }
      }
    },
    elements: {
      point: { 
        radius: trendChartMode === 'line' ? 0 : 3, 
        hoverRadius: 5, 
        backgroundColor: '#ffffff', 
        borderWidth: 2,
        hoverBorderWidth: 2
      },
      line: { tension: 0.4, borderWidth: 2 },
      bar: { borderRadius: 4, borderSkipped: false }
    }
  };

  const mobileStatsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: statsChartMode === 'pie',
        position: 'bottom',
        labels: {
          boxWidth: 8,
          font: { size: 9, family: 'Inter' },
          padding: 10,
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: { family: 'Inter', size: 11 },
        bodyFont: { family: 'Inter', size: 10 },
        padding: 8
      }
    },
    ...(statsChartMode !== 'pie' && {
      scales: {
        x: {
          grid: { display: false },
          ticks: { 
            color: '#6B7280', 
            font: { size: 9, family: 'Inter' },
            maxRotation: 45
          },
          border: { display: false }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
          ticks: {
            color: '#6B7280',
            font: { size: 9, family: 'Inter' }
          },
          border: { display: false }
        }
      },
      elements: {
        point: { 
          radius: statsChartMode === 'line' ? 0 : 3, 
          hoverRadius: 5, 
          backgroundColor: '#ffffff', 
          borderWidth: 2
        },
        line: { tension: 0.4, borderWidth: 2 },
        bar: { borderRadius: 4, borderSkipped: false }
      }
    })
  };

  // Skeleton components
  const MobileStatCardSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton height={12} width={60} />
          <Skeleton height={24} width={80} />
          <Skeleton height={10} width={70} />
        </div>
        <Skeleton circle height={40} width={40} />
      </div>
    </div>
  );

  const MobileChartSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Skeleton circle height={32} width={32} />
          <div>
            <Skeleton height={16} width={100} />
            <Skeleton height={12} width={80} />
          </div>
        </div>
        <Skeleton height={32} width={60} />
      </div>
      <Skeleton height={200} />
    </div>
  );

  const renderStatsChart = (isMobile = false) => {
    const options = isMobile ? mobileStatsChartOptions : mobileStatsChartOptions;
    if (statsChartMode === 'pie') {
      return <Doughnut data={statsData} options={options} />;
    } else if (statsChartMode === 'bar') {
      return <Bar data={statsData} options={options} />;
    } else {
      return <Line data={statsData} options={options} />;
    }
  };

  const renderRevenueChart = (isMobile = false) => {
    const options = isMobile ? mobileStatsChartOptions : mobileStatsChartOptions;
    if (statsChartMode === 'pie') {
      return <Doughnut data={revenueStatsData} options={options} />;
    } else if (statsChartMode === 'bar') {
      return <Bar data={revenueStatsData} options={options} />;
    } else {
      return <Line data={revenueStatsData} options={options} />;
    }
  };

  const renderTrendChart = (isMobile = false) => {
    const options = isMobile ? mobileChartOptions : mobileChartOptions;
    if (trendChartMode === 'bar') {
      return <Bar data={combinedTrendData} options={options} />;
    } else {
      return <Line data={combinedTrendData} options={options} />;
    }
  };

  // Mobile Tab Navigation
  const MobileTabNavigation = () => (
    <div className="lg:hidden bg-white border-b border-gray-100 sticky top-16 z-30">
      <div className="flex">
        {[
          { id: 'overview', label: 'Overview', icon: ChartBarIcon },
          { id: 'charts', label: 'Charts', icon: PresentationChartLineIcon },
          { id: 'patients', label: 'Patients', icon: UserIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setMobileView(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 px-2 text-xs font-medium transition-colors duration-200 ${
                mobileView === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Mobile Patient Card
  const MobilePatientCard = ({ patient }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">
              {patient.patient_info?.first_name} {patient.patient_info?.last_name}
            </div>
            <div className="text-xs text-gray-500">ID: #{patient.id}</div>
          </div>
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          patient.status === 'active' 
            ? 'bg-emerald-100 text-emerald-800' 
            : patient.status === 'discharged'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {patient.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-gray-500 block mb-1">Room:</span>
          <span className="font-medium text-gray-900">{patient.patient_room?.room_name || 'Not assigned'}</span>
        </div>
        <div>
          <span className="text-gray-500 block mb-1">Physician:</span>
          <span className="font-medium text-gray-900">
            {patient.patient_physician ? 
              `Dr. ${patient.patient_physician.first_name} ${patient.patient_physician.last_name}` : 
              'Not assigned'}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block mb-1">Total Amount:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(patient.total_amount)}</span>
        </div>
        <div>
          <span className="text-gray-500 block mb-1">Transactions:</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {patient.transaction_count}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <BillingNavSide>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <SkeletonTheme baseColor="#f8f9fa" highlightColor="#e9ecef">
              <div className="space-y-4 lg:space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center space-x-3">
                  <Skeleton circle height={32} width={32} />
                  <div>
                    <Skeleton height={24} width={200} className="lg:hidden" />
                    <Skeleton height={32} width={250} className="hidden lg:block" />
                    <Skeleton height={16} width={250} />
                  </div>
                </div>

                {/* Mobile Charts Skeleton */}
                <div className="lg:hidden space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <MobileChartSkeleton key={i} />
                  ))}
                </div>

                {/* Desktop Charts Skeleton */}
                <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <Skeleton circle height={48} width={48} />
                          <div>
                            <Skeleton height={20} width={150} />
                            <Skeleton height={16} width={120} />
                          </div>
                        </div>
                        <Skeleton height={32} width={80} />
                      </div>
                      <Skeleton height={320} />
                    </div>
                  ))}
                </div>
              </div>
            </SkeletonTheme>
          </div>
        </div>
      </BillingNavSide>
    );
  }

  return (
    <BillingNavSide>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="space-y-4 lg:space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Billing Dashboard</h1>
                  <p className="text-sm lg:text-base text-gray-600 mt-1">Monitor revenue, transactions, and patient billing</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1 lg:hidden">
                    <CalendarDaysIcon className="w-3 h-3 mr-1" />
                    {getCurrentDateTime()}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-3 py-2 lg:px-4 lg:py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <div className="hidden lg:flex items-center text-sm text-gray-500">
                  <CalendarDaysIcon className="w-4 h-4 mr-2" />
                  {getCurrentDateTime()}
                </div>
              </div>
            </div>

            {/* Mobile Tab Navigation */}
            <MobileTabNavigation />

            {/* Mobile Overview - Quick Stats Cards */}
            {(mobileView === 'overview' || window.innerWidth >= 1024) && (
              <div className="lg:hidden grid grid-cols-2 gap-3">
                {/* Active Patients */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-600">Active Patients</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(billingStats?.activePatients)}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Today's Revenue */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-600">Today's Revenue</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(billingStats?.todayRevenue)}</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <BanknotesIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* Pending Transactions */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(billingStats?.pendingTransactions)}</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </div>

                {/* Discharged Today */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-600">Discharged</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(dischargeStats?.todayDischarges)}</p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <HomeIcon className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Charts View */}
            {(mobileView === 'charts' || window.innerWidth >= 1024) && (
              <div className="space-y-4 lg:space-y-6">
                {/* Mobile Charts */}
                <div className="lg:hidden space-y-4">
                  {/* Combined Trend Chart */}
                  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-red-500 rounded-xl flex items-center justify-center">
                          <ChartBarIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">Revenue & Discharges</h3>
                          <p className="text-xs text-gray-600">Daily trends</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setTrendChartMode('line')}
                          className={`p-1.5 rounded-lg transition-all duration-200 ${
                            trendChartMode === 'line' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <PresentationChartLineIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTrendChartMode('bar')}
                          className={`p-1.5 rounded-lg transition-all duration-200 ${
                            trendChartMode === 'bar' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Bars3BottomLeftIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="h-48 w-full">
                      {(transactionStats?.revenueByDay?.length > 0 || dischargeStats?.dischargeTrend?.length > 0) ? (
                        renderTrendChart(true)
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <ChartBarIcon className="w-12 h-12 text-gray-300 mb-2" />
                          <p className="text-sm font-medium">No Data Available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Patient Statistics Chart */}
                  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">Patient Stats</h3>
                          <p className="text-xs text-gray-600">Overview metrics</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setStatsChartMode('pie')}
                          className={`p-1.5 rounded-lg transition-all duration-200 ${
                            statsChartMode === 'pie' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <ChartPieIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStatsChartMode('bar')}
                          className={`p-1.5 rounded-lg transition-all duration-200 ${
                            statsChartMode === 'bar' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Bars3BottomLeftIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="h-48 w-full">
                      {renderStatsChart(true)}
                    </div>
                  </div>
                </div>

                {/* Desktop Charts */}
                <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                  {/* Combined Revenue & Discharge Trend */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-red-500 rounded-xl flex items-center justify-center">
                          <ChartBarIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Revenue & Discharge Trends</h3>
                          <p className="text-sm text-gray-600">Combined daily overview</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setTrendChartMode('line')}
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            trendChartMode === 'line' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                          title="Line Chart"
                        >
                          <PresentationChartLineIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setTrendChartMode('bar')}
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            trendChartMode === 'bar' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                          title="Bar Chart"
                        >
                          <Bars3BottomLeftIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="h-80 w-full">
                      {(transactionStats?.revenueByDay?.length > 0 || dischargeStats?.dischargeTrend?.length > 0) ? (
                        renderTrendChart()
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <ChartBarIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                          <p className="text-center text-gray-500">Data will appear here once transactions are recorded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Patient & Transaction Statistics */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Patient Statistics</h3>
                          <p className="text-sm text-gray-600">Overview of patient metrics</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setStatsChartMode('pie')}
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            statsChartMode === 'pie' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                          title="Pie Chart"
                        >
                          <ChartPieIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setStatsChartMode('bar')}
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            statsChartMode === 'bar' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                          title="Bar Chart"
                        >
                          <Bars3BottomLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setStatsChartMode('line')}
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            statsChartMode === 'line' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                          title="Line Chart"
                        >
                          <PresentationChartLineIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="h-80 w-full">
                      {renderStatsChart()}
                    </div>
                  </div>

                  {/* Revenue Statistics Chart */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                          <BanknotesIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Revenue Statistics</h3>
                          <p className="text-sm text-gray-600">Financial performance metrics</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setStatsChartMode('pie')}
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            statsChartMode === 'pie' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                          title="Pie Chart"
                        >
                          <ChartPieIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setStatsChartMode('bar')}
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            statsChartMode === 'bar' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                          title="Bar Chart"
                        >
                          <Bars3BottomLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setStatsChartMode('line')}
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            statsChartMode === 'line' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                          title="Line Chart"
                        >
                          <PresentationChartLineIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="h-80 w-full">
                      {renderRevenueChart()}
                    </div>
                  </div>

                  {/* Analytics Section */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Unpaid Patients</h3>
                        <p className="text-sm text-gray-600">Payment pending alerts</p>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {transactionStats?.unpaidPatients?.length > 0 ? (
                        transactionStats.unpaidPatients.slice(0, 5).map((patient, index) => (
                          <div key={index} className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                  <UserIcon className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{patient.name}</p>
                                  <p className="text-xs text-gray-500">{patient.physician}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-amber-600">{formatDays(patient.days_without_payment)}</p>
                                <p className="text-xs text-gray-500">days overdue</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center text-gray-500 py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <ExclamationTriangleIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Payments Current</h3>
                          <p className="text-sm text-gray-500 text-center">No outstanding payments</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Patients View */}
            {(mobileView === 'patients' || window.innerWidth >= 1024) && (
              <div className="space-y-4 lg:space-y-6">
                {/* Mobile Patients List */}
                <div className="lg:hidden">
                  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-4">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Patients</h3>
                        <button
                          onClick={() => setShowMobileFilters(!showMobileFilters)}
                          className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                        >
                          <AdjustmentsHorizontalIcon className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {showMobileFilters && (
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search patients..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                            />
                          </div>
                          <select
                            value={patientsFilter}
                            onChange={(e) => setPatientsFilter(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                          >
                            <option value="active">Active Patients</option>
                            <option value="discharged">Discharged Patients</option>
                            <option value="all">All Patients</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {patientsList?.patients?.length > 0 ? (
                      patientsList.patients.map((patient) => (
                        <MobilePatientCard key={patient.id} patient={patient} />
                      ))
                    ) : (
                      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <UserIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                      </div>
                    )}
                  </div>

                  {/* Mobile Pagination */}
                  {patientsList?.pagination && patientsList.pagination.total_pages > 1 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 font-medium">
                          Page {patientsList.pagination.current_page} of {patientsList.pagination.total_pages}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={!patientsList.pagination.has_prev}
                            className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                          >
                            <ChevronLeftIcon className="w-4 h-4 mr-1" />
                            Prev
                          </button>
                          <button
                            onClick={() => setCurrentPage(Math.min(patientsList.pagination.total_pages, currentPage + 1))}
                            disabled={!patientsList.pagination.has_next}
                            className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                          >
                            Next
                            <ChevronRightIcon className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Patients List */}
                <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Patient List</h3>
                          <p className="text-sm text-gray-600">Manage patient billing</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <select
                          value={patientsFilter}
                          onChange={(e) => setPatientsFilter(e.target.value)}
                          className="border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="active">Active</option>
                          <option value="discharged">Discharged</option>
                          <option value="all">All</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Physician</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transactions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {patientsList?.patients?.length > 0 ? (
                          patientsList.patients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-semibold text-gray-900">
                                      {patient.patient_info?.first_name} {patient.patient_info?.last_name}
                                    </div>
                                    <div className="text-xs text-gray-500">ID: #{patient.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  patient.status === 'active' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : patient.status === 'discharged'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {patient.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {patient.patient_room?.room_name || 'Not assigned'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {patient.patient_physician ? 
                                  `Dr. ${patient.patient_physician.first_name} ${patient.patient_physician.last_name}` : 
                                  'Not assigned'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {formatCurrency(patient.total_amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {patient.transaction_count}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center text-gray-500">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                  <UserIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
                                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Desktop Pagination */}
                  {patientsList?.pagination && patientsList.pagination.total_pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-sm text-gray-600 font-medium">
                        Page {patientsList.pagination.current_page} of {patientsList.pagination.total_pages} 
                        ({patientsList.pagination.total} total patients)
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={!patientsList.pagination.has_prev}
                          className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                        >
                          <ChevronLeftIcon className="w-4 h-4 mr-1" />
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(patientsList.pagination.total_pages, currentPage + 1))}
                          disabled={!patientsList.pagination.has_next}
                          className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                        >
                          Next
                          <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  )}
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