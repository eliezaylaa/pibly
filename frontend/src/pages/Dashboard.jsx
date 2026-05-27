import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const url = user.role === "admin" ? "/posts/all" : "/posts";
    const res = await api.get(url);
    setPosts(res.data);
  };

  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];

  const filtered = posts.filter((p) => {
    const matchSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory ? p.category === filterCategory : true;
    return matchSearch && matchCategory;
  });

  return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.content}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>Welcome back, {user.name}</h1>
          <button
            style={styles.postBtn}
            onClick={() => navigate("/create-post")}
          >
            Post
          </button>
        </div>

        <div style={styles.searchBar}>
          <input
            style={styles.searchInput}
            placeholder="Search for a problem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={styles.select}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {search || filterCategory ? (
            <button
              style={styles.clearBtn}
              onClick={() => {
                setSearch("");
                setFilterCategory("");
              }}
            >
              Clear
            </button>
          ) : null}
        </div>

        <div style={styles.list}>
          {filtered.map((post) => (
            <div
              key={post.id}
              style={styles.row}
              onClick={() => navigate(`/post/${post.id}`)}
            >
              <div style={styles.rowLeft}>
                <span style={styles.category}>{post.category}</span>
                <div>
                  <h3 style={styles.postTitle}>{post.title}</h3>
                  <p style={styles.description}>
                    {post.description?.substring(0, 120)}...
                  </p>
                  <span style={styles.meta}>
                    Posted by {post.name || "Unknown"} ·{" "}
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div style={styles.rowRight}>
                <span style={styles.price}>€{post.price}</span>
                {user.id !== post.user_id && (
                  <button
                    style={styles.joinBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={styles.empty}>No active problems right now</p>
          )}
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
    marginBottom: "32px",
  },
  title: { color: "#fff", fontSize: "24px", fontWeight: "bold" },
  postBtn: {
    padding: "10px 20px",
    backgroundColor: "#2D6BE4",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  searchBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: "14px 20px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #333",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "15px",
  },
  select: {
    padding: "14px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #333",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
  },
  clearBtn: {
    padding: "14px 20px",
    backgroundColor: "#1A1A1A",
    color: "#888",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  list: { display: "flex", flexDirection: "column", gap: "1px" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    backgroundColor: "#111",
    borderBottom: "1px solid #1A1A1A",
    cursor: "pointer",
    borderRadius: "8px",
    marginBottom: "4px",
  },
  rowLeft: { display: "flex", alignItems: "flex-start", gap: "16px", flex: 1 },
  category: {
    backgroundColor: "#1A2A4A",
    color: "#2D6BE4",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    whiteSpace: "nowrap",
  },
  postTitle: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "4px",
  },
  description: { color: "#888", fontSize: "14px", marginBottom: "4px" },
  meta: { color: "#555", fontSize: "12px" },
  rowRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
    minWidth: "120px",
  },
  price: { color: "#2D6BE4", fontSize: "20px", fontWeight: "bold" },
  joinBtn: {
    padding: "8px 20px",
    backgroundColor: "#2D6BE4",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  empty: { color: "#555", textAlign: "center", padding: "60px" },
};
