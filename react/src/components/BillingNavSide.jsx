import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import Breadcrumb from '@components/Breadcrumb';
import {
  HomeIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const sidebarItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
    path: '/billing'
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: CurrencyDollarIcon,
    path: '/billing/transactions'
  },
  {
    id: 'reports',
    label: 'Billing Reports',
    icon: ClipboardDocumentListIcon,
    path: '/billing/reports'
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: DocumentTextIcon,
    path: '/billing/invoices'
  }
];

const BillingNavSide = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Persist sidebar state in localStorage
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => {
    const saved = localStorage.getItem('billing-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('billing-sidebar-collapsed', JSON.stringify(isDesktopCollapsed));
  }, [isDesktopCollapsed]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const getActiveItem = () =>
    sidebarItems.find(item => 
      item.path === location.pathname || 
      (item.path !== '/billing' && location.pathname.startsWith(item.path))
    )?.id || 'dashboard';

  const NavLink = ({ item, onClick, isCollapsed = false, isMobile = false }) => {
    const Icon = item.icon;
    const isActive = getActiveItem() === item.id;
    
    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`
          group relative flex items-center rounded-2xl transition-all duration-150 ease-out
          ${isMobile 
            ? 'px-4 py-4 text-base font-medium' 
            : `px-4 py-3.5 text-sm font-medium ${isCollapsed ? 'justify-center' : ''}`
          }
          ${isActive 
            ? 'text-gray-900 bg-gradient-to-r from-gray-100 to-gray-50 shadow-sm border border-gray-200/50' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 border border-transparent'
          }
        `}
        title={isCollapsed ? item.label : ''}
      >
        <div className={`flex items-center justify-center rounded-xl transition-all duration-150 ${
          isActive ? 'bg-white shadow-sm' : 'group-hover:bg-white/50'
        } ${isCollapsed ? 'p-2' : 'p-2 mr-3'}`}>
          <Icon className={`transition-all duration-150 ${
            isMobile ? 'w-5 h-5' : 'w-5 h-5'
          } ${
            isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'
          }`} />
        </div>
        
        <span className={`transition-all duration-200 font-medium ${
          isCollapsed && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
        }`}>
          {item.label}
        </span>
        
        {isActive && !isCollapsed && (
          <div className="absolute right-4 w-2 h-2 bg-gray-900 rounded-full" />
        )}
      </Link>
    );
  };

  const UserProfile = ({ isCollapsed = false, isMobile = false }) => (
    <div className={`transition-all duration-200 ${
      isCollapsed && !isMobile ? 'flex justify-center' : 'flex items-center space-x-3'
    }`}>
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center transition-all duration-150 hover:shadow-sm ${
        isMobile ? 'w-12 h-12' : 'w-10 h-10'
      }`}>
        <UserCircleIcon className={`text-gray-600 ${isMobile ? 'w-7 h-7' : 'w-6 h-6'}`} />
      </div>
      <div className={`transition-all duration-200 ${
        isCollapsed && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
      }`}>
        <div className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-sm'}`}>
          {user?.name || 'User'}
        </div>
        <div className={`text-gray-500 ${isMobile ? 'text-base' : 'text-xs'}`}>
          Billing Specialist
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-200" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 bg-white shadow-2xl transform transition-all duration-200 w-full max-w-xs sm:max-w-sm">
            {/* Mobile header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100/80">
              <div className="flex items-center">
                <img 
                  src="/ace-banner.png" 
                  alt="ACE Logo" 
                  className="h-16 w-auto transition-transform duration-150 hover:scale-105"
                />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-150"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Mobile navigation */}
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              {sidebarItems.map((item, index) => (
                <div 
                  key={item.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-in slide-in-from-left duration-300"
                >
                  <NavLink 
                    item={item} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    isMobile={true}
                  />
                </div>
              ))}
            </nav>
            
            {/* Mobile user section */}
            <div className="p-6 border-t border-gray-100/80 mt-auto">
              <UserProfile isMobile={true} />
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 z-30 ${
          isDesktopCollapsed ? 'lg:w-20' : 'lg:w-72'
        }`}>
          {/* Desktop logo section */}
          <div className={`flex items-center px-6 py-8 transition-all duration-300 ${
            isDesktopCollapsed ? 'justify-center px-4' : ''
          }`}>
            <div className="flex items-center">
              <img 
                src={isDesktopCollapsed ? "/ace-logo.png" : "/ace-banner.png"}
                alt="ACE Logo" 
                className={`transition-all duration-300 ${
                  isDesktopCollapsed 
                    ? 'h-10 w-10 object-contain' 
                    : 'h-19 w-auto max-w-full object-contain'
                }`}
              />
            </div>
          </div>
          
          {/* Desktop navigation */}
          <nav className={`flex-1 space-y-2 transition-all duration-300 overflow-y-auto ${
            isDesktopCollapsed ? 'px-4' : 'px-6'
          }`}>
            {sidebarItems.map(item => (
              <NavLink key={item.id} item={item} isCollapsed={isDesktopCollapsed} />
            ))}
          </nav>
          
          {/* Desktop user section */}
          <div className={`border-t border-gray-200/50 transition-all duration-300 ${
            isDesktopCollapsed ? 'p-4' : 'p-6'
          }`}>
            <UserProfile isCollapsed={isDesktopCollapsed} />
          </div>
        </aside>

        {/* Main content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          isDesktopCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}>
          {/* Header */}
          <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                {/* Mobile burger menu */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-700 lg:hidden transition-all duration-150 hover:bg-gray-100/80"
                >
                  <Bars3Icon className="w-5 h-5" />
                </button>
                
                {/* Desktop burger menu for collapse/expand */}
                <button
                  onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                  className="hidden lg:flex p-2 rounded-xl text-gray-500 hover:text-gray-700 transition-all duration-150 hover:bg-gray-100/80"
                >
                  {isDesktopCollapsed ? (
                    <ChevronRightIcon className="w-5 h-5" />
                  ) : (
                    <ChevronLeftIcon className="w-5 h-5" />
                  )}
                </button>
                
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">
                    {sidebarItems.find(item => item.id === getActiveItem())?.label || 'Dashboard'}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 flex-shrink-0">
                {/* Desktop user info */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Billing Specialist
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center transition-all duration-150 hover:shadow-sm">
                    <UserCircleIcon className="w-6 h-6 text-gray-600" />
                  </div>
                </div>

                {/* Mobile user avatar */}
                <div className="lg:hidden w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <UserCircleIcon className="w-5 h-5 text-gray-600" />
                </div>

                <button
                  onClick={logout}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-2xl border border-gray-200/80 hover:border-gray-300 transition-all duration-150 hover:bg-gray-50/80 hover:shadow-sm"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <div className="px-4 sm:px-6 lg:px-8 py-3 border-t border-gray-100/50">
              <Breadcrumb />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 bg-gray-50 min-h-0">
            <div className="p-4 lg:p-8 h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default BillingNavSide;