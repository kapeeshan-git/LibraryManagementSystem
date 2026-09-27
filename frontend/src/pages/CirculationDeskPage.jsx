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
  Sparkles,
  RefreshCw,
  Bookmark,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  AlertTriangle,
  Sliders,
  Plus,
  X,
  ChevronRight,
  CheckCircle2,
  Library
} from 'lucide-react';

export default function CirculationDeskPage() {
  const [activeTab, setActiveTab] = useState('issue'); // 'issue', 'return', 'holds_shelf', 'overdues', 'rules', 'lookup'

  // Scanner Modal State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState(null); // 'patron', 'issue_book', 'return_book', 'lookup_book'
  const [scannerTitle, setScannerTitle] = useState('');

  // Tab 1: Check Out (Issue) State
  const [patronReg, setPatronReg] = useState('');
  const [patronData, setPatronData] = useState(null);
  const [patronLookupLoading, setPatronLookupLoading] = useState(false);
  const [patronLookupError, setPatronLookupError] = useState('');

  const [issueBarcode, setIssueBarcode] = useState('');
  const [bookCopyData, setBookCopyData] = useState(null);
  const [copyLookupLoading, setCopyLookupLoading] = useState(false);
  const [issueNotes, setIssueNotes] = useState('');
  const [issueResult, setIssueResult] = useState(null);
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueError, setIssueError] = useState('');

  // Tab 2: Check In (Return) State
  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnResult, setReturnResult] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState('');
  const [sessionReturns, setSessionReturns] = useState([]);

  // Koha Hold Alert Modal (Triggered on Check-In when book has waiting hold)
  const [kohaHoldAlert, setKohaHoldAlert] = useState(null);

  // Tab 3: Holds Waiting Shelf State
  const [holdsShelf, setHoldsShelf] = useState([]);
  const [holdsShelfLoading, setHoldsShelfLoading] = useState(false);

  // Tab 4: Overdue Loans State
  const [overdues, setOverdues] = useState([]);
  const [overduesLoading, setOverduesLoading] = useState(false);
  const [overdueSearch, setOverdueSearch] = useState('');

  // Tab 5: Koha Circulation Rules Matrix State
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [ruleFormData, setRuleFormData] = useState({
    id: null,
    patron_category: 'STUDENT',
    item_type: 'STANDARD',
    max_checkouts: 2,
    loan_period_days: 14,
    fine_per_day_rs: 10.00,
    grace_period_days: 1,
    max_renewals: 1,
    holds_allowed: true,
    description: ''
  });
  const [ruleSaving, setRuleSaving] = useState(false);
  const [ruleError, setRuleError] = useState('');

  // Tab 6: Lookup State
  const [lookupBarcode, setLookupBarcode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // In-line action messages
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

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

  // Fetch tab-specific data when activeTab changes
  useEffect(() => {
    if (activeTab === 'holds_shelf') fetchHoldsShelf();
    if (activeTab === 'overdues') fetchOverdues();
    if (activeTab === 'rules') fetchRules();
  }, [activeTab]);

  const lookupPatron = async (regNo) => {
    setPatronLookupLoading(true);
    setPatronLookupError('');
    try {
      const res = await api.get(`/auth/users/lookup/?reg_number=${encodeURIComponent(regNo)}`);
      setPatronData(res.data);
    } catch (err) {
      setPatronData(null);
      setPatronLookupError(err.response?.data?.error || 'Patron ID not found in library registry.');
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

  const fetchHoldsShelf = async () => {
    setHoldsShelfLoading(true);
    try {
      const res = await api.get('/reservations/queue/?status=READY_FOR_PICKUP');
      setHoldsShelf(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHoldsShelfLoading(false);
    }
  };

  const fetchOverdues = async () => {
    setOverduesLoading(true);
    try {
      const res = await api.get('/circulation/overdues/');
      setOverdues(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setOverduesLoading(false);
    }
  };

  const fetchRules = async () => {
    setRulesLoading(true);
    try {
      const res = await api.get('/circulation/rules/');
      setRules(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRulesLoading(false);
    }
  };

  // Open Scanner Modal
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
      // Auto-trigger check-in if valid
      processReturn(cleanText);
    } else if (scannerTarget === 'lookup_book') {
      setLookupBarcode(cleanText);
      processBarcodeLookup(cleanText);
    }
  };

  // Issue Book Submit
  const handleIssueSubmit = async (e) => {
    e?.preventDefault();
    setIssueError('');
    setIssueResult(null);
    setIssueLoading(true);

    try {
      const res = await api.post('/circulation/issue/', {
        patron_reg_number: patronReg.trim(),
        accession_number: issueBarcode.trim(),
        notes: issueNotes
      });
      setIssueResult(res.data);
      setIssueBarcode('');
      setBookCopyData(null);
      setIssueNotes('');
      showToast('success', `Book '${res.data.book_title}' issued successfully!`);
      // Refresh patron loan list
      lookupPatron(patronReg.trim());
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.[0] || err.response?.data?.error || 'Failed to issue book.';
      setIssueError(msg);
      showToast('error', msg);
    } finally {
      setIssueLoading(false);
    }
  };

  // Process Return
  const processReturn = async (barcode) => {
    const bCode = (barcode || returnBarcode).trim();
    if (!bCode) return;
    setReturnError('');
    setReturnResult(null);
    setReturnLoading(true);

    try {
      const res = await api.post('/circulation/return/', {
        accession_number: bCode,
        condition: returnCondition,
        notes: returnNotes
      });

      setReturnResult(res.data);
      setReturnBarcode('');
      setReturnNotes('');

      // Add to session returns history
      setSessionReturns(prev => [res.data, ...prev]);

      // Koha Hold Alert Check: If hold was found, trigger prominent alert modal!
      if (res.data.hold_found && res.data.hold_details) {
        setKohaHoldAlert(res.data.hold_details);
      } else {
        showToast('success', `Book checked in successfully! (${res.data.record?.book_title})`);
      }

      // If on patron tab, refresh patron if matches
      if (patronReg && patronData) {
        lookupPatron(patronReg);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.[0] || err.response?.data?.error || 'Failed to check in book.';
      setReturnError(msg);
      showToast('error', msg);
    } finally {
      setReturnLoading(false);
    }
  };

  const handleReturnSubmit = (e) => {
    e?.preventDefault();
    processReturn();
  };

  // Renew loan directly from patron's checkouts table (Koha style)
  const handleRenewRecord = async (recordId, bookTitle) => {
    try {
      const res = await api.post('/circulation/renew/', { borrow_record_id: recordId });
      showToast('success', `Loan renewed for '${bookTitle}'. New due date: ${new Date(res.data.new_due_date).toLocaleDateString()}`);
      if (patronReg) lookupPatron(patronReg);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.[0] || 'Unable to renew loan.';
      showToast('error', msg);
    }
  };

  // Check in book directly from patron's checkouts table
  const handleCheckinDirect = async (accessionNumber) => {
    await processReturn(accessionNumber);
    if (patronReg) lookupPatron(patronReg);
  };

  // Quick Issue Held Item
  const handleQuickIssueHeld = (heldItem) => {
    if (!heldItem.accession_number) return;
    setIssueBarcode(heldItem.accession_number);
    lookupCopy(heldItem.accession_number);
  };

  // Barcode Lookup
  const processBarcodeLookup = async (barcode) => {
    const code = (barcode || lookupBarcode).trim();
    if (!code) return;
    setLookupLoading(true);
    try {
      const res = await api.get(`/catalog/copies/lookup/?barcode=${encodeURIComponent(code)}`);
      setLookupResult(res.data);
    } catch (err) {
      setLookupResult(null);
      showToast('error', `No copy found for barcode '${code}'.`);
    } finally {
      setLookupLoading(false);
    }
  };

  // Koha Circulation Rules Management
  const openEditRule = (rule) => {
    setRuleFormData({
      id: rule.id,
      patron_category: rule.patron_category,
      item_type: rule.item_type,
      max_checkouts: rule.max_checkouts,
      loan_period_days: rule.loan_period_days,
      fine_per_day_rs: rule.fine_per_day_rs,
      grace_period_days: rule.grace_period_days,
      max_renewals: rule.max_renewals,
      holds_allowed: rule.holds_allowed,
      description: rule.description || ''
    });
    setRuleError('');
    setRuleModalOpen(true);
  };

  const openAddRule = () => {
    setRuleFormData({
      id: null,
      patron_category: 'STUDENT',
      item_type: 'STANDARD',
      max_checkouts: 2,
      loan_period_days: 14,
      fine_per_day_rs: 10.00,
      grace_period_days: 1,
      max_renewals: 1,
      holds_allowed: true,
      description: ''
    });
    setRuleError('');
    setRuleModalOpen(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    setRuleSaving(true);
    setRuleError('');
    try {
      if (ruleFormData.id) {
        await api.put(`/circulation/rules/${ruleFormData.id}/`, ruleFormData);
        showToast('success', 'Circulation rule updated successfully.');
      } else {
        await api.post('/circulation/rules/', ruleFormData);
        showToast('success', 'New Koha circulation rule added.');
      }
      setRuleModalOpen(false);
      fetchRules();
    } catch (err) {
      setRuleError(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to save rule.');
    } finally {
      setRuleSaving(false);
    }
  };

  const filteredOverdues = overdues.filter(o => 
    !overdueSearch ||
    o.patron_name?.toLowerCase().includes(overdueSearch.toLowerCase()) ||
    o.patron_reg_number?.toLowerCase().includes(overdueSearch.toLowerCase()) ||
    o.book_title?.toLowerCase().includes(overdueSearch.toLowerCase()) ||
    o.accession_number?.toLowerCase().includes(overdueSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-bold transition-all border ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-900 text-emerald-100 border-emerald-500' 
            : 'bg-rose-900 text-rose-100 border-rose-500'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <AlertCircle className="w-4 h-4 text-rose-300" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Global Camera Scanner Modal */}
      {scannerOpen && (
        <QrBarcodeScanner
          title={scannerTitle}
          onScan={handleScanSuccess}
          onClose={() => setScannerOpen(false)}
        />
      )}

      {/* KOHA HOLD FOUND MODAL */}
      {kohaHoldAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-[#ffcb00] shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setKohaHoldAlert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffcb00]/20 border border-[#ffcb00] flex items-center justify-center flex-shrink-0">
                <Bookmark className="w-7 h-7 text-[#670047]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#ffcb00] text-slate-950 px-2.5 py-0.5 rounded-full">
                  Koha Circulation Hold Trigger
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">HOLD FOUND FOR PATRON!</h2>
              </div>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 text-xs space-y-2 mb-4 text-slate-800">
              <p className="font-semibold text-amber-900">
                This item has been requested by another patron and is now assigned to fulfill their queue hold.
              </p>
              <div className="pt-2 border-t border-amber-200/60 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Book Title</span>
                  <div className="font-bold text-slate-900 truncate">{kohaHoldAlert.book_title}</div>
                  <div className="font-mono text-[10px] text-slate-500">{kohaHoldAlert.accession_number}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Waiting Patron</span>
                  <div className="font-bold text-slate-900">{kohaHoldAlert.patron_name}</div>
                  <div className="font-mono text-[10px] text-[#670047] font-black">{kohaHoldAlert.patron_reg_number}</div>
                </div>
              </div>

              {(kohaHoldAlert.patron_phone || kohaHoldAlert.patron_email) && (
                <div className="pt-2 border-t border-amber-200/60 flex items-center gap-4 text-[11px] text-slate-600">
                  {kohaHoldAlert.patron_phone && (
                    <span className="flex items-center gap-1 font-semibold">
                      <Phone className="w-3.5 h-3.5 text-[#670047]" /> {kohaHoldAlert.patron_phone}
                    </span>
                  )}
                  {kohaHoldAlert.patron_email && (
                    <span className="flex items-center gap-1 font-semibold">
                      <Mail className="w-3.5 h-3.5 text-[#670047]" /> {kohaHoldAlert.patron_email}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 bg-[#670047]/5 border border-[#670047]/20 rounded-xl mb-5 text-[11px] text-[#670047] font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                Desk hold shelf pickup window expires on <strong>{kohaHoldAlert.hold_expires_at ? new Date(kohaHoldAlert.hold_expires_at).toLocaleString() : 'in 48 hours'}</strong>.
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setKohaHoldAlert(null)}
                className="flex-1 py-3 px-4 bg-[#670047] hover:bg-[#520038] text-white font-bold rounded-xl text-xs shadow-lg transition"
              >
                Confirm & Place on Hold Shelf
              </button>
              <button
                onClick={() => {
                  setKohaHoldAlert(null);
                  setActiveTab('holds_shelf');
                }}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
              >
                View Hold Shelf
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Circulation Rule Edit/Add Modal */}
      {ruleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setRuleModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-900 mb-1 flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-[#670047]" />
              <span>{ruleFormData.id ? 'Edit Koha Circulation Rule' : 'Add New Koha Circulation Rule'}</span>
            </h2>
            <p className="text-slate-500 text-xs mb-4">
              Configure checkout limits, loan period, fine rates, and grace periods (Koha smart-rules.pl).
            </p>

            {ruleError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {ruleError}
              </div>
            )}

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patron Category</label>
                  <select
                    value={ruleFormData.patron_category}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, patron_category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-semibold bg-white"
                  >
                    <option value="*">All Categories (*)</option>
                    <option value="STUDENT">Student</option>
                    <option value="LECTURER">Lecturer / Academic Staff</option>
                    <option value="LIBRARIAN">Librarian</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Item Type / Collection</label>
                  <select
                    value={ruleFormData.item_type}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, item_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-semibold bg-white"
                  >
                    <option value="*">All Item Types (*)</option>
                    <option value="STANDARD">Standard Lending Book</option>
                    <option value="REFERENCE">Reference (Non-circulating)</option>
                    <option value="RESERVE">Course Reserve (Short Loan)</option>
                    <option value="PERIODICAL">Periodical / Journal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Books</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={ruleFormData.max_checkouts}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, max_checkouts: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Loan Days</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={ruleFormData.loan_period_days}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, loan_period_days: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fine / Day (Rs.)</label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    required
                    value={ruleFormData.fine_per_day_rs}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, fine_per_day_rs: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grace Days</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={ruleFormData.grace_period_days}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, grace_period_days: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Renewals Allowed</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={ruleFormData.max_renewals}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, max_renewals: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={ruleFormData.holds_allowed}
                      onChange={(e) => setRuleFormData({ ...ruleFormData, holds_allowed: e.target.checked })}
                      className="rounded text-[#670047] focus:ring-[#670047] w-4 h-4"
                    />
                    <span>Holds Allowed</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rule Description</label>
                <input
                  type="text"
                  value={ruleFormData.description}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                  placeholder="e.g. Standard Undergraduate lending rules"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRuleModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ruleSaving}
                  className="px-5 py-2 bg-[#670047] hover:bg-[#520038] text-white font-bold rounded-xl shadow transition"
                >
                  {ruleSaving ? 'Saving Rule...' : 'Save Circulation Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#670047] flex items-center justify-center text-[#ffcb00]">
              <Library className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Circulation & Staff Desk
            </h1>
            <span className="text-[10px] bg-[#670047]/10 text-[#670047] font-black px-2.5 py-0.5 rounded-full border border-[#670047]/20 uppercase">
              Koha Core Matched
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            University of Vavuniya integrated check-out, fast barcode return, hold shelf queue, and overdue fine management.
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openScanner('patron', 'Scan Patron Library ID Card QR')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#670047] hover:bg-[#520038] text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <QrCode className="w-4 h-4 text-[#ffcb00]" />
            <span>Scan Patron ID</span>
          </button>
          <button
            onClick={() => openScanner(activeTab === 'return' ? 'return_book' : 'issue_book', 'Scan Book Accession Barcode')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Barcode className="w-4 h-4 text-[#ffcb00]" />
            <span>Scan Book Barcode</span>
          </button>
        </div>
      </div>

      {/* Koha Navigation Tabs */}
      <div className="flex overflow-x-auto space-x-1 border-b border-slate-200 mb-6 text-xs font-bold">
        <button
          onClick={() => { setActiveTab('issue'); setIssueError(''); }}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'issue'
              ? 'border-[#670047] text-[#670047] bg-[#670047]/5 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Check Out (Lend)</span>
        </button>

        <button
          onClick={() => { setActiveTab('return'); setReturnError(''); }}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'return'
              ? 'border-[#670047] text-[#670047] bg-[#670047]/5 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Check In (Return)</span>
        </button>

        <button
          onClick={() => { setActiveTab('holds_shelf'); }}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'holds_shelf'
              ? 'border-[#670047] text-[#670047] bg-[#670047]/5 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Holds Waiting Shelf</span>
          {holdsShelf.length > 0 && (
            <span className="bg-[#ffcb00] text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
              {holdsShelf.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('overdues'); }}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'overdues'
              ? 'border-[#670047] text-[#670047] bg-[#670047]/5 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Overdue Loans</span>
          {overdues.length > 0 && (
            <span className="bg-rose-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
              {overdues.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('rules'); }}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'rules'
              ? 'border-[#670047] text-[#670047] bg-[#670047]/5 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Circulation & Fine Rules</span>
        </button>

        <button
          onClick={() => { setActiveTab('lookup'); }}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'lookup'
              ? 'border-[#670047] text-[#670047] bg-[#670047]/5 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Barcode className="w-4 h-4" />
          <span>Item Lookup</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: KOHA CHECK OUT (circulation.pl)                         */}
      {/* ============================================================== */}
      {activeTab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Patron ID & Book Scan Forms */}
          <div className="lg:col-span-6 space-y-6">
            {/* Step 1: Scan Patron */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <User className="w-4 h-4 text-[#670047]" />
                  <span>1. Enter / Scan Patron ID Card QR</span>
                </h2>
                <button
                  type="button"
                  onClick={() => openScanner('patron', 'Scan Patron Library ID Card QR')}
                  className="flex items-center space-x-1 text-xs text-[#670047] hover:text-[#520038] font-bold"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera Scanner</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={patronReg}
                  onChange={(e) => setPatronReg(e.target.value)}
                  placeholder="Scan physical ID card QR or type reg number (e.g. 2022/ICT/125)"
                  className="w-full pl-3 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-[#670047] focus:outline-hidden"
                />
                {patronLookupLoading && (
                  <div className="absolute right-3 top-3">
                    <div className="w-4 h-4 border-2 border-[#670047] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {patronLookupError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{patronLookupError}</span>
                </div>
              )}
            </div>

            {/* Step 2: Scan Book Accession Barcode */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                  <Barcode className="w-4 h-4 text-[#670047]" />
                  <span>2. Scan Book Accession Barcode</span>
                </h2>
                <button
                  type="button"
                  onClick={() => openScanner('issue_book', 'Scan Book Accession Barcode to Issue')}
                  className="flex items-center space-x-1 text-xs text-[#670047] hover:text-[#520038] font-bold"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera Scanner</span>
                </button>
              </div>

              <form onSubmit={handleIssueSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={issueBarcode}
                    onChange={(e) => setIssueBarcode(e.target.value)}
                    placeholder="Scan accession barcode (e.g. BC-MOS-001)"
                    className="w-full pl-3 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-[#670047] focus:outline-hidden"
                  />
                  {copyLookupLoading && (
                    <div className="absolute right-3 top-3">
                      <div className="w-4 h-4 border-2 border-[#670047] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {bookCopyData && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">{bookCopyData.book_title}</div>
                      <div className="text-slate-500 text-[11px] font-mono">ISBN: {bookCopyData.book_isbn}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Type: <strong>{bookCopyData.item_type_display || bookCopyData.item_type}</strong>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      bookCopyData.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {bookCopyData.status_display}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Desk Notes (Optional)</label>
                  <input
                    type="text"
                    value={issueNotes}
                    onChange={(e) => setIssueNotes(e.target.value)}
                    placeholder="Optional notes (e.g. Accompanying DVD included)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>

                {issueError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{issueError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={issueLoading || !patronData || !patronData.can_borrow}
                  className="w-full py-3 px-4 rounded-xl bg-[#670047] hover:bg-[#520038] text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-[#ffcb00]" />
                  <span>{issueLoading ? 'Processing Checkout...' : 'Complete Lending (Issue Book)'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Koha Patron Summary & Active Loans Table */}
          <div className="lg:col-span-6 space-y-5">
            {patronData ? (
              <div className="space-y-4">
                {/* Koha Patron Profile Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        patronData.user.role === 'LECTURER' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-[#670047]/10 text-[#670047] border border-[#670047]/20'
                      }`}>
                        {patronData.user.role}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {patronData.user.full_name || patronData.user.username}
                      </h3>
                      <div className="font-mono text-xs text-[#670047] font-bold">
                        {patronData.user.reg_number}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {patronData.user.department_name || 'University of Vavuniya'}
                      </div>
                    </div>

                    <div className="text-right">
                      {patronData.can_borrow ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Eligible to Borrow</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-[11px] font-bold">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span>Checkouts Blocked</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badges Matrix */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Checkouts</div>
                      <div className="font-black text-slate-900 mt-0.5">
                        {patronData.active_loans_count} / {patronData.max_borrow_limit}
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-xl border ${patronData.has_overdue ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="text-[10px] font-bold uppercase">Overdue</div>
                      <div className="font-black mt-0.5">
                        {patronData.has_overdue ? 'YES' : 'NONE'}
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-xl border ${patronData.outstanding_fines > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="text-[10px] font-bold uppercase">Fines</div>
                      <div className="font-black mt-0.5">
                        Rs. {patronData.outstanding_fines.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Restriction block reasons if any */}
                  {patronData.block_reasons?.length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-800 font-semibold">
                      <div className="font-bold flex items-center gap-1 text-rose-900">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Koha Circulation Restriction:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        {patronData.block_reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Koha Waiting Holds banner */}
                  {patronData.waiting_holds?.length > 0 && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Bookmark className="w-4 h-4 text-emerald-600" />
                        <span>Item Ready on Desk Hold Shelf ({patronData.waiting_holds.length}):</span>
                      </div>
                      {patronData.waiting_holds.map(h => (
                        <div key={h.id} className="bg-white p-2.5 rounded-lg border border-emerald-100 flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-800">{h.book_title}</div>
                            <div className="font-mono text-[10px] text-slate-500 font-bold">{h.accession_number}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleQuickIssueHeld(h)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition"
                          >
                            Check Out This Held Book
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Koha Current Checked-Out Items Table (issues-table) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Current Checkouts ({patronData.current_loans?.length || 0})
                    </h4>
                    <span className="text-[11px] text-slate-400">Standard Loan: {patronData.loan_period_days} Days</span>
                  </div>

                  {patronData.current_loans?.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No active loans currently checked out to this patron.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs">
                      {patronData.current_loans.map(loan => (
                        <div key={loan.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 truncate">{loan.book_title}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded font-bold">
                                {loan.accession_number}
                              </span>
                              {loan.call_number && <span>Call: {loan.call_number}</span>}
                              <span className={loan.is_overdue ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                                Due: {new Date(loan.due_date).toLocaleDateString()} {loan.is_overdue && `(${loan.overdue_days}d overdue)`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleRenewRecord(loan.id, loan.book_title)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                              title="Extend Loan"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Renew ({loan.renewal_count || 0})</span>
                            </button>
                            <button
                              onClick={() => handleCheckinDirect(loan.accession_number)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold transition"
                            >
                              Check In
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-72 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs">
                <QrCode className="w-10 h-10 text-slate-300 mb-3" />
                <p className="font-semibold text-slate-600">Scan Patron ID Card QR Code</p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Once scanned, patron category, borrowing quota, hold status, and current checkouts will appear automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: KOHA CHECK IN (returns.pl)                              */}
      {/* ============================================================== */}
      {activeTab === 'return' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                <ArrowDownLeft className="w-4 h-4 text-[#670047]" />
                <span>Fast Book Check-In (Returns Desk)</span>
              </h2>
              <button
                type="button"
                onClick={() => openScanner('return_book', 'Scan Book Accession Barcode to Check In')}
                className="flex items-center space-x-1 text-xs text-[#670047] hover:text-[#520038] font-bold"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Camera Scanner</span>
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={returnBarcode}
                  onChange={(e) => setReturnBarcode(e.target.value)}
                  placeholder="Scan physical book barcode (e.g. BC-MOS-001) to return immediately"
                  className="w-full pl-3 pr-10 py-3 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#670047] focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={returnLoading}
                  className="absolute right-2 top-2 px-4 py-1.5 bg-[#670047] hover:bg-[#520038] text-white font-bold rounded-lg transition"
                >
                  {returnLoading ? 'Returning...' : 'Check In'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Book Physical Condition</label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="GOOD">Good / Normal</option>
                    <option value="NEW">Brand New</option>
                    <option value="FAIR">Fair / Worn</option>
                    <option value="DAMAGED">Damaged (Requires Repair)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Check-in Notes</label>
                  <input
                    type="text"
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="Optional check-in notes"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {returnError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{returnError}</span>
                </div>
              )}
            </form>
          </div>

          {/* Session Returns History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Check-In History (Current Desk Session: {sessionReturns.length})
            </h3>

            {sessionReturns.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No items checked in yet during this session.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase border-b">
                    <tr>
                      <th className="py-2.5 px-3">Title & Barcode</th>
                      <th className="py-2.5 px-3">Patron</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3">Fine Imposed</th>
                      <th className="py-2.5 px-3">Hold Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessionReturns.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{item.record?.book_title}</div>
                          <div className="font-mono text-[10px] text-slate-500">{item.record?.accession_number}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{item.record?.patron_name}</div>
                          <div className="font-mono text-[10px] text-[#670047] font-bold">{item.record?.patron_reg_number}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {new Date(item.record?.due_date).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3">
                          {item.fine_imposed > 0 ? (
                            <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              Rs. {item.fine_imposed.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold text-[11px]">Rs. 0.00 (On Time)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {item.hold_found ? (
                            <span className="font-black text-amber-900 bg-[#ffcb00] px-2 py-0.5 rounded-full text-[10px]">
                              Hold Found
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Available Stack</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: HOLDS WAITING PICKUP SHELF (waitingreserves.pl)         */}
      {/* ============================================================== */}
      {activeTab === 'holds_shelf' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-[#670047]" />
                <span>Holds Waiting Pickup Shelf</span>
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Physical books currently reserved on the circulation desk hold shelf awaiting patron collection.
              </p>
            </div>
            <button
              onClick={fetchHoldsShelf}
              className="flex items-center space-x-1 text-xs font-bold text-[#670047] hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Shelf</span>
            </button>
          </div>

          {holdsShelfLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading hold shelf queue...</div>
          ) : holdsShelf.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
              <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-600">Hold shelf is currently empty.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">When returned items match patron reservations, they will appear here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase border-b">
                  <tr>
                    <th className="py-2.5 px-3">Title & Barcode</th>
                    <th className="py-2.5 px-3">Waiting Patron</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Hold Expiration Deadline</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {holdsShelf.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{h.book_title}</div>
                        <div className="font-mono text-[10px] text-slate-500">
                          Barcode: <strong className="text-[#670047]">{h.allocated_copy_barcode}</strong>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{h.patron_name}</div>
                        <div className="font-mono text-[10px] text-[#670047] font-bold">{h.patron_reg_number}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        <div>{h.patron_phone || 'No phone'}</div>
                        <div className="text-[10px] text-slate-400">{h.patron_email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className={`font-semibold ${h.is_expired ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {h.hold_expires_at ? new Date(h.hold_expires_at).toLocaleString() : 'Open window'}
                        </div>
                        {h.is_expired && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">
                            EXPIRED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setPatronReg(h.patron_reg_number);
                            setIssueBarcode(h.allocated_copy_barcode);
                            setActiveTab('issue');
                          }}
                          className="px-3 py-1.5 bg-[#670047] hover:bg-[#520038] text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          Check Out to Patron
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: KOHA OVERDUE LOANS (overdue.pl)                         */}
      {/* ============================================================== */}
      {activeTab === 'overdues' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>Overdue Loans Monitoring ({filteredOverdues.length})</span>
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Active loans that have passed their due date and are accruing penalties under Koha circulation rules.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={overdueSearch}
                onChange={(e) => setOverdueSearch(e.target.value)}
                placeholder="Search overdues by patron, reg no, or book..."
                className="px-3 py-1.5 text-xs border rounded-xl"
              />
              <button
                onClick={fetchOverdues}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {overduesLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading overdue records...</div>
          ) : filteredOverdues.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No overdue loans found!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">All active library borrowings are currently within their lending period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase border-b">
                  <tr>
                    <th className="py-2.5 px-3">Patron Details</th>
                    <th className="py-2.5 px-3">Book Title & Barcode</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Days Late</th>
                    <th className="py-2.5 px-3">Estimated Fine</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOverdues.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{o.patron_name}</div>
                        <div className="font-mono text-[10px] text-[#670047] font-bold">{o.patron_reg_number}</div>
                        <div className="text-[10px] text-slate-400">{o.patron_role} • {o.patron_email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{o.book_title}</div>
                        <div className="font-mono text-[10px] text-slate-500 font-bold">{o.accession_number}</div>
                      </td>
                      <td className="py-3 px-3 text-rose-700 font-semibold">
                        {new Date(o.due_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-black text-[10px]">
                          {o.overdue_days} days overdue
                        </span>
                      </td>
                      <td className="py-3 px-3 font-black text-rose-600">
                        Rs. {o.estimated_fine.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setReturnBarcode(o.accession_number);
                            setActiveTab('return');
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#670047] hover:text-white rounded-lg text-xs font-bold transition"
                        >
                          Check In
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: KOHA CIRCULATION RULES MATRIX (smart-rules.pl)          */}
      {/* ============================================================== */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#670047]" />
                <h2 className="text-sm font-black text-slate-900">
                  Circulation and Fine Rules Matrix (smart-rules.pl)
                </h2>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Koha circulation policies governing loan limits, durations, daily fine penalties, and grace periods by patron category and item type.
              </p>
            </div>

            <button
              onClick={openAddRule}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#670047] hover:bg-[#520038] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#ffcb00]" />
              <span>Add Circulation Rule</span>
            </button>
          </div>

          {rulesLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading circulation matrix...</div>
          ) : rules.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No rules configured in database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase border-b">
                  <tr>
                    <th className="py-2.5 px-3">Patron Category</th>
                    <th className="py-2.5 px-3">Item Type</th>
                    <th className="py-2.5 px-3 text-center">Max Checkouts</th>
                    <th className="py-2.5 px-3 text-center">Loan Period</th>
                    <th className="py-2.5 px-3 text-center">Fine / Day</th>
                    <th className="py-2.5 px-3 text-center">Grace Period</th>
                    <th className="py-2.5 px-3 text-center">Renewals</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rules.map(rule => (
                    <tr key={rule.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {rule.patron_category_display || rule.patron_category}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {rule.item_type_display || rule.item_type}
                      </td>
                      <td className="py-3 px-3 text-center font-bold">
                        {rule.max_checkouts} books
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-[#670047]">
                        {rule.loan_period_days} days
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-rose-700">
                        Rs. {parseFloat(rule.fine_per_day_rs).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">
                        {rule.grace_period_days} day(s)
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">
                        {rule.max_renewals}x
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {rule.description || '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => openEditRule(rule)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#670047] hover:text-white rounded-lg text-xs font-bold transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: ITEM BARCODE STATUS LOOKUP                              */}
      {/* ============================================================== */}
      {activeTab === 'lookup' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">Check Physical Item Holding Status</h2>
            <button
              onClick={() => openScanner('lookup_book', 'Scan Barcode to Lookup')}
              className="flex items-center space-x-1 text-xs text-[#670047] font-bold"
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
              onKeyDown={(e) => e.key === 'Enter' && processBarcodeLookup()}
              placeholder="Enter accession barcode (e.g. BC-MOS-001)"
              className="flex-1 px-3 py-2 text-xs border rounded-xl font-mono focus:ring-2 focus:ring-[#670047] focus:outline-hidden"
            />
            <button
              onClick={() => processBarcodeLookup()}
              className="px-4 py-2 bg-[#670047] hover:bg-[#520038] text-white rounded-xl text-xs font-bold transition"
            >
              {lookupLoading ? 'Checking...' : 'Lookup'}
            </button>
          </div>

          {lookupResult && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="font-extrabold text-slate-900 text-sm">{lookupResult.book_title}</div>
              <div className="text-slate-500 font-mono">ISBN: {lookupResult.book_isbn}</div>
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Barcode</span>
                  <div className="font-mono font-bold text-slate-800">{lookupResult.accession_number}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Holding Status</span>
                  <div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                      {lookupResult.status_display}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Collection Type</span>
                  <div className="font-semibold text-slate-800">{lookupResult.item_type_display || lookupResult.item_type}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Condition</span>
                  <div className="font-semibold text-slate-800">{lookupResult.condition_display}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
