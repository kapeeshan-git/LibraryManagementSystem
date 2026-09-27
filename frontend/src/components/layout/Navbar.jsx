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
  X,
  ExternalLink,
  Clock,
  MapPin
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, isStaff } = useAuth();
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
    { name: 'Institutional Repository', path: '/repository', icon: FileText, public: true },
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
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top Institutional Utility Strip (Matching vau.ac.lk & lib.cmb.ac.lk) */}
      <div className="bg-[#4b0150] text-slate-200 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-[#7a1e5c]/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="font-semibold text-[#ffcb00]">University of Vavuniya</span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-[#ffcb00]" />
              <span>Main Library, Pambaimadu Campus</span>
            </span>
            <span className="hidden lg:inline text-slate-400">|</span>
            <span className="hidden lg:flex items-center space-x-1 text-slate-300">
              <Clock className="w-3 h-3 text-[#ffcb00]" />
              <span>Library Hours: 8:00 AM – 6:00 PM</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-300">
            <a 
              href="https://vau.ac.lk/" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[#ffcb00] transition flex items-center space-x-1"
            >
              <span>Main University Portal</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span>•</span>
            <a 
              href="https://vau.ac.lk/library/" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[#ffcb00] transition"
            >
              About Library
            </a>
          </div>
        </div>
      </div>

      {/* Main University Navbar */}
      <nav className="bg-[#670047] text-white border-b-2 border-[#ffcb00]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* University Crest & Title */}
            <Link to="/catalog" className="flex items-center space-x-3.5 group">
              <img 
                src="/uov_logo.png" 
                alt="University of Vavuniya Crest" 
                className="h-14 w-auto object-contain drop-shadow"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://www.vau.ac.lk/wp-content/uploads/2021/07/cropped-UoV_Logo.png';
                }}
              />
              <div className="leading-tight">
                <div className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-[#ffcb00] transition">
                  UNIVERSITY OF VAVUNIYA
                </div>
                <div className="text-[11px] font-bold tracking-wide text-[#ffcb00]">
                  LIBRARY MANAGEMENT SYSTEM (ULMS)
                </div>
                <div className="text-[10px] text-slate-200 hidden sm:block">
                  Faculty of Applied Science • Group 12
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {filteredLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#4b0150] text-[#ffcb00] shadow-inner border-b-2 border-[#ffcb00]'
                        : 'text-slate-100 hover:bg-[#7a1e5c] hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Profile / Auth State */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3 bg-[#4b0150]/60 p-1.5 pl-3 rounded-2xl border border-white/10">
                  {/* Notification Bell */}
                  <Link 
                    to="/dashboard"
                    title={`${unreadCount} unread notices`}
                    className="relative p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-[#670047] transition"
                  >
                    <Bell className="w-4 h-4 text-[#ffcb00]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black text-[#4b0150] bg-[#ffcb00] rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white leading-none">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                    </div>
                    <div className="text-[10px] text-[#ffcb00] font-mono mt-0.5 font-semibold">
                      {user?.reg_number} • <span className="uppercase">{user?.role}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#670047] hover:bg-rose-700 text-white text-xs font-bold transition shadow"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 bg-[#ffcb00] hover:bg-[#e5b600] text-[#4b0150] px-4 py-2 rounded-xl text-xs font-black shadow-md transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Patron Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-[#ffcb00] p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#4b0150] px-4 pt-2 pb-4 space-y-1 border-t border-[#7a1e5c]">
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-bold text-slate-100 hover:bg-[#670047] hover:text-[#ffcb00]"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#7a1e5c]/60">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{user?.username} ({user?.role})</div>
                    <div className="text-[11px] text-[#ffcb00]">{user?.reg_number}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-rose-300 hover:text-white text-xs font-bold px-3 py-1 bg-rose-900/60 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-[#ffcb00] hover:bg-[#e5b600] text-[#4b0150] font-black px-4 py-2 rounded-lg text-xs"
                >
                  Patron Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
