import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LeaveApplication } from './pages/LeaveApplication';
import { LeaveHistory } from './pages/LeaveHistory';
import { AdminCenter } from './pages/AdminCenter';
import { UserManagement } from './pages/UserManagement';
import { LeaveTypeManagement } from './pages/LeaveTypeManagement';
import { Login } from './pages/Login';
import { TILApplication } from './pages/TILApplication';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeaveProvider } from './context/LeaveContext';
import { LeavePoolManagement } from './pages/LeavePoolManagement';

// Protected route component
const ProtectedRoute = ({ children, requiredRole }: any) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Admin only route
const AdminRoute = ({ children }: any) => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export function App() {
  return (
    <AuthProvider>
      <LeaveProvider>
        <Router basename="/Leave-Management-System/">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="apply" element={<LeaveApplication />} />
              <Route path="history" element={<LeaveHistory />} />
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminCenter />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/leave-types"
                element={
                  <AdminRoute>
                    <LeaveTypeManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/leave-pools"
                element={
                  <AdminRoute>
                    <LeavePoolManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="til"
                element={
                  <ProtectedRoute>
                    <TILApplication />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </LeaveProvider>
    </AuthProvider>
  );
}
