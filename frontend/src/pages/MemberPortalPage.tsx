import React, { useEffect, useState } from "react";
import { apiFetch, ApiClientError, formatDateTime } from "../api/client";
import { useAuth } from "../auth/AuthContext";

interface MyLoan {
  id: number;
  title: string;
  section: string;
  issued_at: string;
  due_at: string;
  returned_at: string | null;
  renewal_count: number;
  status: string;
  overdue: boolean;
  copy: { id: number; accession_number: string };
}

interface MyFine {
  id: number;
  loan_id: number;
  title: string;
  accession_number: string;
  days_late: number;
  rate_applied: string;
  calculated_amount: string;
  balance: string;
  status: string;
  created_at: string;
}

export const MemberPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<MyLoan[]>([]);
  const [fines, setFines] = useState<MyFine[]>([]);
  const [totalBalance, setTotalBalance] = useState("0.00");
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [busy, setBusy] = useState(false);

  const loadData = async () => {
    const [loanRes, fineRes] = await Promise.all([
      apiFetch<{ results: MyLoan[] }>("/loans/mine"),
      apiFetch<{ results: MyFine[]; balance: string }>("/fines/mine"),
    ]);
    setLoans(loanRes.results);
    setFines(fineRes.results);
    setTotalBalance(fineRes.balance);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRenew = async (loan: MyLoan) => {
    setBusy(true);
    setBanner(null);
    try {
      const updated = await apiFetch<MyLoan>(`/loans/${loan.id}/renew`, {
        method: "POST",
        idempotent: true,
        body: {},
      });
      setBanner({
        ok: true,
        text: `Renewed '${updated.title}'. New due date: ${formatDateTime(
          updated.due_at
        )}`,
      });
      await loadData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setBanner({ ok: false, text: `${err.code}: ${err.message}` });
      }
    } finally {
      setBusy(false);
    }
  };

  const activeLoans = loans.filter((l) => l.status === "ACTIVE");
  const pastLoans = loans.filter((l) => l.status !== "ACTIVE");

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">My Library Account</h2>
          <p className="page-subtitle">
            {user?.full_name} ({user?.reg_number || user?.username}) &middot;{" "}
            {user?.patron_category}
          </p>
        </div>
        <div className="stat-box">
          <span className="stat-label">Outstanding Fine Balance</span>
          <strong
            className={`stat-val ${
              Number(totalBalance) > 0 ? "text-danger" : ""
            }`}
          >
            Rs {totalBalance}
          </strong>
        </div>
      </div>

      {banner && (
        <div
          className={`banner ${banner.ok ? "banner-success" : "banner-error"}`}
        >
          {banner.text}
        </div>
      )}

      <div className="card mb-4">
        <h3>Active Loans ({activeLoans.length})</h3>
        {activeLoans.length === 0 ? (
          <p className="text-muted">You currently have no books on loan.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Accession</th>
                  <th>Title</th>
                  <th>Section</th>
                  <th>Issued At</th>
                  <th>Due Date</th>
                  <th>Renewals</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <code>{l.copy.accession_number}</code>
                    </td>
                    <td>
                      <strong>{l.title}</strong>
                    </td>
                    <td>
                      <span className="badge">{l.section}</span>
                    </td>
                    <td>{formatDateTime(l.issued_at)}</td>
                    <td>{formatDateTime(l.due_at)}</td>
                    <td>{l.renewal_count}</td>
                    <td>
                      {l.overdue ? (
                        <span className="status-pill status-suspended">
                          OVERDUE
                        </span>
                      ) : (
                        <span className="status-pill status-active">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-xs"
                        disabled={busy || l.overdue}
                        onClick={() => handleRenew(l)}
                      >
                        Renew
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card mb-4">
        <h3>My Fines ({fines.length})</h3>
        {fines.length === 0 ? (
          <p className="text-muted">You have no fines on record.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Accession</th>
                  <th>Days Late</th>
                  <th>Calculated</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((f) => (
                  <tr key={f.id}>
                    <td>{f.title}</td>
                    <td>
                      <code>{f.accession_number}</code>
                    </td>
                    <td>{f.days_late} day(s)</td>
                    <td>Rs {f.calculated_amount}</td>
                    <td>
                      <strong>Rs {f.balance}</strong>
                    </td>
                    <td>
                      <span
                        className={`status-pill status-${f.status.toLowerCase()}`}
                      >
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pastLoans.length > 0 && (
        <div className="card">
          <h3>Returned / Past Loans ({pastLoans.length})</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Accession</th>
                  <th>Title</th>
                  <th>Issued</th>
                  <th>Returned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pastLoans.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <code>{l.copy.accession_number}</code>
                    </td>
                    <td>{l.title}</td>
                    <td>{formatDateTime(l.issued_at)}</td>
                    <td>{formatDateTime(l.returned_at)}</td>
                    <td>
                      <span className="badge">{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
