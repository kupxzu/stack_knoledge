import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  HomeIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const AdmittingNavSide = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: HomeIcon, 
      path: '/admitting',
      description: 'Overview and analytics'
    },
    { 
      id: 'admit-patient', 
      label: 'Admit Patient', 
      icon: UserPlusIcon, 
      path: '/admitting/admit-patient',
      description: 'Register new patient'
    },
    { 
      id: 'patient-list', 
      label: 'Patient List', 
      icon: ClipboardDocumentListIcon, 
      path: '/admitting/patient-list',
      description: 'Manage existing patients'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Cog6ToothIcon, 
      path: '/admitting/settings',
      description: 'System configuration'
    },
  ];

  const getActiveItem = () => {
    const currentItem = sidebarItems.find(item => item.path === location.pathname);
    return currentItem?.id || 'dashboard';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">CAS</h1>
            <p className="text-xs text-gray-500">Admitting Portal</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = getActiveItem() === item.id;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={closeMobileMenu}
              className={`group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors duration-200 ${
                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="truncate">{item.label}</div>
                <div className={`text-xs truncate transition-colors duration-200 ${
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                }`}>
                  {item.description}
                </div>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center space-x-3 px-3 py-3 rounded-xl bg-gray-50">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
            <UserCircleIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user?.role || 'Staff'} • Online
            </div>
          </div>
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
            className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">CAS</h1>
                  <p className="text-xs text-gray-500">Admitting Portal</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="flex flex-col h-full">
              <nav className="flex-1 px-4 py-4 space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = getActiveItem() === item.id;
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{item.label}</div>
                        <div className={`text-xs truncate transition-colors duration-200 ${
                          isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile User Profile */}
              <div className="px-4 py-4 border-t border-gray-100">
                <div className="flex items-center space-x-3 px-3 py-3 rounded-xl bg-gray-50">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user?.role || 'Staff'} • Online
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white border-r border-gray-100">
          <SidebarContent />
        </aside>

        {/* Main content */}
        <div className="flex-1 lg:ml-72">
          {/* Top header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden transition-colors"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
                
                <div className="hidden lg:block">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {sidebarItems.find(item => item.id === getActiveItem())?.label || 'Dashboard'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {sidebarItems.find(item => item.id === getActiveItem())?.description || 'Welcome back'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Mobile user info */}
                <div className="lg:hidden flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                </div>

                {/* Desktop user info */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.role} • Online</div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-5 h-5 text-white" />
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="min-h-screen bg-gray-50">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdmittingNavSide;