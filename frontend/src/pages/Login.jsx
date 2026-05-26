import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import logo from "../assets/pibly.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={styles.page}>
      <img src={logo} style={styles.logo} alt="Pibly" />
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={login} style={styles.form}>
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button style={styles.button} type="submit">
          Sign In
        </button>
      </form>
      <p style={styles.link}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "#2D6BE4" }}>
          Sign Up
        </Link>
      </p>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#000",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
  },
  logo: {
    width: "700px",
    height: "500px",
    objectFit: "contain",
    marginBottom: "8px",
  },
  subtitle: { color: "#888", marginBottom: "32px" },
  error: { color: "#FF3B3B", marginBottom: "16px" },
  form: { width: "100%", maxWidth: "400px" },
  input: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#1A1A1A",
    border: "1px solid #333",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "15px",
    marginBottom: "12px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#2D6BE4",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "8px",
  },
  link: { color: "#888", marginTop: "20px" },
};
