import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    price: "",
    status: "active",
  });

  const categories = [
    "General",
    "Tech",
    "Medical",
    "Legal",
    "Finance",
    "Gardening",
    "Other",
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await api.get("/posts/all");
    setPosts(res.data);
  };

  const deletePost = async (id) => {
    if (!confirm("Delete this post?")) return;
    await api.delete(`/posts/${id}`);
    fetchPosts();
  };

  const savePost = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/posts/${editing}`, form);
    } else {
      await api.post("/posts", { ...form, price: parseFloat(form.price) });
    }
    setEditing(null);
    setForm({
      title: "",
      description: "",
      category: "General",
      price: "",
      status: "active",
    });
    fetchPosts();
  };

  const startEdit = (post) => {
    setEditing(post.id);
    setForm({
      title: post.title || "",
      description: post.description || "",
      category: post.category || "General",
      price: post.price || "",
      status: post.status || "active",
    });
  };

  const allCategories = [
    ...new Set(posts.map((p) => p.category).filter(Boolean)),
  ];

  const filtered = posts.filter((p) => {
    const matchSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory ? p.category === filterCategory : true;
    const matchStatus = filterStatus ? p.status === filterStatus : true;
    return matchSearch && matchCategory && matchStatus;
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
    if (status === "in_progress")
      return { backgroundColor: "#1A2A4A", color: "#2D6BE4" };
    if (status === "completed")
      return { backgroundColor: "#2A2A1A", color: "#F5A623" };
    return { backgroundColor: "#1A1A1A", color: "#888" };
  };

  return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.content}>
        <h1 style={styles.title}>Posts</h1>

        <form onSubmit={savePost} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Price (€)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <select
            style={styles.input}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            style={styles.input}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
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
                  title: "",
                  description: "",
                  category: "General",
                  price: "",
                  status: "active",
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
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={styles.input}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            style={styles.input}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
          <button
            style={styles.cancel}
            onClick={() => {
              setSearch("");
              setFilterCategory("");
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
              <SortTh field="title" label="Title" />
              <SortTh field="category" label="Category" />
              <SortTh field="price" label="Price" />
              <SortTh field="status" label="Status" />
              <SortTh field="created_at" label="Created" />
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((post) => (
              <tr key={post.id}>
                <td style={styles.td}>{post.id}</td>
                <td style={styles.td}>{post.title}</td>
                <td style={styles.td}>{post.category}</td>
                <td style={styles.td}>€{post.price}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...statusColor(post.status),
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                    }}
                  >
                    {post.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.editBtn}
                    onClick={() => startEdit(post)}
                  >
                    Edit
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deletePost(post.id)}
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
