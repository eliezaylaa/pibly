import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "../api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ clientSecret, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: { card: elements.getElement(CardElement) },
      },
    );
    setLoading(false);
    if (error) {
      alert("Payment failed: " + error.message);
    } else {
      onSuccess();
    }
  };

  return (
    <div style={styles.modal}>
      <div style={styles.modalCard}>
        <h3 style={styles.modalTitle}>Enter Payment Details</h3>
        <form onSubmit={handlePay}>
          <div style={styles.cardElement}>
            <CardElement
              options={{
                style: {
                  base: {
                    color: "#fff",
                    fontSize: "16px",
                    "::placeholder": { color: "#888" },
                  },
                },
              }}
            />
          </div>
          <button style={styles.payBtn} type="submit" disabled={loading}>
            {loading ? "Processing..." : "Pay & Start Session"}
          </button>
          <button style={styles.cancelPayBtn} type="button" onClick={onCancel}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PosterWaiting() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { post } = state || {};
  const [helpers, setHelpers] = useState([]);
  const [clientSecret, setClientSecret] = useState(null);
  const [pendingSessionId, setPendingSessionId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const socket = io(API_URL);
    socket.on("connect", () => socket.emit("join_room", user.id));
    socket.on("helper_joined", (data) => {
      setHelpers((prev) => [...prev, data]);
    });
    socket.on("session_ended", () => navigate("/dashboard"));
    return () => socket.disconnect();
  }, []);

  const acceptHelper = async (session_id) => {
    try {
      const intentRes = await api.post("/payments/create-intent", {
        amount: parseFloat(post.price),
      });
      setClientSecret(intentRes.data.clientSecret);
      setPendingSessionId(session_id);
    } catch (err) {
      alert("Failed to initiate payment");
    }
  };

  const onPaymentSuccess = async () => {
    try {
      const res = await api.put(`/sessions/${pendingSessionId}/accept`, {});
      const postRes = await api.get(`/posts/${post.id}`);
      setClientSecret(null);
      navigate("/video-call", {
        state: { session: res.data, post: postRes.data },
      });
    } catch (err) {
      alert("Failed to accept");
    }
  };

  const rejectHelper = async (session_id) => {
    try {
      await api.put(`/sessions/${session_id}/reject`, {});
      setHelpers((prev) => prev.filter((h) => h.session_id !== session_id));
    } catch (err) {
      alert("Failed to reject");
    }
  };

  return (
    <div style={styles.page}>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            clientSecret={clientSecret}
            onSuccess={onPaymentSuccess}
            onCancel={() => setClientSecret(null)}
          />
        </Elements>
      )}
      <div style={styles.card}>
        <h2 style={styles.title}>{post?.title}</h2>
        <p style={styles.subtitle}>Waiting for helpers...</p>
        <p style={styles.price}>€{post?.price}</p>

        {helpers.length === 0 ? (
          <p style={styles.empty}>No helpers yet...</p>
        ) : (
          <div style={styles.helperList}>
            {helpers.map((h) => (
              <div key={h.session_id} style={styles.helperCard}>
                <div style={styles.helperAvatar}>
                  {h.helper_name?.charAt(0).toUpperCase()}
                </div>
                <span style={styles.helperName}>{h.helper_name}</span>
                <div style={styles.helperActions}>
                  <button
                    style={styles.acceptBtn}
                    onClick={() => acceptHelper(h.session_id)}
                  >
                    Accept
                  </button>
                  <button
                    style={styles.rejectBtn}
                    onClick={() => rejectHelper(h.session_id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button style={styles.cancelBtn} onClick={() => navigate("/dashboard")}>
          Cancel Post
        </button>
      </div>
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
    maxWidth: "500px",
    width: "100%",
  },
  title: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  subtitle: { color: "#888", fontSize: "14px", marginBottom: "8px" },
  price: {
    color: "#2D6BE4",
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "32px",
  },
  empty: { color: "#555", marginBottom: "32px" },
  helperList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "32px",
  },
  helperCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#1A1A1A",
    padding: "16px",
    borderRadius: "10px",
  },
  helperAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#2D6BE4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "16px",
    flexShrink: 0,
  },
  helperName: { color: "#fff", flex: 1, textAlign: "left" },
  helperActions: { display: "flex", gap: "8px" },
  acceptBtn: {
    padding: "8px 16px",
    backgroundColor: "#1D9E75",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  rejectBtn: {
    padding: "8px 16px",
    backgroundColor: "#FF3B3B",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
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
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: "#111",
    borderRadius: "16px",
    padding: "40px",
    border: "1px solid #1A1A1A",
    width: "100%",
    maxWidth: "400px",
  },
  modalTitle: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "24px",
    textAlign: "center",
  },
  cardElement: {
    backgroundColor: "#0A0A0A",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #2A2A2A",
    marginBottom: "20px",
  },
  payBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#2D6BE4",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    marginBottom: "12px",
  },
  cancelPayBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#1A1A1A",
    color: "#888",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
