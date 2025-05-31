import AdminNavSide from '@/components/AdminNavSide';

const AdminDash = () => {

  return (
    <AdminNavSide>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium text-blue-900">User Management</h3>
            <p className="text-blue-700 mt-2">Manage system users and permissions</p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <h3 className="text-lg font-medium text-green-900">System Settings</h3>
            <p className="text-green-700 mt-2">Configure system parameters</p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
            <h3 className="text-lg font-medium text-purple-900">Reports</h3>
            <p className="text-purple-700 mt-2">Generate system reports</p>
          </div>
        </div>
      </div>
    </AdminNavSide>
  );
};

export default AdminDash;