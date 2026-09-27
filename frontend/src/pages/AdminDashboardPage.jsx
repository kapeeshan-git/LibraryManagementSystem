import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import IdCardModal from '../components/common/IdCardModal';
import QrBarcodeScanner from '../components/common/QrBarcodeScanner';
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
  DownloadCloud, 
  UserPlus, 
  Edit3, 
  QrCode, 
  KeyRound, 
  Shield,
  Camera,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAdmin, isStaff } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'csv_import', 'fines_settle'
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [unpaidFines, setUnpaidFines] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalUser, setEditUserModalUser] = useState(null);
  const [idCardModalUser, setIdCardModalUser] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isRegScanned, setIsRegScanned] = useState(false);

  // User Form State (Add / Edit)
  const [userFormData, setUserFormData] = useState({
    reg_number: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role: 'STUDENT',
    department: '',
    password: '',
    is_active_patron: true,
  });
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [userFormError, setUserFormError] = useState('');
  const [userFormSuccess, setUserFormSuccess] = useState('');

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
    fetchDepartments();
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

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/auth/departments/');
      setDepartments(res.data.results || res.data);
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

  // Open Edit User Modal
  const openEditUser = (user) => {
    setEditUserModalUser(user);
    setUserFormData({
      reg_number: user.reg_number,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      role: user.role,
      department: user.department || '',
      password: '',
      is_active_patron: user.is_active_patron,
    });
    setUserFormError('');
  };

  // Open Add User Modal
  const openAddUser = () => {
    setUserFormData({
      reg_number: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      role: 'STUDENT',
      department: departments[0]?.id || '',
      password: '',
      is_active_patron: true,
    });
    setIsRegScanned(false);
    setUserFormError('');
    setAddUserModalOpen(true);
  };

  const handleRegScanSuccess = (scannedCode) => {
    const clean = scannedCode.trim();
    setUserFormData((prev) => ({
      ...prev,
      reg_number: clean,
    }));
    setIsRegScanned(true);
    setIsScannerOpen(false);
  };

  // Submit Add User
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();

    // Verify mandatory scan rule for library staff (admin can bypass)
    if (!isAdmin && !isRegScanned) {
      setUserFormError("Library Staff must scan the patron's physical university ID card to obtain the Registration Number.");
      return;
    }

    if (!userFormData.reg_number.trim()) {
      setUserFormError("Registration No / Staff ID is required.");
      return;
    }

    setUserFormLoading(true);
    setUserFormError('');

    try {
      const payload = {
        ...userFormData,
        username: userFormData.reg_number.trim(),
        reg_number: userFormData.reg_number.trim(),
      };
      if (!payload.password) {
        delete payload.password; // Django model serializer defaults to reg_number
      }

      await api.post('/auth/users/', payload);
      setAddUserModalOpen(false);
      setUserFormSuccess(`User '${payload.reg_number}' created successfully.`);
      fetchUsers();
      fetchMetrics();
    } catch (err) {
      setUserFormError(err.response?.data?.reg_number?.[0] || err.response?.data?.detail || 'Failed to create user.');
    } finally {
      setUserFormLoading(false);
    }
  };

  // Submit Edit User
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setUserFormLoading(true);
    setUserFormError('');

    try {
      const payload = { ...userFormData };
      if (!payload.password) {
        delete payload.password; // Don't overwrite if left blank
      }

      await api.patch(`/auth/users/${editUserModalUser.id}/`, payload);
      setEditUserModalUser(null);
      setUserFormSuccess(`User '${editUserModalUser.reg_number}' updated successfully.`);
      fetchUsers();
    } catch (err) {
      setUserFormError(err.response?.data?.detail || 'Failed to update user.');
    } finally {
      setUserFormLoading(false);
    }
  };

  // Submit CSV Bulk Onboarding
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
      {/* Digital ID Card Modal */}
      {idCardModalUser && (
        <IdCardModal
          user={idCardModalUser}
          onClose={() => setIdCardModalUser(null)}
        />
      )}

      {/* ID Card Scanner for Patron Registration */}
      {isScannerOpen && (
        <QrBarcodeScanner
          title="Scan Student / Staff Physical ID Card QR"
          onScan={handleRegScanSuccess}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Administration</h1>
          <p className="text-slate-500 text-xs">University of Vavuniya Patron Accounts, Governance & Circulation Logs</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={openAddUser}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#670047] hover:bg-[#520038] text-white rounded-xl text-xs font-bold shadow transition"
          >
            <UserPlus className="w-4 h-4 text-[#ffcb00]" />
            <span>Add New Patron</span>
          </button>

          <button
            onClick={handleExportCirculation}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            <DownloadCloud className="w-4 h-4 text-[#ffcb00]" />
            <span>Export Circulation CSV</span>
          </button>
        </div>
      </div>

      {userFormSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>{userFormSuccess}</span>
          <button onClick={() => setUserFormSuccess('')} className="text-emerald-600 font-bold">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 mb-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 transition ${activeTab === 'overview' ? 'border-[#670047] text-[#670047]' : 'border-transparent text-slate-500'}`}
        >
          Metrics & Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 border-b-2 transition ${activeTab === 'users' ? 'border-[#670047] text-[#670047]' : 'border-transparent text-slate-500'}`}
        >
          Patrons & Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('csv_import')}
          className={`py-3 px-4 border-b-2 transition ${activeTab === 'csv_import' ? 'border-[#670047] text-[#670047]' : 'border-transparent text-slate-500'}`}
        >
          CSV Batch Import
        </button>
        <button
          onClick={() => setActiveTab('fines_settle')}
          className={`py-3 px-4 border-b-2 transition ${activeTab === 'fines_settle' ? 'border-[#670047] text-[#670047]' : 'border-transparent text-slate-500'}`}
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by reg no, name, or email..."
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

            <button
              onClick={openAddUser}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#670047] hover:bg-[#520038] text-white rounded-lg text-xs font-bold transition shadow"
            >
              <UserPlus className="w-4 h-4 text-[#ffcb00]" />
              <span>Add User Form</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b">
                <tr>
                  <th className="p-3">Reg No / ID</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-800">{u.reg_number}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{u.full_name || u.username}</div>
                      <div className="text-[11px] text-slate-400">{u.email || 'No email provided'}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'LIBRARIAN' ? 'bg-blue-100 text-blue-800' :
                        u.role === 'LECTURER' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{u.department_name || 'General'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active_patron ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.is_active_patron ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {/* ID Card preview with QR code */}
                      <button
                        onClick={() => setIdCardModalUser(u)}
                        title="View / Print Digital Library ID Card with QR"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] transition"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                        <span>ID Card</span>
                      </button>

                      {/* Edit User Button */}
                      <button
                        onClick={() => openEditUser(u)}
                        title="Edit User Information"
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md font-semibold text-[11px] transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
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

          {/* Settle Fine Modal */}
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

      {/* ADD NEW USER MODAL FORM */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Add New Library Patron / Staff</h2>
            <p className="text-xs text-slate-500 mb-4">Manually register a student, lecturer, or staff account.</p>

            {userFormError && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-lg text-xs font-semibold mb-4 border border-rose-200">
                {userFormError}
              </div>
            )}

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              {/* Registration / ID Scanner Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-slate-700 block uppercase text-[11px]">
                    Registration No / Staff ID *
                  </label>
                  {isAdmin ? (
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                      Admin: Manual Input or Scan
                    </span>
                  ) : (
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                      Physical ID Card Scan Required
                    </span>
                  )}
                </div>

                <div className="relative flex gap-2">
                  <input
                    type="text"
                    required
                    readOnly={!isAdmin}
                    value={userFormData.reg_number}
                    onChange={(e) => {
                      if (isAdmin) {
                        setUserFormData({ ...userFormData, reg_number: e.target.value });
                      }
                    }}
                    placeholder={
                      isAdmin
                        ? "e.g. 2022/ICT/150 or scan physical card"
                        : "Click 'Scan ID Card' to scan physical QR"
                    }
                    className={`flex-1 px-3 py-2 border rounded-lg font-mono text-xs ${
                      !isAdmin
                        ? 'bg-slate-100 text-slate-800 border-slate-300 font-bold cursor-not-allowed'
                        : 'bg-white focus:ring-2 focus:ring-emerald-500'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow transition shrink-0"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{userFormData.reg_number ? 'Re-scan ID' : 'Scan ID Card'}</span>
                  </button>
                </div>

                {isRegScanned && (
                  <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified from Physical University ID Card: {userFormData.reg_number}</span>
                  </div>
                )}

                {!isAdmin && !isRegScanned && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 font-medium flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Library Staff rule: You must scan the patron's physical university ID card to register them.</span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Patron Role *</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="STUDENT">Student</option>
                  <option value="LECTURER">Lecturer / Academic Staff</option>
                  <option value="LIBRARIAN">Librarian</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.first_name}
                    onChange={(e) => setUserFormData({ ...userFormData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={userFormData.last_name}
                    onChange={(e) => setUserFormData({ ...userFormData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="patron@vau.ac.lk"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={userFormData.phone_number}
                    onChange={(e) => setUserFormData({ ...userFormData, phone_number: e.target.value })}
                    placeholder="077xxxxxxx"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <select
                  value={userFormData.department}
                  onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">No Department Assigned</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.faculty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password (Leave blank to use Registration No)</label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder="Defaults to registration number"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userFormData.is_active_patron}
                    onChange={(e) => setUserFormData({ ...userFormData, is_active_patron: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span className="font-semibold text-slate-700">Grant active borrowing privilege</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userFormLoading || (!isAdmin && !isRegScanned)}
                  className={`px-5 py-2 text-white rounded-lg font-bold shadow transition ${
                    !isAdmin && !isRegScanned
                      ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {userFormLoading
                    ? 'Creating User...'
                    : (!isAdmin && !isRegScanned
                        ? 'Scan ID Card to Enable'
                        : 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL FORM */}
      {editUserModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Edit Patron Information</h2>
            <p className="text-xs text-slate-500 mb-4">
              Editing: <strong className="text-slate-800">{editUserModalUser.reg_number}</strong>
            </p>

            {userFormError && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-lg text-xs font-semibold mb-4 border border-rose-200">
                {userFormError}
              </div>
            )}

            <form onSubmit={handleEditUserSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.first_name}
                    onChange={(e) => setUserFormData({ ...userFormData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={userFormData.last_name}
                    onChange={(e) => setUserFormData({ ...userFormData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="LECTURER">Lecturer / Academic Staff</option>
                    <option value="LIBRARIAN">Librarian</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <select
                    value={userFormData.department}
                    onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">No Department Assigned</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={userFormData.phone_number}
                    onChange={(e) => setUserFormData({ ...userFormData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reset Password (Leave blank to keep unchanged)</label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userFormData.is_active_patron}
                    onChange={(e) => setUserFormData({ ...userFormData, is_active_patron: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span className="font-semibold text-slate-700">Active Library Patron Privilege</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditUserModalUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userFormLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow"
                >
                  {userFormLoading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
