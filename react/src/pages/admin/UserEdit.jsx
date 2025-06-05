import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavSide from '@/components/AdminNavSide';
import api from '@/services/api';
import { ArrowLeftIcon, UserIcon, EnvelopeIcon, KeyIcon, ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'billing'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      const user = response.data.user;
      setFormData({
        name: user.name,
        username: user.username,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role
      });
    } catch (error) {
      console.error('Error loading user:', error);
      navigate('/admin');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
        delete updateData.password_confirmation;
      }

      await api.put(`/users/${id}`, updateData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Error updating user');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear specific error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  if (initialLoading) {
    return (
      <AdminNavSide>
        <div className="max-w-2xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
          <div className="bg-white rounded-2xl p-8 space-y-6 shadow-sm border border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-6 bg-gray-200 rounded w-28"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-6 bg-gray-200 rounded w-36"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </AdminNavSide>
    );
  }

  return (
    <AdminNavSide>
      <div className="max-w-2xl mx-auto">
        {/* Header with smooth slide-in animation */}
        <div className="mb-8 animate-slide-in-from-top">
          <button
            onClick={() => navigate('/admin')}
            className="group inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-all duration-200 transform hover:-translate-x-1"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit User</h1>
            <p className="text-gray-600">Update user information and permissions</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-slide-in-from-top">
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-800 font-medium">User updated successfully!</span>
            </div>
          </div>
        )}

        {/* Form with staggered animations */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-slide-in-from-bottom">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
                        errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-2 animate-shake">{errors.name[0]}</p>
                  )}
                </div>

                {/* Username Field */}
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
                        errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-2 animate-shake">{errors.username[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Field */}
                <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
                        errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2 animate-shake">{errors.email[0]}</p>
                  )}
                </div>

                {/* Role Field */}
                <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <ShieldCheckIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      required
                    >
                      <option value="billing">Billing Staff</option>
                      <option value="admitting">Admitting Staff</option>
                    </select>
                  </div>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-2 animate-shake">{errors.role[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t border-gray-200 pt-8 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <KeyIcon className="w-5 h-5 mr-2 text-blue-600" />
                Change Password (Optional)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password Field */}
                <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    New Password
                  </label>
                  <div className="relative group">
                    <KeyIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
                        errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-2 animate-shake">{errors.password[0]}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <KeyIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                    <input
                      type="password"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update User'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminNavSide>
  );
};

export default UserEdit;