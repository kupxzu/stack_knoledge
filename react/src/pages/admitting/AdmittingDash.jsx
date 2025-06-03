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
  SparklesIcon
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
  <div className="bg-white rounded-2xl border-0 shadow-sm p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-16"></div>
        <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24"></div>
      </div>
      <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl border-0 shadow-sm p-6 animate-pulse">
    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-32 mb-6"></div>
    <div className="h-72 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl"></div>
  </div>
);

const AdmittingDash = () => {
  const [timeFilter, setTimeFilter] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    { value: 'today', label: 'Today', icon: ClockIcon, gradient: 'from-blue-500 to-blue-600' },
    { value: 'week', label: 'This Week', icon: CalendarDaysIcon, gradient: 'from-purple-500 to-purple-600' },
    { value: 'month', label: 'This Month', icon: CalendarDaysIcon, gradient: 'from-emerald-500 to-emerald-600' },
    { value: 'year', label: 'This Year', icon: ChartBarIcon, gradient: 'from-amber-500 to-amber-600' }
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

  // Modern Stat Card with Glassmorphism
  const StatCard = ({ title, value, change, changeType, icon: Icon, gradient = 'from-blue-500 to-blue-600' }) => {
    const isPositive = changeType === 'positive';
    const displayValue = title.includes('Avg Stay') && value < 0 ? 0 : value;

    return (
      <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
        {/* Gradient background on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600/80">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {formatNumber(displayValue)}
            </p>
            {change !== undefined && (
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                  isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {isPositive ? (
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                  ) : (
                    <ArrowDownIcon className="w-3 h-3" />
                  )}
                  <span className="text-xs font-semibold">{Math.abs(change)}%</span>
                </div>
                <span className="text-xs text-gray-500">vs last {timeFilter}</span>
              </div>
            )}
          </div>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    );
  };

  // Modern Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-4 border border-white/20 rounded-xl shadow-2xl">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
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

  // City Card Component for the redesigned section
  const CityCard = ({ city, patients, percentage, color, index }) => (
    <div className="group relative bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm`} style={{ backgroundColor: `${color}20` }}>
            <MapPinIcon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">{city}</h4>
            <p className="text-xs text-gray-500">{patients} patients</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold" style={{ color }}>{percentage}%</p>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-xs text-gray-500">#{index + 1}</span>
          </div>
        </div>
      </div>
      
      {/* Modern progress bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
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

  // Modern Physician Card
  const PhysicianCard = ({ physician, percentage, index }) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-emerald-500 to-emerald-600',
      'from-amber-500 to-amber-600',
      'from-pink-500 to-pink-600'
    ];
    
    return (
      <div className="group relative bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 p-4 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{physician.name}</h4>
              <p className="text-xs text-gray-500">Admitting Physician</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {percentage}%
            </p>
            <p className="text-xs text-gray-500">{physician.patients} patients</p>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
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
          <div className="space-y-8 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-48 mb-2"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-64"></div>
            </div>

            <div className="flex space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-28 animate-pulse"></div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3].map((i) => (
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
              <ExclamationTriangleIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
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

  return (
    <AdmittingNavSide>
      <div className="min-h-screen bg-gradient-to-br from-slate-10 via-blue-10 to-indigo-10">
        <div className="space-y-8 p-6">
          {/* Modern Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold bg-black bg-clip-text text-transparent">
                  Dashboard Overview
                </h1>
              </div>
              <p className="text-gray-600">Real-time insights and analytics for modern healthcare</p>
            </div>
            
            {/* Modern Time Filter */}
            <div className="flex flex-wrap gap-2 mt-6 lg:mt-0">
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

          {/* Modern Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Modern Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Modern Admissions Trend */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Daily Admissions</h3>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-700 font-medium">Trending</span>
                </div>
              </div>
              {dashboardData.chartData.admissions.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
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
                      strokeWidth={3}
                      fill="url(#modernAdmissionsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No admission data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modern Room Usage */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
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
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={dashboardData.chartData.roomUsage}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#E5E7EB" strokeOpacity={0.5} />
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
                    <BuildingOfficeIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No room usage data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row - Redesigned */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completely Redesigned Patients by City */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
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
                  {/* Top Cities List */}
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {citiesWithPercentages.slice(0, 6).map((city, index) => (
                        <CityCard
                          key={`${city.name}-${index}`}
                          city={city.name}
                          patients={city.patients}
                          percentage={city.percentage}
                          color={city.color}
                          index={index}
                        />
                      ))}
                    </div>

                  {/* Summary Stats */}
                  <div className="mt-6 pt-4 border-t border-gray-200/50">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
                        <p className="text-lg font-bold text-blue-600">
                          {citiesWithPercentages.length}
                        </p>
                        <p className="text-xs text-blue-700">Cities</p>
                      </div>
                      <div className="text-center bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3">
                        <p className="text-lg font-bold text-emerald-600">
                          {citiesWithPercentages[0]?.percentage || 0}%
                        </p>
                        <p className="text-xs text-emerald-700">Top City</p>
                      </div>
                      <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3">
                        <p className="text-lg font-bold text-purple-600">
                          {citiesWithPercentages.slice(0, 3).reduce((sum, city) => sum + parseFloat(city.percentage), 0).toFixed(0)}%
                        </p>
                        <p className="text-xs text-purple-700">Top 3</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <MapPinIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No city data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modern Physicians Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Top Physicians</h3>
                    <p className="text-xs text-gray-500">By admissions</p>
                  </div>
                </div>
                <button className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors bg-blue-50 px-3 py-1 rounded-lg">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  View All
                </button>
              </div>
              
              {physiciansWithPercentages.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {physiciansWithPercentages.map((physician, index) => (
                      <PhysicianCard
                        key={physician.id || `${physician.name}-${index}`}
                        physician={physician}
                        percentage={physician.percentage}
                        index={index}
                      />
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200/50">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
                        <p className="text-lg font-bold text-blue-600">
                          {totalPhysicianPatients}
                        </p>
                        <p className="text-xs text-blue-700">Total Admissions</p>
                      </div>
                      <div className="text-center bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3">
                        <p className="text-lg font-bold text-emerald-600">
                          {physiciansWithPercentages.length}
                        </p>
                        <p className="text-xs text-emerald-700">Active Physicians</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No physician data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modern Quick Actions */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl p-8 shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            
          </div>
        </div>
      </div>
    </AdmittingNavSide>
  );
};

export default AdmittingDash;