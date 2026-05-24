const pool = require("../config/db");

const joinSession = async (req, res) => {
  const { post_id } = req.body;
  const helper_id = req.user.id;
  try {
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [
      post_id,
    ]);
    if (post.rows.length === 0)
      return res.status(404).json({ error: "Post not found" });
    if (post.rows[0].status !== "active")
      return res.status(400).json({ error: "Post not available" });
    if (post.rows[0].user_id === helper_id)
      return res.status(400).json({ error: "User cannot join their own post" });
    const session = await pool.query(
      "INSERT INTO sessions (post_id, poster_id, helper_id, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [post_id, post.rows[0].user_id, helper_id, "pending"],
    );
    res.status(201).json(session.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const updateSession = async (req, res) => {
  const { id } = req.params;
  const { status, is_fixed } = req.body;
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });
    const updated = await pool.query(
      "UPDATE sessions SET status = $1, is_fixed = $2 WHERE id = $3 RETURNING *",
      [status, is_fixed, id],
    );
    if (updated.rows.length === 0)
      return res.status(404).json({ error: "Session not found" });
    res.status(200).json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const acceptSession = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    const session = await pool.query("SELECT * FROM sessions WHERE id = $1", [
      id,
    ]);
    if (session.rows.length === 0)
      return res.status(404).json({ error: "Session not found" });
    if (session.rows[0].poster_id !== user_id)
      return res.status(403).json({ error: "Only posters can accept" });
    if (session.rows[0].status !== "pending")
      return res.status(400).json({ error: "Session not pending" });
    const updated = await pool.query(
      "UPDATE sessions SET status = 'active', started_at = NOW() WHERE id = $1 RETURNING *",
      [id],
    );
    await pool.query(
      "UPDATE sessions SET status = 'rejected' WHERE post_id = $1 AND status = 'pending' AND id != $2",
      [session.rows[0].post_id, id],
    );
    await pool.query("UPDATE posts SET status = 'in_progress' WHERE id = $1", [
      session.rows[0].post_id,
    ]);
    res.status(200).json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const rejectSession = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    const session = await pool.query("SELECT * FROM sessions WHERE id = $1", [
      id,
    ]);
    if (session.rows.length === 0)
      return res.status(404).json({ error: "Session not found" });
    if (session.rows[0].poster_id !== user_id)
      return res.status(403).json({ error: "Only posters can reject" });
    await pool.query("UPDATE sessions SET status = 'rejected' WHERE id = $1", [
      id,
    ]);
    res.status(200).json({ message: "Helper rejected" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const endSession = async (req, res) => {
  const { id } = req.params;
  const { is_fixed } = req.body;
  try {
    const session = await pool.query(
      "UPDATE sessions SET status = 'completed', ended_at = NOW(), is_fixed = $1 WHERE id = $2 RETURNING *",
      [is_fixed, id],
    );
    if (is_fixed) {
      await pool.query("UPDATE posts SET status = 'completed' WHERE id = $1", [
        session.rows[0].post_id,
      ]);
    } else {
      await pool.query("UPDATE posts SET status = 'active' WHERE id = $1", [
        session.rows[0].post_id,
      ]);
    }
    res.status(200).json(session.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getSession = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await pool.query("SELECT * FROM sessions WHERE id = $1", [
      id,
    ]);
    if (session.rows.length === 0)
      return res.status(404).json({ error: "Session not found" });
    res.status(200).json(session.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getMySessions = async (req, res) => {
  const user_id = req.user.id;
  try {
    const sessions = await pool.query(
      "SELECT * FROM sessions WHERE poster_id = $1 OR helper_id = $1 ORDER BY created_at DESC",
      [user_id],
    );
    res.status(200).json(sessions.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getAllSessions = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });
    const sessions = await pool.query(
      "SELECT * FROM sessions ORDER BY created_at DESC",
    );
    res.status(200).json(sessions.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const deleteSession = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });
    await pool.query("DELETE FROM sessions WHERE id = $1", [id]);
    res.status(200).json({ message: "Session deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  joinSession,
  acceptSession,
  rejectSession,
  updateSession,
  endSession,
  getSession,
  getMySessions,
  getAllSessions,
  deleteSession,
};
