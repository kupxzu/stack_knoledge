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

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const UserRow = ({ user }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">@{user.username}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.role === 'billing' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          <Link
            to={`/admin/users/${user.id}`}
            className="text-blue-600 hover:text-blue-900"
          >
            <EyeIcon className="w-4 h-4" />
          </Link>
          <Link
            to={`/admin/users/${user.id}/edit`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <PencilIcon className="w-4 h-4" />
          </Link>
          <button
            onClick={() => deleteUser(user.id)}
            className="text-red-600 hover:text-red-900"
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
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-96 rounded-xl"></div>
        </div>
      </AdminNavSide>
    );
  }

  return (
    <AdminNavSide>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users and system settings</p>
          </div>
          <Link
            to="/admin/users/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add User
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={UserGroupIcon}
            color="bg-blue-500"
            description="Active system users"
          />
          <StatCard
            title="Billing Staff"
            value={stats.billingUsers}
            icon={DocumentTextIcon}
            color="bg-green-500"
            description="Billing department"
          />
          <StatCard
            title="Admitting Staff"
            value={stats.admittingUsers}
            icon={ShieldCheckIcon}
            color="bg-purple-500"
            description="Admitting department"
          />
          <StatCard
            title="Recent Logins"
            value={stats.recentLogins}
            icon={ClockIcon}
            color="bg-amber-500"
            description="Last 24 hours"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">System Users</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <UserRow key={user.id} user={user} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <UserGroupIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/users/create"
            className="bg-blue-50 p-6 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            <UserGroupIcon className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-blue-900">User Management</h3>
            <p className="text-blue-700 mt-2">Create and manage system users</p>
          </Link>

          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <CogIcon className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-lg font-medium text-green-900">System Settings</h3>
            <p className="text-green-700 mt-2">Configure system parameters</p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
            <DocumentTextIcon className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-medium text-purple-900">Reports</h3>
            <p className="text-purple-700 mt-2">Generate system reports</p>
          </div>
        </div>
      </div>
    </AdminNavSide>
  );
};

export default AdminDash;