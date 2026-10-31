import React, { useEffect, useState } from "react";
import { apiFetch, ApiClientError, formatDateTime } from "../api/client";
import { useAuth } from "../auth/AuthContext";

interface FineTx {
  id: number;
  type: "PAYMENT" | "WAIVER" | "ADJUSTMENT";
  amount: string;
  actor: string;
  reason: string;
  receipt_ref: string;
  created_at: string;
}

interface FineRow {
  id: number;
  loan_id: number;
  patron: {
    id: number;
    username: string;
    full_name: string;
    reg_number: string | null;
  };
  title: string;
  accession_number: string;
  days_late: number;
  rate_applied: string;
  calculated_amount: string;
  balance: string;
  status: "OPEN" | "SETTLED";
  created_at: string;
  transactions?: FineTx[];
}

export const FinesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [q, setQ] = useState("");
  const [fines, setFines] = useState<FineRow[]>([]);
  const [selected, setSelected] = useState<FineRow | null>(null);
  const [txForm, setTxForm] = useState({
    type: "PAYMENT",
    amount: "",
    reason: "",
    receipt_ref: "",
  });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const loadFines = async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (q.trim()) params.set("q", q.trim());
    const res = await apiFetch<{ results: FineRow[] }>(
      `/fines?${params.toString()}`
    );
    setFines(res.results);
  };

  const openFine = async (id: number) => {
    const detail = await apiFetch<FineRow>(`/fines/${id}/transactions`);
    setSelected(detail);
    setTxForm({
      type: "PAYMENT",
      amount: detail.balance,
      reason: "",
      receipt_ref: `RCP-${detail.id}-${Date.now().toString().slice(-4)}`,
    });
  };

  useEffect(() => {
    loadFines();
  }, [statusFilter]);

  const handleRecordTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setMsg(null);
    try {
      const updated = await apiFetch<FineRow>(
        `/fines/${selected.id}/transactions`,
        {
          method: "POST",
          idempotent: true,
          body: txForm,
        }
      );
      setSelected(updated);
      setTxForm((f) => ({
        ...f,
        amount: updated.balance,
        reason: "",
      }));
      setMsg({
        ok: true,
        text: `Recorded ${txForm.type} of Rs ${txForm.amount}. Remaining balance: Rs ${updated.balance} (${updated.status}).`,
      });
      loadFines();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setMsg({ ok: false, text: `${err.code}: ${err.message}` });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Fines &amp; Append-Only Ledger</h2>
          <p className="page-subtitle">
            Record payments, waivers, and adjustments with full auditability
          </p>
        </div>
      </div>

      {msg && (
        <div
          className={`banner ${msg.ok ? "banner-success" : "banner-error"}`}
        >
          {msg.text}
        </div>
      )}

      <div className="card mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadFines();
          }}
          className="filter-bar"
        >
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by patron name or reg number..."
            className="search-input-wide"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Fines</option>
            <option value="OPEN">OPEN Only</option>
            <option value="SETTLED">SETTLED Only</option>
          </select>
          <button type="submit" className="btn btn-primary">
            Filter
          </button>
        </form>
      </div>

      <div className="catalog-split">
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patron</th>
                  <th>Book &amp; Accession</th>
                  <th>Late</th>
                  <th>Calculated</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((f) => (
                  <tr
                    key={f.id}
                    className={selected?.id === f.id ? "row-selected" : ""}
                  >
                    <td>#{f.id}</td>
                    <td>
                      <strong>{f.patron.full_name}</strong>
                      <div className="book-sub-cell">
                        {f.patron.reg_number || f.patron.username}
                      </div>
                    </td>
                    <td>
                      {f.title}
                      <div className="book-sub-cell">
                        <code>{f.accession_number}</code>
                      </div>
                    </td>
                    <td>{f.days_late}d</td>
                    <td>Rs {f.calculated_amount}</td>
                    <td>
                      <strong
                        className={
                          Number(f.balance) > 0 ? "text-danger" : ""
                        }
                      >
                        Rs {f.balance}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`status-pill status-${f.status.toLowerCase()}`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        onClick={() => openFine(f.id)}
                      >
                        Ledger / Pay
                      </button>
                    </td>
                  </tr>
                ))}
                {fines.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      No fines found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="card detail-panel">
            <div className="card-header-flex">
              <h3>Fine #{selected.id} Ledger</h3>
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <p className="text-muted">
              <strong>Patron:</strong> {selected.patron.full_name} (
              {selected.patron.reg_number || selected.patron.username}) <br />
              <strong>Book:</strong> {selected.title} (
              <code>{selected.accession_number}</code>) <br />
              <strong>Calculation:</strong> {selected.days_late} open day(s)
              &times; Rs {selected.rate_applied} = Rs{" "}
              {selected.calculated_amount} <br />
              <strong>Current Balance:</strong>{" "}
              <strong className="text-danger">Rs {selected.balance}</strong> (
              {selected.status})
            </p>

            <form onSubmit={handleRecordTx} className="sub-form mb-4">
              <h4>Record Ledger Transaction</h4>
              <div className="grid-form">
                <div className="field">
                  <label>Transaction Type</label>
                  <select
                    value={txForm.type}
                    onChange={(e) =>
                      setTxForm({ ...txForm, type: e.target.value })
                    }
                  >
                    <option value="PAYMENT">PAYMENT</option>
                    <option value="WAIVER">WAIVER (Reason required)</option>
                    {isAdmin && (
                      <option value="ADJUSTMENT">
                        ADJUSTMENT (Admin only, +/-)
                      </option>
                    )}
                  </select>
                </div>
                <div className="field">
                  <label>Amount (Rs)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={txForm.amount}
                    onChange={(e) =>
                      setTxForm({ ...txForm, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label>Receipt Reference</label>
                  <input
                    type="text"
                    value={txForm.receipt_ref}
                    onChange={(e) =>
                      setTxForm({ ...txForm, receipt_ref: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label>
                    Reason{" "}
                    {txForm.type !== "PAYMENT" ? "(Required *)" : "(Optional)"}
                  </label>
                  <input
                    type="text"
                    value={txForm.reason}
                    onChange={(e) =>
                      setTxForm({ ...txForm, reason: e.target.value })
                    }
                    required={txForm.type !== "PAYMENT"}
                    placeholder="e.g. Medical certificate / Partial cash payment"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm mt-2"
                disabled={busy}
              >
                Post Transaction
              </button>
            </form>

            <h4>Append-Only Ledger History</h4>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actor</th>
                    <th>Reason / Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.transactions || []).map((t) => (
                    <tr key={t.id}>
                      <td>{formatDateTime(t.created_at)}</td>
                      <td>
                        <span className="badge">{t.type}</span>
                      </td>
                      <td>Rs {t.amount}</td>
                      <td>{t.actor}</td>
                      <td>
                        {t.reason || "—"}{" "}
                        {t.receipt_ref ? `(${t.receipt_ref})` : ""}
                      </td>
                    </tr>
                  ))}
                  {(selected.transactions || []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-muted">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
