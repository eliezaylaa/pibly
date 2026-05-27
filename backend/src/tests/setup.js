const pool = require("../config/db");

beforeAll(async () => {
  await pool.query(`
    DELETE FROM invoices;
    DELETE FROM transactions;
    DELETE FROM sessions;
    DELETE FROM posts;
    DELETE FROM users;
  `);
});

afterAll(async () => {
  await pool.query(`
    DELETE FROM invoices;
    DELETE FROM transactions;
    DELETE FROM sessions;
    DELETE FROM posts;
    DELETE FROM users;
  `);
  await pool.end();
});
