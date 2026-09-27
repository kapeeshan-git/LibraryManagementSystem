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
          
          {/* Authentic University of Vavuniya Academic Footer (Inspired by vau.ac.lk & lib.cmb.ac.lk) */}
          <footer className="bg-[#121e36] text-slate-300 text-xs border-t-4 border-[#ffcb00] mt-12 print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Col 1: Crest & Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="/uov_logo.png" 
                      alt="University of Vavuniya" 
                      className="h-12 w-auto object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://www.vau.ac.lk/wp-content/uploads/2021/07/cropped-UoV_Logo.png';
                      }}
                    />
                    <div>
                      <div className="font-black text-white text-sm">UNIVERSITY OF VAVUNIYA</div>
                      <div className="text-[10px] text-[#ffcb00] font-bold">LIBRARY SYSTEM • SRI LANKA</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Main Library, Pambaimadu Campus, Mannar Road, Vavuniya, Sri Lanka.
                  </p>
                  <div className="text-[11px] text-slate-400">
                    <div>Email: <a href="mailto:library@vau.ac.lk" className="text-[#ffcb00] hover:underline">library@vau.ac.lk</a></div>
                    <div>General: <a href="https://vau.ac.lk" target="_blank" rel="noreferrer" className="text-[#ffcb00] hover:underline">www.vau.ac.lk</a></div>
                  </div>
                </div>

                {/* Col 2: Faculties */}
                <div className="space-y-2">
                  <h4 className="text-white font-bold uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1.5 text-[#ffcb00]">
                    University Faculties
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    <li><a href="https://fas.vau.ac.lk/" target="_blank" rel="noreferrer" className="hover:text-white transition">Faculty of Applied Science</a></li>
                    <li><a href="https://fbs.vau.ac.lk/" target="_blank" rel="noreferrer" className="hover:text-white transition">Faculty of Business Studies</a></li>
                    <li><a href="https://fts.vau.ac.lk/" target="_blank" rel="noreferrer" className="hover:text-white transition">Faculty of Technological Studies</a></li>
                    <li><a href="https://vau.ac.lk/cdce/" target="_blank" rel="noreferrer" className="hover:text-white transition">Centre for Distance & Continuing Education</a></li>
                  </ul>
                </div>

                {/* Col 3: Library Services */}
                <div className="space-y-2">
                  <h4 className="text-white font-bold uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1.5 text-[#ffcb00]">
                    Library Collections
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    <li><a href="/catalog" className="hover:text-white transition">OPAC Public Book Catalog</a></li>
                    <li><a href="/repository" className="hover:text-white transition">Digital Institutional Repository</a></li>
                    <li><a href="/dashboard" className="hover:text-white transition">Patron Loans & Due Date Alerts</a></li>
                    <li><a href="https://scholar.google.com/citations?hl=en&view_op=search_authors&mauthors=%22vau.ac.lk%22" target="_blank" rel="noreferrer" className="hover:text-white transition">Staff in Google Scholar</a></li>
                  </ul>
                </div>

                {/* Col 4: Operations & Governance */}
                <div className="space-y-2">
                  <h4 className="text-white font-bold uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1.5 text-[#ffcb00]">
                    Administration & Portal
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                    <li><a href="https://vau.ac.lk/vice-chancellor/" target="_blank" rel="noreferrer" className="hover:text-white transition">Office of the Vice Chancellor</a></li>
                    <li><a href="https://vau.ac.lk/itc/" target="_blank" rel="noreferrer" className="hover:text-white transition">Information Technology Centre</a></li>
                    <li><a href="https://www.ugc.ac.lk/" target="_blank" rel="noreferrer" className="hover:text-white transition">University Grants Commission (UGC)</a></li>
                    <li><span className="text-[#ffcb00] font-semibold">IT3162 — Group Project (Group 12)</span></li>
                  </ul>
                </div>
              </div>

              {/* Bottom Copyright Strip */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-2">
                <p>© {new Date().getFullYear()} University of Vavuniya, Sri Lanka. All rights reserved.</p>
                <p>Designed for Faculty of Applied Science • Department of Physical Science</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
