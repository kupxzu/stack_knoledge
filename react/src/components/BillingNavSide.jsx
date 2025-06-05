import { useState, useEffect, memo } from 'react';
import { useAuth } from '@context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

// Memoize the SidebarItem component to prevent unnecessary re-renders
const SidebarItem = memo(({ item, index, activeItem, handleNavigation }) => {
  const isActive = activeItem === item.id;
  const Icon = item.icon;
  
  return (
    <button
      onClick={() => handleNavigation(item)}
      className={`group w-full flex items-center px-4 py-3 text-left transition-all duration-200 transform hover:scale-105 animate-fade-in ${
        isActive 
          ? `${item.bgColor} border-r-3 ${item.borderColor} ${item.color} font-semibold shadow-lg` 
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`p-2 rounded-xl mr-3 transition-all duration-200 ${
        isActive 
          ? `${item.bgColor} ${item.color} shadow-md` 
          : 'group-hover:bg-gray-100'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <span className="flex-1 font-medium">{item.label}</span>
      
      {isActive && (
        <ChevronRightIcon className="w-4 h-4 animate-pulse" />
      )}
    </button>
  );
});

// Memoize the entire BillingNavSide component
const BillingNavSide = memo(({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState(2); // Mock notifications

  const sidebarItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: HomeIcon, 
      path: '/billing',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500'
    },
    { 
      id: 'transactions', 
      label: 'Transactions', 
      icon: CurrencyDollarIcon, 
      path: '/billing/transactions',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500'
    },
    { 
      id: 'reports', 
      label: 'Billing Reports', 
      icon: ClipboardDocumentListIcon, 
      path: '/billing/reports',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-500'
    },
  ];

  // Update active item based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeMenuItem = sidebarItems.find(item => 
      currentPath === item.path || 
      (item.path !== '/billing' && currentPath.startsWith(item.path))
    );
    if (activeMenuItem) {
      setActiveItem(activeMenuItem.id);
    }
  }, [location.pathname]);

  const handleNavigation = (item) => {
    setActiveItem(item.id);
    navigate(item.path);
    setSidebarOpen(false); // Close mobile sidebar
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">CAS Billing</h1>
                <p className="text-green-100 text-sm">Financial Portal</p>
              </div>
            </div>
            
            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-green-800 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-2 flex-1">
          <div className="px-2 space-y-1">
            {sidebarItems.map((item, index) => (
              <SidebarItem 
                key={item.id} 
                item={item} 
                index={index}
                activeItem={activeItem}
                handleNavigation={handleNavigation}
              />
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">Billing Specialist</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="h-16 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              <div className="animate-slide-in-from-left">
                <h2 className="text-xl font-bold text-gray-900">
                  {sidebarItems.find(item => item.id === activeItem)?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-110">
                <BellIcon className="w-6 h-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3 animate-fade-in">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-900">Welcome back,</p>
                  <p className="text-sm text-gray-500">{user?.name}</p>
                </div>
                
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                
                <button
                  onClick={handleLogout}
                  className="group flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span className="hidden sm:inline font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="px-6 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-green-600 font-medium">Billing</span>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 capitalize">
                {sidebarItems.find(item => item.id === activeItem)?.label || 'Dashboard'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-slide-in-from-bottom">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>© 2024 CAS Billing System. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span>Version 2.1.0</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
});

export default BillingNavSide;

