import { useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  "General",
  "Tech",
  "Advice",
  "Cooking",
  "Finance",
  "Gardening",
  "Other",
];

export default function CreatePost() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    price: "",
  });
  const navigate = useNavigate();

  const createPost = async (e) => {
    e.preventDefault();
    try {
      await api.post("/posts", { ...form, price: parseFloat(form.price) });
      navigate("/my-posts");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create post");
    }
  };

  return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.content}>
        <button style={styles.back} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 style={styles.title}>Post</h1>
        <div style={styles.card}>
          <form onSubmit={createPost}>
            <div style={styles.field}>
              <label style={styles.label}>Title</label>
              <input
                style={styles.input}
                placeholder="What's your problem?"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{ ...styles.input, height: "150px", resize: "vertical" }}
                placeholder="Describe in detail..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Category</label>
              <div style={styles.categories}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    style={
                      form.category === cat ? styles.catActive : styles.cat
                    }
                    onClick={() => setForm({ ...form, category: cat })}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Price (€)</label>
              <input
                style={{ ...styles.input, maxWidth: "200px" }}
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <button style={styles.submitBtn} type="submit">
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", minHeight: "100vh", backgroundColor: "#000" },
  content: {
    marginLeft: "240px",
    padding: "40px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  back: {
    backgroundColor: "transparent",
    color: "#2D6BE4",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "24px",
    padding: 0,
    alignSelf: "flex-start",
  },
  title: {
    color: "#fff",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "24px",
    alignSelf: "flex-start",
  },
  card: {
    backgroundColor: "#111",
    borderRadius: "12px",
    padding: "32px",
    border: "1px solid #1A1A1A",
    width: "100%",
    maxWidth: "600px",
  },
  field: { marginBottom: "24px" },
  label: {
    color: "#555",
    fontSize: "12px",
    display: "block",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "#0A0A0A",
    border: "1px solid #2A2A2A",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  categories: { display: "flex", gap: "8px", flexWrap: "wrap" },
  cat: {
    padding: "8px 16px",
    backgroundColor: "#1A1A1A",
    color: "#888",
    border: "1px solid #2A2A2A",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "14px",
  },
  catActive: {
    padding: "8px 16px",
    backgroundColor: "#2D6BE4",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "14px",
  },
  submitBtn: {
    padding: "14px 32px",
    backgroundColor: "#2D6BE4",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },
};
