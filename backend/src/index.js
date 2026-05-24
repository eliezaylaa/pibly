const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const socketio = require("socket.io");
const server = http.createServer(app);
require("dotenv").config();
require("./config/db");
const io = socketio(server, {
  cors: { origin: "*" },
});
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Pibly API is running!" });
});

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server is running");
});
module.exports = { app, io };
