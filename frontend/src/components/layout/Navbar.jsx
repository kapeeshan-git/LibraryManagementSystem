import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Home,
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
  MapPin,
  Globe,
  GraduationCap,
  Bookmark,
  Info,
  Sparkles
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
    { name: 'Home', path: '/', icon: Home, public: true },
    { name: 'About', path: '/about', icon: Info, public: true },
    { name: 'Catalog (OPAC)', path: '/catalog', icon: BookOpen, public: true },
    { name: 'E-Books', path: '/ebooks', icon: Globe, public: true },
    { name: 'Publications', path: '/publications', icon: GraduationCap, public: true },
    { name: 'Services', path: '/services', icon: Bookmark, public: true },
    { name: 'Repository', path: '/repository', icon: FileText, public: true },
    { name: 'Circulation Desk', path: '/circulation', icon: Repeat, staffOnly: true },
    { name: 'Administration', path: '/admin', icon: LayoutDashboard, staffOnly: true },
    { name: 'My Loans', path: '/dashboard', icon: User, authOnly: true },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (link.staffOnly) return isStaff;
    if (link.authOnly) return isAuthenticated;
    return true;
  });

  return (
    <header className="sticky top-0 z-50 shadow-md bg-white">
      {/* ============================================================== */}
      {/* TIER 1: OFFICIAL VAU.AC.LK BRAND HEADER (White Background)    */}
      {/* ============================================================== */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Official University Logo Banner & Portal Title */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3 group">
                <img 
                  src="/cropped-UoV_Logo.png" 
                  alt="University of Vavuniya | வவுனியா பல்கலைக்கழகம் | වවුනියා විශ්වවිද්‍යාලය" 
                  className="h-12 sm:h-14 md:h-16 w-auto object-contain transition group-hover:opacity-95"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/uov_logo.png';
                  }}
                />
              </Link>

              {/* Vertical Divider & ULMS System Brand */}
              <div className="hidden sm:block border-l-2 border-slate-200 pl-4 py-0.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs md:text-sm font-black text-[#670047] tracking-tight uppercase">
                    Library Management System (ULMS)
                  </span>
                  <span className="text-[10px] bg-[#670047]/10 text-[#670047] font-black px-2 py-0.2 rounded-full border border-[#670047]/20">
                    FAS • Group 12
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">
                  Main Library, University of Vavuniya, Sri Lanka
                </div>
              </div>
            </div>

            {/* Right: Institutional Utility Links (Matching vau.ac.lk & lib.cmb.ac.lk top navigation) */}
            <div className="hidden md:flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1 text-slate-600 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#670047]" />
                <span>Pambaimadu Campus</span>
              </div>

              <div className="flex items-center space-x-1 text-slate-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#670047]" />
                <span>8:00 AM – 8:00 PM</span>
              </div>

              <Link
                to="/about"
                className="text-slate-600 hover:text-[#670047] font-semibold transition"
              >
                About Library
              </Link>

              <Link
                to="/services"
                className="text-slate-600 hover:text-[#670047] font-semibold transition"
              >
                Services
              </Link>

              <Link
                to="/ebooks"
                className="text-slate-600 hover:text-[#670047] font-semibold transition"
              >
                E-Books
              </Link>

              <a 
                href="https://vau.ac.lk/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#670047] hover:text-[#520038] font-bold flex items-center space-x-1 transition pl-1"
              >
                <span>vau.ac.lk</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-[#670047] hover:text-[#520038] p-2 rounded-lg hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TIER 2: MAIN NAVIGATION BAR (Vavuniya Maroon #670047)          */}
      {/* ============================================================== */}
      <nav className="bg-[#670047] text-white border-b-2 border-[#ffcb00]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13">
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-0.5">
              {filteredLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#4b0150] text-[#ffcb00] shadow-inner border-b-2 border-[#ffcb00]'
                        : 'text-slate-100 hover:bg-[#520038] hover:text-[#ffcb00]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#ffcb00]" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right: Authenticated Patron / Staff Profile Strip */}
            <div className="hidden md:flex items-center space-x-2.5 ml-auto">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2.5">
                  {/* Notification Bell */}
                  <Link 
                    to="/dashboard"
                    title={`${unreadCount} unread notices`}
                    className="relative p-2 text-slate-200 hover:text-white rounded-full hover:bg-[#520038] transition"
                  >
                    <Bell className="w-4 h-4 text-[#ffcb00]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black text-slate-950 bg-[#ffcb00] rounded-full shadow-xs">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Patron / Staff Badge */}
                  <div className="flex items-center space-x-2 bg-[#4b0150] py-1 px-2.5 rounded-xl border border-white/10 text-xs">
                    <div className="w-6 h-6 rounded-full bg-[#ffcb00] text-slate-950 font-black flex items-center justify-center text-[10px]">
                      {user?.first_name ? user.first_name[0] : (user?.username ? user.username[0] : 'U')}
                    </div>
                    <div className="leading-tight">
                      <div className="font-bold text-white truncate max-w-[120px]">
                        {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
                      </div>
                      <div className="text-[10px] text-[#ffcb00] font-mono font-bold">
                        {user?.reg_number} • <span className="uppercase text-[9px]">{user?.role}</span>
                      </div>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-300" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 bg-[#ffcb00] hover:bg-yellow-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Patron Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#520038] px-4 pt-3 pb-5 border-t border-[#ffcb00]/30 space-y-2">
            <div className="grid grid-cols-1 gap-1">
              {filteredLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#670047] text-[#ffcb00] border-l-4 border-[#ffcb00]'
                        : 'text-slate-100 hover:bg-[#670047]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#ffcb00]" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="text-slate-200">
                    <span className="font-bold text-white">{user?.username}</span> ({user?.reg_number})
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-rose-300 hover:text-white font-bold flex items-center space-x-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-[#ffcb00] text-slate-950 font-black py-2.5 rounded-xl text-xs"
                >
                  Sign In to Patron Portal
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
