import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";

export default function Dashboard() {
  const [reports, setReports] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user.role === "admin") {
      api
        .get("/reports")
        .then((res) => setReports(res.data))
        .catch(() => {});
    }
  }, []);

  return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.content}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.welcome}>Welcome back, {user.name}</p>

        {user.role === "admin" && reports && (
          <div style={styles.grid}>
            <KpiCard label="Total Users" value={reports.total_users} />
            <KpiCard label="Active Posts" value={reports.total_active_posts} />
            <KpiCard
              label="Sessions Completed"
              value={reports.total_sessions_completed}
            />
            <KpiCard
              label="Platform Revenue"
              value={`€${reports.total_revenue}`}
            />
            <KpiCard label="Fix Rate" value={`${reports.fix_rate}%`} />
            <KpiCard label="Top Category" value={reports.top_category} />
            <KpiCard
              label="Avg Transaction"
              value={`€${reports.avg_transaction_value}`}
            />
            <KpiCard label="Posts Today" value={reports.total_posts_today} />
          </div>
        )}

        {user.role !== "admin" && (
          <div style={styles.grid}>
            <KpiCard label="Your Role" value={user.role?.toUpperCase()} />
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={styles.cardValue}>{value ?? "—"}</p>
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
    marginBottom: "4px",
  },
  welcome: { color: "#888", marginBottom: "32px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #2A2A2A",
  },
  cardLabel: { color: "#888", fontSize: "13px", marginBottom: "8px" },
  cardValue: { color: "#2D6BE4", fontSize: "28px", fontWeight: "bold" },
};
