import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#2D6BE4", "#1D9E75", "#F5A623", "#FF3B3B", "#9B59B6"];

export default function Reports() {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const res = await api.get("/reports");
    setReports(res.data);
  };

  if (!reports)
    return (
      <div style={styles.page}>
        <Sidebar />
        <div style={styles.content}>
          <p style={{ color: "#888" }}>Loading...</p>
        </div>
      </div>
    );

  const pieData = [
    { name: "Total Users", value: reports.total_users },
    { name: "Active Posts", value: reports.total_active_posts },
    { name: "Sessions Completed", value: reports.total_sessions_completed },
  ];

  const barData = [
    { name: "Users", value: reports.total_users },
    { name: "Active Posts", value: reports.total_active_posts },
    { name: "Posts Today", value: reports.total_posts_today },
    { name: "Sessions", value: reports.total_sessions_completed },
  ];

  const revenueData = [
    { name: "Revenue", value: parseFloat(reports.total_revenue) || 0 },
    {
      name: "Avg Transaction",
      value: parseFloat(reports.avg_transaction_value) || 0,
    },
    { name: "Fix Rate", value: parseFloat(reports.fix_rate) || 0 },
  ];

  return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.content}>
        <h1 style={styles.title}>Reports & KPIs</h1>

        <div style={styles.grid}>
          <KpiCard label="Total Users" value={reports.total_users} />
          <KpiCard label="Active Posts" value={reports.total_active_posts} />
          <KpiCard label="Posts Today" value={reports.total_posts_today} />
          <KpiCard
            label="Sessions Completed"
            value={reports.total_sessions_completed}
          />
          <KpiCard
            label="Platform Revenue"
            value={`€${reports.total_revenue}`}
            color="#1D9E75"
          />
          <KpiCard label="Fix Rate" value={`${reports.fix_rate}%`} />
          <KpiCard label="Top Category" value={reports.top_category || "—"} />
          <KpiCard
            label="Avg Transaction"
            value={`€${reports.avg_transaction_value}`}
          />
        </div>

        <div style={styles.charts}>
          <div style={styles.chartBox}>
            <h2 style={styles.chartTitle}>Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#555" />
                <YAxis stroke="#555" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #333",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" fill="#2D6BE4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.chartBox}>
            <h2 style={styles.chartTitle}>Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #333",
                    color: "#fff",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.chartBox}>
            <h2 style={styles.chartTitle}>Revenue & Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <XAxis dataKey="name" stroke="#555" />
                <YAxis stroke="#555" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #333",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" fill="#1D9E75" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, color }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={{ ...styles.cardValue, color: color || "#2D6BE4" }}>
        {value ?? "—"}
      </p>
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
    marginBottom: "32px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "40px",
  },
  card: {
    backgroundColor: "#111",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #1A1A1A",
  },
  cardLabel: {
    color: "#555",
    fontSize: "12px",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  cardValue: { color: "#2D6BE4", fontSize: "32px", fontWeight: "bold" },
  charts: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" },
  chartBox: {
    backgroundColor: "#111",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #1A1A1A",
  },
  chartTitle: {
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "24px",
  },
};
