import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdmittingNavSide = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/admitting' },
    { id: 'admit-patient', label: 'Admit Patient', icon: UserPlusIcon, path: '/admitting/admit-patient' },
    { id: 'patient-list', label: 'Patient List', icon: ClipboardDocumentListIcon, path: '/admitting/patient-list' },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, path: '/admitting/settings' },
  ];

  const getActiveItem = () => {
    const currentItem = sidebarItems.find(item => item.path === location.pathname);
    return currentItem?.id || 'dashboard';
  };

  const handleNavigation = (item) => {
    navigate(item.path);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h1 className="text-lg font-semibold text-gray-900">CAS Admitting</h1>
      </div>
      
      <nav className="flex-1 px-3">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = getActiveItem() === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-lg font-semibold text-gray-900">CAS Admitting</h1>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 pt-4">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = getActiveItem() === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
          <SidebarContent />
        </aside>

        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          {/* Top header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
              <div className="flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
                <h2 className="ml-2 lg:ml-0 text-lg font-medium text-gray-900">
                  {sidebarItems.find(item => item.id === getActiveItem())?.label || 'Dashboard'}
                </h2>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="hidden sm:block text-sm text-gray-500">
                  Welcome, <span className="font-medium text-gray-900">{user?.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdmittingNavSide;