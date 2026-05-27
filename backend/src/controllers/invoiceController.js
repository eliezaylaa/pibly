const pool = require("../config/db");

const getAllInvoices = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });
    const invoices = await pool.query(
      `SELECT invoices.*, 
      t.amount, t.platform_fee, t.status as payment_status,
      p.title as post_title,
      u1.name as poster_name,
      u2.name as helper_name
      FROM invoices
      LEFT JOIN transactions t ON invoices.transaction_id = t.id
      LEFT JOIN posts p ON invoices.post_id = p.id
      LEFT JOIN users u1 ON invoices.poster_id = u1.id
      LEFT JOIN users u2 ON invoices.helper_id = u2.id
      ORDER BY invoices.created_at DESC`,
    );
    res.status(200).json(invoices.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getMyInvoices = async (req, res) => {
  const user_id = req.user.id;
  try {
    const invoices = await pool.query(
      `SELECT invoices.*,
      t.amount, t.platform_fee, t.status as payment_status,
      p.title as post_title,
      u1.name as poster_name,
      u2.name as helper_name
      FROM invoices
      LEFT JOIN transactions t ON invoices.transaction_id = t.id
      LEFT JOIN posts p ON invoices.post_id = p.id
      LEFT JOIN users u1 ON invoices.poster_id = u1.id
      LEFT JOIN users u2 ON invoices.helper_id = u2.id
      WHERE invoices.poster_id = $1 OR invoices.helper_id = $1
      ORDER BY invoices.created_at DESC`,
      [user_id],
    );
    res.status(200).json(invoices.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await pool.query(
      `SELECT invoices.*,
      t.amount, t.platform_fee, t.status as payment_status,
      p.title as post_title,
      u1.name as poster_name,
      u2.name as helper_name
      FROM invoices
      LEFT JOIN transactions t ON invoices.transaction_id = t.id
      LEFT JOIN posts p ON invoices.post_id = p.id
      LEFT JOIN users u1 ON invoices.poster_id = u1.id
      LEFT JOIN users u2 ON invoices.helper_id = u2.id
      WHERE invoices.id = $1`,
      [id],
    );
    if (invoice.rows.length === 0)
      return res.status(404).json({ error: "Invoice not found" });
    res.status(200).json(invoice.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const updateInvoice = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });
    const updated = await pool.query(
      "UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );
    if (updated.rows.length === 0)
      return res.status(404).json({ error: "Invoice not found" });
    res.status(200).json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const deleteInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });
    await pool.query("DELETE FROM invoices WHERE id = $1", [id]);
    res.status(200).json({ message: "Invoice deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getAllInvoices,
  getMyInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
};
