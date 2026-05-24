const pool = require("../config/db");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "eur",
    capture_method: "manual",
  });
  return paymentIntent;
};

const capturePaymentIntent = async (paymentIntentId) => {
  const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
  return paymentIntent;
};

const cancelPaymentIntent = async (paymentIntentId) => {
  const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
  return paymentIntent;
};

const createPayment = async (req, res) => {
  const { session_id } = req.body;
  const payer_id = req.user.id;
  try {
    const session = await pool.query("SELECT * FROM sessions WHERE id = $1", [
      session_id,
    ]);
    if (session.rows.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }
    if (!session.rows[0].is_fixed)
      return res.status(400).json({ error: "Session is not fixed" });
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [
      session.rows[0].post_id,
    ]);
    const amount = parseFloat(post.rows[0].price);
    const platform_fee = parseFloat((amount * 0.1).toFixed(2));
    const transaction = await pool.query(
      "INSERT INTO transactions (session_id, payer_id, payee_id, amount, platform_fee, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        session_id,
        payer_id,
        session.rows[0].helper_id,
        amount,
        platform_fee,
        "pending",
      ],
    );
    res.status(201).json(transaction.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
const confirmPayment = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await pool.query(
      "SELECT * FROM transactions WHERE id = $1",
      [id],
    );
    if (transaction.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    if (transaction.rows[0].payer_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (transaction.rows[0].stripe_payment_intent_id) {
      await capturePaymentIntent(transaction.rows[0].stripe_payment_intent_id);
    }
    const updatedTransaction = await pool.query(
      "UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *",
      ["completed", id],
    );
    const session = await pool.query("SELECT * FROM sessions WHERE id = $1", [
      updatedTransaction.rows[0].session_id,
    ]);
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [
      session.rows[0].post_id,
    ]);
    const poster = await pool.query("SELECT * FROM users WHERE id = $1", [
      session.rows[0].poster_id,
    ]);
    const helper = await pool.query("SELECT * FROM users WHERE id = $1", [
      session.rows[0].helper_id,
    ]);
    await pool.query(
      "INSERT INTO invoices (transaction_id, session_id, post_id, poster_id, helper_id, poster_name, helper_name, post_title, amount, platform_fee, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
      [
        updatedTransaction.rows[0].id,
        session.rows[0].id,
        post.rows[0].id,
        poster.rows[0].id,
        helper.rows[0].id,
        poster.rows[0].name,
        helper.rows[0].name,
        post.rows[0].title,
        updatedTransaction.rows[0].amount,
        updatedTransaction.rows[0].platform_fee,
        "paid",
      ],
    );
    res.status(200).json(updatedTransaction.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
const refundTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await pool.query(
      "SELECT * FROM transactions WHERE id = $1",
      [id],
    );
    if (transaction.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (transaction.rows[0].stripe_payment_intent_id) {
      await cancelPaymentIntent(transaction.rows[0].stripe_payment_intent_id);
    }
    const updatedTransaction = await pool.query(
      "UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *",
      ["refunded", id],
    );
    res.status(200).json(updatedTransaction.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const getMyTransactions = async (req, res) => {
  const userId = req.user.id;
  try {
    const transactions = await pool.query(
      "SELECT * FROM transactions WHERE payer_id = $1 OR payee_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    res.status(200).json(transactions.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
const getAllTransactionsAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const transactions = await pool.query(
      "SELECT transactions.*, u1.name as payer_name, u2.name as payee_name FROM transactions LEFT JOIN users u1 ON transactions.payer_id = u1.id LEFT JOIN users u2 ON transactions.payee_id = u2.id ORDER BY transactions.created_at DESC",
    );
    res.status(200).json(transactions.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Unauthorized" });
    await pool.query("DELETE FROM transactions WHERE id = $1", [id]);
    res.status(200).json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
module.exports = {
  createPaymentIntent,
  capturePaymentIntent,
  cancelPaymentIntent,
  createPayment,
  confirmPayment,
  getMyTransactions,
  refundTransaction,
  getAllTransactionsAdmin,
  deleteTransaction,
};
