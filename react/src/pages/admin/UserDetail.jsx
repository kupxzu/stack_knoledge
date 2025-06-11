import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminNavSide from '@/components/AdminNavSide';
import api from '@/services/api';
import { 
  ArrowLeftIcon, 
  UserIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon, 
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [id]);

  const loadUserData = async () => {
    try {
      const [userRes] = await Promise.all([
        api.get(`/users/${id}`)
      ]);
      
      setUser(userRes.data.user);
    } catch (error) {
      console.error('Error loading user:', error);
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${id}`);
      navigate('/admin');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  if (loading) {
    return (
      <AdminNavSide>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="flex space-x-3">
                  <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
                  <div className="h-10 bg-gray-200 rounded-xl w-28"></div>
                </div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-gray-200 h-96 rounded-2xl"></div>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-200 h-48 rounded-2xl"></div>
                <div className="bg-gray-200 h-32 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </AdminNavSide>
    );
  }

  if (!user) {
    return (
      <AdminNavSide>
        <div className="text-center py-16 animate-fade-in">
          <UserIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-500 font-medium">User not found</p>
        </div>
      </AdminNavSide>
    );
  }

  const getStatusColor = () => {
    return 'bg-green-100 text-green-800';
  };

  return (
    <AdminNavSide>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-in-from-top">
          <button
            onClick={() => navigate('/admin')}
            className="group inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-all duration-200 transform hover:-translate-x-1"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="space-y-2">
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={`/admin/users/${user.id}/edit`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit User
              </Link>
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete User
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg hover-lift animate-slide-in-from-bottom">
              <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
                <UserIcon className="w-6 h-6 mr-2 text-blue-600" />
                User Information
              </h3>
              
              <div className="space-y-8">
                {/* Profile Header */}
                <div className="flex items-center space-x-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                    <UserIcon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">{user.name}</h4>
                    <p className="text-gray-500 text-lg">@{user.username}</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${getStatusColor()}`}>
                      Active Account
                    </span>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border">
                      <EnvelopeIcon className="w-6 h-6 text-gray-400" />
                      <span className="text-gray-900 font-medium">{user.email}</span>
                    </div>
                  </div>

                  <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Role & Permissions
                    </label>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border">
                      <ShieldCheckIcon className="w-6 h-6 text-gray-400" />
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        user.role === 'billing' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role} Staff
                      </span>
                    </div>
                  </div>

                  <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Account Created
                    </label>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border">
                      <CalendarIcon className="w-6 h-6 text-gray-400" />
                      <span className="text-gray-900 font-medium">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Last Updated
                    </label>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border">
                      <ClockIcon className="w-6 h-6 text-gray-400" />
                      <span className="text-gray-900 font-medium">
                        {new Date(user.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover-lift animate-slide-in-from-right">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                Account Overview
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Status</span>
                  <span className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Department</span>
                  <span className="text-gray-900 font-semibold capitalize">{user.role}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700 font-medium">User ID</span>
                  <span className="text-gray-900 font-mono font-semibold">#{user.id}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Access Level</span>
                  <span className="text-gray-900 font-semibold">
                    {user.role === 'billing' ? 'Standard' : 'Standard'}
                  </span>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6 animate-fade-in hover-lift"
              style={{ animationDelay: '0.6s' }}
            >
              <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                Need Help?
              </h4>
              <p className="text-blue-700 text-sm leading-relaxed">
                Contact system administrator for user permission changes, password resets, or account issues.
              </p>
              <button className="mt-4 text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors">
                Contact Support →
              </button>
            </div>

            {/* Activity Summary */}
            <div 
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-6 animate-fade-in hover-lift"
              style={{ animationDelay: '0.7s' }}
            >
              <h4 className="font-bold text-purple-900 mb-3">Recent Activity</h4>
              <div className="space-y-3">
                <div className="text-sm text-purple-700">
                  <div className="font-medium">Profile Updated</div>
                  <div className="text-purple-600">
                    {new Date(user.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-purple-700">
                  <div className="font-medium">Account Created</div>
                  <div className="text-purple-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-40 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-2" />
                  Delete User Account
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to permanently delete <strong>{user.name}</strong>'s account?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-800 text-sm font-medium">
                    ⚠️ This action cannot be undone. All user data will be permanently removed.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105 font-medium"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminNavSide>
  );
};

export default UserDetail;