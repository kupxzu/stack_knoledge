import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Navigate based on user role
    switch (user.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'admitting':
        navigate('/admitting');
        break;
      case 'billing':
        navigate('/billing');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleGoBack = () => {
    window.history.length > 1 ? navigate(-1) : handleGoHome();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">ACE Medical Center</span>
            </div>
            
            {user && (
              <button
                onClick={handleGoHome}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 404 Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Large 404 */}
          <div className="space-y-4">
            <div className="text-8xl md:text-9xl font-bold text-gray-200 select-none">
              404
            </div>
            
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Page Not Found
            </h1>
            <p className="text-gray-600 text-lg">
              The page you're looking for doesn't exist.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleGoHome}
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                {user ? 'Go Home' : 'Login'}
              </button>
              
              <button
                onClick={handleGoBack}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 border border-gray-200"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Go Back
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;