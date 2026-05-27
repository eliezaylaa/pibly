import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const res = await api.get("/payments/all");
    setTransactions(res.data);
  };

  const refundTransaction = async (id) => {
    if (!confirm("Refund this transaction?")) return;
    await api.put(`/payments/${id}/refund`);
    fetchTransactions();
  };

  const deleteTransaction = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    await api.delete(`/payments/${id}`);
    fetchTransactions();
  };

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.id?.toString().includes(search) ||
      t.payer_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.payee_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField] ?? "";
    const valB = b[sortField] ?? "";
    if (sortDir === "asc") return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  const SortTh = ({ field, label }) => (
    <th
      style={{ ...styles.th, cursor: "pointer" }}
      onClick={() => {
        setSortField(field);
        setSortDir(sortDir === "asc" ? "desc" : "asc");
      }}
    >
      {label} {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </th>
  );

  const statusColor = (status) => {
    if (status === "completed")
      return { backgroundColor: "#1A3A1A", color: "#1D9E75" };
    if (status === "pending")
      return { backgroundColor: "#1A2A4A", color: "#2D6BE4" };
    if (status === "refunded")
      return { backgroundColor: "#2A1A1A", color: "#FF3B3B" };
    return { backgroundColor: "#1A1A1A", color: "#888" };
  };

  return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.content}>
        <h1 style={styles.title}>Transactions</h1>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <input
            style={{ ...styles.input, width: "250px" }}
            placeholder="Search by ID, payer or payee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={styles.input}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            style={styles.cancel}
            onClick={() => {
              setSearch("");
              setFilterStatus("");
            }}
          >
            Clear
          </button>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <SortTh field="id" label="ID" />
              <SortTh field="payer_name" label="Payer" />
              <SortTh field="payee_name" label="Payee" />
              <SortTh field="amount" label="Amount" />
              <SortTh field="platform_fee" label="Platform Fee" />
              <SortTh field="status" label="Status" />
              <SortTh field="created_at" label="Date" />
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => (
              <tr key={t.id}>
                <td style={styles.td}>{t.id}</td>
                <td style={styles.td}>{t.payer_name || "—"}</td>
                <td style={styles.td}>{t.payee_name || "—"}</td>
                <td style={styles.td}>€{t.amount}</td>
                <td style={styles.td}>€{t.platform_fee}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...statusColor(t.status),
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                    }}
                  >
                    {t.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {new Date(t.created_at).toLocaleDateString()}
                </td>
                <td style={styles.td}>
                  {t.status !== "refunded" && (
                    <button
                      style={styles.editBtn}
                      onClick={() => refundTransaction(t.id)}
                    >
                      Refund
                    </button>
                  )}
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteTransaction(t.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", minHeight: "100vh", backgroundColor: "#000" },
  content: { marginLeft: "240px", padding: "40px", flex: 1 },
  title: {
    color: "#fff",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "24px",
  },
  input: {
    padding: "10px 14px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
  },
  cancel: {
    padding: "10px 20px",
    backgroundColor: "#1A1A1A",
    color: "#888",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    color: "#888",
    textAlign: "left",
    padding: "12px 16px",
    borderBottom: "1px solid #1A1A1A",
    fontSize: "13px",
  },
  td: {
    color: "#fff",
    padding: "12px 16px",
    borderBottom: "1px solid #111",
    fontSize: "14px",
  },
  editBtn: {
    backgroundColor: "#1A2A4A",
    color: "#2D6BE4",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "8px",
  },
  deleteBtn: {
    backgroundColor: "#2A1A1A",
    color: "#FF3B3B",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
