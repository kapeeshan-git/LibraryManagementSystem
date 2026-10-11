import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, User, AlertCircle, BookMarked, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(username, password);
      if (userData.role === 'ADMIN' || userData.role === 'LIBRARIAN') {
        navigate('/circulation');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid Registration Number / Password combination.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border-t-4 border-[#670047] border-x border-b border-slate-200">
        <div className="text-center">
          <img 
            src="/uov_logo.png" 
            alt="University of Vavuniya Crest" 
            className="h-16 w-auto mx-auto object-contain drop-shadow mb-3"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://www.vau.ac.lk/wp-content/uploads/2021/07/cropped-UoV_Logo.png';
            }}
          />
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Patron & Staff Login
          </h2>
          <p className="mt-0.5 text-xs text-[#670047] font-bold">
            University of Vavuniya Library Management System
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-3.5 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-700 font-bold">{error}</p>
          </div>
        )}

        <form className="mt-4 space-y-4 text-xs" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Registration No / Staff ID
            </label>
            <div className="relative rounded-md shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. 2022/ICT/125 or librarian"
                className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#670047] bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative rounded-md shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#670047] bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-black text-white bg-[#670047] hover:bg-[#4b0150] focus:outline-none focus:ring-2 focus:ring-[#ffcb00] transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Library'}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3 h-3 text-[#ffcb00]" />
            <span>Fast Role Testing Accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('librarian', 'librarian123')}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-[#fff0f7] hover:border-[#670047]/40 text-left transition"
            >
              <div className="font-black text-slate-800">Librarian</div>
              <div className="text-slate-500 text-[10px]">librarian / librarian123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-[#fff0f7] hover:border-[#670047]/40 text-left transition"
            >
              <div className="font-black text-slate-800">Admin</div>
              <div className="text-slate-500 text-[10px]">admin / admin123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('lecturer', 'lecturer123')}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-[#fff0f7] hover:border-[#670047]/40 text-left transition"
            >
              <div className="font-black text-slate-800">Lecturer</div>
              <div className="text-slate-500 text-[10px]">lecturer / lecturer123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('2022/ICT/125', 'Password@123')}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-[#fff0f7] hover:border-[#670047]/40 text-left transition"
            >
              <div className="font-black text-slate-800">Student (Kapeeshan)</div>
              <div className="text-slate-500 text-[10px]">2022/ICT/125 / Password@123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
