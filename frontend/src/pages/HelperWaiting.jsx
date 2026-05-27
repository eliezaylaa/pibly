import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function HelperWaiting() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { session, post } = state || {};
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const socket = io(API_URL);
    socket.on("connect", () => socket.emit("join_room", user.id));
    socket.on("session_accepted", (data) => {
      navigate("/video-call", {
        state: { session: { ...session, ...data }, post },
      });
    });
    socket.on("session_rejected", () => {
      alert("Your request was rejected.");
      navigate("/dashboard");
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.spinner} />
        <h2 style={styles.title}>Waiting for poster to accept...</h2>
        <p style={styles.subtitle}>{post?.title}</p>
        <p style={styles.price}>€{post?.price}</p>
        <button style={styles.cancelBtn} onClick={() => navigate("/dashboard")}>
          Cancel
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#111",
    borderRadius: "16px",
    padding: "48px",
    border: "1px solid #1A1A1A",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
  },
  spinner: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    border: "4px solid #1A1A1A",
    borderTop: "4px solid #2D6BE4",
    margin: "0 auto 32px",
    animation: "spin 1s linear infinite",
  },
  title: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "12px",
  },
  subtitle: { color: "#888", fontSize: "14px", marginBottom: "8px" },
  price: {
    color: "#2D6BE4",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "32px",
  },
  cancelBtn: {
    padding: "12px 24px",
    backgroundColor: "#1A1A1A",
    color: "#FF3B3B",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
