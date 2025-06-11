import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import AnimationBG from '@/common/AnimationBG';

const Login = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    remember: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const getRoleBasedRoute = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'admitting':
        return '/admitting';
      case 'billing':
        return '/billing';
      default:
        return '/dashboard';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      const route = getRoleBasedRoute(result.user.role);
      navigate(route);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <AnimationBG 
      variant="medical" 
      color="blue" 
      intensity="low"
      className="min-h-screen"
    >
      <div className="min-h-screen flex flex-col justify-center py-8 sm:px-6 lg:px-8 relative">
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
        
        <div className="relative z-10">

          {/* Login Form */}
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            
            <div className="bg-white/95 backdrop-blur-sm py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-gray-200/50">
                      <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-4xl flex items-center justify-center shadow-lg bg-white/90 backdrop-blur-sm">
                <img
                  className="h-20 w-20"
                  src="/ace-logo.png"
                  alt="ACEMCT Logo"
                />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Billing System
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Welcome back! Please sign in to continue
            </p>
          </div>
          <br />
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Username/Email Field */}
                <div>

                  <div className="mt-1">
                    <input
                      id="login"
                      name="login"
                      type="text"
                      autoComplete="username"
                      required
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-sm bg-white/90"
                      placeholder="Enter username or email"
                      value={formData.login}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>

                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 sm:text-sm bg-white/90"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.remember}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Keep me signed in
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-lg bg-red-50/90 backdrop-blur-sm border border-red-200 p-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Sign In
                        <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    )}
                  </button>
                </div>
              </form>

              {/* Additional Features */}
              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Secure healthcare billing management system
                  </p>
                  <div className="mt-2 flex justify-center space-x-4 text-xs text-gray-400">
                    <span>SSL Encrypted |</span>
                    <span>Fast & Reliable |</span>
                    <span>Mobile Ready |</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Accounts Info */}
            {/* <div className="mt-6">
              <div className="bg-blue-50/90 backdrop-blur-sm border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Test Accounts</h3>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Admin:</span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">admin / qweqweqwe</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Admitting:</span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">admitting / qweqweqwe</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Billing:</span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">billing / qweqweqwe</code>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2025 Allied Care Experts Tuguegarao City. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </AnimationBG>
  );
};

export default Login;