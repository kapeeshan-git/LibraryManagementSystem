import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  BookOpen, 
  FileText, 
  Repeat, 
  LayoutDashboard, 
  User, 
  LogOut, 
  LogIn, 
  Bell,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications/inbox/unread_count/')
        .then(res => setUnreadCount(res.data.unread_count || 0))
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Catalog (OPAC)', path: '/catalog', icon: BookOpen, public: true },
    { name: 'Research Repository', path: '/repository', icon: FileText, public: true },
    { name: 'Circulation Desk', path: '/circulation', icon: Repeat, staffOnly: true },
    { name: 'Administration', path: '/admin', icon: LayoutDashboard, staffOnly: true },
    { name: 'My Loans & Holds', path: '/dashboard', icon: User, authOnly: true },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (link.staffOnly) return isStaff;
    if (link.authOnly) return isAuthenticated;
    return true;
  });

  return (
    <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & University Title */}
          <Link to="/catalog" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow group-hover:bg-emerald-500 transition">
              U
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block leading-tight">University of Vavuniya</span>
              <span className="text-xs text-emerald-400 font-medium tracking-wide">Library Management System</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile / Auth State */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Notification Badge */}
                <Link 
                  to="/dashboard"
                  title={`${unreadCount} unread notices`}
                  className="relative p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-800 transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-rose-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <div className="text-right">
                  <div className="text-sm font-semibold text-white leading-none">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                  </div>
                  <div className="text-xs text-emerald-400 mt-0.5">
                    {user?.reg_number} • <span className="font-bold">{user?.role}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-rose-700 text-slate-200 hover:text-white text-xs font-semibold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-sm font-medium shadow transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Patron Login</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 px-4 pt-2 pb-4 space-y-1">
          {filteredLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-700">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{user?.username} ({user?.role})</div>
                  <div className="text-xs text-slate-400">{user?.reg_number}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-rose-400 hover:text-rose-300 text-sm font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Patron Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
