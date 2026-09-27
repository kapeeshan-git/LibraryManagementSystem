import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, ShieldCheck, BookOpen } from 'lucide-react';

export default function IdCardModal({ user, onClose }) {
  const cardRef = useRef(null);

  if (!user) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Controls */}
        <div className="bg-[#4b0150] px-6 py-3 flex items-center justify-between text-white print:hidden border-b border-[#7a1e5c]">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#ffcb00]">
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Library Patron Card</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1 bg-[#ffcb00] hover:bg-[#e5b600] text-[#4b0150] rounded-lg text-xs font-black transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Card</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-[#670047]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable University ID Card Container */}
        <div className="p-6 bg-slate-100 flex items-center justify-center">
          <div
            ref={cardRef}
            className="w-full bg-white rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden flex flex-col justify-between"
            style={{ minHeight: '390px' }}
          >
            {/* Card Header with Official UoV Crest */}
            <div className="bg-[#670047] text-white p-3.5 text-center relative border-b-2 border-[#ffcb00]">
              <img 
                src="/uov_logo.png" 
                alt="University of Vavuniya" 
                className="h-10 mx-auto object-contain mb-1 drop-shadow"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://www.vau.ac.lk/wp-content/uploads/2021/07/cropped-UoV_Logo.png';
                }}
              />
              <h2 className="text-xs font-black uppercase tracking-wider text-white">University of Vavuniya</h2>
              <p className="text-[10px] text-[#ffcb00] font-bold">Library Identification Card</p>
            </div>

            {/* Card Body */}
            <div className="p-5 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-[#670047]/30 flex items-center justify-center text-[#670047] font-black text-xl mb-2.5 shadow-inner">
                {user.first_name ? user.first_name[0] : (user.username ? user.username[0] : 'P')}
              </div>

              <h3 className="text-base font-black text-slate-900 leading-tight">
                {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username}
              </h3>

              <div className="mt-1">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                  user.role === 'LIBRARIAN' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                  user.role === 'LECTURER' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {user.role}
                </span>
              </div>

              <div className="text-[11px] text-slate-600 mt-1 font-medium">
                {user.department_name || user.department?.name || 'Faculty of Applied Science'}
              </div>

              {/* Scannable QR Code */}
              <div className="mt-3.5 p-2.5 bg-white rounded-xl border-2 border-[#670047] shadow-sm inline-block">
                <QRCodeSVG
                  value={user.reg_number || user.username}
                  size={120}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="mt-1.5 font-mono font-black text-sm text-[#670047] tracking-wider">
                {user.reg_number || user.username}
              </div>
            </div>

            {/* Card Footer Strip */}
            <div className="bg-[#1b3058] text-slate-200 py-2 px-4 text-center text-[10px] flex items-center justify-between border-t border-slate-200">
              <span className="flex items-center space-x-1 font-semibold">
                <BookOpen className="w-3 h-3 text-[#ffcb00]" />
                <span>ULMS • Sri Lanka</span>
              </span>
              <span className="font-bold text-[#ffcb00]">
                {user.is_active_patron ? 'Active Privilege' : 'Suspended'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Help */}
        <div className="p-3.5 bg-white text-center text-xs text-slate-500 print:hidden border-t">
          Present this ID Card QR code to the circulation camera scanner for book checkouts and returns.
        </div>
      </div>
    </div>
  );
}
