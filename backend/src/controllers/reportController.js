const pool = require("../config/db");

const getReports = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied" });

    const totalUsers = await pool.query("SELECT COUNT(*) FROM users");

    const totalPostsToday = await pool.query(
      "SELECT COUNT(*) FROM posts WHERE created_at >= NOW() - INTERVAL '24 hours'",
    );

    const totalSessionsCompleted = await pool.query(
      "SELECT COUNT(*) FROM sessions WHERE status = 'completed'",
    );

    const totalRevenue = await pool.query(
      "SELECT SUM(platform_fee) as revenue FROM transactions WHERE status = 'completed'",
    );

    const topCategory = await pool.query(
      "SELECT category, COUNT(*) as count FROM posts GROUP BY category ORDER BY count DESC LIMIT 1",
    );

    const totalActivePosts = await pool.query(
      "SELECT COUNT(*) FROM posts WHERE status = 'active' AND expires_at > NOW()",
    );
    const fixRate = await pool.query(
      "SELECT ROUND(COUNT(CASE WHEN is_fixed = true THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as fix_rate FROM sessions WHERE status = 'completed'",
    );

    const avgTransactionValue = await pool.query(
      "SELECT ROUND(AVG(amount), 2) as avg_value FROM transactions WHERE status = 'completed'",
    );

    res.status(200).json({
      total_users: parseInt(totalUsers.rows[0].count),
      total_posts_today: parseInt(totalPostsToday.rows[0].count),
      total_active_posts: parseInt(totalActivePosts.rows[0].count),
      total_sessions_completed: parseInt(totalSessionsCompleted.rows[0].count),
      total_revenue: parseFloat(totalRevenue.rows[0].revenue),
      fix_rate: parseFloat(fixRate.rows[0].fix_rate) || 0,
      top_category: topCategory.rows[0]?.category,
      avg_transaction_value: parseFloat(avgTransactionValue.rows[0].avg_value),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getReports };
