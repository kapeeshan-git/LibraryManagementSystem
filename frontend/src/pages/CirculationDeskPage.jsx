import React, { useState, useEffect } from 'react';
import api from '../services/api';
import QrBarcodeScanner from '../components/common/QrBarcodeScanner';
import { 
  Barcode, 
  QrCode, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User, 
  Book, 
  Camera, 
  ShieldAlert, 
  Sparkles 
} from 'lucide-react';

export default function CirculationDeskPage() {
  const [activeTab, setActiveTab] = useState('issue'); // 'issue', 'return', 'lookup'

  // Scanner Modal State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState(null); // 'patron', 'issue_book', 'return_book', 'lookup_book'
  const [scannerTitle, setScannerTitle] = useState('');

  // Issue Form State
  const [patronReg, setPatronReg] = useState('');
  const [patronData, setPatronData] = useState(null);
  const [patronLookupLoading, setPatronLookupLoading] = useState(false);
  const [patronLookupError, setPatronLookupError] = useState('');

  const [issueBarcode, setIssueBarcode] = useState('');
  const [bookCopyData, setBookCopyData] = useState(null);
  const [copyLookupLoading, setCopyLookupLoading] = useState(false);

  const [issueNotes, setIssueNotes] = useState('');
  const [issueResult, setIssueResult] = useState(null);

  // Return Form State
  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnResult, setReturnResult] = useState(null);

  // Lookup State
  const [lookupBarcode, setLookupBarcode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto lookup patron when patronReg changes
  useEffect(() => {
    const trimmed = patronReg.trim();
    if (trimmed.length >= 3) {
      lookupPatron(trimmed);
    } else {
      setPatronData(null);
      setPatronLookupError('');
    }
  }, [patronReg]);

  // Auto lookup book copy when issueBarcode changes
  useEffect(() => {
    const trimmed = issueBarcode.trim();
    if (trimmed.length >= 3) {
      lookupCopy(trimmed);
    } else {
      setBookCopyData(null);
    }
  }, [issueBarcode]);

  const lookupPatron = async (regNo) => {
    setPatronLookupLoading(true);
    setPatronLookupError('');
    try {
      const res = await api.get(`/auth/users/lookup/?reg_number=${encodeURIComponent(regNo)}`);
      setPatronData(res.data);
    } catch (err) {
      setPatronData(null);
      setPatronLookupError(err.response?.data?.error || 'Patron ID not found.');
    } finally {
      setPatronLookupLoading(false);
    }
  };

  const lookupCopy = async (barcode) => {
    setCopyLookupLoading(true);
    try {
      const res = await api.get(`/catalog/copies/lookup/?barcode=${encodeURIComponent(barcode)}`);
      setBookCopyData(res.data);
    } catch (err) {
      setBookCopyData(null);
    } finally {
      setCopyLookupLoading(false);
    }
  };

  // Open Scanner Helper
  const openScanner = (target, title) => {
    setScannerTarget(target);
    setScannerTitle(title);
    setScannerOpen(true);
  };

  // Handle Scan Callback
  const handleScanSuccess = (decodedText) => {
    const cleanText = decodedText.trim();
    if (scannerTarget === 'patron') {
      setPatronReg(cleanText);
      lookupPatron(cleanText);
    } else if (scannerTarget === 'issue_book') {
      setIssueBarcode(cleanText);
      lookupCopy(cleanText);
    } else if (scannerTarget === 'return_book') {
      setReturnBarcode(cleanText);
    } else if (scannerTarget === 'lookup_book') {
      setLookupBarcode(cleanText);
      // Auto submit lookup
      api.get(`/catalog/copies/lookup/?barcode=${encodeURIComponent(cleanText)}`)
        .then(res => setLookupResult(res.data))
        .catch(() => setLookupResult(null));
    }
  };

  const handleIssueSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setIssueResult(null);
    setLoading(true);

    try {
      const res = await api.post('/circulation/issue/', {
        patron_reg_number: patronReg.trim(),
        accession_number: issueBarcode.trim(),
        notes: issueNotes
      });
      setIssueResult(res.data);
      setIssueBarcode('');
      setBookCopyData(null);
      // Refresh patron loan count
      lookupPatron(patronReg.trim());
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.[0] || 'Failed to issue book.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setReturnResult(null);
    setLoading(true);

    try {
      const res = await api.post('/circulation/return/', {
        accession_number: returnBarcode.trim(),
        condition: returnCondition,
        notes: returnNotes
      });
      setReturnResult(res.data);
      setReturnBarcode('');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.[0] || 'Failed to process book return.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Scanner Modal */}
      {scannerOpen && (
        <QrBarcodeScanner
          title={scannerTitle}
          onScan={handleScanSuccess}
          onClose={() => setScannerOpen(false)}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Circulation Desk</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Barcode & QR Ready
            </span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Scan patron ID cards (QR) and physical book barcodes to lend or return books instantly.
          </p>
        </div>

        {/* Global Quick Scan Button */}
        <div className="flex gap-2">
          <button
            onClick={() => openScanner('patron', 'Scan Patron Library ID Card QR')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#670047] hover:bg-[#520038] text-white rounded-xl text-xs font-bold shadow transition"
          >
            <QrCode className="w-4 h-4 text-[#ffcb00]" />
            <span>Scan ID Card</span>
          </button>
          <button
            onClick={() => openScanner(activeTab === 'return' ? 'return_book' : 'issue_book', 'Scan Book Accession Barcode')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition"
          >
            <Barcode className="w-4 h-4 text-[#ffcb00]" />
            <span>Scan Book Barcode</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => { setActiveTab('issue'); setError(''); }}
          className={`flex items-center space-x-2 py-3 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'issue'
              ? 'border-[#670047] text-[#670047]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Lend / Issue Book</span>
        </button>

        <button
          onClick={() => { setActiveTab('return'); setError(''); }}
          className={`flex items-center space-x-2 py-3 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'return'
              ? 'border-[#670047] text-[#670047]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Return Book (Check-in)</span>
        </button>

        <button
          onClick={() => { setActiveTab('lookup'); setError(''); }}
          className={`flex items-center space-x-2 py-3 px-4 font-bold text-xs border-b-2 transition ${
            activeTab === 'lookup'
              ? 'border-[#670047] text-[#670047]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Barcode className="w-4 h-4" />
          <span>Barcode Status Lookup</span>
        </button>
      </div>

      {/* Alert Error Box */}
      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-rose-900">Transaction Failed</div>
            <div className="text-xs text-rose-700 mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* TAB 1: LEND / ISSUE BOOK */}
      {activeTab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input & Scanner Controls */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <span>Step 1 & 2: Scan Patron Card & Book</span>
            </h2>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              {/* Patron Input with Scanner button */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    1. Patron Registration / Staff ID
                  </label>
                  <button
                    type="button"
                    onClick={() => openScanner('patron', 'Scan Patron ID Card QR')}
                    className="flex items-center space-x-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Open Camera Scanner</span>
                  </button>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={patronReg}
                    onChange={(e) => setPatronReg(e.target.value)}
                    placeholder="Scan ID QR or type reg no (e.g. 2022/ICT/125)"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner('patron', 'Scan Patron ID Card QR')}
                    className="absolute right-2 top-2 p-1 text-slate-400 hover:text-emerald-600"
                    title="Scan ID QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
                {patronLookupLoading && (
                  <p className="text-[11px] text-slate-400 mt-1">Verifying patron status in university registry...</p>
                )}
                {patronLookupError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{patronLookupError}</p>
                )}
              </div>

              {/* Book Barcode Input with Scanner button */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    2. Book Accession Barcode Number
                  </label>
                  <button
                    type="button"
                    onClick={() => openScanner('issue_book', 'Scan Book Accession Barcode')}
                    className="flex items-center space-x-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Open Camera Scanner</span>
                  </button>
                </div>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={issueBarcode}
                    onChange={(e) => setIssueBarcode(e.target.value)}
                    placeholder="Scan barcode or type code (e.g. BC-MOS-001)"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner('issue_book', 'Scan Book Accession Barcode')}
                    className="absolute right-2 top-2 p-1 text-slate-400 hover:text-emerald-600"
                    title="Scan Book Barcode"
                  >
                    <Barcode className="w-4 h-4" />
                  </button>
                </div>
                {bookCopyData && (
                  <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{bookCopyData.book_title}</div>
                      <div className="text-slate-500 text-[11px]">ISBN: {bookCopyData.book_isbn}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      bookCopyData.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {bookCopyData.status_display}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Desk Notes (Optional)
                </label>
                <input
                  type="text"
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="e.g. Clean condition, CD included"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || (patronData && !patronData.can_borrow)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#670047] hover:bg-[#520038] text-white font-bold text-xs shadow transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4 text-[#ffcb00]" />
                <span>{loading ? 'Processing Checkout...' : 'Complete Lending (Issue Book)'}</span>
              </button>
            </form>
          </div>

          {/* Right: Real-time Patron Verification & Loan Summary */}
          <div className="lg:col-span-5 space-y-4">
            {patronData ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      patronData.user.role === 'LECTURER' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {patronData.user.role}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {patronData.user.full_name || patronData.user.username}
                    </h3>
                    <div className="font-mono text-xs text-slate-500 font-bold">
                      {patronData.user.reg_number}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {patronData.user.department_name || 'Faculty of Applied Science'}
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-xl flex items-center space-x-1 ${
                    patronData.can_borrow
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {patronData.can_borrow ? <CheckCircle className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    <span>{patronData.can_borrow ? 'Eligible' : 'Blocked'}</span>
                  </span>
                </div>

                {/* Block reasons if any */}
                {patronData.block_reasons && patronData.block_reasons.length > 0 && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                    <div className="text-[11px] font-bold text-rose-900">Borrowing Block Active:</div>
                    {patronData.block_reasons.map((r, i) => (
                      <div key={i} className="text-[11px] text-rose-700">• {r}</div>
                    ))}
                  </div>
                )}

                {/* Counters */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-500">Active Loans</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">
                      {patronData.active_loans_count} / {patronData.max_borrow_limit}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-500">Unpaid Fines</div>
                    <div className={`text-sm font-black mt-0.5 ${patronData.outstanding_fines > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      Rs. {patronData.outstanding_fines.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Currently borrowed list */}
                {patronData.current_loans && patronData.current_loans.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Currently Loaned Items ({patronData.current_loans.length})
                    </h4>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {patronData.current_loans.map(l => (
                        <div key={l.id} className="p-2 bg-slate-50 rounded-lg text-xs flex justify-between items-center border">
                          <div className="truncate mr-2">
                            <div className="font-semibold text-slate-800 truncate">{l.book_title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{l.accession_number}</div>
                          </div>
                          <span className={`text-[10px] font-bold whitespace-nowrap ${l.is_overdue ? 'text-rose-600' : 'text-slate-500'}`}>
                            Due {new Date(l.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs">
                <QrCode className="w-8 h-8 text-slate-300 mb-2" />
                <p>Scan patron ID card QR code to verify borrowing eligibility and active loans.</p>
              </div>
            )}

            {/* Issue Receipt Card */}
            {issueResult && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Checkout Complete!</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-1 text-slate-700">
                  <div><strong>Patron:</strong> {issueResult.patron_name} ({issueResult.patron_reg_number})</div>
                  <div><strong>Book:</strong> {issueResult.book_title}</div>
                  <div><strong>Barcode:</strong> <span className="font-mono font-bold text-emerald-700">{issueResult.accession_number}</span></div>
                  <div className="pt-1.5 border-t border-slate-100 text-rose-700 font-bold">
                    Return Deadline: {new Date(issueResult.due_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RETURN BOOK */}
      {activeTab === 'return' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                <span>Scan Book to Process Return</span>
              </h2>
              <button
                type="button"
                onClick={() => openScanner('return_book', 'Scan Book Accession Barcode to Check In')}
                className="flex items-center space-x-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Open Camera Scanner</span>
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1 uppercase">
                  Book Accession Barcode Number
                </label>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={returnBarcode}
                    onChange={(e) => setReturnBarcode(e.target.value)}
                    placeholder="Scan barcode or type (e.g. BC-MOS-001)"
                    className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => openScanner('return_book', 'Scan Book Barcode for Check-in')}
                    className="absolute right-2 top-2 p-1 text-slate-400 hover:text-emerald-600"
                  >
                    <Barcode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Condition on Return</label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="GOOD">Good / Normal</option>
                    <option value="NEW">Like New</option>
                    <option value="FAIR">Fair</option>
                    <option value="DAMAGED">Damaged</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Return Notes</label>
                  <input
                    type="text"
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="Optional notes"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#670047] hover:bg-[#520038] text-white font-bold rounded-xl shadow transition"
              >
                {loading ? 'Processing Check-in...' : 'Check-In Returned Book'}
              </button>
            </form>
          </div>

          {returnResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>{returnResult.message}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-100 space-y-1 text-slate-700">
                <div><strong>Book:</strong> {returnResult.record?.book_title}</div>
                <div><strong>Patron:</strong> {returnResult.record?.patron_name} ({returnResult.record?.patron_reg_number})</div>
                <div><strong>Barcode:</strong> {returnResult.record?.accession_number}</div>
                {returnResult.fine_imposed > 0 ? (
                  <div className="mt-2 p-2 bg-rose-50 text-rose-800 font-bold rounded-lg border border-rose-200">
                    Overdue Penalty Imposed: Rs. {returnResult.fine_imposed.toFixed(2)}
                  </div>
                ) : (
                  <div className="text-emerald-700 font-semibold mt-1">Returned on time (Rs. 0.00 fine).</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BARCODE LOOKUP */}
      {activeTab === 'lookup' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">Check Holding Status</h2>
            <button
              onClick={() => openScanner('lookup_book', 'Scan Barcode to Lookup')}
              className="flex items-center space-x-1 text-xs text-emerald-600 font-bold"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Scan</span>
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={lookupBarcode}
              onChange={(e) => setLookupBarcode(e.target.value)}
              placeholder="Enter or scan accession barcode (e.g. BC-MOS-001)"
              className="flex-1 px-3 py-2 text-xs border rounded-lg font-mono"
            />
            <button
              onClick={() => lookupCopy(lookupBarcode.trim())}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
            >
              Lookup
            </button>
          </div>

          {lookupResult && (
            <div className="p-4 bg-slate-50 border rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">{lookupResult.book_title}</div>
              <div className="text-slate-500">ISBN: {lookupResult.book_isbn}</div>
              <div>Barcode: <span className="font-mono font-bold text-emerald-700">{lookupResult.accession_number}</span></div>
              <div>Status: <span className="font-bold text-slate-800">{lookupResult.status_display}</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
