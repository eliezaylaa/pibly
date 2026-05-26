import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const res = await api.get("/invoices");
    setInvoices(res.data);
  };

  const deleteInvoice = async (id) => {
    if (!confirm("Delete this invoice?")) return;
    await api.delete(`/invoices/${id}`);
    fetchInvoices();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/invoices/${id}`, { status });
    fetchInvoices();
  };

  const filtered = invoices.filter((i) => {
    const matchSearch =
      i.id?.toString().includes(search) ||
      i.poster_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.helper_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.post_title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? i.status === filterStatus : true;
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
    if (status === "paid")
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
        <h1 style={styles.title}>Invoices</h1>

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
            placeholder="Search by poster, helper or post..."
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
            <option value="paid">Paid</option>
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
              <SortTh field="poster_name" label="Poster" />
              <SortTh field="helper_name" label="Helper" />
              <SortTh field="post_title" label="Post" />
              <SortTh field="amount" label="Amount" />
              <SortTh field="platform_fee" label="Fee" />
              <SortTh field="status" label="Status" />
              <SortTh field="created_at" label="Date" />
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((i) => (
              <tr key={i.id}>
                <td style={styles.td}>{i.id}</td>
                <td style={styles.td}>{i.poster_name || "—"}</td>
                <td style={styles.td}>{i.helper_name || "—"}</td>
                <td style={styles.td}>{i.post_title || "—"}</td>
                <td style={styles.td}>€{i.amount || "—"}</td>
                <td style={styles.td}>€{i.platform_fee || "—"}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...statusColor(i.status),
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                    }}
                  >
                    {i.status || "—"}
                  </span>
                </td>
                <td style={styles.td}>
                  {new Date(i.created_at).toLocaleDateString()}
                </td>
                <td style={styles.td}>
                  <select
                    style={{
                      ...styles.input,
                      padding: "4px 8px",
                      fontSize: "12px",
                      marginRight: "8px",
                    }}
                    value={i.status}
                    onChange={(e) => updateStatus(i.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteInvoice(i.id)}
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
  deleteBtn: {
    backgroundColor: "#2A1A1A",
    color: "#FF3B3B",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
