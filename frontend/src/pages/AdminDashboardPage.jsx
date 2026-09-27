import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  Upload, 
  FileSpreadsheet, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  DollarSign, 
  BookOpen, 
  DownloadCloud 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'csv_import', 'fines_settle'
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [unpaidFines, setUnpaidFines] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [csvRole, setCsvRole] = useState('STUDENT');
  const [csvResult, setCsvResult] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState('');

  // Fine Payment State
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [selectedFine, setSelectedFine] = useState(null);
  const [paySuccess, setPaySuccess] = useState('');

  useEffect(() => {
    fetchMetrics();
    fetchUsers();
    fetchUnpaidFines();
  }, [userSearch, selectedRole]);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/reports/dashboard/');
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      let url = `/auth/users/?search=${encodeURIComponent(userSearch)}`;
      if (selectedRole) url += `&role=${selectedRole}`;
      const res = await api.get(url);
      setUsers(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpaidFines = async () => {
    try {
      const res = await api.get('/fines/ledger/?status=UNPAID');
      setUnpaidFines(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setCsvError('Please select a .csv file');
      return;
    }
    setCsvLoading(true);
    setCsvError('');
    setCsvResult(null);

    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('role', csvRole);

    try {
      const res = await api.post('/auth/users/batch-import/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCsvResult(res.data);
      fetchUsers();
      fetchMetrics();
    } catch (err) {
      setCsvError(err.response?.data?.error || 'CSV import failed.');
    } finally {
      setCsvLoading(false);
    }
  };

  const handleFinePayment = async (e) => {
    e.preventDefault();
    if (!selectedFine) return;
    try {
      await api.post('/fines/pay/', {
        fine_id: selectedFine.id,
        amount: parseFloat(payAmount),
        payment_method: payMethod
      });
      setPaySuccess('Fine payment settled successfully!');
      setSelectedFine(null);
      setPayAmount('');
      fetchUnpaidFines();
      fetchMetrics();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to record payment');
    }
  };

  const handleExportCirculation = () => {
    window.open('/api/reports/export/circulation/', '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Administration</h1>
          <p className="text-slate-500 text-xs">University of Vavuniya Library Operations & Governance</p>
        </div>

        <button
          onClick={handleExportCirculation}
          className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow transition"
        >
          <DownloadCloud className="w-4 h-4" />
          <span>Export Circulation CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 mb-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 transition ${activeTab === 'overview' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'}`}
        >
          Metrics & Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 border-b-2 transition ${activeTab === 'users' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'}`}
        >
          Patrons & Users
        </button>
        <button
          onClick={() => setActiveTab('csv_import')}
          className={`py-3 px-4 border-b-2 transition ${activeTab === 'csv_import' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'}`}
        >
          CSV Batch Import
        </button>
        <button
          onClick={() => setActiveTab('fines_settle')}
          className={`py-3 px-4 border-b-2 transition ${activeTab === 'fines_settle' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'}`}
        >
          Settle Fines ({unpaidFines.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catalog Titles</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total_titles}</div>
            <div className="text-[11px] text-slate-400 mt-1">{metrics.total_physical_copies} total physical copies</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Loans</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{metrics.active_loans}</div>
            <div className="text-[11px] text-rose-600 font-bold mt-1">{metrics.overdue_loans} currently overdue</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outstanding Fines</div>
            <div className="text-2xl font-black text-rose-700 mt-1">Rs. {metrics.outstanding_fines_rs.toFixed(2)}</div>
            <div className="text-[11px] text-emerald-600 mt-1">Rs. {metrics.collected_fines_rs.toFixed(2)} collected</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Research Papers</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{metrics.total_research_papers}</div>
            <div className="text-[11px] text-amber-600 font-bold mt-1">{metrics.pending_papers_for_review} pending peer review</div>
          </div>
        </div>
      )}

      {/* TAB 2: PATRONS & USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by reg no, name, or username..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="LECTURER">Lecturers</option>
              <option value="LIBRARIAN">Librarians</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b">
                <tr>
                  <th className="p-3">Reg No / ID</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-800">{u.reg_number}</td>
                    <td className="p-3 font-semibold">{u.full_name || u.username}</td>
                    <td className="p-3 text-slate-500">{u.email || '—'}</td>
                    <td className="p-3 font-bold text-slate-700">{u.role}</td>
                    <td className="p-3 text-slate-600">{u.department_name || 'General'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active_patron ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.is_active_patron ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CSV BATCH IMPORT */}
      {activeTab === 'csv_import' && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Batch Patron CSV Onboarding</h2>
          <p className="text-xs text-slate-500 mb-4">
            Upload annual student intake or staff lists in CSV format for bulk account provisioning.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-5 text-xs text-slate-600">
            <strong>Expected CSV Header Columns:</strong>
            <code className="block bg-white p-2 rounded border border-slate-200 mt-1 font-mono text-[11px] text-slate-800">
              reg_number,first_name,last_name,email,department
            </code>
            <span className="text-[11px] text-slate-500 block mt-1">
              Example row: <code>2022/ICT/150,Kamal,Perera,kamal@vau.ac.lk,Department of Physical Science</code>
            </span>
          </div>

          {csvError && (
            <div className="p-3 bg-rose-50 text-rose-800 rounded-lg text-xs font-semibold mb-4 border border-rose-200">
              {csvError}
            </div>
          )}

          {csvResult && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold mb-4 border border-emerald-200">
              {csvResult.message}
            </div>
          )}

          <form onSubmit={handleCsvSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Patron Role</label>
              <select
                value={csvRole}
                onChange={(e) => setCsvRole(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="STUDENT">Student Intake</option>
                <option value="LECTURER">Academic Staff / Lecturer</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Select CSV File</label>
              <input
                type="file"
                accept=".csv"
                required
                onChange={(e) => setCsvFile(e.target.files[0])}
                className="w-full text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={csvLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow transition"
            >
              {csvLoading ? 'Processing Batch Import...' : 'Import Patron Accounts'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: SETTLE FINES */}
      {activeTab === 'fines_settle' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Outstanding Patron Fines Ledger</h2>

          {paySuccess && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
              {paySuccess}
            </div>
          )}

          {unpaidFines.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No outstanding unpaid fines.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {unpaidFines.map((f) => (
                <div key={f.id} className="py-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-800">{f.patron_reg_number}</span> — <strong className="text-slate-900">{f.patron_name}</strong>
                    <div className="text-slate-500 mt-0.5">{f.reason} (Title: {f.book_title})</div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-bold text-rose-700 text-sm">Rs. {f.balance_amount?.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">Total: Rs. {parseFloat(f.amount).toFixed(2)}</div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFine(f);
                        setPayAmount(f.balance_amount);
                        setPaySuccess('');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition"
                    >
                      Receive Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settle Modal */}
          {selectedFine && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
                <h3 className="font-bold text-sm text-slate-900 mb-2">Process Fine Receipt</h3>
                <p className="text-xs text-slate-600 mb-4">
                  Patron: <strong>{selectedFine.patron_name}</strong> ({selectedFine.patron_reg_number})
                </p>

                <form onSubmit={handleFinePayment} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold block mb-1">Amount to Pay (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Payment Method</label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="CASH">Cash at Desk</option>
                      <option value="ONLINE">Bank Transfer / Online</option>
                      <option value="WAIVED">Administrative Waiver</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFine(null)}
                      className="px-3 py-1.5 bg-slate-100 rounded text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 text-white rounded font-bold shadow"
                    >
                      Issue Receipt
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
