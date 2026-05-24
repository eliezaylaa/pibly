const pool = require("../config/db");

const createPost = async (req, res) => {
  const { title, description, category, price, media_url } = req.body;
  const user_id = req.user.id;
  if (!title || !description || !category || !price) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const post = await pool.query(
      "INSERT INTO posts (user_id, title, description, category, price, media_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [user_id, title, description, category, price, media_url],
    );
    res.status(201).json(post.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getAllPostsAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Unauthorized" });
    const posts = await pool.query(
      "SELECT * FROM posts ORDER BY created_at DESC",
    );
    res.status(200).json(posts.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await pool.query(
      "SELECT posts.*, users.name, users.avatar_url FROM posts LEFT JOIN users ON posts.user_id = users.id WHERE posts.status = 'active' AND posts.expires_at > NOW() ORDER BY posts.created_at DESC",
    );
    res.status(200).json(posts.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await pool.query(
      "SELECT posts.*, users.name as poster_name FROM posts LEFT JOIN users ON posts.user_id = users.id WHERE posts.id = $1",
      [id],
    );
    if (post.rows.length === 0)
      return res.status(404).json({ error: "Post not found" });
    res.status(200).json(post.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, description, category, price, media_url } = req.body;
  try {
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    if (post.rows.length === 0)
      return res.status(404).json({ error: "Post not found" });
    if (post.rows[0].user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const updated = await pool.query(
      "UPDATE posts SET title = $1, description = $2, category = $3, price = $4, media_url = $5 WHERE id = $6 RETURNING *",
      [title, description, category, price, media_url, id],
    );
    res.status(200).json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    if (post.rows.length === 0)
      return res.status(404).json({ error: "Post not found" });
    if (post.rows[0].user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await pool.query("DELETE FROM posts WHERE id = $1", [id]);
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getAllPostsAdmin,
  getPost,
  updatePost,
  deletePost,
};
