import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import Login from '@pages/Login';
import Dashboard from '@pages/Dashboard';
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
            path="/admin"
              element={
              <ProtectedRoute allowRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
              }
              />
          <Route 
            path="/admitting"
              element={
              <ProtectedRoute allowRoles={['admitting']}>
                <Dashboard />
              </ProtectedRoute>
              }
              />
          <Route 
            path="/billing"
              element={
              <ProtectedRoute allowRoles={['billing']}>
                <Dashboard />
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