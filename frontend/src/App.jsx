import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import CatalogPage from './pages/CatalogPage';
import RepositoryPage from './pages/RepositoryPage';
import LoginPage from './pages/LoginPage';
import CirculationDeskPage from './pages/CirculationDeskPage';
import PatronDashboardPage from './pages/PatronDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Route guards
const ProtectedRoute = ({ children, staffOnly = false }) => {
  const { isAuthenticated, isStaff, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (staffOnly && !isStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/catalog" replace />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/repository" element={<RepositoryPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Patron Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <PatronDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Librarian Circulation Desk */}
              <Route
                path="/circulation"
                element={
                  <ProtectedRoute staffOnly={true}>
                    <CirculationDeskPage />
                  </ProtectedRoute>
                }
              />

              {/* System Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute staffOnly={true}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/catalog" replace />} />
            </Routes>
          </main>
          
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            <p>© {new Date().getFullYear()} University of Vavuniya Library Management System • Group 12 (IT3162)</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
