import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";

export default function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const res = await api.get("/invoices/myinvoices");
    setInvoices(res.data);
  };

  const filtered = invoices.filter(
    (i) =>
      i.post_title?.toLowerCase().includes(search.toLowerCase()) ||
      i.poster_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.helper_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const statusColor = (status) => {
    if (status === "paid") return "#1D9E75";
    if (status === "pending") return "#2D6BE4";
    if (status === "refunded") return "#FF3B3B";
    return "#888";
  };

  return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.content}>
        <h1 style={styles.title}>My Invoices</h1>
        <input
          style={{ ...styles.input, width: "300px", marginBottom: "24px" }}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={styles.grid}>
          {filtered.map((i) => (
            <div key={i.id} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.category}>{i.post_title || "—"}</span>
                <span
                  style={{
                    color: statusColor(i.status),
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {i.status || "—"}
                </span>
              </div>
              <h3 style={styles.postTitle}>€{i.amount || "0.00"}</h3>
              <p style={styles.description}>
                Platform fee: €{i.platform_fee || "0.00"}
              </p>
              <div style={styles.cardBottom}>
                <span style={styles.meta}>Poster: {i.poster_name || "—"}</span>
                <span style={styles.meta}>Helper: {i.helper_name || "—"}</span>
                <span style={styles.date}>
                  {new Date(i.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p style={styles.empty}>No invoices yet</p>}
        </div>
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
  card: {
    backgroundColor: "#111",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #1A1A1A",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  category: {
    backgroundColor: "#1A2A4A",
    color: "#2D6BE4",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
  },
  postTitle: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  description: { color: "#888", fontSize: "14px", marginBottom: "16px" },
  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "4px",
  },
  meta: { color: "#555", fontSize: "12px" },
  date: { color: "#555", fontSize: "12px" },
  empty: { color: "#555" },
};
