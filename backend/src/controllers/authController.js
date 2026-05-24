const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const register = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, role",
      [email, hashedPassword, name],
    );
    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: newUser.rows[0].id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" },
    );
    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      refreshToken,
      newUser.rows[0].id,
    ]);
    res.status(201).json({
      user: newUser.rows[0],
      token,
      refreshToken,
    });
  } catch (err) {
    console.log("Register error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { id: user.rows[0].id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" },
    );
    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      refreshToken,
      user.rows[0].id,
    ]);
    res.json({
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        name: user.rows[0].name,
        role: user.rows[0].role,
      },
      token,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await pool.query(
      "SELECT id,role, refresh_token FROM users WHERE id = $1",
      [decoded.id],
    );
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.rows[0].refresh_token !== refreshToken) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ message: "Invalid refresh token" });
  }
};
const logout = async (req, res) => {
  try {
    await pool.query("UPDATE users SET refresh_token = NULL WHERE id = $1", [
      req.user.id,
    ]);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
