import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import IdCardModal from '../components/common/IdCardModal';
import { 
  BookOpen, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Bookmark, 
  CheckCircle, 
  Bell, 
  Receipt,
  Trash2,
  QrCode 
} from 'lucide-react';

export default function PatronDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('loans'); // 'loans', 'holds', 'fines', 'notices'
  const [loans, setLoans] = useState([]);
  const [holds, setHolds] = useState([]);
  const [fines, setFines] = useState([]);
  const [notices, setNotices] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const [idCardOpen, setIdCardOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [loansRes, holdsRes, finesRes, noticesRes, metricsRes] = await Promise.all([
        api.get('/circulation/records/?status=ACTIVE'),
        api.get('/reservations/queue/'),
        api.get('/fines/ledger/'),
        api.get('/notifications/inbox/'),
        api.get('/reports/dashboard/')
      ]);
      setLoans(loansRes.data.results || loansRes.data);
      setHolds(holdsRes.data.results || holdsRes.data);
      setFines(finesRes.data.results || finesRes.data);
      setNotices(noticesRes.data.results || noticesRes.data);
      setMetrics(metricsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (recordId) => {
    try {
      const res = await api.post('/circulation/renew/', { borrow_record_id: recordId });
      setActionMessage({ type: 'success', text: res.data.message });
      fetchDashboardData();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.detail || err.response?.data?.[0] || 'Unable to renew book loan.'
      });
    }
  };

  const handleCancelHold = async (reservationId) => {
    if (!confirm('Are you sure you want to cancel this hold reservation?')) return;
    try {
      await api.post(`/reservations/${reservationId}/cancel/`);
      setActionMessage({ type: 'success', text: 'Reservation cancelled successfully.' });
      fetchDashboardData();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to cancel reservation.'
      });
    }
  };

  const handleMarkNoticesRead = async () => {
    try {
      await api.post('/notifications/inbox/mark_all_read/');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Patron Dashboard
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {user?.full_name || user?.username} • ID: <strong className="text-slate-800">{user?.reg_number}</strong> ({user?.role})
          </p>
        </div>

        {/* Quick KPI pills & ID Card button */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setIdCardOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Digital ID Card (QR)</span>
          </button>

          <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold">
            {metrics?.my_active_loans ?? loans.length} Active Loans
          </div>
          <div className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200 font-bold">
            {metrics?.my_active_holds ?? holds.length} Active Holds
          </div>
          <div className="bg-rose-50 text-rose-800 px-3 py-1.5 rounded-xl border border-rose-200 font-bold">
            Rs. {metrics?.my_unpaid_fines_rs ? metrics.my_unpaid_fines_rs.toFixed(2) : '0.00'} Fines
          </div>
        </div>
      </div>

      {idCardOpen && (
        <IdCardModal
          user={user}
          onClose={() => setIdCardOpen(false)}
        />
      )}

      {actionMessage.text && (
        <div className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
          actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('loans')}
          className={`flex items-center space-x-1.5 py-3 px-4 font-semibold text-xs border-b-2 transition ${
            activeTab === 'loans' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Active Loans ({loans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('holds')}
          className={`flex items-center space-x-1.5 py-3 px-4 font-semibold text-xs border-b-2 transition ${
            activeTab === 'holds' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Hold Reservations ({holds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fines')}
          className={`flex items-center space-x-1.5 py-3 px-4 font-semibold text-xs border-b-2 transition ${
            activeTab === 'fines' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Fines & Receipts ({fines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center space-x-1.5 py-3 px-4 font-semibold text-xs border-b-2 transition ${
            activeTab === 'notices' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>System Alerts ({notices.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE LOANS */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {loans.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-slate-400 text-xs">
              You currently have no books on loan. Browse the catalog to borrow books.
            </div>
          ) : (
            loans.map((loan) => (
              <div
                key={loan.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {loan.accession_number}
                    </span>
                    {loan.is_overdue && (
                      <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {loan.overdue_days_count} Days Overdue
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{loan.book_title}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center space-x-3">
                    <span>Issued: {new Date(loan.issue_date).toLocaleDateString()}</span>
                    <span>Due: <strong className={loan.is_overdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                      {new Date(loan.due_date).toLocaleDateString()}
                    </strong></span>
                    <span>Renewals: {loan.renewal_count}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRenew(loan.id)}
                  disabled={loan.is_overdue}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold shadow transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Extend Loan</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: HOLDS & RESERVATIONS */}
      {activeTab === 'holds' && (
        <div className="space-y-4">
          {holds.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-slate-400 text-xs">
              No active reservations or hold requests placed.
            </div>
          ) : (
            holds.map((h) => (
              <div
                key={h.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      h.status === 'READY_FOR_PICKUP' ? 'bg-emerald-100 text-emerald-800' :
                      h.status === 'PENDING' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {h.status_display}
                    </span>
                    {h.status === 'PENDING' && (
                      <span className="text-xs font-bold text-slate-600">
                        Position in Queue: #{h.queue_position}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{h.book_title}</h3>
                  {h.hold_expires_at && (
                    <div className="text-xs text-rose-600 font-bold mt-1">
                      Desk Pickup Window Closes: {new Date(h.hold_expires_at).toLocaleString()}
                    </div>
                  )}
                </div>

                {['PENDING', 'READY_FOR_PICKUP'].includes(h.status) && (
                  <button
                    onClick={() => handleCancelHold(h.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel Hold</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: FINES */}
      {activeTab === 'fines' && (
        <div className="space-y-4">
          {fines.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-slate-400 text-xs">
              No fines on record. Your library account has a clean standing!
            </div>
          ) : (
            fines.map((f) => (
              <div key={f.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      f.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {f.status_display}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{f.reason}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">Item: {f.book_title || 'Physical Holding'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">Rs. {parseFloat(f.amount).toFixed(2)}</div>
                    <div className="text-xs text-slate-500">Balance: Rs. {f.balance_amount?.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: SYSTEM ALERTS */}
      {activeTab === 'notices' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={handleMarkNoticesRead}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Mark All as Read
            </button>
          </div>
          {notices.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border text-xs ${
                n.is_read ? 'bg-white border-slate-200' : 'bg-emerald-50/50 border-emerald-200 font-semibold'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-800">{n.title}</span>
                <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-600">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
