import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function VideoCall() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { session, post } = state || {};
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [duration, setDuration] = useState(0);
  const isPoster = parseInt(user.id) === parseInt(session?.poster_id);
  const roomUrl = `https://meet.jit.si/pibly-session-${session?.id}`;

  useEffect(() => {
    const socket = io(API_URL);
    socket.on("connect", () => socket.emit("join_room", user.id));
    socket.on("session_ended", () => navigate("/dashboard"));
    const timer = setInterval(() => setDuration((prev) => prev + 1), 1000);
    return () => {
      socket.disconnect();
      clearInterval(timer);
    };
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const endSession = async (isFixed) => {
    try {
      await api.put(`/sessions/${session.id}/end`, { is_fixed: isFixed });
      if (isFixed)
        alert(`Problem fixed! Payment of €${post?.price} processed.`);
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to end session");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>{post?.title}</h2>
        <span style={styles.timer}>{formatTime(duration)}</span>
        <span style={styles.price}>€{post?.price}</span>
      </div>
      <iframe
        src={roomUrl}
        style={styles.video}
        allow="camera; microphone; fullscreen; display-capture"
      />
      {isPoster && (
        <div style={styles.buttons}>
          <button style={styles.fixedBtn} onClick={() => endSession(true)}>
            Fixed
          </button>
          <button style={styles.notFixedBtn} onClick={() => endSession(false)}>
            Not Fixed
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#000",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    backgroundColor: "#111",
    borderBottom: "1px solid #1A1A1A",
  },
  title: { color: "#fff", fontSize: "18px", fontWeight: "bold" },
  timer: { color: "#2D6BE4", fontSize: "24px", fontWeight: "bold" },
  price: { color: "#2D6BE4", fontSize: "20px", fontWeight: "bold" },
  video: {
    flex: 1,
    border: "none",
    width: "100%",
    height: "calc(100vh - 140px)",
  },
  buttons: {
    display: "flex",
    gap: "16px",
    padding: "16px 32px",
    backgroundColor: "#111",
    borderTop: "1px solid #1A1A1A",
    justifyContent: "center",
  },
  fixedBtn: {
    padding: "14px 40px",
    backgroundColor: "#1D9E75",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },
  notFixedBtn: {
    padding: "14px 40px",
    backgroundColor: "#FF3B3B",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },
};
