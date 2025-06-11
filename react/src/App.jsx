import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import { BreadcrumbProvider } from '@context/BreadcrumbContext';
import Login from '@pages/Login';
import Dashboard from '@pages/Dashboard';
import NotFound from '@pages/NotFound'; // Add this import

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
import BillingReport from '@pages/billing/BillingReport';

import PatientPortal from '@pages/portal/PatientPortal';

import ProtectedRoute from '@components/ProtectedRoute';
import PWAInstallPrompt from '@components/PWAInstallPrompt';
import PWAUpdatePrompt from '@components/PWAUpdatePrompt';
import OfflineStatus from '@components/OfflineStatus';
import BreadcrumbWrapper from '@components/BreadcrumbWrapper';

function App() {
  return (
    <AuthProvider>
      <BreadcrumbProvider>
        <Router>
          <OfflineStatus />
          <PWAUpdatePrompt />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Patient Portal - does hash */}
            <Route path="/patient-portal/:accessHash" element={<PatientPortal />} />
            
            {/* Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Dashboard', path: '/dashboard', isHome: true }
                  ]}>
                    <Dashboard />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Admin', path: '/admin', isHome: true }
                  ]}>
                    <AdminDash />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users/create" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Admin', path: '/admin', isHome: true },
                    { label: 'Users', path: '/admin/users' },
                    { label: 'Create User', path: '/admin/users/create', isActive: true }
                  ]}>
                    <UserCreate />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Admin', path: '/admin', isHome: true },
                    { label: 'Users', path: '/admin/users' },
                    { label: 'User Details', path: '/admin/users/:id', isActive: true }
                  ]}>
                    <UserDetail />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Admin', path: '/admin', isHome: true },
                    { label: 'Users', path: '/admin/users' },
                    { label: 'Edit User', path: '/admin/users/:id/edit', isActive: true }
                  ]}>
                    <UserEdit />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              } 
            />
            
            {/* Admitting Routes */}
            <Route
              path="/admitting" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'admitting']}>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Admitting', path: '/admitting', isHome: true }
                  ]}>
                    <AdmittingDash />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admitting/admit-patient"
              element={
                <ProtectedRoute allowedRoles={['admin', 'admitting']}>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Admitting', path: '/admitting', isHome: true },
                    { label: 'Admit Patient', path: '/admitting/admit-patient', isActive: true }
                  ]}>
                    <AdmitPatient />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admitting/patient-list" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'admitting']}>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Admitting', path: '/admitting', isHome: true },
                    { label: 'Patient List', path: '/admitting/patient-list', isActive: true }
                  ]}>
                    <AdmitPatientList />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admitting/patients/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'admitting']}>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Admitting', path: '/admitting', isHome: true },
                    { label: 'Patient List', path: '/admitting/patient-list' },
                    { label: 'Patient Details', path: '/admitting/patients/:id', isActive: true }
                  ]}>
                    <ViewPatient />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admitting/patients/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'admitting']}>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Admitting', path: '/admitting', isHome: true },
                    { label: 'Patient List', path: '/admitting/patient-list' },
                    { label: 'Edit Patient', path: '/admitting/patients/:id/edit', isActive: true }
                  ]}>
                    <EditPatient />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admitting/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'admitting']}>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Admitting', path: '/admitting', isHome: true },
                    { label: 'Settings', path: '/admitting/settings', isActive: true }
                  ]}>
                    <AdmissionSetting />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              }
            />
            
            {/* Billing Routes */}
            <Route 
              path="/billing" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'billing']}>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Billing', path: '/billing', isHome: true }
                  ]}>
                    <BillingDash />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/billing/transactions" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'billing']}>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Billing', path: '/billing', isHome: true },
                    { label: 'Transactions', path: '/billing/transactions', isActive: true }
                  ]}>
                    <BillingTransaction />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/billing/reports" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'billing']}>
                  <BreadcrumbWrapper breadcrumbs={[
                    { label: 'Billing', path: '/billing', isHome: true },
                    { label: 'Reports', path: '/billing/reports', isActive: true }
                  ]}>
                    <BillingReport />
                  </BreadcrumbWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PWAInstallPrompt />
        </Router>
      </BreadcrumbProvider>
    </AuthProvider>
  );
}

export default App;