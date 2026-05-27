import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await api.get("/posts/me");
    setPosts(res.data);
  };

  const deletePost = async (id) => {
    if (!confirm("Delete this post?")) return;
    await api.delete(`/posts/${id}`);
    fetchPosts();
  };

  const filtered = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()),
  );

  const statusColor = (status) => {
    if (status === "active") return "#1D9E75";
    if (status === "in_progress") return "#2D6BE4";
    if (status === "completed") return "#F5A623";
    return "#888";
  };

  return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.content}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>My Posts</h1>
        </div>
        <input
          style={{ ...styles.input, width: "300px", marginBottom: "24px" }}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={styles.grid}>
          {filtered.map((post) => (
            <div key={post.id} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.category}>{post.category}</span>
                <span
                  style={{
                    color: statusColor(post.status),
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {post.status}
                </span>
              </div>
              <h3
                style={styles.postTitle}
                onClick={() => navigate(`/post/${post.id}`)}
              >
                {post.title}
              </h3>
              <p style={styles.description}>
                {post.description?.substring(0, 100)}...
              </p>
              <div style={styles.cardBottom}>
                <span style={styles.price}>€{post.price}</span>
                <span style={styles.date}>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                <button
                  style={styles.deleteBtn}
                  onClick={() => deletePost(post.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p style={styles.empty}>No posts yet</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", minHeight: "100vh", backgroundColor: "#000" },
  content: { marginLeft: "240px", padding: "40px", flex: 1 },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: { color: "#fff", fontSize: "28px", fontWeight: "bold" },
  createBtn: {
    padding: "10px 20px",
    backgroundColor: "#2D6BE4",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
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
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "8px",
    cursor: "pointer",
  },
  description: { color: "#888", fontSize: "14px", marginBottom: "16px" },
  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: { color: "#2D6BE4", fontSize: "18px", fontWeight: "bold" },
  date: { color: "#555", fontSize: "12px" },
  deleteBtn: {
    backgroundColor: "#2A1A1A",
    color: "#FF3B3B",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  empty: { color: "#555" },
};
