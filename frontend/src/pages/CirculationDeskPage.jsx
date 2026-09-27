import React, { useState } from 'react';
import api from '../services/api';
import { 
  Barcode, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User, 
  Book 
} from 'lucide-react';

export default function CirculationDeskPage() {
  const [activeTab, setActiveTab] = useState('issue'); // 'issue', 'return', 'lookup'

  // Issue Form State
  const [patronReg, setPatronReg] = useState('');
  const [issueBarcode, setIssueBarcode] = useState('');
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

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.[0] || 'Failed to issue book.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
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

  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    setLookupResult(null);
    setLoading(true);

    try {
      const res = await api.get(`/catalog/copies/lookup/?barcode=${encodeURIComponent(lookupBarcode.trim())}`);
      setLookupResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Book copy not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Circulation Desk</h1>
        <p className="text-slate-500 text-sm">Issue and check-in physical library books, scan barcodes, and calculate overdue penalties.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => { setActiveTab('issue'); setError(''); }}
          className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 transition ${
            activeTab === 'issue'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Issue Book (Checkout)</span>
        </button>

        <button
          onClick={() => { setActiveTab('return'); setError(''); }}
          className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 transition ${
            activeTab === 'return'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Return Book (Check-in)</span>
        </button>

        <button
          onClick={() => { setActiveTab('lookup'); setError(''); }}
          className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 transition ${
            activeTab === 'lookup'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Barcode className="w-4 h-4" />
          <span>Barcode Lookup</span>
        </button>
      </div>

      {/* Alert Error Box */}
      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-rose-900">Transaction Failed</div>
            <div className="text-xs text-rose-700 mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* TAB 1: ISSUE BOOK */}
      {activeTab === 'issue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              <span>Checkout Item</span>
            </h2>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Patron Registration No (or Staff ID)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={patronReg}
                    onChange={(e) => setPatronReg(e.target.value)}
                    placeholder="e.g. 2022/ICT/125"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Book Accession Barcode Number
                </label>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={issueBarcode}
                    onChange={(e) => setIssueBarcode(e.target.value)}
                    placeholder="e.g. BC-MOS-001"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Circulation Desk Notes (Optional)
                </label>
                <input
                  type="text"
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="e.g. Minor pencil marks noted on page 20"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition disabled:opacity-50"
              >
                {loading ? 'Processing Checkout...' : 'Issue Book to Patron'}
              </button>
            </form>
          </div>

          {/* Issue Result Receipt */}
          <div>
            {issueResult ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Checkout Complete!</span>
                </div>

                <div className="space-y-2 text-xs text-slate-700 bg-white p-4 rounded-xl border border-emerald-100">
                  <div><strong>Patron:</strong> {issueResult.patron_name} ({issueResult.patron_reg_number})</div>
                  <div><strong>Title:</strong> {issueResult.book_title}</div>
                  <div><strong>Barcode:</strong> <span className="font-mono font-bold text-emerald-700">{issueResult.accession_number}</span></div>
                  <div><strong>Issued:</strong> {new Date(issueResult.issue_date).toLocaleDateString()}</div>
                  <div className="text-rose-700 font-bold text-sm pt-2 border-t border-slate-100">
                    Due Date: {new Date(issueResult.due_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-8 text-center text-slate-400 text-xs">
                Scan or enter patron ID and book barcode to print issue receipt.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RETURN BOOK */}
      {activeTab === 'return' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
              <span>Check-in Returned Book</span>
            </h2>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Book Accession Barcode Number
                </label>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={returnBarcode}
                    onChange={(e) => setReturnBarcode(e.target.value)}
                    placeholder="Scan barcode, e.g. BC-MOS-001"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Book Condition Upon Return
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="GOOD">Good / Normal Wear</option>
                  <option value="NEW">Like New</option>
                  <option value="FAIR">Fair</option>
                  <option value="DAMAGED">Damaged (Assessment Required)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Return Notes
                </label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Optional check-in comments"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow transition disabled:opacity-50"
              >
                {loading ? 'Processing Return...' : 'Complete Book Return'}
              </button>
            </form>
          </div>

          {/* Return Result */}
          <div>
            {returnResult ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>{returnResult.message}</span>
                </div>

                <div className="space-y-2 text-xs text-slate-700 bg-white p-4 rounded-xl border border-emerald-100">
                  <div><strong>Title:</strong> {returnResult.record?.book_title}</div>
                  <div><strong>Patron:</strong> {returnResult.record?.patron_name}</div>
                  <div><strong>Barcode:</strong> {returnResult.record?.accession_number}</div>
                  
                  {returnResult.fine_imposed > 0 ? (
                    <div className="p-3 bg-rose-50 text-rose-800 rounded-lg font-bold border border-rose-200 text-xs">
                      Overdue Fine Imposed: Rs. {returnResult.fine_imposed.toFixed(2)}
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg font-medium text-xs">
                      No overdue fines incurred.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-8 text-center text-slate-400 text-xs">
                Scan barcode of incoming book to complete check-in and verify overdue status.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BARCODE LOOKUP */}
      {activeTab === 'lookup' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleLookup} className="flex gap-2 mb-6">
            <input
              type="text"
              required
              value={lookupBarcode}
              onChange={(e) => setLookupBarcode(e.target.value)}
              placeholder="Enter accession number, e.g. BC-MOS-001"
              className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold flex items-center space-x-1"
            >
              <Search className="w-4 h-4" />
              <span>Lookup</span>
            </button>
          </form>

          {lookupResult && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 text-xs">
              <div className="text-sm font-bold text-slate-900">{lookupResult.book_title}</div>
              <div className="text-slate-600">ISBN: {lookupResult.book_isbn}</div>
              <div>Barcode: <strong className="font-mono text-emerald-700">{lookupResult.accession_number}</strong></div>
              <div>Condition: {lookupResult.condition_display}</div>
              <div>
                Status: <span className="font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">{lookupResult.status_display}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
