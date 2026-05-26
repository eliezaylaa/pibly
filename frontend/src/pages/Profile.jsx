import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [earnings, setEarnings] = useState("0.00");
  const [form, setForm] = useState({
    name: "",
    bio: "",
    phone: "",
    address: "",
    zip_code: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    const res = await api.get("/users/myprofile");
    const full = { ...stored, ...res.data, role: stored.role };
    setUser(full);
    setForm({
      name: res.data.name || "",
      bio: res.data.bio || "",
      phone: res.data.phone || "",
      address: res.data.address || "",
      zip_code: res.data.zip_code || "",
      city: res.data.city || "",
      country: res.data.country || "",
    });
    fetchEarnings(stored, res.data.id);
  };

  const fetchEarnings = async (stored, userId) => {
    try {
      if (stored.role === "admin") {
        const res = await api.get("/reports");
        setEarnings(res.data.total_revenue?.toFixed(2) || "0.00");
      } else {
        const res = await api.get("/payments/mytransactions");
        const total = res.data
          .filter((t) => t.payee_id === userId && t.status === "completed")
          .reduce(
            (sum, t) => sum + parseFloat(t.amount) - parseFloat(t.platform_fee),
            0,
          );
        setEarnings(total.toFixed(2));
      }
    } catch (err) {}
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    await api.put(`/users/${stored.id}`, { ...form, role: stored.role });
    await loadProfile();
    setEditing(false);
  };

  if (!user) return null;

  return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
          <div style={styles.headerInfo}>
            <h1 style={styles.name}>{user.name}</h1>
            <p style={styles.email}>{user.email}</p>
            <span style={styles.badge}>{user.role?.toUpperCase()}</span>
          </div>
          <div style={styles.earningsBox}>
            <p style={styles.earningsLabel}>
              {user.role === "admin" ? "Platform Revenue" : "Total Earned"}
            </p>
            <p style={styles.earningsValue}>€{earnings}</p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Profile Information</h2>
            {!editing && (
              <button style={styles.editBtn} onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
          </div>

          {!editing ? (
            <div style={styles.grid}>
              <InfoItem label="Full Name" value={user.name} />
              <InfoItem label="Email" value={user.email} />
              <InfoItem label="Bio" value={user.bio} />
              <InfoItem label="Phone" value={user.phone} />
              <InfoItem label="Address" value={user.address} />
              <InfoItem label="City" value={user.city} />
              <InfoItem label="Zip Code" value={user.zip_code} />
              <InfoItem label="Country" value={user.country} />
            </div>
          ) : (
            <form onSubmit={saveProfile}>
              <div style={styles.grid}>
                <FormField
                  label="Full Name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
                <FormField
                  label="Bio"
                  value={form.bio}
                  onChange={(v) => setForm({ ...form, bio: v })}
                />
                <FormField
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                />
                <FormField
                  label="Address"
                  value={form.address}
                  onChange={(v) => setForm({ ...form, address: v })}
                />
                <FormField
                  label="City"
                  value={form.city}
                  onChange={(v) => setForm({ ...form, city: v })}
                />
                <FormField
                  label="Zip Code"
                  value={form.zip_code}
                  onChange={(v) => setForm({ ...form, zip_code: v })}
                />
                <FormField
                  label="Country"
                  value={form.country}
                  onChange={(v) => setForm({ ...form, country: v })}
                />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button style={styles.saveBtn} type="submit">
                  Save Changes
                </button>
                <button
                  style={styles.cancelBtn}
                  type="button"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <p
        style={{
          color: "#555",
          fontSize: "12px",
          marginBottom: "4px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <p style={{ color: value ? "#fff" : "#333", fontSize: "15px" }}>
        {value || "Not set"}
      </p>
    </div>
  );
}

function FormField({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          color: "#555",
          fontSize: "12px",
          display: "block",
          marginBottom: "6px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <input
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#0A0A0A",
          border: "1px solid #2A2A2A",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "15px",
          boxSizing: "border-box",
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const styles = {
  page: { display: "flex", minHeight: "100vh", backgroundColor: "#000" },
  content: { marginLeft: "240px", padding: "40px", flex: 1 },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "32px",
    backgroundColor: "#111",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #1A1A1A",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#2D6BE4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "bold",
    color: "#fff",
    flexShrink: 0,
  },
  headerInfo: { flex: 1 },
  name: {
    color: "#fff",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "4px",
  },
  email: { color: "#888", fontSize: "14px", marginBottom: "8px" },
  badge: {
    backgroundColor: "#1A2A4A",
    color: "#2D6BE4",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  earningsBox: { textAlign: "right" },
  earningsLabel: { color: "#555", fontSize: "12px", marginBottom: "4px" },
  earningsValue: { color: "#2D6BE4", fontSize: "28px", fontWeight: "bold" },
  card: {
    backgroundColor: "#111",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #1A1A1A",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  cardTitle: { color: "#fff", fontSize: "18px", fontWeight: "bold" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px" },
  editBtn: {
    padding: "8px 20px",
    backgroundColor: "#2D6BE4",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  saveBtn: {
    padding: "12px 24px",
    backgroundColor: "#2D6BE4",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cancelBtn: {
    padding: "12px 24px",
    backgroundColor: "#1A1A1A",
    color: "#888",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
