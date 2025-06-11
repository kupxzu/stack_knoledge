import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const AdminNavSide = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: HomeIcon, 
      path: '/admin'
    },
    // { 
    //   id: 'users', 
    //   label: 'Users', 
    //   icon: UserGroupIcon, 
    //   path: '/admin/users'
    // },
    // { 
    //   id: 'reports', 
    //   label: 'Reports', 
    //   icon: ChartBarIcon, 
    //   path: '/admin/reports'
    // },
    // { 
    //   id: 'billing', 
    //   label: 'Billing', 
    //   icon: DocumentTextIcon, 
    //   path: '/admin/billing'
    // },
    // { 
    //   id: 'settings', 
    //   label: 'Settings', 
    //   icon: CogIcon, 
    //   path: '/admin/settings'
    // }
  ];

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const currentPath = location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment);
    
    const breadcrumbs = [
      { label: 'Admin', path: '/admin', isHome: true }
    ];

    if (pathSegments.length > 1) {
      const currentItem = sidebarItems.find(item => 
        item.path === currentPath || currentPath.startsWith(item.path + '/')
      );
      
      if (currentItem && currentItem.id !== 'dashboard') {
        breadcrumbs.push({ 
          label: currentItem.label, 
          path: currentItem.path,
          isActive: true 
        });
      }
    }

    return breadcrumbs;
  };

  // Fix: Proper route matching to prevent defaulting to dashboard on refresh
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find exact match first
    let activeMenuItem = sidebarItems.find(item => item.path === currentPath);
    
    // If no exact match, find the best partial match
    if (!activeMenuItem) {
      activeMenuItem = sidebarItems.find(item => {
        if (item.path === '/admin') {
          return currentPath === '/admin'; // Only match exact /admin for dashboard
        }
        return currentPath.startsWith(item.path);
      });
    }
    
    // Set active item or default to dashboard only if we're exactly on /admin
    if (activeMenuItem) {
      setActiveItem(activeMenuItem.id);
    } else if (currentPath === '/admin' || currentPath === '/admin/') {
      setActiveItem('dashboard');
    }
  }, [location.pathname]);

  const handleNavigation = (item) => {
    setActiveItem(item.id);
    navigate(item.path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getCurrentPageTitle = () => {
    const currentItem = sidebarItems.find(item => item.id === activeItem);
    return currentItem?.label || 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo/Brand */}
        <div className="h-24 flex items-center justify-between px-6 border-b border-gray-200">
              <div className="flex items-center space-x-4 flex-1">
                <img 
                  src="/ace-banner.png" 
                  alt="ACE Medical Center" 
                  className="h-20 w-auto object-contain p-1"
                />
              </div>
          
          {/* Mobile Close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = activeItem === item.id;
              const Icon = item.icon;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item)}
                    className={`
                      group w-full flex items-center px-4 py-4 text-base font-medium rounded-xl
                      transition-all duration-200 ease-in-out transform hover:scale-105
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-lg border-l-4 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                      }
                    `}
                  >
                    <Icon className={`
                      w-7 h-7 mr-4 flex-shrink-0 transition-all duration-200
                      ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-105'}
                    `} />
                    <span className="truncate font-semibold">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 transition-all duration-200">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 font-medium">Administrator</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          {/* Mobile Header */}
          <div className="lg:hidden h-16 flex items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
              >
                <Bars3Icon className="w-6 h-6 text-gray-600" />
              </button>
              
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-white shadow-sm border border-gray-100">
                <img 
                  src="/ace-logo.png" 
                  alt="ACE Logo" 
                  className="w-6 h-6 object-contain"
                />
              </div>
              
              <h1 className="text-lg font-bold text-gray-900">
                {getCurrentPageTitle()}
              </h1>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Header with Banner */}
          <div className="hidden lg:block">
            {/* Banner */}
            <div className="h-24 flex items-center px-6">
              <div className="flex items-center space-x-4 flex-1">

              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-BLACK text-sm font-medium">
                  {user?.name || 'Admin User'}
                </span>
                <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Breadcrumbs */}
            <div className="h-12 flex items-center px-6 bg-gray-50 border-b border-gray-200">
              <nav className="flex items-center space-x-2 text-sm">
                {getBreadcrumbs().map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center">
                    {index > 0 && (
                      <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
                    )}
                    <button
                      onClick={() => navigate(crumb.path)}
                      className={`
                        px-2 py-1 rounded-md transition-colors duration-200
                        ${crumb.isActive 
                          ? 'text-blue-700 font-semibold bg-blue-50' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }
                        ${crumb.isHome ? 'flex items-center' : ''}
                      `}
                    >
                      {crumb.isHome && <HomeIcon className="w-4 h-4 mr-1" />}
                      {crumb.label}
                    </button>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminNavSide;