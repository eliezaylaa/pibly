import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: "pending", is_fixed: false });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const res = await api.get("/sessions/all");
    setSessions(res.data);
  };

  const deleteSession = async (id) => {
    if (!confirm("Delete this session?")) return;
    await api.delete(`/sessions/${id}`);
    fetchSessions();
  };

  const saveSession = async (e) => {
    e.preventDefault();
    await api.put(`/sessions/${editing}`, form);
    setEditing(null);
    setForm({ status: "pending", is_fixed: false });
    fetchSessions();
  };

  const startEdit = (session) => {
    setEditing(session.id);
    setForm({ status: session.status, is_fixed: session.is_fixed });
  };

  const filtered = sessions.filter((s) => {
    const matchSearch =
      s.id?.toString().includes(search) ||
      s.poster_id?.toString().includes(search) ||
      s.helper_id?.toString().includes(search);
    const matchStatus = filterStatus ? s.status === filterStatus : true;
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
    if (status === "active")
      return { backgroundColor: "#1A3A1A", color: "#1D9E75" };
    if (status === "pending")
      return { backgroundColor: "#1A2A4A", color: "#2D6BE4" };
    if (status === "completed")
      return { backgroundColor: "#2A2A1A", color: "#F5A623" };
    if (status === "rejected")
      return { backgroundColor: "#2A1A1A", color: "#FF3B3B" };
    return { backgroundColor: "#1A1A1A", color: "#888" };
  };

  return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.content}>
        <h1 style={styles.title}>Sessions</h1>

        {editing && (
          <form onSubmit={saveSession} style={styles.form}>
            <select
              style={styles.input}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              style={styles.input}
              value={form.is_fixed}
              onChange={(e) =>
                setForm({ ...form, is_fixed: e.target.value === "true" })
              }
            >
              <option value="false">Not Fixed</option>
              <option value="true">Fixed</option>
            </select>
            <button style={styles.button} type="submit">
              Update
            </button>
            <button
              style={styles.cancel}
              type="button"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </form>
        )}

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
            placeholder="Search by ID, poster or helper..."
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
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
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
              <SortTh field="post_id" label="Post ID" />
              <SortTh field="poster_id" label="Poster ID" />
              <SortTh field="helper_id" label="Helper ID" />
              <SortTh field="status" label="Status" />
              <SortTh field="is_fixed" label="Fixed" />
              <SortTh field="started_at" label="Started" />
              <SortTh field="ended_at" label="Ended" />
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((session) => (
              <tr key={session.id}>
                <td style={styles.td}>{session.id}</td>
                <td style={styles.td}>{session.post_id || "—"}</td>
                <td style={styles.td}>{session.poster_id || "—"}</td>
                <td style={styles.td}>{session.helper_id || "—"}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...statusColor(session.status),
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                    }}
                  >
                    {session.status}
                  </span>
                </td>
                <td style={styles.td}>{session.is_fixed ? "Yes" : "No"}</td>
                <td style={styles.td}>
                  {session.started_at
                    ? new Date(session.started_at).toLocaleString()
                    : "—"}
                </td>
                <td style={styles.td}>
                  {session.ended_at
                    ? new Date(session.ended_at).toLocaleString()
                    : "—"}
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.editBtn}
                    onClick={() => startEdit(session)}
                  >
                    Edit
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteSession(session.id)}
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
  form: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  input: {
    padding: "10px 14px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#2D6BE4",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
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
