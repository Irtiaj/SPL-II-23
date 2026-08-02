import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import CouncillorDashboard from './pages/councillor/CouncillorDashboard';
import ComplaintDetails from './pages/councillor/ComplaintDetails';
import InspectorDashboard from './pages/inspector/InspectorDashboard';
import InspectorComplaintPage from './pages/inspector/InspectorComplaintPage';

// Redirect to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Redirect based on user role
const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Home — role-based router */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Councillor routes */}
          <Route
            path="/councillor"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Councillor', 'Master Admin']}>
                  <CouncillorDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/councillor/complaint/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Councillor', 'Master Admin']}>
                  <ComplaintDetails />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Inspector routes */}
          <Route
            path="/inspector"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Inspector']}>
                  <InspectorDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspector/complaint/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['Inspector']}>
                  <InspectorComplaintPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
