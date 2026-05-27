const express = require("express");
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const socketio = require("socket.io");

require("dotenv").config();
require("./config/db");

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } });

const { setIO } = require("./socket");
setIO(io);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests" },
  }),
);

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const reportRoutes = require("./routes/reportRoute");

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/sessions", sessionRoutes);
app.use("/payments", paymentRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/reports", reportRoutes);

app.get("/", (req, res) => res.json({ message: "Pibly API is running!" }));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("join_room", (user_id) => {
    socket.join(`user_${user_id}`);
    console.log(`User ${user_id} joined room`);
  });
  socket.on("join_session", (sessionId) => socket.join(`session_${sessionId}`));
  socket.on("offer", ({ offer, sessionId }) =>
    socket.to(`session_${sessionId}`).emit("offer", { offer }),
  );
  socket.on("answer", ({ answer, sessionId }) =>
    socket.to(`session_${sessionId}`).emit("answer", { answer }),
  );
  socket.on("ice-candidate", ({ candidate, sessionId }) =>
    socket.to(`session_${sessionId}`).emit("ice-candidate", { candidate }),
  );
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is running"));

module.exports = { app, io };
