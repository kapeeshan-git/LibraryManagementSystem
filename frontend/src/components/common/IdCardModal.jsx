import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, ShieldCheck, UserCheck, BookOpen } from 'lucide-react';

export default function IdCardModal({ user, onClose }) {
  const cardRef = useRef(null);

  if (!user) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Controls */}
        <div className="bg-slate-900 px-6 py-3 flex items-center justify-between text-white print:hidden">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Library Patron Card</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable University ID Card Container */}
        <div className="p-6 bg-slate-100 flex items-center justify-center">
          <div
            ref={cardRef}
            className="w-full bg-white rounded-2xl border-2 border-slate-300 shadow-lg overflow-hidden flex flex-col justify-between"
            style={{ minHeight: '380px' }}
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 text-white p-4 text-center relative">
              <div className="w-8 h-8 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-1 text-white font-extrabold text-sm border border-white/20">
                U
              </div>
              <h2 className="text-xs font-black uppercase tracking-wider">University of Vavuniya</h2>
              <p className="text-[10px] text-emerald-200 font-medium">Library Patron Identification</p>
            </div>

            {/* Card Body */}
            <div className="p-5 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-700 font-bold text-xl mb-3 shadow-inner">
                {user.first_name ? user.first_name[0] : (user.username ? user.username[0] : 'P')}
              </div>

              <h3 className="text-base font-black text-slate-900 leading-tight">
                {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username}
              </h3>

              <div className="mt-1">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'LIBRARIAN' ? 'bg-blue-100 text-blue-800' :
                  user.role === 'LECTURER' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {user.role}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 mt-1">
                {user.department_name || user.department?.name || 'Faculty of Applied Science'}
              </div>

              {/* Scannable QR Code */}
              <div className="mt-4 p-3 bg-white rounded-2xl border-2 border-emerald-500/40 shadow-sm inline-block">
                <QRCodeSVG
                  value={user.reg_number || user.username}
                  size={128}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="mt-2 font-mono font-black text-sm text-slate-900 tracking-wider">
                {user.reg_number || user.username}
              </div>
            </div>

            {/* Card Footer Strip */}
            <div className="bg-slate-900 text-slate-300 py-2 px-4 text-center text-[10px] flex items-center justify-between border-t border-slate-200">
              <span className="flex items-center space-x-1">
                <BookOpen className="w-3 h-3 text-emerald-400" />
                <span>ULMS Vavuniya</span>
              </span>
              <span className="font-semibold text-emerald-400">
                {user.is_active_patron ? 'Active Privilege' : 'Suspended'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Help */}
        <div className="p-4 bg-white text-center text-xs text-slate-500 print:hidden">
          Present this QR code to the library camera scanner for instant book borrowing and returns.
        </div>
      </div>
    </div>
  );
}
