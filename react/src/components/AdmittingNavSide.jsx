import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AdmittingNavSide = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('dashboard');

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admitting' },
    { id: 'admit-patient', label: 'Admit Patient', icon: '🩺', path: '/admitting/admit-patient' },
    { id: 'patient-list', label: 'Patient list', icon: '📋', path: '/admitting/patient-list' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/admitting/settings' },
  ];

  const getActiveItem = () => {
    const currentItem = sidebarItems.find(item => item.path === location.pathname);
    return currentItem?.id || 'dashboard';
  };

  const handleNavigation = (item) => {
    setActiveItem(item.id);
    navigate(item.path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-sm border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-800">CAS Admitting</h1>
        </div>
        
        <nav className="mt-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                getActiveItem() === item.id ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
          <h2 className="text-lg font-medium text-gray-800">
            {sidebarItems.find(item => item.id === getActiveItem())?.label || 'Dashboard'}
          </h2>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdmittingNavSide;

