const pool = require("../config/db");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied" });
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userExists.rows.length > 0)
      return res.status(400).json({ error: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, role || "user"],
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });
    const users = await pool.query(
      "SELECT id, name, email, role, avatar_url, bio, phone, address, zip_code, city, country, created_at FROM users ORDER BY created_at DESC",
    );
    res.status(200).json(users.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await pool.query(
      "SELECT id, name, avatar_url, bio, created_at FROM users WHERE id = $1",
      [id],
    );
    if (user.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.status(200).json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    bio,
    avatar_url,
    phone,
    address,
    zip_code,
    city,
    country,
    role,
  } = req.body;
  try {
    if (req.user.role !== "admin" && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const updated = await pool.query(
      "UPDATE users SET name = $1, bio = $2, avatar_url = $3, phone = $4, address = $5, zip_code = $6, city = $7, country = $8, role = $9 WHERE id = $10 RETURNING id, name, email, bio, avatar_url, phone, address, zip_code, city, country, role",
      [
        name,
        bio,
        avatar_url,
        phone,
        address,
        zip_code,
        city,
        country,
        role,
        id,
      ],
    );
    if (updated.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.status(200).json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role !== "admin" && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const searchUser = async (req, res) => {
  const { name } = req.query;
  try {
    const users = await pool.query(
      "SELECT id, name, role, avatar_url, bio FROM users WHERE LOWER(name) LIKE LOWER($1)",
      [`%${name}%`],
    );
    res.status(200).json(users.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  searchUser,
};
