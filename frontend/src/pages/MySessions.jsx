import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";

export default function MySessions() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const res = await api.get("/sessions/mysessions");
    setSessions(res.data);
  };

  const filtered = sessions.filter(
    (s) =>
      s.id?.toString().includes(search) ||
      s.post_id?.toString().includes(search),
  );

  const statusColor = (status) => {
    if (status === "active") return "#1D9E75";
    if (status === "pending") return "#2D6BE4";
    if (status === "completed") return "#F5A623";
    if (status === "rejected") return "#FF3B3B";
    return "#888";
  };

  return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.content}>
        <h1 style={styles.title}>My Sessions</h1>
        <input
          style={{ ...styles.input, width: "300px", marginBottom: "24px" }}
          placeholder="Search by ID or post ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={styles.grid}>
          {filtered.map((session) => {
            const role = session.poster_id === user.id ? "Poster" : "Helper";
            return (
              <div key={session.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <span
                    style={
                      role === "Poster"
                        ? styles.posterBadge
                        : styles.helperBadge
                    }
                  >
                    {role}
                  </span>
                  <span
                    style={{
                      color: statusColor(session.status),
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {session.status}
                  </span>
                </div>
                <h3 style={styles.sessionId}>Session #{session.id}</h3>
                <p style={styles.description}>
                  Post ID: {session.post_id || "—"}
                </p>
                <div style={styles.cardBottom}>
                  <span style={styles.meta}>
                    {session.is_fixed ? "Fixed" : "Not Fixed"}
                  </span>
                  <span style={styles.date}>
                    {session.started_at
                      ? new Date(session.started_at).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p style={styles.empty}>No sessions yet</p>}
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
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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
  posterBadge: {
    backgroundColor: "#1A2A4A",
    color: "#2D6BE4",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
  },
  helperBadge: {
    backgroundColor: "#1A3A1A",
    color: "#1D9E75",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
  },
  sessionId: {
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  description: { color: "#888", fontSize: "14px", marginBottom: "16px" },
  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meta: { color: "#555", fontSize: "12px" },
  date: { color: "#555", fontSize: "12px" },
  empty: { color: "#555" },
};
