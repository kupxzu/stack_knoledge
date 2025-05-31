import { Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    const roleBasedRedirect = {
      admin: '/admin',
      admitting: '/admitting',
      billing: '/billing'
    };
    
    return <Navigate to={roleBasedRedirect[user?.role] || '/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;