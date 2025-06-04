import { useState, useEffect } from 'react';
import AdmittingNavSide from '@/components/AdmittingNavSide';
import api from '@/services/api';
import {
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BuildingOfficeIcon,
  UserIcon,
  EyeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  StarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Modern Skeleton Loading Components
const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border-0 shadow-sm p-4 md:p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2 md:space-y-3">
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16 md:w-20"></div>
        <div className="h-6 md:h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-12 md:w-16"></div>
        <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20 md:w-24"></div>
      </div>
      <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl md:rounded-2xl"></div>
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl border-0 shadow-sm p-4 md:p-6 animate-pulse">
    <div className="h-4 md:h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-24 md:w-32 mb-4 md:mb-6"></div>
    <div className="h-48 md:h-72 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl"></div>
  </div>
);

const AdmittingDash = () => {
  const [timeFilter, setTimeFilter] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPatients: 0,
      todayAdmissions: 0,
      totalPhysicians: 0,
      averageStayDays: 0
    },
    trends: {
      admissionsGrowth: 0,
      roomUtilization: 0
    },
    chartData: {
      admissions: [],
      roomUsage: [],
      patientAddresses: [],
      topPhysicians: []
    }
  });

  const timeFilters = [
    { value: 'today', label: 'Today', shortLabel: 'Today', icon: ClockIcon, gradient: 'from-blue-500 to-blue-600' },
    { value: 'week', label: 'This Week', shortLabel: 'Week', icon: CalendarDaysIcon, gradient: 'from-purple-500 to-purple-600' },
    { value: 'month', label: 'This Month', shortLabel: 'Month', icon: CalendarDaysIcon, gradient: 'from-emerald-500 to-emerald-600' },
    { value: 'year', label: 'This Year', shortLabel: 'Year', icon: ChartBarIcon, gradient: 'from-amber-500 to-amber-600' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, [timeFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, trendsRes, chartsRes] = await Promise.all([
        api.get(`/dashboard/stats?period=${timeFilter}`),
        api.get(`/dashboard/trends?period=${timeFilter}`),
        api.get(`/dashboard/charts?period=${timeFilter}`)
      ]);

      setDashboardData({
        stats: statsRes.data.stats || {
          totalPatients: 0,
          todayAdmissions: 0,
          totalPhysicians: 0,
          averageStayDays: 0
        },
        trends: trendsRes.data.trends || {
          admissionsGrowth: 0,
          roomUtilization: 0
        },
        chartData: chartsRes.data.chartData || {
          admissions: [],
          roomUsage: [],
          patientAddresses: [],
          topPhysicians: []
        }
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      
      setDashboardData({
        stats: {
          totalPatients: 0,
          todayAdmissions: 0,
          totalPhysicians: 0,
          averageStayDays: 0
        },
        trends: {
          admissionsGrowth: 0,
          roomUtilization: 0
        },
        chartData: {
          admissions: [],
          roomUsage: [],
          patientAddresses: [],
          topPhysicians: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Responsive Stat Card with Glassmorphism
  const StatCard = ({ title, value, change, changeType, icon: Icon, gradient = 'from-blue-500 to-blue-600' }) => {
    const isPositive = changeType === 'positive';
    const displayValue = title.includes('Avg Stay') && value < 0 ? 0 : value;

    return (
      <div className="group relative bg-white/70 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 p-4 md:p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-xl md:rounded-2xl transition-opacity duration-300`}></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-2 md:space-y-3 flex-1">
            <p className="text-xs md:text-sm font-medium text-gray-600/80 leading-tight">{title}</p>
            <p className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {formatNumber(displayValue)}
            </p>
            {change !== undefined && (
              <div className="flex items-center space-x-1 md:space-x-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {isPositive ? (
                    <ArrowTrendingUpIcon className="w-2 h-2 md:w-3 md:h-3" />
                  ) : (
                    <ArrowDownIcon className="w-2 h-2 md:w-3 md:h-3" />
                  )}
                  <span className="text-xs font-semibold">{Math.abs(change)}%</span>
                </div>
                <span className="text-xs text-gray-500 hidden sm:inline">vs last {timeFilter}</span>
              </div>
            )}
          </div>
          <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ml-3`}>
            <Icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
          </div>
        </div>
      </div>
    );
  };

  // Mobile-friendly Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 md:p-4 border border-white/20 rounded-xl shadow-2xl max-w-xs">
          <p className="font-semibold text-gray-900 mb-2 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-xs md:text-sm text-gray-700">{entry.name}: <span className="font-semibold">{entry.value}</span></span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Pie Chart Tooltip
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 border border-white/20 rounded-xl shadow-xl">
          <p className="font-semibold text-gray-900 text-sm">{data.name}</p>
          <p className="text-xs text-gray-600">
            Patients: <span className="font-semibold">{data.patients}</span>
          </p>
          <p className="text-xs text-gray-600">
            Percentage: <span className="font-semibold">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Mobile-responsive City Card Component
  const CityCard = ({ city, patients, percentage, color, index }) => (
    <div className="group relative bg-white/60 backdrop-blur-sm rounded-lg md:rounded-xl border border-white/30 p-3 md:p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm`} style={{ backgroundColor: `${color}20` }}>
            <MapPinIcon className="w-4 h-4 md:w-5 md:h-5" style={{ color }} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">{city}</h4>
            <p className="text-xs text-gray-500">{patients} patients</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm md:text-lg font-bold" style={{ color }}>{percentage}%</p>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-xs text-gray-500">#{index + 1}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-2 md:mt-3">
        <div className="w-full bg-gray-100 rounded-full h-1 md:h-1.5 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ 
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${color}AA, ${color})`
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  // Mobile-responsive Physician Card
  const PhysicianCard = ({ physician, percentage, index }) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-emerald-500 to-emerald-600',
      'from-amber-500 to-amber-600',
      'from-pink-500 to-pink-600'
    ];
    
    return (
      <div className="group relative bg-white/70 backdrop-blur-sm rounded-lg md:rounded-xl border border-white/20 p-3 md:p-4 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
              <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{physician.name}</h4>
              <p className="text-xs text-gray-500">Admitting Physician</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm md:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {percentage}%
            </p>
            <p className="text-xs text-gray-500">{physician.patients} patients</p>
          </div>
        </div>
        
        <div className="mt-2 md:mt-3">
          <div className="w-full bg-gray-100 rounded-full h-1.5 md:h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${gradients[index % gradients.length]} transition-all duration-700 ease-out`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdmittingNavSide>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="space-y-6 md:space-y-8 p-4 md:p-6">
            <div className="animate-pulse">
              <div className="h-6 md:h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-36 md:w-48 mb-2"></div>
              <div className="h-3 md:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-48 md:w-64"></div>
            </div>

            <div className="flex space-x-2 md:space-x-3 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 md:h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-20 md:w-28 flex-shrink-0 animate-pulse"></div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <ChartSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </AdmittingNavSide>
    );
  }

  if (error) {
    return (
      <AdmittingNavSide>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl max-w-md w-full">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdmittingNavSide>
    );
  }

  const totalPhysicianPatients = dashboardData.chartData.topPhysicians.reduce((sum, p) => sum + p.patients, 0);
  const physiciansWithPercentages = dashboardData.chartData.topPhysicians.map(physician => ({
    ...physician,
    percentage: totalPhysicianPatients > 0 ? ((physician.patients / totalPhysicianPatients) * 100).toFixed(1) : 0
  }));

  // Calculate percentages for city data
  const calculateCityPercentages = (data) => {
    const total = data.reduce((sum, item) => sum + item.patients, 0);
    return data.map((item, index) => ({
      ...item,
      percentage: total > 0 ? ((item.patients / total) * 100).toFixed(1) : 0,
      color: item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`
    }));
  };

  const citiesWithPercentages = calculateCityPercentages(dashboardData.chartData.patientAddresses);

  // Color schemes for pie charts
  const cityColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];
  const physicianColors = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#EF4444'];

  // Prepare data for pie charts
  const cityPieData = citiesWithPercentages.slice(0, 5).map((city, index) => ({
    name: city.name,
    patients: city.patients,
    percentage: parseFloat(city.percentage),
    color: cityColors[index] || cityColors[0]
  }));

  const physicianPieData = physiciansWithPercentages.slice(0, 5).map((physician, index) => ({
    name: physician.name,
    patients: physician.patients,
    percentage: parseFloat(physician.percentage),
    color: physicianColors[index] || physicianColors[0]
  }));

  return (
    <AdmittingNavSide>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="space-y-6 md:space-y-8 p-4 md:p-6">
          {/* Responsive Header */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl md:text-3xl font-bold bg-black bg-clip-text text-transparent">
                  Dashboard Overview
                </h1>
              </div>
              <p className="text-sm md:text-base text-gray-600">Real-time insights and analytics for modern healthcare</p>
            </div>
            
            {/* Mobile-first Time Filter */}
            <div className="relative">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden flex items-center justify-between w-full bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-sm font-medium text-gray-700"
              >
                <span>{timeFilters.find(f => f.value === timeFilter)?.label}</span>
                {mobileFiltersOpen ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <Bars3Icon className="w-5 h-5" />
                )}
              </button>

              {/* Mobile Filter Dropdown */}
              {mobileFiltersOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg z-10">
                  {timeFilters.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.value}
                        onClick={() => {
                          setTimeFilter(filter.value);
                          setMobileFiltersOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                          timeFilter === filter.value
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Desktop Filter Buttons */}
              <div className="hidden lg:flex gap-2">
                {timeFilters.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <button
                      key={filter.value}
                      onClick={() => setTimeFilter(filter.value)}
                      className={`group relative inline-flex items-center px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        timeFilter === filter.value
                          ? `bg-gradient-to-r ${filter.gradient} text-white shadow-lg hover:shadow-xl`
                          : 'bg-white/70 backdrop-blur-sm text-gray-700 border border-white/30 hover:bg-white/90 hover:shadow-md'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {filter.label}
                      {timeFilter === filter.value && (
                        <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Responsive Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <StatCard
              title="Total Patients"
              value={dashboardData.stats.totalPatients}
              change={dashboardData.trends.admissionsGrowth}
              changeType={dashboardData.trends.admissionsGrowth >= 0 ? 'positive' : 'negative'}
              icon={UserGroupIcon}
              gradient="from-blue-500 to-blue-600"
            />
            <StatCard
              title="Today's Admissions"
              value={dashboardData.stats.todayAdmissions}
              icon={UserIcon}
              gradient="from-emerald-500 to-emerald-600"
            />
            <StatCard
              title="Active Physicians"
              value={dashboardData.stats.totalPhysicians}
              icon={UserIcon}
              gradient="from-purple-500 to-purple-600"
            />
            <StatCard
              title="Avg Stay (Days)"
              value={dashboardData.stats.averageStayDays}
              icon={ClockIcon}
              gradient="from-amber-500 to-amber-600"
            />
          </div>

          {/* Responsive Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Admissions Trend */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 p-4 md:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <ChartBarIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">Daily Admissions</h3>
                </div>
                <div className="flex items-center space-x-2 px-2 md:px-3 py-1 bg-blue-50 rounded-full">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs md:text-sm text-blue-700 font-medium">Trending</span>
                </div>
              </div>
              {dashboardData.chartData.admissions.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={dashboardData.chartData.admissions}>
                    <defs>
                      <linearGradient id="modernAdmissionsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#E5E7EB" strokeOpacity={0.5} />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                    <YAxis stroke="#6B7280" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="admissions"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#modernAdmissionsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 md:h-80 flex items-center justify-center">
                  <div className="text-center">
                    <ChartBarIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-sm">No admission data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Room Usage */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 p-4 md:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <BuildingOfficeIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">Room Usage</h3>
                </div>
                <div className="text-right">
                  <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {dashboardData.trends.roomUtilization}%
                  </span>
                  <p className="text-xs text-gray-500">Utilization</p>
                </div>
              </div>
              {dashboardData.chartData.roomUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dashboardData.chartData.roomUsage}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#E5E7EB" strokeOpacity={0.5} />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                    <YAxis stroke="#6B7280" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="patients" fill="url(#roomGradient)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="roomGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={1}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 md:h-80 flex items-center justify-center">
                  <div className="text-center">
                    <BuildingOfficeIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-sm">No room usage data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Redesigned Analytics with Pie Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Patients by City - Redesigned with Pie Chart */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 p-4 md:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <MapPinIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Patients by City</h3>
                    <p className="text-xs text-gray-500">Geographic distribution</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    {citiesWithPercentages.reduce((sum, city) => sum + city.patients, 0)}
                  </p>
                  <p className="text-xs text-gray-500">Total Patients</p>
                </div>
              </div>

              {citiesWithPercentages.length > 0 ? (
                <div className="space-y-4">
                  {/* Pie Chart Section */}
                  <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
                    <div className="w-full lg:w-1/2">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={cityPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="patients"
                          >
                            {cityPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Legend */}
                    <div className="w-full lg:w-1/2 space-y-2">
                      {cityPieData.map((city, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50/50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: city.color }}></div>
                            <span className="text-sm font-medium text-gray-900">{city.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold" style={{ color: city.color }}>{city.percentage}%</p>
                            <p className="text-xs text-gray-500">{city.patients}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-2 md:gap-3 pt-4 border-t border-gray-200/50">
                    <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg md:rounded-xl p-2 md:p-3">
                      <p className="text-sm md:text-lg font-bold text-blue-600">
                        {citiesWithPercentages.length}
                      </p>
                      <p className="text-xs text-blue-700">Cities</p>
                    </div>
                    <div className="text-center bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg md:rounded-xl p-2 md:p-3">
                      <p className="text-sm md:text-lg font-bold text-emerald-600">
                        {citiesWithPercentages[0]?.percentage || 0}%
                      </p>
                      <p className="text-xs text-emerald-700">Top City</p>
                    </div>
                    <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg md:rounded-xl p-2 md:p-3">
                      <p className="text-sm md:text-lg font-bold text-purple-600">
                        {citiesWithPercentages.slice(0, 3).reduce((sum, city) => sum + parseFloat(city.percentage), 0).toFixed(0)}%
                      </p>
                      <p className="text-xs text-purple-700">Top 3</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 md:h-80 flex items-center justify-center">
                  <div className="text-center">
                    <MapPinIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-sm">No city data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Top Physicians - Redesigned with Pie Chart */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 p-4 md:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <UserGroupIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Top Physicians</h3>
                    <p className="text-xs text-gray-500">By admissions</p>
                  </div>
                </div>
                <button className="inline-flex items-center text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors bg-blue-50 px-2 md:px-3 py-1 rounded-lg">
                  <EyeIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  <span className="hidden sm:inline">View All</span>
                </button>
              </div>
              
              {physiciansWithPercentages.length > 0 ? (
                <div className="space-y-4">
                  {/* Pie Chart Section */}
                  <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
                    <div className="w-full lg:w-1/2">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={physicianPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="patients"
                          >
                            {physicianPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Legend */}
                    <div className="w-full lg:w-1/2 space-y-2">
                      {physicianPieData.map((physician, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50/50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: physician.color }}></div>
                            <span className="text-sm font-medium text-gray-900 truncate">{physician.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold" style={{ color: physician.color }}>{physician.percentage}%</p>
                            <p className="text-xs text-gray-500">{physician.patients}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3 pt-4 border-t border-gray-200/50">
                    <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg md:rounded-xl p-2 md:p-3">
                      <p className="text-sm md:text-lg font-bold text-blue-600">
                        {totalPhysicianPatients}
                      </p>
                      <p className="text-xs text-blue-700">Total Admissions</p>
                    </div>
                    <div className="text-center bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg md:rounded-xl p-2 md:p-3">
                      <p className="text-sm md:text-lg font-bold text-emerald-600">
                        {physiciansWithPercentages.length}
                      </p>
                      <p className="text-xs text-emerald-700">Active Physicians</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 md:h-80 flex items-center justify-center">
                  <div className="text-center">
                    <UserIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-sm">No physician data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile-responsive Quick Actions */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-xl md:rounded-2xl p-6 md:p-8 shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            
            <div className="relative">
              <div className="text-center text-white">
                <SparklesIcon className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 md:mb-4" />
                <h3 className="text-lg md:text-2xl font-bold mb-2">Healthcare Analytics Dashboard</h3>
                <p className="text-sm md:text-base text-blue-100 max-w-2xl mx-auto">
                  Monitor patient admissions, track physician performance, and analyze geographic distribution with real-time insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdmittingNavSide>
  );
};

export default AdmittingDash;