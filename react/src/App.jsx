import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import Login from '@pages/Login';
import Dashboard from '@pages/Dashboard';
import AdminDash from '@pages/admin/AdminDash';
import AdmittingDash from '@pages/admitting/AdmittingDash';
import BillingDash from '@pages/billing/BillingDash';
import ProtectedRoute from '@components/ProtectedRoute';
import PWAInstallPrompt from '@components/PWAInstallPrompt';
import PWAUpdatePrompt from '@components/PWAUpdatePrompt';
import OfflineStatus from '@components/OfflineStatus';

function App() {
  return (
    <AuthProvider>
      <Router>
        <OfflineStatus />
        <PWAUpdatePrompt />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDash />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admitting" 
            element={
              <ProtectedRoute allowedRoles={['admitting']}>
                <AdmittingDash />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/billing" 
            element={
              <ProtectedRoute allowedRoles={['billing']}>
                <BillingDash />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <PWAInstallPrompt />
      </Router>
    </AuthProvider>
  );
}

export default App;