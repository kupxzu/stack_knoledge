import { useAuth } from '@context/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  const roleBasedRedirect = {
    admin: '/admin',
    admitting: '/admitting',
    billing: '/billing'
  };

  if (user?.role && roleBasedRedirect[user.role]) {
    return <Navigate to={roleBasedRedirect[user.role]} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to ACEMCT Billing System</h1>
              <p className="text-gray-600">General Dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;