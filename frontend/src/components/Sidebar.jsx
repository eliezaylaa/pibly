import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isAdmin = user.role === "admin";

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>Pibly</div>
      <nav style={styles.nav}>
        <Link to="/dashboard" style={styles.link}>
          Dashboard
        </Link>
        <Link to="/my-posts" style={styles.link}>
          My Posts
        </Link>
        <Link to="/my-sessions" style={styles.link}>
          My Sessions
        </Link>
        <Link to="/my-invoices" style={styles.link}>
          My Invoices
        </Link>
        <Link to="/profile" style={styles.link}>
          My Profile
        </Link>
        {isAdmin && (
          <>
            <div style={styles.divider} />
            <Link to="/users" style={styles.link}>
              Users
            </Link>
            <Link to="/posts" style={styles.link}>
              All Posts
            </Link>
            <Link to="/sessions" style={styles.link}>
              All Sessions
            </Link>
            <Link to="/transactions" style={styles.link}>
              Transactions
            </Link>
            <Link to="/invoices" style={styles.link}>
              Invoices
            </Link>
            <Link to="/reports" style={styles.link}>
              Reports
            </Link>
          </>
        )}
      </nav>
      <div style={styles.bottom}>
        <p style={styles.userName}>{user.name}</p>
        <p style={styles.userRole}>{user.role?.toUpperCase()}</p>
        <button style={styles.logout} onClick={logout}>
          Log Out
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    height: "100vh",
    backgroundColor: "#0A0A0A",
    borderRight: "1px solid #1A1A1A",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    position: "fixed",
    left: 0,
    top: 0,
    boxSizing: "border-box",
  },
  logo: {
    color: "#2D6BE4",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "32px",
    paddingLeft: "8px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
    overflowY: "auto",
  },
  link: {
    color: "#888",
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "14px",
  },
  divider: { borderTop: "1px solid #1A1A1A", margin: "12px 0" },
  adminLabel: {
    color: "#555",
    fontSize: "11px",
    fontWeight: "bold",
    paddingLeft: "12px",
    marginBottom: "4px",
  },
  bottom: {
    borderTop: "1px solid #1A1A1A",
    paddingTop: "16px",
    marginTop: "auto",
    flexShrink: 0,
  },
  userName: { color: "#fff", fontWeight: "bold", marginBottom: "2px" },
  userRole: { color: "#2D6BE4", fontSize: "11px", marginBottom: "12px" },
  logout: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#1A1A1A",
    color: "#FF3B3B",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
