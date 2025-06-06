import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import Login from '@pages/Login';
import Dashboard from '@pages/Dashboard';

import AdminDash from '@pages/admin/AdminDash';
import UserCreate from '@/pages/admin/UserCreate';
import UserEdit from '@/pages/admin/UserEdit';
import UserDetail from '@/pages/admin/UserDetail';

import AdmitPatient from '@pages/admitting/AdmitPatient';
import AdmitPatientList from '@pages/admitting/AdmitPatientList';
import AdmittingDash from '@pages/admitting/AdmittingDash';
import ViewPatient from '@pages/admitting/ViewPatient';
import EditPatient from '@pages/admitting/EditPatient';
import AdmissionSetting from '@pages/admitting/AdmissionSetting';

import BillingDash from '@pages/billing/BillingDash';
import BillingTransaction from '@pages/billing/BillingTransaction';

import PatientPortal from '@pages/portal/PatientPortal';

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
          
          {/* does hash*/}
          <Route path="/patient-portal/:accessHash" element={<PatientPortal />} />
          
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDash />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users/create" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserEdit />
              </ProtectedRoute>
            } 
          />
          
          {/* Admitting Routes */}
          <Route
            path="/admitting" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'admitting']}>
                <AdmittingDash />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admitting/admit-patient"
            element={
              <ProtectedRoute allowedRoles={['admin', 'admitting']}>
                <AdmitPatient />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admitting/patient-list" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'admitting']}>
                <AdmitPatientList />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admitting/patients/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'admitting']}>
                <ViewPatient />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admitting/patients/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'admitting']}>
                <EditPatient />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admitting/settings" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'admitting']}>
                <AdmissionSetting />
              </ProtectedRoute>
            }
          />
          
          {/* Billing Routes */}
          <Route 
            path="/billing" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'billing']}>
                <BillingDash />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/billing/transactions" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'billing']}>
                <BillingTransaction />
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