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
  XMarkIcon,
  HeartIcon,
  PlusCircleIcon
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

// Colorful Skeleton Loading Components
const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-blue-100 p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full w-20"></div>
        <div className="h-8 bg-gradient-to-r from-blue-200 to-blue-300 rounded-lg w-16"></div>
        <div className="h-2 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full w-24"></div>
      </div>
      <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl"></div>
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl border border-blue-100 p-6 animate-pulse">
    <div className="h-6 bg-gradient-to-r from-blue-200 to-blue-300 rounded-lg w-32 mb-6"></div>
    <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl"></div>
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
    { value: 'today', label: 'Today', icon: ClockIcon, color: 'from-blue-500 to-blue-600' },
    { value: 'week', label: 'This Week', icon: CalendarDaysIcon, color: 'from-emerald-500 to-emerald-600' },
    { value: 'month', label: 'This Month', icon: CalendarDaysIcon, color: 'from-purple-500 to-purple-600' },
    { value: 'year', label: 'This Year', icon: ChartBarIcon, color: 'from-amber-500 to-amber-600' }
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

  // Healthcare-themed Colorful Stat Card Component
  const StatCard = ({ title, value, change, changeType, icon: Icon, color = 'from-blue-500 to-blue-600' }) => {
    const isPositive = changeType === 'positive';
    const displayValue = title.includes('Avg Stay') && value < 0 ? 0 : value;

    return (
      <div className="group bg-white rounded-2xl border border-blue-100/50 p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {formatNumber(displayValue)}
            </p>
            {change !== undefined && (
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {isPositive ? (
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                  ) : (
                    <ArrowDownIcon className="w-3 h-3" />
                  )}
                  <span className="font-medium">{Math.abs(change)}%</span>
                </div>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  // Healthcare-themed Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border border-blue-200/50 rounded-xl shadow-lg">
          <p className="font-semibold text-gray-900 mb-2 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-sm text-gray-700">{entry.name}: <span className="font-semibold">{entry.value}</span></span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Healthcare Pie Chart Tooltip
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 border border-blue-200/50 rounded-xl shadow-lg">
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

  if (loading) {
    return (
      <AdmittingNavSide>
        <div className="min-h-screen ">
          <div className="space-y-8 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gradient-to-r from-blue-200 to-blue-300 rounded-lg w-48 mb-2"></div>
              <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-300 rounded-lg w-64"></div>
            </div>

            <div className="flex space-x-3 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl w-28 flex-shrink-0 animate-pulse"></div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <div className="min-h-screen  flex items-center justify-center p-4">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-red-200/50 shadow-xl max-w-md w-full">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
              <ExclamationTriangleIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
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
      color: item.color || `hsl(${(index * 137.5) % 360}, 65%, 55%)`
    }));
  };

  const citiesWithPercentages = calculateCityPercentages(dashboardData.chartData.patientAddresses);

  // Healthcare-themed color schemes
  const cityColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];
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
      <div className="min-h-screen">
        <div className="space-y-8 p-8">
          {/* Healthcare-themed Header */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admitting Dashboard
                </h1>
              </div>
              <p className="text-gray-600">Real-time patient admissions and healthcare analytics</p>
            </div>
            
            {/* Colorful Time Filter */}
            <div className="relative">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden flex items-center justify-between w-full bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 shadow-sm"
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
                <div className="lg:hidden absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-xl shadow-lg z-10">
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
                            : 'text-gray-700 hover:bg-blue-50/50'
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
                      className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        timeFilter === filter.value
                          ? `bg-gradient-to-r ${filter.color} text-white shadow-lg`
                          : 'bg-white/80 text-gray-700 border border-blue-200/50 hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Healthcare Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Patients"
              value={dashboardData.stats.totalPatients}
              change={dashboardData.trends.admissionsGrowth}
              changeType={dashboardData.trends.admissionsGrowth >= 0 ? 'positive' : 'negative'}
              icon={UserGroupIcon}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              title="Today's Admissions"
              value={dashboardData.stats.todayAdmissions}
              icon={PlusCircleIcon}
              color="from-emerald-500 to-emerald-600"
            />
            <StatCard
              title="Active Physicians"
              value={dashboardData.stats.totalPhysicians}
              icon={UserIcon}
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              title="Avg Stay (Days)"
              value={dashboardData.stats.averageStayDays}
              icon={ClockIcon}
              color="from-amber-500 to-amber-600"
            />
          </div>

          {/* Colorful Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admissions Trend */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Daily Admissions</h3>
                </div>
                <div className="px-3 py-1 bg-blue-50 rounded-full">
                  <span className="text-xs text-blue-700 font-medium">Live Data</span>
                </div>
              </div>
              {dashboardData.chartData.admissions.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={dashboardData.chartData.admissions}>
                    <defs>
                      <linearGradient id="admissionsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#E0E7FF" />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                    <YAxis stroke="#6B7280" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="admissions"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fill="url(#admissionsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-blue-300" />
                    <p className="text-gray-500 text-sm">No admission data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Room Usage */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <BuildingOfficeIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Room Usage</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {dashboardData.trends.roomUtilization}%
                  </span>
                  <p className="text-xs text-gray-500">Utilization</p>
                </div>
              </div>
              {dashboardData.chartData.roomUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dashboardData.chartData.roomUsage}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#E0E7FF" />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                    <YAxis stroke="#6B7280" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="patients" fill="url(#roomGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="roomGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={1}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <BuildingOfficeIcon className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                    <p className="text-gray-500 text-sm">No room usage data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Healthcare Analytics with Colorful Pie Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patients by City */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                    <MapPinIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Patients by City</h3>
                    <p className="text-xs text-gray-500">Geographic distribution</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    {citiesWithPercentages.reduce((sum, city) => sum + city.patients, 0)}
                  </p>
                  <p className="text-xs text-gray-500">Total Patients</p>
                </div>
              </div>

              {citiesWithPercentages.length > 0 ? (
                <div className="space-y-4">
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
                    
                    <div className="w-full lg:w-1/2 space-y-2">
                      {cityPieData.map((city, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border border-blue-100/30">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: city.color }}></div>
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
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <MapPinIcon className="w-16 h-16 mx-auto mb-4 text-emerald-300" />
                    <p className="text-gray-500 text-sm">No city data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Top Physicians */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-100/50 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <UserGroupIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Top Physicians</h3>
                    <p className="text-xs text-gray-500">By admissions</p>
                  </div>
                </div>
                <button className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors bg-indigo-50 px-3 py-1 rounded-lg">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View All
                </button>
              </div>
              
              {physiciansWithPercentages.length > 0 ? (
                <div className="space-y-4">
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
                    
                    <div className="w-full lg:w-1/2 space-y-2">
                      {physicianPieData.map((physician, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-lg border border-purple-100/30">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: physician.color }}></div>
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
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <UserIcon className="w-16 h-16 mx-auto mb-4 text-indigo-300" />
                    <p className="text-gray-500 text-sm">No physician data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdmittingNavSide>
  );
};

export default AdmittingDash;