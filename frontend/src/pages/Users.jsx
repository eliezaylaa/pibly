import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user",
    bio: "",
    phone: "",
    address: "",
    zip_code: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  const saveUser = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/users/${editing}`, form);
    } else {
      await api.post("/users", { ...form, password: "password123" });
    }
    setEditing(null);
    setForm({
      name: "",
      email: "",
      role: "user",
      bio: "",
      phone: "",
      address: "",
      zip_code: "",
      city: "",
      country: "",
    });
    fetchUsers();
  };

  const startEdit = (user) => {
    setEditing(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      bio: user.bio || "",
      phone: user.phone || "",
      address: user.address || "",
      zip_code: user.zip_code || "",
      city: user.city || "",
      country: user.country || "",
    });
  };

  const countries = [...new Set(users.map((u) => u.country).filter(Boolean))];

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole ? u.role === filterRole : true;
    const matchCountry = filterCountry ? u.country === filterCountry : true;
    return matchSearch && matchRole && matchCountry;
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

  return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.content}>
        <h1 style={styles.title}>Users</h1>

        <form onSubmit={saveUser} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Zip Code"
            value={form.zip_code}
            onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
          <select
            style={styles.input}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button style={styles.button} type="submit">
            {editing ? "Update" : "Create"}
          </button>
          {editing && (
            <button
              style={styles.cancel}
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({
                  name: "",
                  email: "",
                  role: "user",
                  bio: "",
                  phone: "",
                  address: "",
                  zip_code: "",
                  city: "",
                  country: "",
                });
              }}
            >
              Cancel
            </button>
          )}
        </form>

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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={styles.input}
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            style={styles.input}
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            style={styles.cancel}
            onClick={() => {
              setSearch("");
              setFilterRole("");
              setFilterCountry("");
            }}
          >
            Clear
          </button>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <SortTh field="id" label="ID" />
              <SortTh field="name" label="Name" />
              <SortTh field="email" label="Email" />
              <SortTh field="role" label="Role" />
              <SortTh field="phone" label="Phone" />
              <SortTh field="city" label="City" />
              <SortTh field="country" label="Country" />
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((user) => (
              <tr key={user.id}>
                <td style={styles.td}>{user.id}</td>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  <span
                    style={
                      user.role === "admin"
                        ? styles.adminBadge
                        : styles.userBadge
                    }
                  >
                    {user.role}
                  </span>
                </td>
                <td style={styles.td}>{user.phone || "—"}</td>
                <td style={styles.td}>{user.city || "—"}</td>
                <td style={styles.td}>{user.country || "—"}</td>
                <td style={styles.td}>
                  <button
                    style={styles.editBtn}
                    onClick={() => startEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteUser(user.id)}
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
  adminBadge: {
    backgroundColor: "#1A2A4A",
    color: "#2D6BE4",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
  },
  userBadge: {
    backgroundColor: "#1A1A1A",
    color: "#888",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
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
