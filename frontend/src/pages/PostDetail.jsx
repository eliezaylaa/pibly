import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/posts/${id}`);
      setPost(res.data);
    } catch (err) {
      navigate(-1);
    }
  };

  const joinPost = async () => {
    try {
      const res = await api.post("/sessions/join", { post_id: parseInt(id) });
      navigate("/helper-waiting", { state: { session: res.data, post } });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to join");
    }
  };

  if (!post)
    return (
      <div style={styles.page}>
        <Sidebar />
        <div style={styles.content}>
          <p style={{ color: "#888" }}>Loading...</p>
        </div>
      </div>
    );

  return (
    <div style={styles.page}>
      <Sidebar />
      <div style={styles.content}>
        <button style={styles.back} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div style={styles.card}>
          <div style={styles.cardTop}>
            <span style={styles.category}>{post.category}</span>
            <span style={styles.price}>€{post.price}</span>
          </div>
          <h1 style={styles.title}>{post.title}</h1>
          <p style={styles.meta}>
            Posted by {post.name || "Unknown"} ·{" "}
            {new Date(post.created_at).toLocaleDateString()}
          </p>
          <div style={styles.divider} />
          <p style={styles.description}>{post.description}</p>
          <div style={styles.divider} />
          <div style={styles.footer}>
            <div>
              <p style={styles.infoLabel}>Status</p>
              <p style={styles.infoValue}>{post.status}</p>
            </div>
            <div>
              <p style={styles.infoLabel}>Expires</p>
              <p style={styles.infoValue}>
                {new Date(post.expires_at).toLocaleDateString()}
              </p>
            </div>
            {parseInt(user.id) !== parseInt(post.user_id) &&
              post.status === "active" && (
                <button style={styles.joinBtn} onClick={joinPost}>
                  Join Session
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", minHeight: "100vh", backgroundColor: "#000" },
  content: { marginLeft: "240px", padding: "40px", flex: 1, maxWidth: "800px" },
  back: {
    backgroundColor: "transparent",
    color: "#2D6BE4",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "24px",
    padding: 0,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: "12px",
    padding: "32px",
    border: "1px solid #1A1A1A",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  category: {
    backgroundColor: "#1A2A4A",
    color: "#2D6BE4",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
  },
  price: { color: "#2D6BE4", fontSize: "28px", fontWeight: "bold" },
  title: {
    color: "#fff",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  meta: { color: "#555", fontSize: "13px", marginBottom: "24px" },
  divider: { borderTop: "1px solid #1A1A1A", margin: "24px 0" },
  description: { color: "#aaa", fontSize: "16px", lineHeight: "1.7" },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    color: "#555",
    fontSize: "12px",
    marginBottom: "4px",
    textTransform: "uppercase",
  },
  infoValue: { color: "#fff", fontSize: "15px" },
  joinBtn: {
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
