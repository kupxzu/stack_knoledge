import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminNavSide from '@/components/AdminNavSide';
import api from '@/services/api';
import {
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AdminDash = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    billingUsers: 0,
    admittingUsers: 0,
    recentLogins: 0
  });
  const [selectedRole, setSelectedRole] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [selectedRole]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes] = await Promise.all([
        api.get(`/users${selectedRole !== 'all' ? `?role=${selectedRole}` : ''}`)
      ]);

      setUsers(usersRes.data.data || []);
      
      // Calculate stats
      const allUsers = usersRes.data.data || [];
      setStats({
        totalUsers: allUsers.length,
        billingUsers: allUsers.filter(u => u.role === 'billing').length,
        admittingUsers: allUsers.filter(u => u.role === 'admitting').length,
        recentLogins: allUsers.filter(u => {
          const lastLogin = new Date(u.updated_at);
          const today = new Date();
          return (today - lastLogin) < (24 * 60 * 60 * 1000); // Last 24 hours
        }).length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description, index }) => (
    <div 
      className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover-lift animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 animate-pulse-scale">{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color} shadow-lg transform transition-transform hover:rotate-6`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );

  const UserRow = ({ user, index }) => (
    <tr 
      className="hover:bg-gray-50 transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">@{user.username}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 hover:scale-105 ${
          user.role === 'billing' 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <Link
            to={`/admin/users/${user.id}`}
            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
            title="View User"
          >
            <EyeIcon className="w-4 h-4" />
          </Link>
          <Link
            to={`/admin/users/${user.id}/edit`}
            className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-all duration-200 transform hover:scale-110"
            title="Edit User"
          >
            <PencilIcon className="w-4 h-4" />
          </Link>
          <button
            onClick={() => handleDeleteClick(user)}
            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
            title="Delete User"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <AdminNavSide>
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-2xl animate-pulse"></div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminNavSide>
    );
  }

  return (
    <AdminNavSide>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between animate-slide-in-from-top">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users and system settings</p>
          </div>
          <Link
            to="/admin/users/create"
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add User
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={UserGroupIcon}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            description="Active system users"
            index={0}
          />
          <StatCard
            title="Billing Staff"
            value={stats.billingUsers}
            icon={DocumentTextIcon}
            color="bg-gradient-to-r from-green-500 to-green-600"
            description="Billing department"
            index={1}
          />
          <StatCard
            title="Admitting Staff"
            value={stats.admittingUsers}
            icon={ShieldCheckIcon}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            description="Admitting department"
            index={2}
          />
          <StatCard
            title="Recent Logins"
            value={stats.recentLogins}
            icon={ClockIcon}
            color="bg-gradient-to-r from-amber-500 to-amber-600"
            description="Last 24 hours"
            index={3}
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg animate-slide-in-from-bottom">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">System Users</h3>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Roles</option>
                  <option value="billing">Billing</option>
                  <option value="admitting">Admitting</option>
                </select>
              </div>
            </div>
          </div>

          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <UserRow key={user.id} user={user} index={index} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center animate-fade-in">
              <UserGroupIcon className="w-16 h-16 mx-auto text-gray-300 mb-6" />
              <p className="text-xl text-gray-500 font-medium">No users found</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or create a new user</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/users/create"
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 hover-lift group animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <UserGroupIcon className="w-10 h-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-blue-900 mb-2">User Management</h3>
            <p className="text-blue-700">Create and manage system users</p>
          </Link>

          <div 
            className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105 hover-lift group animate-fade-in cursor-pointer"
            style={{ animationDelay: '0.2s' }}
          >
            <CogIcon className="w-10 h-10 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-green-900 mb-2">System Settings</h3>
            <p className="text-green-700">Configure system parameters</p>
          </div>

          <div 
            className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 hover-lift group animate-fade-in cursor-pointer"
            style={{ animationDelay: '0.3s' }}
          >
            <DocumentTextIcon className="w-10 h-10 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-purple-900 mb-2">Reports</h3>
            <p className="text-purple-700">Generate system reports</p>
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
              setUserToDelete(null);
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
                  Delete User
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{userToDelete?.name}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminNavSide>
  );
};

export default AdminDash;